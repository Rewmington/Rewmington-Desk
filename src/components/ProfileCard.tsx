"use client";

import siteConfig from "../../siteConfig";
import { articles, photos } from "@/lib/constants";

export default function ProfileCard() {
  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] rounded-3xl p-5 md:p-6 h-full shadow-[var(--shadow-card)] flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* 头像 + 呼吸灯 */}
        <div className="relative">
          <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-[var(--accent-secondary)] to-[var(--accent-primary)] animate-[breathe_3s_ease-in-out_infinite] opacity-60" />
          <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[var(--accent-secondary)] via-[var(--accent-primary)] to-[var(--accent-secondary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteConfig.avatarUrl}
              alt={siteConfig.authorName}
              width={96}
              height={96}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            />
          </div>
        </div>

        {/* 名字 + Bio */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            {siteConfig.authorName}
          </h2>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-1">
            {siteConfig.bio}
          </p>
        </div>

        {/* 社交图标 */}
        <div className="flex gap-2">
          {siteConfig.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] flex items-center justify-center transition-all duration-300 hover:scale-110"
              title={social.name}
            >
              <svg
                className="w-4 h-4 text-[var(--text-secondary)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={social.icon} />
              </svg>
            </a>
          ))}
        </div>

        {/* 底部数据条 */}
        <div className="grid grid-cols-2 gap-2 w-full mt-2">
          <div className="bg-[var(--bg-subtle)] rounded-2xl px-2 py-2 text-center backdrop-blur-sm">
            <div className="text-lg font-bold text-[var(--text-primary)]">{articles.length}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">文章</div>
          </div>
          <div className="bg-[var(--bg-subtle)] rounded-2xl px-2 py-2 text-center backdrop-blur-sm">
            <div className="text-lg font-bold text-[var(--text-primary)]">{photos.length}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">摄影</div>
          </div>
        </div>
      </div>
    </div>
  );
}
