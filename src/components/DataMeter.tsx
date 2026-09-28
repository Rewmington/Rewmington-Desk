"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { formatBytes, useDataUsage } from "@/hooks/useDataUsage";

const HIDDEN_KEY = "meter-hidden";
const CHANGE_EVENT = "desk-meter-hidden";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
};

const getHiddenSnapshot = () => localStorage.getItem(HIDDEN_KEY) === "1";
const getHiddenServerSnapshot = () => true;

export default function DataMeter() {
  const hidden = useSyncExternalStore(
    subscribe,
    getHiddenSnapshot,
    getHiddenServerSnapshot
  );
  const [open, setOpen] = useState(false);
  const usage = useDataUsage(!hidden);

  const setHidden = useCallback((value: boolean) => {
    if (value) localStorage.setItem(HIDDEN_KEY, "1");
    else localStorage.removeItem(HIDDEN_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const byKind = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of usage.rows) {
      map.set(row.kind, (map.get(row.kind) ?? 0) + row.bytes);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [usage.rows]);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-3 right-3 md:bottom-5 md:right-5 z-40 flex w-6 h-6 md:w-5 md:h-5 rounded-full bg-[var(--bg-card)] backdrop-blur-[20px] border border-[var(--border-card)] items-center justify-center text-[10px] md:text-[9px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        title="显示网速计"
        aria-label="显示网速计"
      >
        ↓
      </button>
    );
  }

  if (usage.pending) {
    return (
      <div className="fixed bottom-3 right-3 md:bottom-5 md:right-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] backdrop-blur-[20px] border border-[var(--border-card)] font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
        加载中 {formatBytes(usage.total)}
        <span className="text-[var(--text-tertiary)]">
          {formatBytes(usage.rate)}/s
        </span>
      </div>
    );
  }

  return (
    // 移动端：整块贴底，面板在上、药丸在下，等于一个底部抽屉。
    // 桌面端：解除左边界，靠右下角，面板浮在药丸上方。
    <div className="fixed bottom-0 right-0 left-0 z-40 flex flex-col md:left-auto md:bottom-5 md:right-5 md:items-end">
      {open && (
        <div className="max-h-[55vh] overflow-y-auto rounded-t-2xl p-4 bg-[var(--bg-card)] backdrop-blur-[20px] saturate-[1.8] border border-[var(--border-card)] md:max-h-none md:overflow-visible md:rounded-2xl md:w-[300px] md:p-3 md:mb-2 md:shadow-[var(--shadow-card)]">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              本页传输
            </span>
            <span className="font-mono text-sm text-[var(--text-primary)] tabular-nums">
              {formatBytes(usage.total)}
            </span>
          </div>

          <div className="space-y-1 mb-3">
            {byKind.map(([kind, bytes]) => (
              <div key={kind} className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-[var(--text-tertiary)]">{kind}</span>
                <div className="flex-1 h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-primary)]"
                    style={{ width: `${usage.total ? (bytes / usage.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-[10px] text-[var(--text-secondary)] tabular-nums">
                  {formatBytes(bytes)}
                </span>
              </div>
            ))}
          </div>

          <div className="max-h-[200px] overflow-y-auto -mx-1 px-1">
            {usage.rows.slice(0, 12).map((row, i) => (
              <div
                key={`${row.name}-${i}`}
                className="flex items-center gap-2 py-[3px] text-[10px]"
              >
                <span className="text-[var(--text-primary)] truncate flex-1" title={row.name}>
                  {row.name}
                </span>
                {row.cached && (
                  <span className="shrink-0 px-1 rounded bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
                    缓存
                  </span>
                )}
                <span className="shrink-0 font-mono text-[var(--text-secondary)] tabular-nums">
                  {formatBytes(row.bytes)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 mt-1 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)]">
            {usage.rows.length} 个请求
            {usage.cachedCount > 0 && ` · ${usage.cachedCount} 个命中缓存（0 网络开销）`}
            {usage.rows.length > 12 && " · 仅列出前 12 项"}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 justify-end px-3 pb-3 md:p-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] backdrop-blur-[20px] border border-[var(--border-card)] hover:border-[var(--accent-primary)] transition-colors font-mono text-[11px] text-[var(--text-secondary)] tabular-nums"
          title={open ? "收起" : "查看构成"}
        >
          <span className="text-[var(--text-tertiary)]">↓</span>
          {formatBytes(usage.total)}
          <span className="text-[var(--text-tertiary)]">{open ? "▾" : "▴"}</span>
        </button>
        <button
          onClick={() => setHidden(true)}
          className="w-6 h-6 rounded-full bg-[var(--bg-card)] backdrop-blur-[20px] border border-[var(--border-card)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-[10px]"
          title="收起为小圆点"
          aria-label="隐藏网速计"
        >
          ×
        </button>
      </div>
    </div>
  );
}
