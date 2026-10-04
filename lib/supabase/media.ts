import { SupabaseClient } from "@supabase/supabase-js";
import { MediaType } from "@/types/project";

/**
 * Storage configuration & strict validation limits for V1 media upload system.
 * Target private bucket: otzi-media
 */
export const STORAGE_BUCKET = "otzi-media";

// V1 Upload Size Limits
export const IMAGE_MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const VIDEO_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// Allowed MIME types
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

// Extension to MIME mappings for consistency validation
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".mp4": ["video/mp4"],
  ".webm": ["video/webm"],
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
  mediaType?: MediaType;
}

/**
 * Validates file MIME type, extension, and size before sending to Storage.
 * Rejects unsupported or mismatched formats with clear UI-friendly errors.
 */
export function validateMediaUpload(file: {
  name: string;
  type: string;
  size: number;
}): ValidationResult {
  if (!file || !file.name) {
    return { valid: false, error: "No file provided for upload." };
  }

  // 1. Extract and sanitize extension
  const lastDot = file.name.lastIndexOf(".");
  if (lastDot === -1) {
    return {
      valid: false,
      error: "File must have a valid extension (.jpg, .png, .webp, .mp4, .webm).",
    };
  }

  const ext = file.name.slice(lastDot).toLowerCase();
  const normalizedMime = (file.type || "").toLowerCase().trim();

  // 2. Validate MIME type
  const isImage = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(normalizedMime);
  const isVideo = (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(normalizedMime);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file format (${normalizedMime || "unknown"}). Allowed formats: JPEG, PNG, WebP images and MP4, WebM videos.`,
    };
  }

  // 3. Validate extension matches MIME type
  const allowedMimesForExt = EXTENSION_MIME_MAP[ext];
  if (!allowedMimesForExt || !allowedMimesForExt.includes(normalizedMime)) {
    return {
      valid: false,
      error: `File extension "${ext}" does not match file type "${normalizedMime}".`,
    };
  }

  // 4. Validate file size limits
  if (isImage && file.size > IMAGE_MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image exceeds the 15MB limit (current: ${sizeMb}MB). Please optimize the image before uploading.`,
    };
  }

  if (isVideo && file.size > VIDEO_MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Video exceeds the 50MB limit (current: ${sizeMb}MB). Please provide a web cutdown under 50MB.`,
    };
  }

  return {
    valid: true,
    mediaType: isVideo ? "video" : "image",
  };
}

/**
 * Generates a collision-resistant, sanitized storage path inside the private bucket.
 * Structure: projects/{projectId}/{timestamp}-{uuid8}-{safe-basename}.{ext}
 */
export function generateSafeStoragePath(projectId: string, originalFilename: string): string {
  const lastDot = originalFilename.lastIndexOf(".");
  const ext = lastDot !== -1 ? originalFilename.slice(lastDot).toLowerCase() : "";
  const rawBase = lastDot !== -1 ? originalFilename.slice(0, lastDot) : originalFilename;

  // Clean filename: retain only alphanumeric, hyphen, underscore
  const safeBase = rawBase
    .toLowerCase()
    .trim()
    .replace(/[^\w-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32);

  const timestamp = Date.now();
  const randomSuffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10);

  const finalName = `${timestamp}-${randomSuffix}-${safeBase || "asset"}${ext}`;
  return `projects/${projectId}/${finalName}`;
}

/**
 * Creates a server-side signed URL for a private storage object.
 * Safe fallback if object does not exist or creation fails.
 */
export async function createMediaSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!storagePath) return null;
  // External or absolute static URLs need no signing
  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://") ||
    storagePath.startsWith("/")
  ) {
    return storagePath;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
