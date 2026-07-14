"use client";

import { useState } from "react";

interface PhotoFormProps {
  onStaged: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 focus:bg-white/40 transition-colors";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function PhotoForm({ onStaged }: PhotoFormProps) {
  const [src, setSrc] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!src.trim()) return;

    onStaged({
      id: Date.now().toString(),
      src: src.trim(),
      caption: caption.trim(),
      date,
      location: location.trim(),
    });

    setSrc("");
    setCaption("");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>
          照片路径 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="/photos/photo-1.jpg"
          className={inputClass}
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          请将照片放到 public/photos/ 目录
        </p>
      </div>

      <div>
        <label className={labelClass}>照片说明</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="夕阳下的海边"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>拍摄日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>拍摄地点</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="北京"
            className={inputClass}
          />
        </div>
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
