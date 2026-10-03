import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * 知识库内容源：src/content/notes/*.md
 *
 * 为什么用 md 而不是像 articles.json 那样用 JSON：讲义是长文，带表格和代码块，
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

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, "").trim();
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
