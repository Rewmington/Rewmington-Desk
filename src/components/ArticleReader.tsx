"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 读不到就返回 null：服务端渲染时 localStorage 不存在，隐私模式下会抛错 */
function readLocal(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

/**
 * 阅读页的交互层。正文是构建期预渲染的静态 HTML，这里只负责三件事：
 * 1) 把清单里的复选框变成可点、并把结果记在 localStorage（没有后端，换设备不同步）
 * 2) 顶部阅读进度条 + 记住上次读到的位置
 * 3) 字号切换
 */
export default function ArticleReader({ slug }: { slug: string }) {
  const [pct, setPct] = useState(0);
  const [resume, setResume] = useState<number | null>(null);
  // 字号不进 markup（只在 changeFs 里被读），所以可以在首次 render 就读出来，
  // 不必「effect 里 setState」。服务端读到 0，不会造成 hydration 不一致。
  const [fs, setFs] = useState(() => Number(readLocal(`note:${slug}:fs`) || 0));
  const doneRef = useRef<HTMLSpanElement>(null);

  // 不包 useCallback 的话它每次 render 都是新函数，下面三个 effect 就跟着每次重跑
  const key = useCallback((k: string) => `note:${slug}:${k}`, [slug]);

  useEffect(() => {
    if (fs) document.documentElement.style.setProperty("--md-fs", `${fs}px`);
  }, [fs]);

  useEffect(() => {
    const boxes = Array.from(
      document.querySelectorAll<HTMLInputElement>(".md-check"),
    );
    boxes.forEach((box, i) => {
      // 键按条目内容哈希（构建期写在 data-k 上），插删方框不会让历史勾选错位；
      // 万一拿不到 data-k（老构建产物）才退回序号
      const token = box.dataset.k;
      const k = key(token ? `k${token}` : `t${i}`);
      if (token) {
        // 一次性把这次改动之前按序号存的状态搬到内容键上
        try {
          const legacy = localStorage.getItem(key(`t${i}`));
          if (legacy !== null && localStorage.getItem(k) === null) {
            localStorage.setItem(k, legacy);
            localStorage.removeItem(key(`t${i}`));
          }
        } catch {
          /* 读不到就算了 */
        }
      }
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

    let last = Date.now(); // 挂载后第一次调用只画进度条，别把存着的阅读位置盖成 0
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

    // 必须先读旧位置再挂监听：onScroll() 会把当前进度写回 prog，
    // 顺序反了就读到 0，这个功能会静默失效（之前正是这样）
    let saved = 0;
    try {
      saved = Number(localStorage.getItem(key("prog")) || 0);
    } catch {
      saved = 0;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (saved > 0.05 && saved < 0.95) {
      // scrollY 已经不在顶部 = 浏览器自己恢复了位置，别再跳一次
      if (window.scrollY < 200) {
        window.scrollTo(0, Math.max(0, (doc.offsetHeight - window.innerHeight) * saved));
      }
      // microtask 里 setState：effect 体里直接 setState 会触发级联渲染，
      // 而这次 scrollTo 是同步生效的，不需要等绘制（用 rAF 的话后台标签页里根本不触发）
      queueMicrotask(() => setResume(saved));
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
