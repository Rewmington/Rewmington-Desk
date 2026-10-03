"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 阅读页的交互层。正文是构建期预渲染的静态 HTML，这里只负责三件事：
 * 1) 把清单里的复选框变成可点、并把结果记在 localStorage（没有后端，换设备不同步）
 * 2) 顶部阅读进度条 + 记住上次读到的位置
 * 3) 字号切换
 */
export default function ArticleReader({ slug }: { slug: string }) {
  const [pct, setPct] = useState(0);
  const [resume, setResume] = useState<number | null>(null);
  const [fs, setFs] = useState(0);
  const doneRef = useRef<HTMLSpanElement>(null);

  const key = (k: string) => `note:${slug}:${k}`;

  useEffect(() => {
    try {
      const savedFs = Number(localStorage.getItem(key("fs")) || 0);
      if (savedFs) {
        document.documentElement.style.setProperty("--md-fs", `${savedFs}px`);
        setFs(savedFs);
      }
    } catch {
      /* 隐私模式下 localStorage 会抛错，忽略即可 */
    }
  }, [key]);

  useEffect(() => {
    const boxes = Array.from(
      document.querySelectorAll<HTMLInputElement>(".md-check"),
    );
    boxes.forEach((box, i) => {
      const k = key(`t${i}`);
      let saved = false;
      try {
        saved = localStorage.getItem(k) === "1";
      } catch {
        saved = false;
      }
      box.checked = saved;
      box.closest("li")?.classList.toggle("md-done", saved);
      const onChange = () => {
        box.closest("li")?.classList.toggle("md-done", box.checked);
        try {
          localStorage.setItem(k, box.checked ? "1" : "0");
        } catch {
          /* 存不下就算了 */
        }
      };
      box.addEventListener("change", onChange);
    });
    return () => boxes.forEach((b) => b.replaceWith(b.cloneNode(true)));
  }, [slug, key]);

  useEffect(() => {
    const doc = document.querySelector(".md-body") as HTMLElement | null;
    if (!doc) return;

    let last = 0;
    const onScroll = () => {
      const h = doc.offsetHeight - window.innerHeight;
      const p = h <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / h));
      setPct(p);
      const now = Date.now();
      if (now - last > 700) {
        last = now;
        try {
          localStorage.setItem(key("prog"), String(p));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let saved = 0;
    try {
      saved = Number(localStorage.getItem(key("prog")) || 0);
    } catch {
      saved = 0;
    }
    if (saved > 0.05 && saved < 0.95 && window.scrollY < 200) {
      window.scrollTo(0, Math.max(0, (doc.offsetHeight - window.innerHeight) * saved));
      setResume(saved);
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, [slug, key]);

  function changeFs(delta: number) {
    const base = 16;
    const next = Math.min(21, Math.max(14, (fs || base) + delta));
    document.documentElement.style.setProperty("--md-fs", `${next}px`);
    setFs(next);
    try {
      localStorage.setItem(key("fs"), String(next));
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[70] pointer-events-none">
        <i
          className="block h-full bg-[var(--accent-primary)] transition-[width] duration-150"
          style={{ width: `${(pct * 100).toFixed(1)}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)] mb-6">
        <span>字号</span>
        <button
          type="button"
          onClick={() => changeFs(-1)}
          className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
        >
          A
        </button>
        <button
          type="button"
          onClick={() => changeFs(1)}
          className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] text-sm"
        >
          A
        </button>
        <span ref={doneRef} />
        {resume !== null && (
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              try {
                localStorage.setItem(key("prog"), "0");
              } catch {
                /* ignore */
              }
              setResume(null);
            }}
            className="ml-auto px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--accent-primary)] hover:bg-[var(--bg-subtle-hover)]"
          >
            上次读到 {Math.round(resume * 100)}% · 从头读
          </button>
        )}
      </div>
    </>
  );
}
