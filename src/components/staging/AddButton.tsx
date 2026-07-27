"use client";

import { useState } from "react";
import type { ContentType } from "@/types";
import AddDialog from "./AddDialog";

const CONTENT_LABELS: Record<ContentType, string> = {
  article: "添加文章",
  project: "添加项目",
  friend: "添加友链",
  music: "添加音乐",
  photo: "添加照片",
};

const CONTENT_ICONS: Record<ContentType, string> = {
  article: "📝",
  project: "💻",
  friend: "🔗",
  music: "🎵",
  photo: "📷",
};

interface AddButtonProps {
  contentType: ContentType;
}

export default function AddButton({ contentType }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 浮动添加按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-[var(--bg-card)] glass-backdrop border border-[var(--border-card)] shadow-[var(--shadow-card)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:scale-110 transition-all duration-200 group"
        title={CONTENT_LABELS[contentType]}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] glass-backdrop border border-[var(--border-card)] text-[var(--text-secondary)] text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {CONTENT_ICONS[contentType]} {CONTENT_LABELS[contentType]}
        </span>
      </button>

      {/* 添加对话框 */}
      <AddDialog
        contentType={contentType}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
