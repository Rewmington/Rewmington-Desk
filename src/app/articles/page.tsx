"use client";

import ArticleCard from "@/components/ArticleCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { articles } from "@/lib/constants";
import AddButton from "@/components/staging/AddButton";

export default function ArticlesPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              📝 文章
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              记录技术探索与思考
            </p>
          </div>
        </StaggerItem>

        {/* 文章网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <StaggerItem
              key={article.id}
              className={index === 0 ? "md:col-span-2" : ""}
            >
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      <AddButton contentType="article" />
    </main>
  );
}
