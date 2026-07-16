"use client";

import GlassCard from "./GlassCard";
import siteConfig from "../../siteConfig";
import { articles, photos } from "@/lib/constants";

export default function ProfileCard() {
  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5">
        {/* 头像 */}
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteConfig.avatarUrl}
            alt={siteConfig.authorName}
            width={80}
            height={80}
            className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover"
          />
        </div>

        {/* 中间信息 */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {siteConfig.authorName}
          </h2>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-1 mt-0.5">
            {siteConfig.bio}
          </p>
          <div className="flex gap-4 md:gap-6 mt-2 justify-center sm:justify-start">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-800">
                {articles.length}
              </div>
              <div className="text-xs text-gray-500">文章</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-800">
                {photos.length}
              </div>
              <div className="text-xs text-gray-500">照片</div>
            </div>
          </div>
        </div>

        {/* 社交图标胶囊条 */}
        <div className="flex gap-2 px-3 py-1.5 bg-white/30 rounded-full shrink-0">
          {siteConfig.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
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
      </div>
    </GlassCard>
  );
}
