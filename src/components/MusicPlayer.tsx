"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "./GlassCard";
import { musicTracks } from "@/lib/constants";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = musicTracks[currentTrack];

  // 无音乐数据时显示空状态
  if (!track) {
    return (
      <GlassCard className="p-5 md:p-6 h-full">
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          🎵 暂无音乐，点击音乐页添加
        </div>
      </GlassCard>
    );
  }

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleNext);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleNext);
    };
  }, [currentTrack]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % musicTracks.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + musicTracks.length) % musicTracks.length);
    setProgress(0);
  };

  return (
    <GlassCard className="p-5 md:p-6 h-full">
      <div className="flex items-center gap-4 h-full">
        {/* 专辑封面 */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-purple-400 to-pink-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* 歌曲信息 + 进度条 + 频谱 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div>
            <div className="text-gray-800 font-semibold text-sm md:text-base truncate">
              {track.title}
            </div>
            <div className="text-gray-500 text-xs mt-0.5">{track.artist}</div>
          </div>

          {/* 毛玻璃进度条 */}
          <div className="w-full h-2 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 频谱动画柱 */}
          <div className="flex items-end gap-0.5 h-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
                style={{
                  height: "4px",
                  animation: isPlaying
                    ? `audioBar ${0.5 + i * 0.15}s ease-in-out infinite`
                    : "none",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleNext}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 隐藏的 audio 元素 */}
      {track.src && <audio ref={audioRef} src={track.src} preload="none" />}
    </GlassCard>
  );
}
