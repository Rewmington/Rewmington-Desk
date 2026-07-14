"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";

export default function PhotosPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              📷 照片墙
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              用镜头记录生活瞬间
            </p>
          </div>
        </StaggerItem>

        {/* 照片网格占位 */}
        <StaggerItem>
          <GlassCard className="p-12 md:p-20 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-white/80 text-lg font-medium mb-2">
              照片墙即将上线
            </h3>
            <p className="text-white/50 text-sm">
              正在整理照片，敬请期待...
            </p>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </main>
  );
}
