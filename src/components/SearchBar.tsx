"use client";

import GlassCard from "./GlassCard";

export default function SearchBar() {
  return (
    <GlassCard
      enableTilt={false}
      className="w-full max-w-[800px] mx-auto mb-8"
    >
      <div className="flex items-center gap-3 px-6 py-3">
        <svg
          className="w-5 h-5 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="搜索文章..."
          className="w-full bg-transparent text-gray-800 placeholder-gray-400/50 outline-none text-sm text-center"
        />
      </div>
    </GlassCard>
  );
}
