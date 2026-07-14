"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";

export default function StatusBar() {
  const clock = useClock();

  return (
    <div className="w-full bg-black/50 backdrop-blur-md rounded-3xl px-6 py-3 flex items-center justify-between text-white/70 text-xs md:text-sm">
      {/* 时钟 */}
      <div className="font-mono tracking-wider">{clock}</div>

      {/* 技术栈图标 */}
      <div className="flex items-center gap-3">
        {techBadges.map((badge) => (
          <a
            key={badge.name}
            href="#"
            className="hover:text-white transition-colors"
            title={badge.name}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d={badge.icon} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
