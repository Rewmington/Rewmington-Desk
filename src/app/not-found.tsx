import Link from "next/link";
import GlassCard from "@/components/GlassCard";

export default function NotFound() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <GlassCard className="p-10 md:p-16 text-center" enableTilt={false}>
        <div className="font-mono text-6xl md:text-7xl font-bold text-[var(--accent-primary)] tabular-nums glow-accent">
          404
        </div>
        <h1 className="mt-4 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          这个页面不存在
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          地址可能打错了，或者内容还没写上来
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-2.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] border border-[var(--border-card)] text-sm text-[var(--text-primary)] transition-colors"
        >
          ← 返回首页
        </Link>
      </GlassCard>
    </main>
  );
}
