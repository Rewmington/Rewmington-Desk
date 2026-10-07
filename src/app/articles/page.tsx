import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { listNotes } from "@/lib/notes";

export const metadata = {
  title: "文章",
  description: "学习笔记、讲义与随笔：后端基础、AI 应用落地、求职记录。",
};

export default function ArticlesPage() {
  const notes = listNotes();

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              📝 文章
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              学习笔记与讲义。清单里的方框可以直接点，勾选结果记在本机浏览器上。
            </p>
          </div>
        </StaggerItem>

        {notes.length > 0 && (
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {notes.map((n) => (
                <Link key={n.slug} href={`/articles/${n.slug}/`} className="block">
                  <GlassCard className="p-6 md:p-7 h-full min-h-[200px]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-medium">
                        {n.kind}
                      </span>
                      {n.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] leading-tight mb-2">
                      {n.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                      {n.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 text-xs text-[var(--text-tertiary)]">
                      <span>
                        {n.date} · 约 {n.minutes} 分钟
                      </span>
                      <span className="text-[var(--accent-primary)]">开始阅读 →</span>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </StaggerItem>
        )}

        {notes.length === 0 && (
          <StaggerItem>
            <GlassCard className="p-12 md:p-20 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-[var(--text-secondary)] text-lg font-medium mb-2">
                还没有文章
              </h3>
              <p className="text-[var(--text-tertiary)] text-sm">
                往 src/content/notes/ 放一个带 frontmatter 的 .md
              </p>
            </GlassCard>
          </StaggerItem>
        )}
      </StaggerContainer>
    </main>
  );
}
