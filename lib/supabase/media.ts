import { SupabaseClient } from "@supabase/supabase-js";
import {
  STORAGE_BUCKET,
  IMAGE_MAX_SIZE_BYTES,
  VIDEO_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  ValidationResult,
  resolveMimeType,
  validateMediaUpload,
  generateSafeStoragePath,
} from "./mediaValidation";

export {
  STORAGE_BUCKET,
  IMAGE_MAX_SIZE_BYTES,
  VIDEO_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  type ValidationResult,
  resolveMimeType,
  validateMediaUpload,
  generateSafeStoragePath,
};

/**
 * Creates a server-side signed URL for a private storage object across providers.
 * Safe fallback if object does not exist or creation fails.
 */
export async function createMediaSignedUrl(
  supabase: SupabaseClient | null | undefined,
  storagePath: string,
  expiresInSeconds = 3600,
  storageProvider: "supabase" | "cloudinary" = "supabase",
  mediaType: "image" | "video" = "image",
  options?: { isPoster?: boolean; format?: string }
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

  // Cloudinary authenticated asset delivery
  if (storageProvider === "cloudinary") {
    try {
      const { resolveCloudinaryDeliveryUrl } = await import("@/lib/media/cloudinary");
      const effectiveMediaType: "image" | "video" =
        /\.(mp4|webm|mov|m4v|mkv|avi)(\?.*)?$/i.test(storagePath) ? "video" : mediaType;
      return resolveCloudinaryDeliveryUrl(storagePath, {
        resourceType: effectiveMediaType,
        expiresInSeconds,
        isPoster: options?.isPoster,
        format: options?.format,
      });
    } catch (err) {
      console.error("[createMediaSignedUrl] Cloudinary signed URL error:", err);
      return null;
    }
  }

  // Supabase Storage asset delivery
  if (!supabase) return null;
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
