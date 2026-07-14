"use client";

import GlassCard from "./GlassCard";
import type { Article } from "@/types";

export default function ArticleCard({ article }: { article: Article }) {
  const isImage = article.variant === "image";

  return (
    <GlassCard
      variant="transparent"
      className={`h-full ${isImage ? "min-h-[280px]" : "min-h-[200px]"}`}
    >
      <div
        className={`relative h-full flex flex-col justify-end p-6 ${
          isImage ? "min-h-[280px]" : "min-h-[200px]"
        }`}
      >
        {/* 背景图片层 */}
        <div className="absolute inset-0 rounded-[24px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* 图片加载失败时的渐变回退 */}
          <div
            className={`absolute inset-0 ${
              isImage
                ? "bg-gradient-to-br from-purple-300/80 via-pink-200/60 to-blue-200/80"
                : "bg-gradient-to-br from-purple-200/60 via-pink-100/40 to-blue-100/60"
            }`}
          />
        </div>

        {/* 底部深色渐变遮罩 */}
        <div
          className={`absolute inset-0 rounded-[24px] ${
            isImage
              ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              : "bg-gradient-to-t from-black/40 via-black/10 to-transparent"
          }`}
        />

        {/* 内容 */}
        <div className="relative z-10">
          {/* 标签 */}
          <div className="flex gap-2 mb-3">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-black/30 text-white/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 标题 */}
          <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2 drop-shadow-lg">
            {article.title}
          </h3>

          {/* 描述 */}
          <p className="text-white/70 text-sm line-clamp-2">{article.description}</p>

          {/* 日期 */}
          <div className="text-white/50 text-xs mt-3">{article.date}</div>
        </div>
      </div>
    </GlassCard>
  );
}
