"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { photos } from "@/lib/constants";

export default function PhotoCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + photos.length) % photos.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % photos.length);
  }, []);

  return (
    <div className="bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-3xl p-5 md:p-6 h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
        <span className="ml-2 text-xs text-slate-500 font-mono">photo.gallery</span>
      </div>

      {photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-sm">照片墙即将上线</p>
          <p className="text-xs mt-1">正在整理照片...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* 照片区域 */}
          <div className="relative flex-1 min-h-[200px] rounded-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={photos[current].id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[current].src}
                  alt={photos[current].caption || "照片"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/30 via-[#00FFA3]/20 to-[#00D1FF]/30 -z-10" />

            {/* 底部信息 */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
              {photos[current].caption && (
                <p className="text-white text-sm font-medium truncate">
                  {photos[current].caption}
                </p>
              )}
            </div>

            {/* 切换按钮 */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="上一张"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="下一张"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* 指示点 */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-[#00FFA3] w-6 glow-accent"
                      : "bg-white/20 w-1.5 hover:bg-white/30"
                  }`}
                  aria-label={`第 ${i + 1} 张`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
