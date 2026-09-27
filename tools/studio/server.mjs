import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = join(ROOT, "src", "content");
const IMAGES = join(ROOT, "public", "images", "posts");
const PORT = Number(process.env.STUDIO_PORT || 5178);

const SCHEMA = {
  articles: {
    label: "文章",
    file: "articles.json",
    id: true,
    fields: [
      ["title", "标题", "text"],
      ["description", "摘要", "textarea"],
      ["cover", "封面", "image"],
      ["date", "日期", "date"],
      ["tags", "标签", "list"],
      ["variant", "版式", "enum", ["image", "text-overlay"]],
    ],
  },
  projects: {
    label: "项目",
    file: "projects.json",
    fields: [
      ["name", "名称", "text"],
      ["description", "简介", "textarea"],
      ["url", "链接", "text"],
      ["tags", "技术栈", "list"],
      ["progress", "进度 %", "number"],
      ["status", "状态", "enum", ["编码中", "规划中", "已完成", "测试中"]],
    ],
  },
  photos: {
    label: "照片",
    file: "photos.json",
    id: true,
    fields: [
      ["src", "图片", "image"],
      ["caption", "说明", "text"],
      ["date", "日期", "date"],
      ["location", "地点", "text"],
    ],
  },
  friends: {
    label: "友链",
    file: "friends.json",
    fields: [
      ["name", "名称", "text"],
      ["url", "链接", "text"],
      ["avatar", "头像", "image"],
      ["bio", "介绍", "textarea"],
    ],
  },
  music: {
    label: "音乐",
    file: "music.json",
    id: true,
    fields: [
      ["title", "曲名", "text"],
      ["artist", "作者", "text"],
      ["src", "音频地址", "text"],
      ["cover", "封面", "image"],
    ],
  },
};

const KEYS = Object.keys(SCHEMA);

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(await readFile(path, "utf8"));
}

function validate(key, items) {
  const schema = SCHEMA[key];
  const errors = [];
  items.forEach((item, i) => {
    for (const [field, label, kind, allowed] of schema.fields) {
      const value = item[field];
      if (value === undefined || value === null) {
        errors.push(`${schema.label} 第 ${i + 1} 项缺少「${label}」字段`);
        continue;
      }
      if (kind === "number" && (!Number.isFinite(value) || value < 0 || value > 100)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」必须是 0-100 的数字`);
      }
      if (kind === "enum" && !allowed.includes(value)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」只能是：${allowed.join(" / ")}`);
      }
      if (kind === "list" && !Array.isArray(value)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」必须是数组`);
      }
    }
  });
  if (schema.id) {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item.id)) errors.push(`${schema.label} 有重复 id：${item.id}`);
      seen.add(item.id);
    }
  }
  return errors;
}

async function snapshot() {
  const out = { profile: await readJson(join(CONTENT, "profile.json"), {}) };
  for (const key of KEYS) out[key] = await readJson(join(CONTENT, SCHEMA[key].file), []);
  out.rev = await revision();
  return out;
}

// 编辑期间如果文件被别处改过（手动编辑、git 操作、另一个窗口），整包写回会把对方的
// 改动静默覆盖掉，所以用文件指纹做一次乐观并发检查。
async function revision() {
  const files = ["profile.json", ...KEYS.map((k) => SCHEMA[k].file)];
  const hash = createHash("sha1");
  for (const f of files) {
    hash.update(f);
    hash.update(existsSync(join(CONTENT, f)) ? await readFile(join(CONTENT, f)) : "");
  }
  return hash.digest("hex").slice(0, 12);
}

function git(args) {
  return run("git", args, { cwd: ROOT }).then((r) => (r.stdout + r.stderr).trim());
}

// 纯字符串数组折回一行，否则每次保存都会把仓库里的 tags 撑成一大坨 diff。
function stringify(value) {
  return JSON.stringify(value, null, 2).replace(
    /\[\s*\n((?:\s*"(?:[^"\\]|\\.)*",?\s*\n)+)\s*\]/g,
    (_m, inner) => `[${inner.trim().split("\n").map((s) => s.trim().replace(/,$/, "")).join(", ")}]`
  );
}

async function gitOut(args) {
  try {
    return await git(args);
  } catch (e) {
    return String(e.stdout ?? "").trim() || `失败：${e.message}`;
  }
}

function send(res, code, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(payload);
}

function collectBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((res, rej) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        rej(new Error("内容过大"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => res(Buffer.concat(chunks)));
    req.on("error", rej);
  });
}

async function saveImage(raw) {
  let bytes = Buffer.from(raw.dataBase64, "base64");
  const originalExt = (raw.name.match(/\.(png|jpe?g|webp|avif|gif)$/i) ?? [".jpg"])[0].toLowerCase();
  let ext = originalExt;
  let note = "";

  try {
    const { default: sharp } = await import("sharp");
    const max = raw.kind === "avatar" ? 512 : 1600;
    const info = await sharp(bytes).metadata();
    const resized = await sharp(bytes)
      .rotate()
      .resize({ width: Math.min(max, info.width || max), withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    if (resized.length < bytes.length) {
      note = `已重编码压缩：${(bytes.length / 1024).toFixed(0)} KB → ${(resized.length / 1024).toFixed(0)} KB`;
      bytes = resized;
      ext = ".jpg";
    } else {
      note = "原图已经够小，按原样保存";
    }
  } catch {
    note = "未安装 sharp，按原样保存（npm i -D sharp 可自动压缩）";
  }

  const safe = String(raw.name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  if (!safe) throw new Error("文件名清理后为空，请换一个含英文或数字的名字");

  const filename = `${safe}${ext}`;
  await mkdir(IMAGES, { recursive: true });
  await writeFile(join(IMAGES, filename), bytes);
  return { src: `/images/posts/${filename}`, bytes: bytes.length, note, filename };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://studio");
  try {
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, await readFile(join(ROOT, "tools", "studio", "ui.html"), "utf8"), "text/html; charset=utf-8");
    }

    if (req.method === "GET" && url.pathname === "/api/schema") {
      return send(res, 200, { schema: SCHEMA, keys: KEYS });
    }

    if (req.method === "GET" && url.pathname === "/api/content") {
      return send(res, 200, await snapshot());
    }

    if (req.method === "POST" && url.pathname === "/api/content") {
      const body = JSON.parse((await collectBody(req)).toString("utf8"));
      const errors = [];

      if (body.rev !== (await revision())) {
        return send(res, 409, {
          errors: ["磁盘上的内容文件已经变了（可能在别处改过）。先点「重载」重新读取，再保存，否则会覆盖掉那边的改动。"],
        });
      }

      for (const key of KEYS) {
        const items = body[key];
        if (!Array.isArray(items)) {
          errors.push(`${SCHEMA[key].label} 数据格式不对`);
          continue;
        }
        const current = await readJson(join(CONTENT, SCHEMA[key].file), []);
        if (items.length === 0 && current.length > 0 && !body.allowEmpty) {
          errors.push(`${SCHEMA[key].label} 从 ${current.length} 条变成 0 条，不像是要清空。确认要清空请勾选「允许清空」`);
          continue;
        }
        errors.push(...validate(key, items));
      }
      if (errors.length) return send(res, 400, { errors });

      for (const key of KEYS) {
        await writeFile(join(CONTENT, SCHEMA[key].file), `${stringify(body[key])}\n`);
      }
      if (body.profile) {
        await writeFile(join(CONTENT, "profile.json"), `${stringify(body.profile)}\n`);
      }
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && url.pathname === "/api/image") {
      const body = JSON.parse((await collectBody(req)).toString("utf8"));
      return send(res, 200, await saveImage(body));
    }

    if (req.method === "GET" && url.pathname === "/api/status") {
      // porcelain 每行是「2 个状态字符 + 1 个空格 + 路径」，首行的前导空格不能被 trim 掉，
      // 所以这里直接按固定宽度切片，而不是把原始文本丢给前端去猜。
      let changed = [];
      try {
        const { stdout } = await run(
          "git",
          ["status", "--porcelain", "--", "src/content", "public/images", "siteConfig.ts"],
          { cwd: ROOT }
        );
        changed = stdout.split("\n").filter((l) => l.trim()).map((l) => l.slice(3).replace(/^.*-> /, "").replace(/^"|"$/g, ""));
      } catch (e) {
        changed = [`读取失败：${e.message}`];
      }
      const [log, ahead] = await Promise.all([
        gitOut(["log", "-1", "--format=%h %s (%cr)"]),
        gitOut(["rev-list", "--count", "@{u}..HEAD"]),
      ]);
      return send(res, 200, { changed, log, ahead });
    }

    if (req.method === "POST" && url.pathname === "/api/publish") {
      const body = JSON.parse((await collectBody(req)).toString("utf8"));
      const message = (body.message || "").trim() || "content: 更新站点内容";
      const steps = [];
      steps.push(await gitOut(["add", "src/content", "src/app", "public/images"]));
      const status = await gitOut(["diff", "--cached", "--name-only"]);
      if (!status) return send(res, 200, { ok: true, steps: ["没有需要提交的改动"] });
      steps.push(await gitOut(["commit", "-m", message]));
      steps.push(await gitOut(["push"]));
      return send(res, 200, { ok: true, steps: steps.filter(Boolean), committed: status.split("\n") });
    }

    return send(res, 404, { error: "not found" });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`内容发布台：http://127.0.0.1:${PORT}`);
});
