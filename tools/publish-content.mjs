import { mkdir, rm, writeFile, readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { notesMeta } from "./notes-meta.mjs";

// 把 src/content/*.json 原样快照到 out/content/，并把文章元数据也快照一份，
// 让 /admin 页面能用**同源**的 fetch("/content/photos.json") 读到当前内容。
//
// 为什么不走 raw.githubusercontent.com：实测在用户这台机器上该域名三次请求只通了一次
// （200/000/000），而同源请求走的是他打开站点用的同一条路。
//
// 代价：这份快照来自上一次成功构建，可能落后于 main。真正的兜底是 GitHub 的编辑页——
// 粘贴后它会先给你看 diff，不会静默覆盖。
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "src", "content");
const DEST = resolve(ROOT, "out", "content");

await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });

const names = (await readdir(SRC)).filter((f) => f.endsWith(".json"));
// 逐文件读写，不用 fs.cp：它的 filter 只在 recursive:true 下生效，配错会静默跳过整目录。
for (const name of names) {
  await writeFile(join(DEST, name), await readFile(join(SRC, name)));
}

// 文章的正体是 src/content/notes/*.md，构建期就被渲染成静态页了，运行时读不到源文件，
// 所以这里只快照一份元数据清单给 /admin 用。它不含正文，改文章仍然要去 GitHub 改那个 md。
const notes = await notesMeta(ROOT);
await writeFile(join(DEST, "notes.json"), `${JSON.stringify(notes, null, 2)}\n`);

const files = [...names.map((f) => f.replace(/\.json$/, "")), "notes"];
await writeFile(
  resolve(DEST, "manifest.json"),
  JSON.stringify({ files }) + "\n"
);

console.log(`内容快照 → out/content/：${files.join(", ")}（文章 ${notes.length} 篇）`);
