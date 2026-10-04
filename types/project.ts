import { AspectRatio, AssetType, PlatformType } from "./homepage";

export interface ProjectRecord {
  id: string;
  title: string;
  slug: string;
  client: string;
  year: string;
  discipline: string;
  asset_type: AssetType | string;
  platform: PlatformType | string;
  aspect_ratio: AspectRatio | string;
  description: string | null;
  cover_path: string | null;
  published: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProjectInput = {
  title: string;
  slug: string;
  client: string;
  year: string;
  discipline: string;
  asset_type: AssetType | string;
  platform: PlatformType | string;
  aspect_ratio: AspectRatio | string;
  description?: string | null;
  cover_path?: string | null;
  published: boolean;
};

export type ProjectFilterStatus = "all" | "published" | "draft";

export type MediaType = "image" | "video";

export interface MediaRecord {
  id: string;
  project_id: string;
  type: MediaType;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at?: string;
  signedUrl?: string | null;
}
