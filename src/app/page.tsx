import SearchBar from "@/components/SearchBar";
import ProfileCard from "@/components/ProfileCard";
import MusicPlayer from "@/components/MusicPlayer";
import StatusBar from "@/components/StatusBar";
import ArticleCard from "@/components/ArticleCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { articles } from "@/lib/constants";

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
