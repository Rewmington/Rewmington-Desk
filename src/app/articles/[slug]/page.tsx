import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNote, listNotes, neighbors } from "@/lib/notes";
import ArticleReader from "@/components/ArticleReader";

/**
 * notes/*.md 清空时也必须返回至少一个参数：`output: "export"` 见到空数组会判定这个路由
 * 没用 generateStaticParams，直接构建失败 —— 而构建失败等于线上悄悄停在旧版本。
 * 这个占位 slug 不对应任何文件，渲染时走 notFound()，也不会有链接指向它。
 */
const EMPTY_PLACEHOLDER = "__no-notes__";

export const dynamicParams = false;

export function generateStaticParams() {
  const notes = listNotes();
  return notes.length
    ? notes.map((n) => ({ slug: n.slug }))
    : [{ slug: EMPTY_PLACEHOLDER }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "文章未找到" };
  return {
    title: note.title,
    description: note.description,
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const { prev, next } = neighbors(slug);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <Link
        href="/articles/"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] mb-6"
      >
        ← 返回文章列表
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-medium">
            {note.kind}
          </span>
          <span className="text-[var(--text-tertiary)]">
            {note.date} · 约 {note.minutes} 分钟
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-3">
          {note.title}
        </h1>
        {note.description && (
          <p className="text-[var(--text-secondary)] text-sm md:text-base">
            {note.description}
          </p>
        )}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <ArticleReader slug={note.slug} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_14rem] gap-8">
        <article
          className="md-body text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: note.html }}
        />

        {note.toc.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-xs tracking-[0.14em] text-[var(--text-tertiary)] mb-3">
                本篇目录
              </p>
              <ul className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
                {note.toc.map((t) => (
                  <li key={t.id} className={t.level === 3 ? "pl-3" : ""}>
                    <a
                      href={`#${t.id}`}
                      className="block text-xs leading-relaxed py-1 pl-2 border-l border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                    >
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {(prev || next) && (
        <nav className="mt-12 pt-6 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 gap-3">
          {prev ? (
            <Link
              href={`/articles/${prev.slug}/`}
              className="block p-4 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)]"
            >
              <span className="text-xs text-[var(--text-tertiary)]">上一篇</span>
              <span className="block text-sm text-[var(--text-primary)] mt-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/articles/${next.slug}/`}
              className="block p-4 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] md:text-right"
            >
              <span className="text-xs text-[var(--text-tertiary)]">下一篇</span>
              <span className="block text-sm text-[var(--text-primary)] mt-1">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
