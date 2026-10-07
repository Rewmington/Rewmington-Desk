"use client";

import type { Project } from "@/types";

const statusDot: Record<string, string> = {
  "编码中": "bg-[var(--accent-secondary)]",
  "规划中": "bg-amber-400",
  "已完成": "bg-[var(--accent-primary)]",
  "测试中": "bg-violet-400",
};

/**
 * 一行一个项目：左边名字，右边一个数就够。
 * 有手工进度就报进度，否则报仓库事实（语言 / star / 最近动过）。
 * 描述不在这张卡里 —— 它长短不可控，两行截断会把中文尾巴吃掉，完整描述在 /projects 页。
 */
function rightSide(p: Project) {
  if (typeof p.progress === "number") return `${p.progress}%`;
  return [
    p.status !== "编码中" ? p.status : "",
    p.language,
    p.stars ? `★${p.stars}` : "",
    p.pushedAt ? p.pushedAt.slice(5, 10) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function ProjectTracker({ items }: { items: Project[] }) {
  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-3xl p-5 md:p-6 h-full shadow-[var(--shadow-card)] flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)] text-sm">
          🚀 暂无项目
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-auto">
          {items.map((project) => (
            <div key={project.url} className="flex items-center gap-2 min-w-0">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[project.status] || "bg-slate-400"}`}
              />
              <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                {project.name}
              </span>
              <span className="ml-auto shrink-0 text-[11px] text-[var(--text-tertiary)] tabular-nums">
                {rightSide(project)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
