import {
  SCHEMA,
  KEYS,
  CONTENT_PATHS,
  PROFILE_IMAGE_FIELDS,
  validate,
  stringify,
  safeImageName,
  imageDir,
  siteImageSrc,
} from "../tools/studio/schema.mjs";

const OWNER = "Rewmington";
const REPO = "Rewmington-Desk";
const BRANCH = "main";
const API = "https://api.github.com";
const COOKIE = "desk_admin";
const SESSION_DAYS = 30;

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(init.headers || {}) },
  });

const err = (message, status = 400) => json({ errors: [message] }, { status });

// ---------- GitHub ----------

async function gh(env, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "desk-content-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 401) throw new Error("GitHub 拒绝了 token（GITHUB_TOKEN 可能已过期或权限不够）");
  if (res.status === 403) throw new Error("GitHub 返回 403：可能是速率限制，或 token 没有这个仓库的写权限");
  if (!res.ok) throw new Error(`GitHub ${res.status} ${path}：${(await res.text()).slice(0, 240)}`);
  return res.status === 204 ? null : res.json();
}

// Workers 里默认没有 Buffer，用 atob + TextDecoder 解 base64，省掉 nodejs_compat 依赖
function b64utf8(b64) {
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function readAll(env) {
  const head = await gh(env, `/repos/${OWNER}/${REPO}/commits/${BRANCH}`);
  const files = {};
  await Promise.all(
    CONTENT_PATHS.map(async (p) => {
      const res = await gh(env, `/repos/${OWNER}/${REPO}/contents/${p}?ref=${BRANCH}`);
      files[p] = b64utf8(res.content);
    })
  );
  return { head, files };
}

// 一次保存 = 一个 commit = 一次构建。图片 blob 和内容 blob 一起进同一棵树，
// 否则加一张图就会多触发一次 Actions。
async function commitAll(env, entries, message, expectedSha) {
  const base = await gh(env, `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  if (expectedSha && base.object.sha !== expectedSha) {
    throw new Error("main 分支在你打开页面之后又前进了（可能本地发布台或 GitHub 网页也改过）。重新载入再保存。");
  }
  const tree = [];
  for (const [path, base64] of entries) {
    const blob = await gh(env, `/repos/${OWNER}/${REPO}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: base64, encoding: "base64" }),
    });
    tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const newTree = await gh(env, `/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: base.object.sha, tree }),
  });
  const made = await gh(env, `/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [base.object.sha] }),
  });
  await gh(env, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: made.sha, force: false }),
  });
  return made.sha;
}

// ---------- 会话 ----------
// 密钥直接用后台密码：省一个 secret，代价是改密码会让所有已登录会话失效（可接受）。

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(payload, password) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

// 定长比较，避免用响应时间一位一位猜签名。
function steady(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function isAuthed(request, env) {
  const token = readCookie(request, COOKIE);
  if (!token) return false;
  const [expiry, sig] = token.split(".");
  if (!expiry || !sig) return false;
  if (Number(expiry) < Date.now()) return false;
  return steady(sig, await sign(expiry, env.ADMIN_PASSWORD));
}

// ---------- 路由 ----------

// 浏览器里选好的图先以 @pending:<token> 占位填进字段，保存时在这里换成真实路径。
// 文件名的清理规则只留在服务端一处，UI 不需要复制一份 safeImageName。
function resolvePending(value, pending, entries) {
  if (typeof value !== "string" || !value.startsWith("@pending:")) return value;
  const img = pending[value.slice(9)];
  if (!img) throw new Error(`图片占位 ${value} 找不到对应的数据，请重新选一次这张图`);
  const filename = `${safeImageName(img.name)}.jpg`;
  entries.set(imageDir(filename), img.dataBase64);
  return siteImageSrc(filename);
}

function materializeImages(body, entries) {
  const pending = {};
  for (const img of body.images || []) pending[img.token] = img;

  for (const key of KEYS) {
    for (const item of body[key] || []) {
      for (const [field, , kind] of SCHEMA[key].fields) {
        if (kind === "image") item[field] = resolvePending(item[field], pending, entries);
      }
    }
  }
  if (body.profile) {
    for (const field of PROFILE_IMAGE_FIELDS) {
      body.profile[field] = resolvePending(body.profile[field], pending, entries);
    }
  }
}

async function handle(request, env) {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/admin\/?/, "").replace(/\/$/, "");
  const method = request.method;

  if (method === "GET" && (route === "" || route === "ui.html")) {
    const asset = await env.ASSETS.fetch(new Request(new URL("ui.html", url).toString()));
    return new Response(asset.body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }

  if (method === "POST" && route === "api/login") {
    const { password } = await request.json();
    if (typeof password !== "string" || !steady(password, env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 600));
      return err("密码不对", 401);
    }
    const expiry = Date.now() + SESSION_DAYS * 86400000;
    const cookie = `${COOKIE}=${expiry}.${await sign(String(expiry), env.ADMIN_PASSWORD)}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
    return json({ ok: true }, { headers: { "Set-Cookie": cookie } });
  }

  if (method === "POST" && route === "api/logout") {
    return json({ ok: true }, { headers: { "Set-Cookie": `${COOKIE}=; Path=/admin; HttpOnly; Secure; Max-Age=0` } });
  }

  if (!route.startsWith("api/")) return new Response("Not found", { status: 404 });

  if (!(await isAuthed(request, env))) {
    return json({ errors: ["未登录"], needLogin: true }, { status: 401 });
  }

  if (method === "GET" && route === "api/schema") {
    return json({ schema: SCHEMA, keys: KEYS, remote: true });
  }

  if (method === "GET" && route === "api/content") {
    const { head, files } = await readAll(env);
    const out = { rev: head.sha, profile: JSON.parse(files["src/content/profile.json"] || "{}") };
    for (const key of KEYS) {
      out[key] = JSON.parse(files[`src/content/${SCHEMA[key].file}`] || "[]");
    }
    return json(out);
  }

  if (method === "GET" && route === "api/status") {
    const { head } = await readAll(env);
    const runs = await gh(env, `/repos/${OWNER}/${REPO}/actions/runs?per_page=3&branch=${BRANCH}`);
    const build = runs.workflow_runs?.[0];
    return json({
      changed: [],
      log: `${head.sha.slice(0, 7)} ${head.commit.message.split("\n")[0]}`,
      build: build ? { status: build.status, conclusion: build.conclusion, url: build.html_url } : null,
    });
  }

  if (method === "POST" && route === "api/content") {
    const body = await request.json();
    if (!body.rev) return err("缺少 rev，拒绝写入");

    const errors = [];
    const { files, head } = await readAll(env);
    if (body.rev !== head.sha) {
      return err("main 分支在你打开页面之后又前进了（可能本地发布台或 GitHub 网页也改过）。重新载入再保存。", 409);
    }

    const images = new Map();
    try {
      materializeImages(body, images);
    } catch (e) {
      return err(e.message);
    }

    for (const key of KEYS) {
      const items = body[key];
      if (!Array.isArray(items)) {
        errors.push(`${SCHEMA[key].label} 数据格式不对`);
        continue;
      }
      let current = [];
      try {
        current = JSON.parse(files[`src/content/${SCHEMA[key].file}`] || "[]");
      } catch {}
      if (items.length === 0 && current.length > 0 && !body.allowEmpty) {
        errors.push(`${SCHEMA[key].label} 从 ${current.length} 条变成 0 条，不像是要清空。确认要清空请勾选「允许清空」`);
        continue;
      }
      errors.push(...validate(key, items));
    }
    if (errors.length) return json({ errors }, { status: 400 });

    // 图片 blob 和内容 blob 进同一个 commit，加一张图不会多触发一次构建。
    const entries = new Map(images);
    for (const key of KEYS) entries.set(`src/content/${SCHEMA[key].file}`, stringify(body[key]));
    if (body.profile) entries.set("src/content/profile.json", stringify(body.profile));

    const sha = await commitAll(env, entries, (body.message || "").trim() || "content(admin): 更新站点内容", body.rev);
    return json({ ok: true, sha, files: [...entries.keys()] });
  }

  return new Response("Not found", { status: 404 });
}

const worker = {
  async fetch(request, env) {
    if (!env.GITHUB_TOKEN || !env.ADMIN_PASSWORD) {
      return err("Worker 还缺 secret：GITHUB_TOKEN 和 ADMIN_PASSWORD 都要设置", 500);
    }
    try {
      return await handle(request, env);
    } catch (e) {
      return err(e.message, 500);
    }
  },
};

export default worker;
