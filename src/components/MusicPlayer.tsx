"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import { musicTracks } from "@/lib/constants";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = musicTracks[currentTrack];

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
    <GlassCard className="p-6">
      <div className="flex flex-col items-center gap-4">
        {/* 专辑封面 */}
        <motion.div
          className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ animationPlayState: isPlaying ? "running" : "paused" }}
        >
          <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50" />
        </motion.div>

        {/* 歌曲信息 */}
        <div className="text-center">
          <div className="text-white font-semibold text-sm md:text-base truncate max-w-[180px]">
            {track.title}
          </div>
          <div className="text-white/50 text-xs mt-1">{track.artist}</div>
        </div>

        {/* 进度条 */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleNext}
            className="text-white/60 hover:text-white transition-colors"
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
