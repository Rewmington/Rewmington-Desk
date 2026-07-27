"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";

export default function StatusBar() {
  const clock = useClock();

  return (
    <div className="w-full bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-2xl px-5 py-2.5 flex items-center justify-between text-xs shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* 左：时钟 + 状态 */}
      <div className="flex items-center gap-2">
        <div className="font-mono tracking-wider text-slate-300 tabular-nums">{clock}</div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse glow-accent" />
        <span className="text-slate-500 hidden sm:inline">系统正常运行</span>
      </div>

      {/* 右：技术栈 */}
      <div className="hidden md:flex items-center gap-1.5">
        {techBadges.map((badge) => (
          <span
            key={badge.name}
            className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-md text-[11px] text-slate-400"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d={badge.icon} />
            </svg>
            {badge.name}
          </span>
        ))}
      </div>
    </div>
  );
}
