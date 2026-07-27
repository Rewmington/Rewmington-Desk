"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";

export default function StatusBar() {
  const clock = useClock();

  return (
    <div className="w-full bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-2xl px-5 py-2.5 flex items-center justify-between text-xs shadow-[var(--shadow-card)]">
      {/* 左：时钟 + 状态 */}
      <div className="flex items-center gap-2">
        <div className="font-mono tracking-wider text-[var(--text-secondary)] tabular-nums">{clock}</div>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse glow-accent" />
        <span className="text-[var(--text-tertiary)] hidden sm:inline">系统正常运行</span>
      </div>

      {/* 右：技术栈 */}
      <div className="hidden md:flex items-center gap-1.5">
        {techBadges.map((badge) => (
          <span
            key={badge.name}
            className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-subtle)] rounded-md text-[11px] text-[var(--text-secondary)]"
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
