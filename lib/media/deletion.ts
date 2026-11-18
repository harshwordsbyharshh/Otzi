export interface PurgeMediaItem {
  storage_path: string;
  storage_provider?: string | null;
  type?: string | null;
}

export interface PurgeStorageDeps {
  removeSupabasePaths: (
    paths: string[]
  ) => Promise<{ data?: unknown; error: { message: string } | null }>;
  deleteCloudinaryAsset: (
    path: string,
    type: "image" | "video"
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface PurgeResult {
  success: boolean;
  error?: string;
  failedSupabase?: boolean;
  failedCloudinaryCount?: number;
}

/**
 * Orchestrates cross-provider media file purge for a project before database records are deleted.
 * Guarantees fail-fast behavior:
 * 1. Supabase Storage files are removed first. If removal fails or throws, aborts before Cloudinary.
 * 2. Cloudinary files are removed. If any asset fails, aborts before database records are deleted.
 * 3. Preserves database records if any storage removal fails.
 */
export async function purgeProjectMediaStorage(
  projectId: string,
  mediaItems: PurgeMediaItem[],
  deps: PurgeStorageDeps
): Promise<PurgeResult> {
  if (!mediaItems || mediaItems.length === 0) {
    return { success: true };
  }

  // 1. Purge Supabase Storage files
  const supabasePaths = mediaItems
    .filter((m) => !m.storage_provider || m.storage_provider === "supabase")
    .map((m) => m.storage_path)
    .filter(Boolean);

  if (supabasePaths.length > 0) {
    try {
      const { error: storageError } = await deps.removeSupabasePaths(supabasePaths);
      if (storageError) {
        console.error(
          `[purgeProjectMediaStorage] Supabase storage purge failed for project "${projectId}":`,
          storageError
        );
        return {
          success: false,
          failedSupabase: true,
          error: `Project deletion aborted: Failed to remove Supabase storage asset(s) (${storageError.message}). Database records were preserved. Please check storage logs and retry.`,
        };
      }
    } catch (err) {
      console.error(
        `[purgeProjectMediaStorage] Unexpected exception during Supabase storage purge for project "${projectId}":`,
        err
      );
      const message = err instanceof Error ? err.message : "Unexpected storage error";
      return {
        success: false,
        failedSupabase: true,
        error: `Project deletion aborted: Unexpected error during Supabase storage purge (${message}). Database records were preserved.`,
      };
    }
  }

  // 2. Purge Cloudinary assets
  const cloudinaryItems = mediaItems.filter(
    (m) => m.storage_provider === "cloudinary"
  );

  if (cloudinaryItems.length > 0) {
    try {
      const purgeResults = await Promise.all(
        cloudinaryItems.map(async (c) => {
          const res = await deps.deleteCloudinaryAsset(
            c.storage_path,
            c.type === "video" ? "video" : "image"
          );
          return { path: c.storage_path, ...res };
        })
      );

      const failedPurges = purgeResults.filter((r) => !r.success);
      if (failedPurges.length > 0) {
        console.error(
          `[purgeProjectMediaStorage] Cloudinary asset purge failed for project "${projectId}":`,
          failedPurges.map((f) => ({ path: f.path, error: f.error }))
        );
        return {
          success: false,
          failedCloudinaryCount: failedPurges.length,
          error: `Project deletion aborted: Failed to remove ${failedPurges.length} remote media asset(s) from Cloudinary. Database records were preserved. Please check Cloudinary configuration and retry.`,
        };
      }
    } catch (err) {
      console.error(
        `[purgeProjectMediaStorage] Cloudinary purge unexpected exception for project "${projectId}":`,
        err
      );
      const message = err instanceof Error ? err.message : "Unexpected Cloudinary purge error";
      return {
        success: false,
        error: `Project deletion aborted: Unexpected error during media storage purge (${message}). Database records were preserved.`,
      };
    }
  }

  return { success: true };
}
