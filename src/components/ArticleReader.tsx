"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connect,
  foldLocal,
  forget,
  getToken,
  makeVal,
  parseVal,
  pull,
  schedulePush,
  seedVal,
  setToken,
  type Doc,
} from "@/lib/sync";

/** 读不到就返回 null：服务端渲染时 localStorage 不存在，隐私模式下会抛错 */
function readLocal(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

/**
 * 阅读页的交互层。正文是构建期预渲染的静态 HTML，这里只负责四件事：
 * 1) 把清单里的复选框变成可点、记在 localStorage，并通过你自己的 gist 跨设备同步
 * 2) 顶部阅读进度条 + 记住上次读到的位置
 * 3) 字号切换
 * 4) 那个「同步」开关和填 token 的面板
 */
export default function ArticleReader({ slug }: { slug: string }) {
  const [pct, setPct] = useState(0);
  const [resume, setResume] = useState<number | null>(null);
  // 字号不进 markup（只在 changeFs 里被读），所以可以在首次 render 就读出来，
  // 不必「effect 里 setState」。服务端读到 0，不会造成 hydration 不一致。
  const [fs, setFs] = useState(() => Number(readLocal(`note:${slug}:fs`) || 0));
  const doneRef = useRef<HTMLSpanElement>(null);
  const boxesRef = useRef<HTMLInputElement[]>([]);
  const [syncState, setSyncState] = useState<"off" | "busy" | "ok" | "error">(
    getToken() ? "ok" : "off",
  );
  const [syncMsg, setSyncMsg] = useState("");
  const [at, setAt] = useState(0);
  const [panel, setPanel] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");

  // 不包 useCallback 的话它每次 render 都是新函数，下面几个 effect 就跟着每次重跑
  const key = useCallback((k: string) => `note:${slug}:${k}`, [slug]);

  useEffect(() => {
    if (fs) document.documentElement.style.setProperty("--md-fs", `${fs}px`);
  }, [fs]);

  /**
   * 拿合并后的整份 doc 和 localStorage 逐条比，不一样就校正页面。
   * 不能只挑「远端赢了镜像」的那些：镜像可能已经收进远端值了，
   * 那样这一页就永远不会被校正（就是这个 bug 让手机连上了却还显示自己的旧状态）。
   */
  const applyDoc = useCallback(
    (doc: Doc) => {
      for (const [tk, val] of Object.entries(doc[slug] || {})) {
        const k = key(`k${tk}`);
        if (readLocal(k) === val) continue;
        try {
          localStorage.setItem(k, val);
        } catch {
          /* 存不下就算了 */
        }
        const box = boxesRef.current.find((b) => b.dataset.k === tk);
        if (!box) continue;
        const on = parseVal(val).on;
        box.checked = on;
        box.closest("li")?.classList.toggle("md-done", on);
      }
    },
    [slug, key],
  );

  const runSync = useCallback(
    async (force = false) => {
      if (!getToken()) {
        setSyncState("off");
        return;
      }
      setSyncState("busy");
      const r = await pull(force);
      if (!r.ok) {
        setSyncState("error");
        setSyncMsg(r.error || "同步失败");
        return;
      }
      applyDoc(r.doc);
      setAt(Date.now());
      setSyncMsg("");
      if (r.dirt) schedulePush(300);
      setSyncState("ok");
    },
    [applyDoc],
  );

  useEffect(() => {
    const boxes = Array.from(
      document.querySelectorAll<HTMLInputElement>(".md-check"),
    );
    boxesRef.current = boxes;
    const local: Record<string, string> = {};

    boxes.forEach((box, i) => {
      // 键按条目内容哈希（构建期写在 data-k 上），插删方框不会让历史勾选错位；
      // 万一拿不到 data-k（老构建产物）才退回序号
      const tk = box.dataset.k;
      const k = key(tk ? `k${tk}` : `t${i}`);
      if (tk) {
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
      const stored = readLocal(k);
      box.checked = parseVal(stored).on;
      box.closest("li")?.classList.toggle("md-done", box.checked);
      // 老数据没有时间戳，补一个最小的：够格被推上去，但任何真实改动都能盖过它
      if (tk && stored !== null) {
        const seeded = seedVal(stored);
        if (seeded !== stored) {
          try {
            localStorage.setItem(k, seeded);
          } catch {
            /* ignore */
          }
        }
        local[tk] = seeded;
      }

      const onChange = () => {
        box.closest("li")?.classList.toggle("md-done", box.checked);
        const val = makeVal(box.checked);
        try {
          localStorage.setItem(k, val);
        } catch {
          /* 存不下就算了 */
        }
        if (tk) {
          foldLocal(slug, { [tk]: val });
          schedulePush();
        }
      };
      box.addEventListener("change", onChange);
    });

    if (Object.keys(local).length) foldLocal(slug, local);
    // 同步不挡首屏，放 microtask 里：runSync 一开头就 setState，
    // 在 effect 体里直接调它会触发级联渲染
    queueMicrotask(() => void runSync());
    return () => boxes.forEach((b) => b.replaceWith(b.cloneNode(true)));
  }, [slug, key, runSync]);

  // 手机切回标签页时把别人的改动拉下来
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void runSync();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [runSync]);

  async function onConnect() {
    setToken(tokenDraft);
    setSyncState("busy");
    const r = await connect();
    if (!r.ok) {
      setSyncState("error");
      setSyncMsg(r.error || "连不上");
      return;
    }
    setSyncMsg("");
    setTokenDraft("");
    setPanel(false);
    await runSync(true);
  }

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

  const pill =
    syncState === "off"
      ? "开启同步"
      : syncState === "busy"
        ? "同步中…"
        : syncState === "error"
          ? "同步失败"
          : "已同步";

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
        <button
          type="button"
          onClick={() => setPanel((v) => !v)}
          className={`px-3 py-1 rounded-full border border-[var(--border-subtle)] ${
            syncState === "error" || syncState === "off"
              ? "text-[var(--text-tertiary)]"
              : "text-[var(--accent-primary)]"
          } hover:border-[var(--accent-primary)]`}
        >
          {pill}
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

      {panel && (
        <div className="mb-6 px-4 py-3 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          <p className="text-[var(--text-primary)]">勾选状态同步</p>
          <p>
            打卡状态存在<b>你自己一个不公开的 gist</b> 里，网页直接去 GitHub 读它，所以手机和电脑看到的是同一份。
            token 只留在这台设备的浏览器里，不在网站代码里 —— 别人打开这个页面既看不到你的勾选，也改不动。
          </p>
          <p>
            第一次用：打开{" "}
            <a
              className="text-[var(--accent-primary)] underline"
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noreferrer"
            >
              GitHub 新建 token 的页面
            </a>
            ，权限<b>只勾 Gists 的 Read and write</b>，仓库权限一个都别给，过期设 Never，然后把那串粘进来。
            手机上同样粘一次就行 —— gist 会被自动找到，不用传地址、不用建文件。
          </p>
          {syncState === "off" ? (
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                placeholder="粘贴 token"
                className="flex-1 min-w-[14rem] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={onConnect}
                disabled={!tokenDraft.trim()}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white disabled:opacity-40"
              >
                连接
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runSync(true)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]"
              >
                立即同步
              </button>
              <button
                type="button"
                onClick={() => {
                  forget();
                  setAt(0);
                  setSyncMsg("");
                  setSyncState("off");
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--accent-primary)]"
              >
                在这台设备关闭
              </button>
            </div>
          )}
          <p className="text-[var(--text-tertiary)]">
            {syncMsg || (at ? `上次同步 ${new Date(at).toLocaleTimeString()}` : "还没同步过")}
          </p>
        </div>
      )}
    </>
  );
}
