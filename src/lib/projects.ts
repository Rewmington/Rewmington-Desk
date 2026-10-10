import fs from "node:fs";
import path from "node:path";
import overridesRaw from "@/content/projects.json";
import { PROJECT_STATUSES } from "@/types";
import type { Project, ProjectStatus } from "@/types";

/**
 * 项目清单：GitHub 的公开仓库是主源，src/content/projects.json 只是覆盖表。
 *
 * 抓取由 tools/fetch-repos.mjs 在 next build 之前完成，结果落在
 * src/content/github-repos.json（提交进仓库，所以断网也能构建）。
 *
 * 合并规则，按重要性排：
 * 1. projects.json 里 url 指向同一个仓库的条目 = 覆盖：可以改显示名、简介、标签，
 *    以及 GitHub 给不出来的 progress 和 status。
 * 2. projects.json 里 GitHub 没有的条目 = 手工项目（没开源的东西），照原样排在自动项后面。
 * 3. 没被覆盖的仓库：标签取「主语言 + 仓库 topics」，状态按是否归档推成 已完成 / 编码中，
 *    progress 留空 —— 界面就没有进度条，改画「语言 · ★ · 最近 push」，不编造完成度。
 *
 * 排序跟着 GitHub 的 pushed 倒序，所以新推过的项目自然浮到最上面。
 */

type Repo = {
  name: string;
  description: string;
  url: string;
  language: string;
  topics: string[];
  stars: number;
  pushedAt: string;
  archived: boolean;
};

/** 覆盖表和仓库靠 url 末段的仓库名对上，比如 .../Rewmington-Blog ↔ Rewmington-Blog */
function repoKey(url: string) {
  return String(url).split("/").filter(Boolean).pop()?.toLowerCase() ?? "";
}

function readRepos(): Repo[] {
  const file = path.join(process.cwd(), "src", "content", "github-repos.json");
  try {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(json?.repos) ? json.repos : [];
  } catch {
    return [];
  }
}

/** 覆盖表：只有 name 和 url 是必须的，其余留空就沿用 GitHub 给出来的值 */
type Override = Partial<Project> & Pick<Project, "name" | "url">;

const overrides = overridesRaw as Override[];

// 和之前一样在构建期硬校验：这份 JSON 是在 GitHub 网页上手改的，写错状态宁可构建报错，
// 也不要界面上静默出现一个灰点。
overrides.forEach((o, i) => {
  if (o.status !== undefined && !PROJECT_STATUSES.includes(o.status)) {
    throw new Error(
      `src/content/projects.json 第 ${i + 1} 项的 status 是 ${JSON.stringify(o.status)}，只能是：${PROJECT_STATUSES.join(" / ")}`,
    );
  }
  if (o.progress !== undefined && o.progress !== null && !Number.isFinite(o.progress)) {
    throw new Error(`src/content/projects.json 第 ${i + 1} 项的 progress 是 ${JSON.stringify(o.progress)}，得是数字或不填`);
  }
});

const byKey = new Map(overrides.map((o) => [repoKey(o.url), o]));
const matched = new Set<string>();

const fromGitHub: Project[] = readRepos().map((r) => {
  const key = r.name.toLowerCase();
  const o = byKey.get(key);
  if (o) matched.add(key);
  const tags = o?.tags?.length ? o.tags : [...(r.language ? [r.language] : []), ...(r.topics ?? [])].slice(0, 3);
  return {
    name: o?.name || r.name,
    description: o?.description ?? r.description ?? "",
    tags,
    url: o?.url || r.url,
    progress: typeof o?.progress === "number" ? o.progress : null,
    status: (o?.status || (r.archived ? "已完成" : "编码中")) as ProjectStatus,
    language: r.language || "",
    stars: r.stars ?? 0,
    pushedAt: r.pushedAt || "",
  };
});

// GitHub 上没有的条目 = 手工项目（没开源的东西），补齐字段后排在自动项后面
const manual: Project[] = overrides
  .filter((o) => !matched.has(repoKey(o.url)))
  .map((o) => ({
    name: o.name,
    description: o.description ?? "",
    tags: o.tags ?? [],
    url: o.url,
    progress: typeof o.progress === "number" ? o.progress : null,
    status: o.status ?? "编码中",
    language: o.language ?? "",
    stars: o.stars ?? 0,
    pushedAt: o.pushedAt ?? "",
  }));

export function listProjects(): Project[] {
  return [...fromGitHub, ...manual];
}
