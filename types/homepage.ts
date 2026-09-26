export type AspectRatio = "9:16" | "4:5" | "1:1" | "16:9";

export type AssetType = "REEL" | "CAROUSEL" | "POST" | "SHORT FILM";

export type PlatformType = "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "DIGITAL";

export interface SelectedProject {
  id: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  assetType: AssetType;
  aspectRatio: AspectRatio;
  platform: PlatformType;
  synopsis?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  slidesCount?: number;
}

export interface Discipline {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}
