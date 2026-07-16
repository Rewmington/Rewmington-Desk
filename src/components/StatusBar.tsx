"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";

export default function StatusBar() {
  const clock = useClock();

  return (
    <div className="w-full bg-white/40 glass-backdrop border border-white/30 rounded-[24px] px-6 py-3 flex items-center justify-between text-gray-700 text-xs md:text-sm shadow-lg shadow-black/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {/* 左：时钟 + 状态 */}
      <div className="flex items-center gap-2">
        <div className="font-mono tracking-wider text-gray-800">{clock}</div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-gray-600 hidden sm:inline">系统正常运行</span>
      </div>

      {/* 中：技术栈胶囊标签 */}
      <div className="hidden md:flex items-center gap-2">
        {techBadges.map((badge) => (
          <span
            key={badge.name}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/30 rounded-full text-xs text-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d={badge.icon} />
            </svg>
            {badge.name}
          </span>
        ))}
      </div>

    </div>
  );
}
