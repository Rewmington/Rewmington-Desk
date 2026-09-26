"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { photos } from "@/lib/constants";
import PhotoLightbox from "@/components/PhotoLightbox";
import type { Photo } from "@/types";

export default function PhotosPage() {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              📷 照片墙
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              用镜头记录生活瞬间
            </p>
          </div>
        </StaggerItem>

        {photos.length === 0 ? (
          /* 空状态 */
          <StaggerItem>
            <GlassCard className="p-12 md:p-20 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-[var(--text-secondary)] text-lg font-medium mb-2">
                照片墙即将上线
              </h3>
              <p className="text-[var(--text-tertiary)] text-sm">
                正在整理照片，敬请期待...
              </p>
              <p className="text-[var(--text-tertiary)] text-xs mt-2">
                图片放进 public/images，再登记到 src/content/photos.json
              </p>
            </GlassCard>
          </StaggerItem>
        ) : (
          /* 照片网格 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <StaggerItem key={photo.id}>
                <GlassCard className="overflow-hidden group cursor-pointer" onClick={() => setLightbox(photo)}>
                  <div className="relative aspect-square">
                    <motion.img
                      layoutId={`photo-${photo.id}`}
                      src={photo.src}
                      alt={photo.caption || "照片"}
                      className="w-full h-full object-cover"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {/* 渐变回退 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-secondary)]/30 via-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/30 -z-10" />
                    {/* 悬浮信息 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                      <div className="w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {photo.caption && (
                          <p className="text-[var(--text-primary)] text-sm truncate">
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

      {/* Lightbox 放大查看 */}
      <PhotoLightbox
        photo={lightbox}
        photos={photos}
        onClose={() => setLightbox(null)}
        onNavigate={(photo) => setLightbox(photo)}
      />
    </main>
  );
}
