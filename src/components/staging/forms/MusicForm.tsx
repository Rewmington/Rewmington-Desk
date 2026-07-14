"use client";

import { useState } from "react";

interface MusicFormProps {
  onStaged: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 focus:bg-white/40 transition-colors";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function MusicForm({ onStaged }: MusicFormProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState("");
  const [src, setSrc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    onStaged({
      id: Date.now().toString(),
      title: title.trim(),
      artist: artist.trim(),
      cover: cover.trim() || "/images/album-cover.jpg",
      src: src.trim(),
    });

    setTitle("");
    setArtist("");
    setCover("");
    setSrc("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>
          歌曲名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="夜に駆ける"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          歌手/乐队 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="YOASOBI"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>封面图路径</label>
        <input
          type="text"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="/images/album-cover.jpg"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          请将图片放到 public/images/ 目录
        </p>
      </div>

      <div>
        <label className={labelClass}>音频文件路径</label>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="/music/song.mp3"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          请将音频文件放到 public/music/ 目录
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all shadow-md"
      >
        暂存到本地
      </button>
    </form>
  );
}
