import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { listProjects } from "@/lib/projects";

export const metadata = {
  title: "项目",
  description: "我的开源项目与作品，清单构建期直接从 GitHub 公开仓库取。",
};

/** 最近一次动过，只到天 */
function pushed(iso?: string) {
  return iso ? iso.slice(0, 10) : "";
}

export default function ProjectsPage() {
  const items = listProjects();

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              💻 项目
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              我的开源项目与作品。清单是构建时从 GitHub 上的公开仓库取的，
              新仓库 push 之后自动出现在这里。
            </p>
          </div>
        </StaggerItem>

        {/* 项目列表 */}
        {items.length === 0 ? (
          <StaggerItem>
            <div className="text-[var(--text-tertiary)] text-sm">
              还没抓到仓库清单，等一次构建完就有了。
            </div>
          </StaggerItem>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((project) => {
              const meta = [
                project.language,
                project.stars ? `★ ${project.stars}` : "",
                pushed(project.pushedAt) && `最近动过 ${pushed(project.pushedAt)}`,
              ].filter(Boolean);
              return (
                <StaggerItem key={project.url}>
                  <GlassCard className="p-6 h-full">
                    <div className="flex flex-col h-full">
                      <h3 className="text-[var(--text-primary)] font-bold text-lg mb-2">
                        {project.name}
                      </h3>
                      {/* 没填描述的仓库就留白，这一格仍然占位是为了让同一行的卡片标签对齐底部 */}
                      <p className="text-[var(--text-secondary)] text-sm flex-1 mb-4">
                        {project.description}
                      </p>
                      {meta.length > 0 && (
                        <p className="text-[11px] text-[var(--text-tertiary)] mb-3 tabular-nums">
                          {meta.join(" · ")}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] backdrop-blur-sm"
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
                          className="mt-4 inline-flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xs transition-colors"
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
              );
            })}
          </div>
        )}
      </StaggerContainer>
    </main>
  );
}
