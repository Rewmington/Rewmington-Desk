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
  /** 关于页「技术栈」卡片的介绍文案，与 profile.json 同源，改内容不用动代码 */
  techIntro: string;
  techStack: string[];
  socials: SocialLink[];
}

export const PROJECT_STATUSES = ["编码中", "规划中", "已完成", "测试中"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  name: string;
  description: string;
  tags: string[];
  url: string;
  progress: number; // 0-100
  status: ProjectStatus;
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
