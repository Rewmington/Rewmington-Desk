"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { photos } from "@/lib/constants";
import AddButton from "@/components/staging/AddButton";

export default function PhotosPage() {
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
                <GlassCard variant="transparent" className="overflow-hidden group">
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
    </main>
  );
}
