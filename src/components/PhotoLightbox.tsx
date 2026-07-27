"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/types";

interface PhotoLightboxProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onNavigate?: (photo: Photo) => void;
}

export default function PhotoLightbox({
  photo,
  photos,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev && onNavigate) {
      onNavigate(photos[currentIndex - 1]);
    }
  }, [hasPrev, onNavigate, photos, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(photos[currentIndex + 1]);
    }
  }, [hasNext, onNavigate, photos, currentIndex]);

  // ESC / 方向键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, onClose, goToPrev, goToNext]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [photo]);

  const handleDownload = (src: string, caption: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = caption || src.split("/").pop() || "photo";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      {photo && (
        <>
          {/* 遮罩层 */}
          <motion.div
            key="lightbox-backdrop"
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* 居中容器 — 用 flex 居中避免 transform 与 layoutId 冲突 */}
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
            <motion.img
              key={`lightbox-img-${photo.id}`}
              layoutId={`photo-${photo.id}`}
              src={photo.src}
              alt={photo.caption || "照片"}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-auto"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* 左右切换箭头 */}
          {photos.length > 1 && (
            <>
              {hasPrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="fixed left-4 top-1/2 -translate-y-1/2 z-[82] w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                  aria-label="上一张"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              {hasNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="fixed right-4 top-1/2 -translate-y-1/2 z-[82] w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                  aria-label="下一张"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </>
          )}

          {/* 底部信息栏 */}
          <motion.div
            key="lightbox-info"
            className="fixed bottom-0 left-0 right-0 z-[82] p-6 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {photo.caption && (
                <p className="text-white text-base font-medium">
                  {photo.caption}
                </p>
              )}
              {photo.location && (
                <p className="text-white/70 text-sm">📍 {photo.location}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* 下载按钮 */}
              <button
                onClick={() => handleDownload(photo.src, photo.caption)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="下载到本地"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="关闭"
              >
                <svg
                  className="w-5 h-5"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
