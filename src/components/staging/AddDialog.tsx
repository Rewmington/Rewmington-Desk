"use client";

import { useState } from "react";
import type { ContentType } from "@/types";
import { useStaging } from "@/hooks/useStaging";
import ArticleForm from "./forms/ArticleForm";
import ProjectForm from "./forms/ProjectForm";
import FriendForm from "./forms/FriendForm";
import MusicForm from "./forms/MusicForm";
import PhotoForm from "./forms/PhotoForm";
import DataManager from "./DataManager";

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

interface AddDialogProps {
  contentType: ContentType;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDialog({
  contentType,
  isOpen,
  onClose,
}: AddDialogProps) {
  const { addItem } = useStaging();
  const [showManager, setShowManager] = useState(false);
  const [staged, setStaged] = useState(false);

  if (!isOpen) return null;

  const handleStaged = (data: Record<string, unknown>) => {
    addItem(contentType, data);
    setStaged(true);
    setTimeout(() => {
      setStaged(false);
    }, 2000);
  };

  const handleClose = () => {
    setStaged(false);
    onClose();
  };

  const renderForm = () => {
    switch (contentType) {
      case "article":
        return <ArticleForm onStaged={handleStaged} />;
      case "project":
        return <ProjectForm onStaged={handleStaged} />;
      case "friend":
        return <FriendForm onStaged={handleStaged} />;
      case "music":
        return <MusicForm onStaged={handleStaged} />;
      case "photo":
        return <PhotoForm onStaged={handleStaged} />;
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-fade-in-up"
        onClick={handleClose}
      />

      {/* 对话框 */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-[560px] bg-[rgba(20,21,23,0.85)] glass-backdrop border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 pointer-events-auto animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {CONTENT_ICONS[contentType]} {CONTENT_LABELS[contentType]}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 暂存成功提示 */}
          {staged && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] text-sm text-center">
              ✅ 已暂存到本地！可在导航栏数据管理中导出
            </div>
          )}

          {/* 表单区 */}
          {renderForm()}

          {/* 底部按钮 */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowManager(true)}
              className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
              管理暂存数据
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 数据管理面板 */}
      <DataManager isOpen={showManager} onClose={() => setShowManager(false)} />
    </>
  );
}
