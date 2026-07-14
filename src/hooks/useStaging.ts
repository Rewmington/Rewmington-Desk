"use client";

import { useState, useCallback, useEffect } from "react";
import type { ContentType, StagingItem, ExportFile } from "@/types";

const STORAGE_KEY = "myblog-staging-items";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function readItems(): StagingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: StagingItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useStaging() {
  const [items, setItems] = useState<StagingItem[]>([]);

  // 挂载时从 localStorage 读取
  useEffect(() => {
    setItems(readItems());
  }, []);

  const refresh = useCallback(() => {
    setItems(readItems());
  }, []);

  const addItem = useCallback((type: ContentType, data: Record<string, unknown>): void => {
    const current = readItems();
    const newItem: StagingItem = {
      id: generateId(),
      type,
      data,
      stagedAt: new Date().toISOString(),
    };
    writeItems([...current, newItem]);
    refresh();
  }, [refresh]);

  const removeItem = useCallback((id: string): void => {
    const current = readItems();
    writeItems(current.filter((item) => item.id !== id));
    refresh();
  }, [refresh]);

  const clearAll = useCallback((): void => {
    writeItems([]);
    refresh();
  }, [refresh]);

  const exportToJSON = useCallback((): ExportFile => {
    const current = readItems();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "myblog-staging",
      items: current.map(({ type, data }) => ({ type, data })),
    };
  }, []);

  const downloadExport = useCallback((): void => {
    const data = exportToJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myblog-pending-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportToJSON]);

  return {
    items,
    refresh,
    addItem,
    removeItem,
    clearAll,
    exportToJSON,
    downloadExport,
  };
}
