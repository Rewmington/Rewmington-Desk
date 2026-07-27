export interface Article {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  tags: string[];
  variant: "image" | "text-overlay";
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string; // SVG path data
}

export interface SiteConfig {
  authorName: string;
  bio: string;
  avatarUrl: string;
  buildDate: string; // ISO date string
  socials: SocialLink[];
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  url: string;
  progress: number; // 0-100
  status: "编码中" | "规划中" | "已完成" | "测试中";
}

export interface Friend {
  name: string;
  url: string;
  avatar: string;
  bio: string;
}

export interface Photo {
  id: string;
  src: string;
  caption: string;
  date: string;
  location: string;
}

// 暂存系统类型
export type ContentType = "article" | "project" | "friend" | "music" | "photo";

export interface StagingItem {
  id: string;
  type: ContentType;
  data: Record<string, unknown>;
  stagedAt: string;
}

export interface ExportFile {
  version: number;
  exportedAt: string;
  source: "desk-staging";
  items: Array<{ type: ContentType; data: Record<string, unknown> }>;
}
