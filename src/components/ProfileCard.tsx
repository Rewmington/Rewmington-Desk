"use client";

import { useState, useEffect } from "react";
import siteConfig from "../../siteConfig";
import { articles, photos } from "@/lib/constants";

export default function ProfileCard() {
  const [daysRunning, setDaysRunning] = useState<number | null>(null);

  useEffect(() => {
    const buildDate = new Date(siteConfig.buildDate);
    const today = new Date();
    const days = Math.floor(
      (today.getTime() - buildDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    setDaysRunning(days);
  }, []);

  return (
    <div className="bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-5 md:p-6 h-full shadow-lg shadow-black/5 flex flex-col">
      {/* OS 窗口标题栏 */}
      <div className="os-titlebar">
        <div className="os-dot bg-red-400" />
        <div className="os-dot bg-yellow-400" />
        <div className="os-dot bg-green-400" />
        <span className="ml-2 text-xs text-gray-500 font-mono">profile.widget</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* 头像 + 呼吸灯 */}
        <div className="relative">
          <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 animate-[breathe_3s_ease-in-out_infinite] opacity-60" />
          <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-blue-400">
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {siteConfig.authorName}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
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
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110"
              title={social.name}
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={social.icon} />
              </svg>
            </a>
          ))}
        </div>

        {/* 底部数据条 */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          <div className="bg-white/15 rounded-2xl px-2 py-2 text-center backdrop-blur-sm">
            <div className="text-lg font-bold text-gray-800">{articles.length}</div>
            <div className="text-[10px] text-gray-500">文章</div>
          </div>
          <div className="bg-white/15 rounded-2xl px-2 py-2 text-center backdrop-blur-sm">
            <div className="text-lg font-bold text-gray-800">{photos.length}</div>
            <div className="text-[10px] text-gray-500">摄影</div>
          </div>
          <div className="bg-white/15 rounded-2xl px-2 py-2 text-center backdrop-blur-sm">
            <div className="text-lg font-bold text-gray-800">
              {daysRunning !== null ? `${daysRunning}d` : "---"}
            </div>
            <div className="text-[10px] text-gray-500">运行</div>
          </div>
        </div>
      </div>
    </div>
  );
}
