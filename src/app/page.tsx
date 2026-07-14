import SearchBar from "@/components/SearchBar";
import ProfileCard from "@/components/ProfileCard";
import MusicPlayer from "@/components/MusicPlayer";
import StatusBar from "@/components/StatusBar";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { articles } from "@/lib/constants";
import GlassCard from "@/components/GlassCard";
import type { Article } from "@/types";

function ArticleCard({ article }: { article: Article }) {
  const isImage = article.variant === "image";

  return (
    <GlassCard className={`h-full ${isImage ? "min-h-[280px]" : "min-h-[200px]"}`}>
      <div
        className={`relative h-full flex flex-col justify-end p-6 ${
          isImage ? "min-h-[280px]" : "min-h-[200px]"
        }`}
      >
        {/* 渐变背景 */}
        <div
          className={`absolute inset-0 rounded-3xl ${
            isImage
              ? "bg-gradient-to-br from-purple-600/60 to-pink-600/60"
              : "bg-gradient-to-br from-purple-500/30 to-pink-500/30"
          }`}
        />

        {/* 渐变蒙层 */}
        <div
          className={`absolute inset-0 rounded-3xl ${
            isImage
              ? "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              : "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          }`}
        />

        {/* 内容 */}
        <div className="relative z-10">
          {/* 标签 */}
          <div className="flex gap-2 mb-3">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white/80 backdrop-blur-sm"
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
          <p className="text-white/60 text-sm line-clamp-2">{article.description}</p>

          {/* 日期 */}
          <div className="text-white/40 text-xs mt-3">{article.date}</div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Home() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 搜索框 */}
        <StaggerItem>
          <SearchBar />
        </StaggerItem>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 个人信息卡 */}
          <StaggerItem className="md:col-span-5">
            <ProfileCard />
          </StaggerItem>

          {/* 音乐播放器 */}
          <StaggerItem className="md:col-span-7">
            <MusicPlayer />
          </StaggerItem>

          {/* 文章展示 */}
          {articles.map((article, index) => (
            <StaggerItem
              key={article.id}
              className={
                index === 0
                  ? "md:col-span-8"
                  : index === 1
                  ? "md:col-span-4"
                  : "md:col-span-4"
              }
            >
              <ArticleCard article={article} />
            </StaggerItem>
          ))}

          {/* 底部状态栏 */}
          <StaggerItem className="md:col-span-12">
            <StatusBar />
          </StaggerItem>
        </div>
      </StaggerContainer>
    </main>
  );
}
