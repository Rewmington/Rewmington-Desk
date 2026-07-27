"use client";

import { useClock } from "@/hooks/useClock";
import { techBadges } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";

export default function SystemTopBar() {
  const clock = useClock();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="w-full bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-2xl px-4 md:px-5 py-2 flex items-center justify-between gap-3 shadow-[var(--shadow-card)]">
        {/* 左：Logo + 搜索 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[var(--text-primary)] shrink-0">⚡ OS</span>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] rounded-lg transition-colors text-xs text-[var(--text-tertiary)] min-w-[160px] md:min-w-[200px]"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>搜索...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 bg-[var(--bg-subtle)] rounded text-[9px] text-[var(--text-tertiary)] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* 右：技术栈 + 时钟 + 状态 */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* 技术栈图标 */}
          <div className="hidden md:flex items-center gap-1">
            {techBadges.map((badge) => (
              <span
                key={badge.name}
                className="w-6 h-6 flex items-center justify-center bg-[var(--bg-subtle)] rounded-md hover:bg-[var(--bg-subtle-hover)] transition-colors"
                title={badge.name}
              >
                <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d={badge.icon} />
                </svg>
              </span>
            ))}
          </div>

          <div className="hidden md:block w-px h-3.5 bg-[var(--border-subtle)]" />

          {/* 时钟 */}
          <div className="font-mono tracking-wider text-xs text-[var(--text-secondary)] tabular-nums">
            {clock}
          </div>

          {/* 状态灯 */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse glow-accent" />
            <span className="hidden sm:inline text-[10px] text-[var(--text-tertiary)]">Active</span>
          </div>
        </div>
      </div>

      {/* 搜索弹窗 */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg mx-4 bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <svg className="w-5 h-5 text-[var(--text-secondary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章、项目..."
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-sm"
                autoFocus
              />
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-subtle)] rounded text-[10px] text-[var(--text-tertiary)] font-mono">
                ESC
              </kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
