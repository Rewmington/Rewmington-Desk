"use client";

import { useEffect, useState } from "react";

export interface UsageRow {
  name: string;
  kind: string;
  bytes: number;
  cached: boolean;
}

export interface DataUsage {
  rows: UsageRow[];
  total: number;
  rate: number;
  pending: boolean;
  cachedCount: number;
}

const EMPTY: DataUsage = {
  rows: [],
  total: 0,
  rate: 0,
  pending: true,
  cachedCount: 0,
};

function classify(entry: PerformanceResourceTiming): string {
  const url = entry.name;
  // 先看扩展名：Next 用 <link rel=preload> 预载脚本和字体，这类条目的 initiatorType
  // 一律是 "link"，只按 initiatorType 分会把 JS 和字体全算成 CSS。
  if (/\.js(\?|$)/.test(url)) return "JS";
  if (/\.css(\?|$)/.test(url)) return "CSS";
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/.test(url)) return "字体";
  if (/\.(png|jpe?g|webp|avif|gif|svg|ico)(\?|$)/.test(url)) return "图片";
  if (/\.html?(\?|\/|$)/.test(url)) return "文档";
  if (entry.initiatorType === "script") return "JS";
  if (entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest") return "数据";
  return "其他";
}

function shortName(url: string): string {
  const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  const file = path.split("/").filter(Boolean).pop() ?? path ?? "/";
  return file.length > 34 ? `${file.slice(0, 16)}…${file.slice(-15)}` : file;
}

function collect(): DataUsage {
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  const rows: UsageRow[] = [];
  let total = 0;
  let cachedCount = 0;

  if (navigation) {
    const bytes = navigation.transferSize || navigation.encodedBodySize;
    total += bytes;
    if (navigation.transferSize === 0 && navigation.encodedBodySize > 0) cachedCount += 1;
    rows.push({ name: "文档", kind: "文档", bytes, cached: navigation.transferSize === 0 });
  }

  for (const entry of resources) {
    const bytes = entry.transferSize || entry.encodedBodySize;
    const cached = entry.transferSize === 0 && entry.encodedBodySize > 0;
    total += bytes;
    if (cached) cachedCount += 1;
    rows.push({ name: shortName(entry.name), kind: classify(entry), bytes, cached });
  }

  rows.sort((a, b) => b.bytes - a.bytes);

  return {
    rows,
    total,
    rate: 0,
    pending: !navigation || navigation.loadEventEnd === 0,
    cachedCount,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function useDataUsage(active: boolean = true): DataUsage {
  const [usage, setUsage] = useState<DataUsage>(EMPTY);

  useEffect(() => {
    if (!active) return;
    let lastBytes = 0;
    let lastAt = performance.now();
    let lastTotal = -1;
    let rate = 0;
    let quietTicks = 0;

    const tick = () => {
      const next = collect();
      const now = performance.now();
      const dt = now - lastAt;
      if (dt > 0) {
        const instant = Math.max(0, next.total - lastBytes) / (dt / 1000);
        rate = rate * 0.6 + instant * 0.4;
      }
      if (next.total === lastBytes) quietTicks += 1;
      else quietTicks = 0;
      lastBytes = next.total;
      lastAt = now;
      if (quietTicks > 2) rate = 0;

      // 页面稳定下来后不再触发渲染，避免为了显示一个不变的数字一直重排。
      // 悬停预取会让 total 变化，那时又会恢复更新。
      if (next.total === lastTotal && rate === 0 && quietTicks > 6) return;
      lastTotal = next.total;

      setUsage({
        ...next,
        rate,
        pending: next.pending || quietTicks <= 2,
      });
    };

    // 第一次读数交给 interval 的 500ms 回调：effect 体内同步 setState 会触发级联渲染，
    // 而那半秒里显示"加载中 0 B"本身就是事实。
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [active]);

  return usage;
}
