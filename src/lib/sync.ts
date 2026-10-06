/**
 * 打卡状态的跨设备同步。
 *
 * 存的位置：你自己的一个 secret gist 里的一个 JSON 文件。
 * 为什么可行：站点是纯静态导出、没有后端、没有账号，而 api.github.com 自带 CORS
 * （实测从 wmddd.online 这个 Origin 发预检：Allow-Origin:*，允许 Authorization 头，允许 PATCH）。
 *
 * 为什么安全：token 只存在每台设备的 localStorage 里，不进构建产物 —— 别人打开网站
 * 既读不到（secret gist 匿名读 404）也写不了（写要凭据，实测 401）。
 * 前提是站点继续保持零第三方脚本，否则任何外部 JS 都能从 localStorage 把 token 读走。
 *
 * 合并粒度是「单个方框」而不是「整份文件」：每条记自己的改动时间戳，谁新用谁的。
 * 所以两台设备各自离线打勾、之后联网，不会互相把对方的改动吃掉。
 */

export type Doc = Record<string, Record<string, string>>; // slug -> 条目哈希 -> "1@时间戳"

const FILE = "checkmarks.json";
const GIST_DESC = "Rewmington-Desk 打卡状态（程序自动写，别手改）";
const LS = {
  token: "sync.token",
  gist: "sync.gist",
  doc: "sync.doc",
  at: "sync.at",
  base: "sync.apiBase",
};
const PULL_MIN_MS = 20_000; // 自动拉取的最小间隔，别对着 GitHub 猛刷

/** 只允许指向本机：给本地联调留的后门，公网主机进不来 */
function base(): string {
  try {
    const b = localStorage.getItem(LS.base);
    if (b && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(b)) return b;
  } catch {
    /* 读不到就用默认的 */
  }
  return "https://api.github.com";
}

/** 每条勾选存成 "1@时间戳"；旧格式（纯 "1"/"0"）当时间戳 0 处理 */
export function parseVal(v: string | null): { on: boolean; ts: number } {
  if (v === null) return { on: false, ts: 0 };
  const [flag, tsRaw] = v.split("@");
  const ts = Number(tsRaw);
  return { on: flag === "1", ts: Number.isFinite(ts) ? ts : 0 };
}

export function makeVal(on: boolean, ts = Date.now()): string {
  return `${on ? "1" : "0"}@${ts}`;
}

/** 老数据没有时间戳：补一个最小的 1，够格被推上去，但任何真实改动都能盖过它 */
export function seedVal(v: string): string {
  const { on, ts } = parseVal(v);
  return makeVal(on, ts || 1);
}

export function getToken(): string {
  try {
    return localStorage.getItem(LS.token) || "";
  } catch {
    return "";
  }
}

export function setToken(t: string) {
  try {
    localStorage.setItem(LS.token, t.trim());
  } catch {
    /* ignore */
  }
}

export function lastSyncAt(): number {
  try {
    return Number(localStorage.getItem(LS.at) || 0);
  } catch {
    return 0;
  }
}

function markSynced(ts = Date.now()) {
  try {
    localStorage.setItem(LS.at, String(ts));
  } catch {
    /* ignore */
  }
}

function readDoc(): Doc {
  try {
    return JSON.parse(localStorage.getItem(LS.doc) || "{}") as Doc;
  } catch {
    return {};
  }
}

function writeDoc(d: Doc) {
  try {
    localStorage.setItem(LS.doc, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

/**
 * 逐条取时间戳新的那个。won 放「远端赢了」的条目，调用方拿它去更新页面上已渲染的方框；
 * dirt 表示「本地有东西还没上去」，需要推送。
 */
export function mergeDocs(
  local: Doc,
  remote: Doc,
): { doc: Doc; won: Doc; dirt: boolean } {
  const doc: Doc = {};
  const won: Doc = {};
  let dirt = false;

  for (const slug of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const l = local[slug] || {};
    const r = remote[slug] || {};
    const out: Record<string, string> = {};
    for (const k of new Set([...Object.keys(l), ...Object.keys(r)])) {
      const lt = parseVal(k in l ? l[k] : null);
      const rt = parseVal(k in r ? r[k] : null);
      if (rt.ts > lt.ts) {
        out[k] = r[k];
        (won[slug] ||= {})[k] = r[k];
      } else {
        out[k] = l[k];
        if (lt.ts > rt.ts) dirt = true;
      }
    }
    doc[slug] = out;
  }
  return { doc, won, dirt };
}

/** 把当前页面读到的本地状态折进镜像，免得「点了但没推上去」的改动只躺在 localStorage 里 */
export function foldLocal(slug: string, entries: Record<string, string>): Doc {
  const doc = readDoc();
  const cur = (doc[slug] ||= {});
  for (const [k, v] of Object.entries(entries)) {
    if (parseVal(v).ts >= parseVal(cur[k] ?? null).ts) cur[k] = v;
  }
  writeDoc(doc);
  return doc;
}

async function gh(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${base()}${path}`, {
    ...init,
    credentials: "omit", // 只带 Authorization，不带 cookie
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
}

function docOf(body: unknown): Doc {
  const files = ((body as { files?: Record<string, { content?: string }> })?.files) || {};
  try {
    return JSON.parse(files[FILE]?.content || "{}") as Doc;
  } catch {
    return {};
  }
}

/**
 * 找到（第一次时创建）存状态的那个 gist。
 * 手机侧只填 token 就能干活：用 token 列出自己的 gist，按文件名认出这一个，
 * 所以那串 gist id 不需要跨设备传。
 */
export async function ensureGist(): Promise<string> {
  let cached = "";
  try {
    cached = localStorage.getItem(LS.gist) || "";
  } catch {
    /* ignore */
  }
  if (cached) return cached;

  const res = await gh("/gists?per_page=100");
  const list = res.ok ? ((await res.json()) as { id: string; files: Record<string, unknown> }[]) : [];
  const found = Array.isArray(list) ? list.find((g) => g.files && FILE in g.files) : undefined;
  if (found) {
    try {
      localStorage.setItem(LS.gist, found.id);
    } catch {
      /* ignore */
    }
    return found.id;
  }

  const created = await gh("/gists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: GIST_DESC,
      public: false,
      files: { [FILE]: { content: "{}" } },
    }),
  });
  const body = (await created.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!created.ok || !body.id) throw new Error(`建 gist 失败（${created.status} ${body.message || ""}）`);
  try {
    localStorage.setItem(LS.gist, body.id);
  } catch {
    /* ignore */
  }
  return body.id;
}

export type PullResult = { ok: boolean; won: Doc; dirt: boolean; error?: string };

/** 拉远端并和本地镜像合并；won 是当前设备需要照着改页面的条目 */
export async function pull(force = false): Promise<PullResult> {
  if (!getToken()) return { ok: false, won: {}, dirt: false, error: "没填 token" };
  if (!force && Date.now() - lastSyncAt() < PULL_MIN_MS) {
    return { ok: true, won: {}, dirt: false };
  }
  try {
    const id = await ensureGist();
    const res = await gh(`/gists/${id}`);
    if (!res.ok) throw new Error(`读 gist 失败（${res.status}）`);
    const merged = mergeDocs(readDoc(), docOf(await res.json()));
    writeDoc(merged.doc);
    markSynced();
    return { ok: true, won: merged.won, dirt: merged.dirt };
  } catch (e) {
    return { ok: false, won: {}, dirt: false, error: e instanceof Error ? e.message : String(e) };
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** 改动攒 1.2 秒再上，一次连点只发一次请求 */
export function schedulePush(delay = 1200) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void push();
  }, delay);
}

/**
 * 推之前先重新读一次远端再合并（read-modify-write），
 * 这样另一台设备刚好在你之后推过的东西不会被你这一步覆盖掉。
 */
export async function push(): Promise<{ ok: boolean; error?: string }> {
  if (!getToken()) return { ok: false, error: "没填 token" };
  try {
    const id = await ensureGist();
    let remote: Doc = {};
    const res = await gh(`/gists/${id}`);
    if (res.ok) remote = docOf(await res.json());
    const merged = mergeDocs(readDoc(), remote);
    writeDoc(merged.doc);
    const put = await gh(`/gists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: { [FILE]: { content: JSON.stringify(merged.doc) } },
      }),
    });
    if (!put.ok) throw new Error(`写 gist 失败（${put.status}）`);
    markSynced();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** 填 token 后走一遍完整流程：认/建 gist、拉一次、把本地已有的状态推上去 */
export async function connect(): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureGist();
    const p = await pull(true);
    if (!p.ok) throw new Error(p.error || "拉取失败");
    if (p.dirt) {
      const r = await push();
      if (!r.ok) throw new Error(r.error || "推送失败");
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function forget() {
  try {
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.gist);
    localStorage.removeItem(LS.doc);
    localStorage.removeItem(LS.at);
  } catch {
    /* ignore */
  }
}
