"use client";

import { useEffect } from "react";
import { useStaging } from "@/hooks/useStaging";
import type { ContentType, StagingItem } from "@/types";

const TYPE_LABELS: Record<ContentType, string> = {
  article: "📝 文章",
  project: "💻 项目",
  friend: "🔗 友链",
  music: "🎵 音乐",
  photo: "📷 照片",
};

const TYPE_ORDER: ContentType[] = [
  "article",
  "project",
  "friend",
  "music",
  "photo",
];

function getItemSummary(item: StagingItem): string {
  const d = item.data;
  switch (item.type) {
    case "article":
      return (d.title as string) || "无标题";
    case "project":
      return (d.name as string) || "无名称";
    case "friend":
      return (d.name as string) || "无名称";
    case "music":
      return `${d.title || "未知"} - ${d.artist || "未知"}`;
    case "photo":
      return (d.caption as string) || (d.src as string) || "无说明";
    default:
      return "未知";
  }
}

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataManager({ isOpen, onClose }: DataManagerProps) {
  const { items, refresh, removeItem, clearAll, downloadExport } = useStaging();

  // 每次打开时从 localStorage 刷新数据
  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  if (!isOpen) return null;

  // 刷新数据
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<string, StagingItem[]>
  );

  const hasItems = items.length > 0;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 侧边抽屉 */}
      <div className="fixed top-0 right-0 z-[60] h-full w-[400px] max-w-[90vw] bg-white/40 glass-backdrop border-l border-white/30 shadow-xl shadow-black/5 animate-slide-in-right flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-lg font-bold text-gray-800">📦 暂存数据管理</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
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

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasItems ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 text-sm">
                暂无暂存数据
              </p>
              <p className="text-gray-400 text-xs mt-1">
                点击页面上的 + 按钮添加内容
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {TYPE_ORDER.map((type) => {
                const typeItems = grouped[type];
                if (!typeItems || typeItems.length === 0) return null;

                return (
                  <div key={type}>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">
                      {TYPE_LABELS[type]}{" "}
                      <span className="text-gray-400 font-normal">
                        ({typeItems.length})
                      </span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {typeItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/20 border border-white/20"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">
                              {getItemSummary(item)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.stagedAt).toLocaleString("zh-CN")}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-400/30 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            title="删除"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        {hasItems && (
          <div className="p-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                共 {items.length} 条暂存数据
              </span>
              <button
                onClick={() => {
                  if (confirm("确定清空所有暂存数据？")) {
                    clearAll();
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                清空全部
              </button>
            </div>
            <button
              onClick={() => {
                downloadExport();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all shadow-md flex items-center justify-center gap-2"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              导出数据 (JSON)
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              导出后请将文件放到项目根目录，然后告诉 Claude 进行固化
            </p>
          </div>
        )}
      </div>
    </>
  );
}
