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
  filing: string;
  socials: SocialLink[];
  stats: {
    articles: number;
    photos: number;
  };
}
