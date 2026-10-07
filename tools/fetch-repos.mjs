import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 构建前跑这一步：把你 GitHub 名下的公开仓库抓成 src/content/github-repos.json。
 *
 * 不用 token：公开仓库匿名就能读（免费额度 60 次/小时，一次构建只用 1 次）。
 * 只留页面要用的字段：原始响应一条仓库就 3KB 多，全存进仓库会让 diff 没法看。
 * 抓到的结果**提交进 git**，所以本地断网、GitHub 抽风都能拿上一版继续构建。
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = resolve(ROOT, "src", "content", "github-repos.json");
const API = "https://api.github.com/users/Rewmington/repos?per_page=100&sort=pushed";

let old = null;
try {
  old = JSON.parse(await readFile(DEST, "utf8"));
} catch {
  /* 第一次跑还没有缓存文件 */
}

let payload = old;

try {
  const res = await fetch(API, {
    headers: { "user-agent": "Rewmington-Desk build", accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error("响应不是仓库数组");

  const repos = json
    .filter((r) => !r.fork) // fork 出来的别人项目不算作品
    .map((r) => ({
      name: r.name,
      description: r.description || "",
      url: r.html_url,
      language: r.language || "",
      topics: r.topics || [],
      stars: r.stargazers_count || 0,
      pushedAt: r.pushed_at || "",
      archived: !!r.archived,
    }));

  if (!repos.length) throw new Error("抓到 0 个仓库，不像真的");
  payload = { fetchedAt: new Date().toISOString(), repos };
} catch (e) {
  // 故意不让构建失败：构建红了等于站点悄悄停在旧版本，比项目栏少一条更难查。
  const n = old?.repos?.length ?? 0;
  console.warn(
    `GitHub 仓库抓取失败（${e instanceof Error ? e.message : e}）` +
      (n ? `，沿用缓存里的 ${n} 条（缓存于 ${old.fetchedAt}）` : "，而且本地没有可用缓存，这次按空清单构建"),
  );
  if (!payload) payload = { fetchedAt: "", repos: [] };
}

await writeFile(DEST, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`GitHub 项目清单 → src/content/github-repos.json：${payload.repos.length} 条`);
