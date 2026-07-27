"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";

export default function StatusBar() {
  const clock = useClock();

  return (
    <div className="w-full bg-white/15 backdrop-blur-2xl border border-white/40 rounded-2xl px-5 py-2.5 flex items-center justify-between text-xs shadow-lg shadow-black/5">
      {/* 左：时钟 + 状态 */}
      <div className="flex items-center gap-2">
        <div className="font-mono tracking-wider text-gray-600 tabular-nums">{clock}</div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-gray-400 hidden sm:inline">系统正常运行</span>
      </div>

      {/* 右：技术栈 */}
      <div className="hidden md:flex items-center gap-1.5">
        {techBadges.map((badge) => (
          <span
            key={badge.name}
            className="flex items-center gap-1 px-2 py-0.5 bg-white/15 rounded-md text-[11px] text-gray-500"
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
