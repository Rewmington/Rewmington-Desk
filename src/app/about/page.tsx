"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import siteConfig from "../../../siteConfig";

export default function AboutPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              👋 关于
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              了解更多关于我
            </p>
          </div>
        </StaggerItem>

        {/* 个人信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerItem>
            <GlassCard className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {siteConfig.authorName}
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {siteConfig.bio}
                </p>
                <div className="flex gap-4 mt-2">
                  {siteConfig.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
                      title={social.name}
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
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
          </StaggerItem>

          <StaggerItem>
            <GlassCard className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-800">
                  🛠️ 技术栈
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  热爱前端开发，喜欢探索新技术。日常使用 Next.js、React、TypeScript、Tailwind CSS 等工具构建项目。
                </p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Git"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs rounded-full bg-white/30 text-gray-700 backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        </div>

        {/* 关于本站 */}
        <StaggerItem>
          <GlassCard className="p-6 md:p-8 mt-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                🌐 关于本站
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                本站基于 Next.js 16 构建，采用毛玻璃拟态（Glassmorphism）设计风格，
                搭配 Bento Grid 布局和丰富的交互动画。静态导出部署在 GitHub Pages，
                零服务器成本，极速访问。
              </p>
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </main>
  );
}
