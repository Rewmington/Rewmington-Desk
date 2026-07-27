"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { musicTracks } from "@/lib/constants";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const track = musicTracks[currentTrack];

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

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
        setCurrentTime(formatTime(audio.currentTime));
      }
    };

    const updateDuration = () => {
      if (audio.duration) {
        setDuration(formatTime(audio.duration));
      }
    };

    const handleEnded = () => {
      setCurrentTrack((prev) => (prev + 1) % musicTracks.length);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, formatTime]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % musicTracks.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + musicTracks.length) % musicTracks.length);
    setProgress(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current?.duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-3xl p-5 md:p-6 h-full shadow-[var(--shadow-card)] flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
      </div>

      {!track ? (
        <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)] text-sm">
          🎵 暂无音乐
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-4">
          {/* 黑胶唱片旋转封面 */}
          <div className="relative shrink-0">
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg border-2 border-[var(--border-card)]"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{
                duration: 8,
                repeat: isPlaying ? Infinity : 0,
                ease: "linear",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={track.cover}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* 黑胶中心孔 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-5 h-5 rounded-full bg-black/40 border-2 border-[var(--border-card)]" />
              </div>
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-primary)] -z-10 blur-sm opacity-60" />
          </div>

          {/* 歌曲信息 + 进度 + 波形 */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-sm truncate">
                {track.title}
              </div>
              <div className="text-[var(--text-secondary)] text-xs">{track.artist}</div>
            </div>

            {/* 进度条 */}
            <div
              ref={progressRef}
              className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-full transition-all duration-150 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* 时间 */}
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] tabular-nums">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>

            {/* 波形 + 控制按钮 */}
            <div className="flex items-center gap-3">
              {/* 波形 */}
              <div className="flex items-end gap-[2px] h-5 flex-1">
                {[18, 22, 14, 20, 16, 24, 12, 20, 18, 14, 22, 16].map((peak, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] bg-gradient-to-t from-[var(--accent-secondary)]/80 to-[var(--accent-primary)]/80 rounded-full"
                    animate={
                      isPlaying
                        ? { height: [3, peak, 5, peak - 4, 3] }
                        : { height: 3 }
                    }
                    transition={
                      isPlaying
                        ? {
                            duration: 0.8 + i * 0.05,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: i * 0.06,
                          }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={handlePrev} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                </button>
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-primary)] hover:from-[var(--accent-secondary)]/90 hover:to-[var(--accent-primary)]/90 flex items-center justify-center transition-all shadow-md glow-accent"
                >
                  {isPlaying ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <button onClick={handleNext} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {track?.src && <audio ref={audioRef} src={track.src} preload="none" />}
    </div>
  );
}
