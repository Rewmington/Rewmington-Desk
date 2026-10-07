import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

export const NOTES_DIR = "src/content/notes";

/**
 * 读出 src/content/notes/*.md 的元数据清单，供构建快照和本地发布台使用。
 *
 * 线上的真值只由 src/lib/notes.ts 决定（它在构建期渲染页面）。这里的默认值和排序
 * 必须跟它的 toMeta() / listNotes() 保持一致，否则 /admin 列出的顺序和标题会跟
 * 站点上看到的对不上。
 */
export async function notesMeta(root) {
  const dir = join(root, NOTES_DIR);
  const names = (await readdir(dir, { withFileTypes: true }).catch(() => []))
    .filter((d) => d.isFile() && d.name.endsWith(".md"))
    .map((d) => d.name);

  const items = await Promise.all(
    names.map(async (name) => {
      const { data } = matter(await readFile(join(dir, name), "utf8"));
      const slug = name.replace(/\.md$/, "");
      return {
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        description: typeof data.description === "string" ? data.description : "",
        date: typeof data.date === "string" ? data.date : "",
        kind: typeof data.kind === "string" ? data.kind : "笔记",
        tags: Array.isArray(data.tags) ? data.tags : [],
        order: typeof data.order === "number" ? data.order : 0,
      };
    })
  );

  return items.sort((a, b) => b.order - a.order || (a.date < b.date ? 1 : -1));
}
