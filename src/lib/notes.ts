import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * 知识库内容源：src/content/notes/*.md
 *
 * 为什么用 md 而不是 JSON：讲义是长文，带表格和代码块，
 * 在 JSON 字符串里写这些等于跟转义搏斗。md 可以单独打开编辑，也能被 /admin 之外的
 * 任何编辑器改。
 *
 * 这些文件只在**构建期**被读（output: export 会把每个 slug 预渲染成静态页），
 * 所以不需要像 publish-content.mjs 那样把源文件快照到 out/ 供运行时 fetch。
 */

const NOTES_DIR = path.join(process.cwd(), "src", "content", "notes");

export interface NoteMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  kind: string;
  tags: string[];
  order: number;
  minutes: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Note extends NoteMeta {
  html: string;
  toc: TocItem[];
}

/** marked 会把正文里的引号等转成 HTML 实体，目录是纯文本，得还原回来 */
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripTags(s: string) {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).trim();
}

/** 归一化：去掉标签、把连续空白压成一个空格，让「同一句话换个换行」也算同一条 */
function normalize(s: string) {
  return stripTags(s).replace(/\s+/g, " ");
}

/**
 * 复选框的稳定标识。
 *
 * 以前前端按方框在页面里出现的**顺序**编号存状态，于是在文档前面插一个方框，
 * 后面所有历史勾选就整体错位一格。这里改成按内容算哈希：
 *   所在小节标题 + 条目文字 + 同小节内第几次出现
 * 第三项是必须的：weekly-plan 里「算法 2 题」出现了 7 次，光靠文字无法区分。
 * 按小节分组后，它们分属不同的 h3，天然不撞；万一同一小节里真有两个同名条目，
 * 才靠序号区分。
 */
function checkToken(scope: string, text: string, dup: number) {
  return createHash("sha1")
    .update(`${scope}\u0001${text}\u0001${dup}`)
    .digest("hex")
    .slice(0, 12);
}

/** 粗估阅读时长：中日韩字符按 350/分，拉丁词按 200/分 */
function readingMinutes(raw: string) {
  const cjk = (raw.match(/[一-龥]/g) || []).length;
  const latin = (raw.replace(/[一-龥]/g, "").match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 350 + latin / 200));
}

function toMeta(slug: string, data: Record<string, unknown>, raw: string): NoteMeta {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    kind: typeof data.kind === "string" ? data.kind : "笔记",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    order: typeof data.order === "number" ? data.order : 0,
    minutes: readingMinutes(raw),
  };
}

/**
 * 给每个复选框打上 data-k（内容哈希），前端拿它当存储键。
 * 单趟扫描：小标题决定当前 scope，方框取到最近的 </li> 之间是条目文字。
 */
function tagCheckboxes(html: string) {
  const seen = new Map<string, number>();
  let scope = "（第一小节之前）";
  let out = "";
  let cursor = 0;
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>|<input\b[^>]*class="md-check"[^>]*>/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    out += html.slice(cursor, m.index);
    cursor = re.lastIndex;

    if (m[2] !== undefined) {
      const t = normalize(m[2]);
      if (t) scope = t;
      out += m[0];
      continue;
    }

    const liEnd = html.indexOf("</li>", cursor);
    const text = normalize(liEnd < 0 ? "" : html.slice(cursor, liEnd));
    const dupKey = `${scope}\u0001${text}`;
    const dup = seen.get(dupKey) ?? 0;
    seen.set(dupKey, dup + 1);

    out += m[0].replace(
      'class="md-check"',
      `class="md-check" data-k="${checkToken(scope, text, dup)}"`,
    );
  }

  return out + html.slice(cursor);
}

/** marked 不认识锚点和可勾选框，这里统一补上 */
function renderBody(content: string) {
  // md 里那行一级标题跟 frontmatter 的 title 重复，页面顶部已经渲染过标题了
  const body = content.replace(/^\s*#\s+.*\r?\n+/, "");
  const raw = marked.parse(body, { async: false }) as string;
  const toc: TocItem[] = [];
  let n = 0;

  let html = raw.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
    n += 1;
    const id = `s${n}`;
    toc.push({ id, text: stripTags(inner), level: Number(lvl) });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });

  // 任务清单默认带 disabled，去掉它才能在阅读模式下直接点
  html = html.replace(/<input\b[^>]*>/g, (tag) =>
    tag.includes("checkbox")
      ? tag.replace(/\s*disabled(?:\s*=\s*"[^"]*")?/, "").replace("<input", '<input class="md-check"')
      : tag,
  );

  html = tagCheckboxes(html);

  // 宽表在手机上会撑破版面，套一层可横向滚动的容器
  html = html.replace(/<table>/g, '<div class="md-tw"><table>').replace(/<\/table>/g, "</table></div>");

  return { html, toc };
}

function files() {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md"));
}

export function listNotes(): NoteMeta[] {
  return files()
    .map((f) => {
      const raw = fs.readFileSync(path.join(NOTES_DIR, f), "utf8");
      const parsed = matter(raw);
      return toMeta(f.replace(/\.md$/, ""), parsed.data, raw);
    })
    .sort((a, b) => b.order - a.order || (a.date < b.date ? 1 : -1));
}

export function getNote(slug: string): Note | null {
  const file = path.join(NOTES_DIR, `${slug}.md`);
  // slug 来自 URL，先确认它没有跳出 notes 目录再去读文件
  if (!fs.existsSync(file) || !path.resolve(file).startsWith(path.resolve(NOTES_DIR))) {
    return null;
  }
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const { html, toc } = renderBody(parsed.content);
  return { ...toMeta(slug, parsed.data, raw), html, toc };
}

/** 上一篇 / 下一篇：按列表顺序取相邻项 */
export function neighbors(slug: string) {
  const list = listNotes();
  const i = list.findIndex((n) => n.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: i > 0 ? list[i - 1] : null, next: i < list.length - 1 ? list[i + 1] : null };
}
