"use client";

import { motion } from "framer-motion";
import type { Project } from "@/types";

const statusColors: Record<string, { bg: string; dot: string }> = {
  "编码中": { bg: "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]", dot: "bg-[var(--accent-secondary)]" },
  "规划中": { bg: "bg-amber-400/20 text-amber-400", dot: "bg-amber-400" },
  "已完成": { bg: "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]", dot: "bg-[var(--accent-primary)]" },
  "测试中": { bg: "bg-violet-400/20 text-violet-400", dot: "bg-violet-400" },
};

/** GitHub 的最近 push 只取到「哪天」，够判断一个项目是不是还活着 */
function pushed(iso?: string) {
  return iso ? iso.slice(0, 10) : "";
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
        <div className="flex-1 space-y-4 overflow-auto">
          {items.map((project, index) => {
            const statusStyle = statusColors[project.status] || { bg: "bg-slate-400/20 text-slate-400", dot: "bg-slate-400" };
            return (
              <div key={project.url}>
                {/* 项目头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${statusStyle.dot} shrink-0`} />
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {project.name}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium shrink-0 ${statusStyle.bg}`}>
                    {project.status}
                  </span>
                </div>

                {typeof project.progress === "number" ? (
                  <>
                    {/* 动画进度条 */}
                    <div className="w-full h-2.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden progress-shine">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{
                          duration: 1.5,
                          delay: 0.3 + index * 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      />
                    </div>

                    {/* 进度 + 描述 */}
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate flex-1 mr-2">
                        {project.description}
                      </p>
                      <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0">
                        {project.progress}%
                      </span>
                    </div>
                  </>
                ) : (
                  /* 自动抓来的仓库没有"完成度"这个东西，那就只报事实：语言、star、最近动过 */
                  <>
                    <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2">
                      {project.description || "（仓库没填描述）"}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1 tabular-nums">
                      {[project.language, project.stars ? `★${project.stars}` : "", pushed(project.pushedAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
