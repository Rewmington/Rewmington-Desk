"use client";

import GlassCard from "./GlassCard";
import siteConfig from "../../siteConfig";

export default function ProfileCard() {
  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex flex-col items-center text-center gap-4">
        {/* 头像 */}
        <div className="p-1 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl md:text-4xl">
            🌸
          </div>
        </div>

        {/* 昵称 */}
        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
          {siteConfig.authorName}
        </h2>

        {/* 描述 */}
        <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xs">
          {siteConfig.bio}
        </p>

        {/* 统计数字 */}
        <div className="flex gap-8 mt-2">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white drop-shadow">
              {siteConfig.stats.articles}
            </div>
            <div className="text-xs text-white/50 mt-1">文章</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white drop-shadow">
              {siteConfig.stats.photos}
            </div>
            <div className="text-xs text-white/50 mt-1">照片</div>
          </div>
        </div>

        {/* 社交图标 */}
        <div className="flex gap-4 mt-2">
          {siteConfig.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={social.name}
            >
              <svg
                className="w-5 h-5 text-white/80"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={social.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
