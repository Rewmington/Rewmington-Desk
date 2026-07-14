"use client";

import { useState } from "react";

interface ArticleFormProps {
  onStaged: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 focus:bg-white/40 transition-colors";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function ArticleForm({ onStaged }: ArticleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState("");
  const [variant, setVariant] = useState<"image" | "text-overlay">("image");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onStaged({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      cover: cover.trim() || "/images/posts/post-new.jpg",
      date,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      variant,
    });

    // 重置表单
    setTitle("");
    setDescription("");
    setCover("");
    setDate(new Date().toISOString().split("T")[0]);
    setTags("");
    setVariant("image");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>
          标题 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          描述 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="文章简介"
          className={`${inputClass} resize-none h-20`}
          required
        />
      </div>

      <div>
        <label className={labelClass}>封面图片路径</label>
        <input
          type="text"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="/images/posts/post-new.jpg"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          请将图片放到 public/images/posts/ 目录
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            日期 <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            卡片样式 <span className="text-red-400">*</span>
          </label>
          <select
            value={variant}
            onChange={(e) =>
              setVariant(e.target.value as "image" | "text-overlay")
            }
            className={inputClass}
          >
            <option value="image">图片背景</option>
            <option value="text-overlay">文字叠加</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>标签</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="用逗号分隔，如：Next.js, React, 教程"
          className={inputClass}
        />
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
