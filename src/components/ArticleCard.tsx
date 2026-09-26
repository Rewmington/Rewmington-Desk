"use client";

import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import type { Article } from "@/types";

export default function ArticleCard({ article }: { article: Article }) {
  const isImage = article.variant === "image";

  return (
    <GlassCard
      className={`h-full group ${isImage ? "min-h-[280px]" : "min-h-[200px]"}`}
    >
      <div
        className={`relative h-full flex flex-col justify-end p-6 overflow-hidden ${
          isImage ? "min-h-[280px]" : "min-h-[200px]"
        }`}
      >
        {/* 背景图片层 - 悬停放大 */}
        <div className="absolute inset-0 rounded-[24px] overflow-hidden">
          <motion.img
            src={article.cover}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          {/* 图片加载失败时的渐变回退 */}
          <div
            className={`absolute inset-0 ${
              isImage
                ? "bg-gradient-to-br from-[#00D1FF]/30 via-[#00FFA3]/20 to-[#00D1FF]/30"
                : "bg-gradient-to-br from-[#00D1FF]/20 via-[#00FFA3]/10 to-[#00D1FF]/20"
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

        {/* 内容 - 悬停上浮 */}
        <motion.div
          className="relative z-10"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
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
        </motion.div>
      </div>
    </GlassCard>
  );
}
