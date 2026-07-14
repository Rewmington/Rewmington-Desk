"use client";

import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { photos } from "@/lib/constants";
import AddButton from "@/components/staging/AddButton";

export default function PhotosPage() {
  const [lightbox, setLightbox] = useState<typeof photos[number] | null>(null);

  const handleDownload = (src: string, caption: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = caption || src.split("/").pop() || "photo";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              📷 照片墙
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              用镜头记录生活瞬间
            </p>
          </div>
        </StaggerItem>

        {photos.length === 0 ? (
          /* 空状态 */
          <StaggerItem>
            <GlassCard className="p-12 md:p-20 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-gray-700 text-lg font-medium mb-2">
                照片墙即将上线
              </h3>
              <p className="text-gray-500 text-sm">
                正在整理照片，敬请期待...
              </p>
              <p className="text-gray-400 text-xs mt-2">
                点击右下角 + 按钮添加照片
              </p>
            </GlassCard>
          </StaggerItem>
        ) : (
          /* 照片网格 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <StaggerItem key={photo.id}>
                <GlassCard variant="transparent" className="overflow-hidden group cursor-pointer" onClick={() => setLightbox(photo)}>
                  <div className="relative aspect-square">
                    <img
                      src={photo.src}
                      alt={photo.caption || "照片"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {/* 渐变回退 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-300/80 via-pink-200/60 to-blue-200/80 -z-10" />
                    {/* 悬浮信息 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                      <div className="w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {photo.caption && (
                          <p className="text-white text-sm truncate">
                            {photo.caption}
                          </p>
                        )}
                        {photo.location && (
                          <p className="text-white/70 text-xs">
                            📍 {photo.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </div>
        )}
      </StaggerContainer>

      <AddButton contentType="photo" />

      {/* Lightbox 放大查看 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setLightbox(null)}
        >
          {/* 图片 */}
          <img
            src={lightbox.src}
            alt={lightbox.caption || "照片"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 底部信息栏 */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {lightbox.caption && (
                <p className="text-white text-base font-medium">
                  {lightbox.caption}
                </p>
              )}
              {lightbox.location && (
                <p className="text-white/70 text-sm">
                  📍 {lightbox.location}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* 下载按钮 */}
              <button
                onClick={() => handleDownload(lightbox.src, lightbox.caption)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                title="下载到本地"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              {/* 关闭按钮 */}
              <button
                onClick={() => setLightbox(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                title="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
