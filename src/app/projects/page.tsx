"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";

const projects = [
  {
    name: "MyBlog",
    description: "基于 Next.js 16 的个人主页，毛玻璃拟态设计 + Bento Grid 布局",
    tags: ["Next.js", "React", "Tailwind CSS"],
    url: "https://github.com/Rewmington",
  },
  {
    name: "更多项目",
    description: "即将添加更多项目展示...",
    tags: ["Coming Soon"],
    url: "",
  },
];

export default function ProjectsPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              💻 项目
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              我的开源项目与作品
            </p>
          </div>
        </StaggerItem>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <StaggerItem key={project.name}>
              <GlassCard className="p-6 h-full">
                <div className="flex flex-col h-full">
                  <h3 className="text-white font-bold text-lg mb-2">
                    {project.name}
                  </h3>
                  <p className="text-white/60 text-sm flex-1 mb-4">
                    {project.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-white/15 text-white/70 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-xs transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      查看项目
                    </a>
                  )}
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </main>
  );
}
