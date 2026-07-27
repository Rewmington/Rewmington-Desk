"use client";

import { motion } from "framer-motion";
import { projects } from "@/lib/constants";

const statusColors: Record<string, { bg: string; dot: string }> = {
  "编码中": { bg: "bg-[#00D1FF]/20 text-[#00D1FF]", dot: "bg-[#00D1FF]" },
  "规划中": { bg: "bg-amber-400/20 text-amber-400", dot: "bg-amber-400" },
  "已完成": { bg: "bg-[#00FFA3]/20 text-[#00FFA3]", dot: "bg-[#00FFA3]" },
  "测试中": { bg: "bg-violet-400/20 text-violet-400", dot: "bg-violet-400" },
};

export default function ProjectTracker() {
  return (
    <div className="bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-3xl p-5 md:p-6 h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
        <span className="ml-2 text-xs text-slate-500 font-mono">project.tracker</span>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          🚀 暂无项目
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-auto">
          {projects.map((project, index) => {
            const statusStyle = statusColors[project.status] || { bg: "bg-slate-400/20 text-slate-400", dot: "bg-slate-400" };
            return (
              <div key={project.name}>
                {/* 项目头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${statusStyle.dot} shrink-0`} />
                    <span className="text-sm font-semibold text-white truncate">
                      {project.name}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium shrink-0 ${statusStyle.bg}`}>
                    {project.status}
                  </span>
                </div>

                {/* 动画进度条 */}
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden progress-shine">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00D1FF] to-[#00FFA3] rounded-full"
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
                  <p className="text-[11px] text-slate-500 truncate flex-1 mr-2">
                    {project.description}
                  </p>
                  <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                    {project.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
