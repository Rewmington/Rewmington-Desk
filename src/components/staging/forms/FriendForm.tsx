"use client";

import { useState } from "react";

interface FriendFormProps {
  onStaged: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full bg-[var(--bg-subtle)] backdrop-blur-sm border border-[var(--border-card)] rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--border-card)] focus:bg-[var(--bg-subtle-hover)] transition-colors";

const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

const EMOJI_OPTIONS = ["😎", "🦊", "🐱", "🐶", "🦄", "🐼", "🐸", "🦋", "🌸", "✨", "🎮", "🎵"];

export default function FriendForm({ onStaged }: FriendFormProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [bio, setBio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onStaged({
      name: name.trim(),
      url: url.trim(),
      avatar,
      bio: bio.trim(),
    });

    setName("");
    setUrl("");
    setAvatar("😎");
    setBio("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>
          友链名称 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="好友博客名"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          友链地址 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://friend-blog.com"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>头像</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                avatar === emoji
                  ? "bg-[var(--accent-primary)]/20 border-2 border-[var(--accent-primary)] scale-110"
                  : "bg-[var(--bg-subtle)] border border-[var(--border-card)] hover:bg-[var(--bg-subtle-hover)]"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="选择上方 emoji 或输入图片 URL"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>一句话介绍</label>
        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="一个很酷的博主"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] text-[var(--text-primary)] font-medium text-sm hover:from-[var(--accent-secondary)]/90 hover:to-[var(--accent-primary)]/90 transition-all shadow-md glow-accent"
      >
        暂存到本地
      </button>
    </form>
  );
}
