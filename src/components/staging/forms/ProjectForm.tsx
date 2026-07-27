"use client";

import { useState } from "react";

interface ProjectFormProps {
  onStaged: (data: Record<string, unknown>) => void;
}

const inputClass =
  "w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors";

const labelClass = "block text-sm font-medium text-slate-300 mb-1";

export default function ProjectForm({ onStaged }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    onStaged({
      name: name.trim(),
      description: description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      url: url.trim(),
    });

    setName("");
    setDescription("");
    setTags("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>
          项目名称 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="MyProject"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          项目描述 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="项目简介"
          className={`${inputClass} resize-none h-20`}
          required
        />
      </div>

      <div>
        <label className={labelClass}>技术标签</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="用逗号分隔，如：React, TypeScript, Node.js"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>项目链接</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00D1FF] to-[#00FFA3] text-white font-medium text-sm hover:from-[#00D1FF]/90 hover:to-[#00FFA3]/90 transition-all shadow-md glow-accent"
      >
        暂存到本地
      </button>
    </form>
  );
}
