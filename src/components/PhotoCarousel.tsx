"use client";

import { useState, useCallback } from "react";
import GlassCard from "./GlassCard";
import { photos } from "@/lib/constants";

export default function PhotoCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + photos.length) % photos.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % photos.length);
  }, []);

  if (photos.length === 0) {
    return (
      <GlassCard className="p-8 md:p-12 text-center">
        <div className="text-4xl mb-3">📸</div>
        <h3 className="text-gray-700 text-sm font-medium">照片墙即将上线</h3>
        <p className="text-gray-400 text-xs mt-1">正在整理照片，敬请期待...</p>
      </GlassCard>
    );
  }

  const photo = photos[current];

  return (
    <GlassCard enableTilt={false} className="overflow-hidden">
      {/* 照片区域 */}
      <div className="relative aspect-[4/3]">
        <img
          key={photo.id}
          src={photo.src}
          alt={photo.caption || "照片"}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* 渐变回退 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-300/80 via-pink-200/60 to-blue-200/80 -z-10" />

        {/* 底部渐变遮罩 + 信息 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-10">
          {photo.caption && (
            <p className="text-white text-sm font-medium truncate">
              {photo.caption}
            </p>
          )}
          {photo.location && (
            <p className="text-white/70 text-xs mt-0.5">
              📍 {photo.location}
            </p>
          )}
        </div>

        {/* 左右切换按钮 */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="上一张"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="下一张"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 指示点 */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`跳转到第 ${i + 1} 张照片`}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
