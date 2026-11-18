/**
 * ÖTZI Cover Resolution Helper
 *
 * Provides robust media type inference and URL resolution for project cover assets.
 * Guarantees provider-aware routing for Cloudinary video/image assets and preserves
 * legacy Supabase Storage media behavior.
 */

export type MediaType = "image" | "video";

export interface CoverResolutionDeps {
  createMediaSignedUrl?: (
    storageClient: unknown,
    storagePath: string,
    expiresInSeconds: number,
    storageProvider: "supabase" | "cloudinary",
    mediaType: MediaType,
    options?: { isPoster?: boolean; format?: string }
  ) => Promise<string | null>;
  getPublicUrl?: (storagePath: string) => string | null | undefined;
}

/**
 * Infers the authoritative media type ("image" | "video") for a project cover asset.
 * Prioritizes explicit file extensions, then project asset_type model.
 * Returns null if the type cannot be safely determined (e.g. extensionless Cloudinary path
 * with missing or unrecognized asset_type), preventing silent misrouting as an image.
 */
export function inferCoverMediaType(
  coverPath?: string | null,
  assetType?: string | null
): MediaType | null {
  if (!coverPath) return null;

  // 1. Explicit video file extensions take highest precedence
  if (/\.(mp4|webm|mov|m4v|mkv|avi)(\?.*)?$/i.test(coverPath)) {
    return "video";
  }

  // 2. Explicit image file extensions
  if (/\.(jpe?g|png|webp|gif|svg|avif|bmp|tiff?)(\?.*)?$/i.test(coverPath)) {
    return "image";
  }

  // 3. For extension-stripped paths (e.g. Cloudinary public IDs), infer from explicit asset_type
  if (assetType === "REEL" || assetType === "SHORT FILM") {
    return "video";
  }

  if (assetType === "POST") {
    return "image";
  }

  // 4. Missing or unrecognized asset_type for extensionless path: fail-safe
  return null;
}

/**
 * Resolves delivery and poster URLs for a project's primary cover asset.
 * Guarantees provider-aware routing and eager poster generation for video assets.
 */
export async function resolveProjectCover(
  storageClient: unknown,
  coverPath: string,
  coverProvider: "supabase" | "cloudinary" = "supabase",
  assetType?: string | null,
  deps?: CoverResolutionDeps
): Promise<{ mediaUrl?: string; thumbnailUrl?: string }> {
  if (!coverPath) {
    return {};
  }

  // External or absolute static URLs need no signing
  if (
    coverPath.startsWith("http://") ||
    coverPath.startsWith("https://") ||
    coverPath.startsWith("/")
  ) {
    return { mediaUrl: coverPath, thumbnailUrl: coverPath };
  }

  const mediaType = inferCoverMediaType(coverPath, assetType);

  // Fail-safe: Cloudinary requires a definite resource type ("image" or "video") for
  // authenticated URL signing. If an extensionless Cloudinary path lacks explicit
  // media type metadata, do not silently sign it as an image (which would produce
  // an invalid delivery URL and browser decoder error for video assets).
  if (coverProvider === "cloudinary" && !mediaType) {
    return {};
  }

  const effectiveType: MediaType = mediaType || "image";
  const isVideo = effectiveType === "video";

  // Sign primary media delivery URL
  let signedUrl: string | null = null;
  if (deps?.createMediaSignedUrl) {
    signedUrl = await deps.createMediaSignedUrl(
      storageClient,
      coverPath,
      3600,
      coverProvider,
      effectiveType
    );
  } else {
    try {
      const { createMediaSignedUrl } = await import("@/lib/supabase/media");
      signedUrl = await createMediaSignedUrl(
        storageClient as any,
        coverPath,
        3600,
        coverProvider,
        effectiveType
      );
    } catch {
      signedUrl = null;
    }
  }

  // For Cloudinary videos, resolve eager JPEG poster frame
  let posterSignedUrl: string | null = null;
  if (isVideo && coverProvider === "cloudinary") {
    if (deps?.createMediaSignedUrl) {
      posterSignedUrl = await deps.createMediaSignedUrl(
        storageClient,
        coverPath,
        3600,
        "cloudinary",
        "video",
        { isPoster: true }
      );
    } else {
      try {
        const { createMediaSignedUrl } = await import("@/lib/supabase/media");
        posterSignedUrl = await createMediaSignedUrl(
          storageClient as any,
          coverPath,
          3600,
          "cloudinary",
          "video",
          { isPoster: true }
        );
      } catch {
        posterSignedUrl = null;
      }
    }
  }

  // Supabase public URL fallback for legacy assets
  let publicUrl: string | null = null;
  if (coverProvider === "supabase") {
    if (deps?.getPublicUrl) {
      publicUrl = deps.getPublicUrl(coverPath) || null;
    } else if (storageClient && typeof (storageClient as any)?.storage?.from === "function") {
      try {
        publicUrl =
          (storageClient as any).storage.from("otzi-media").getPublicUrl(coverPath).data?.publicUrl || null;
      } catch {
        publicUrl = null;
      }
    }
  }

  const resolvedPrimary = signedUrl || publicUrl || coverPath;
  const resolvedThumbnail = posterSignedUrl || resolvedPrimary;

  return {
    mediaUrl: resolvedPrimary,
    thumbnailUrl: resolvedThumbnail,
  };
}
