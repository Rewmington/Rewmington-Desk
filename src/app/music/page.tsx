"use client";

import MusicPlayer from "@/components/MusicPlayer";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import AddButton from "@/components/staging/AddButton";

export default function MusicPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🎵 音乐
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              我喜欢的音乐
            </p>
          </div>
        </StaggerItem>

        {/* 音乐播放器 */}
        <StaggerItem className="max-w-md mx-auto">
          <MusicPlayer />
        </StaggerItem>
      </StaggerContainer>

      <AddButton contentType="music" />
    </main>
  );
}
