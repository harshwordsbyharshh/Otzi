export type AspectRatio = "9:16" | "4:5" | "1:1" | "16:9";

export type AssetType = "REEL" | "CAROUSEL" | "POST" | "SHORT FILM";

export type PlatformType = "INSTAGRAM" | "YOUTUBE" | "X" | "DIGITAL";

export interface ProjectMediaItem {
  id: string;
  caption: string;
  aspectRatio: AspectRatio;
  assetType: AssetType;
  thumbnailUrl?: string;
  mediaUrl?: string;
}

export interface SelectedProject {
  id: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  assetType: AssetType;
  aspectRatio: AspectRatio;
  platform: PlatformType;
  discipline?: string;
  synopsis?: string;
  summary?: string;
  context?: string;
  execution?: string;
  deliverables?: string[];
  mediaSequence?: ProjectMediaItem[];
  thumbnailUrl?: string;
  mediaUrl?: string;
  slidesCount?: number;
  isFeatured?: boolean;
  featuredOrder?: number | null;
}

export interface Discipline {
  id: string;
  number: string;
  title: string;
  subDescription?: string;
  subServices?: string[];
  description: string;
  scope?: string;
  deliverables: string[];
  platforms?: string[];
  methodology?: string[];
}
