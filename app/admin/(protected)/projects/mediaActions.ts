"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "./actions";
import { MediaRecord } from "@/types/project";
import {
  STORAGE_BUCKET,
  validateMediaUpload,
  generateSafeStoragePath,
  createMediaSignedUrl,
} from "@/lib/supabase/media";
import {
  isCloudinaryConfigured,
  generateUploadSignature,
  verifyCloudinaryAsset,
  deleteCloudinaryAsset,
} from "@/lib/media/cloudinary";

export async function getProjectMediaAction(
  projectId: string
): Promise<{ success: boolean; media?: MediaRecord[]; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) {
      return { success: false, error: "Failed to retrieve media records." };
    }

    const mediaList = (data as MediaRecord[]) || [];

    // Attach signed URLs for private asset preview in admin console
    const mediaWithSignedUrls: MediaRecord[] = await Promise.all(
      mediaList.map(async (item) => {
        const signedUrl = await createMediaSignedUrl(
          supabase,
          item.storage_path,
          3600,
          item.storage_provider || "supabase",
          item.type
        );
        return {
          ...item,
          signedUrl,
        };
      })
    );

    return { success: true, media: mediaWithSignedUrls };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load project media.";
    return { success: false, error: message };
  }
}

/**
 * Authorizes and prepares direct-to-storage signed upload parameters for browser uploads.
 * Prioritizes Cloudinary direct upload (supporting up to 100MB videos and 10MB images),
 * with safe fallback to Supabase Storage when Cloudinary is unconfigured.
 */
export async function prepareMediaUploadAction(input: {
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<{
  success: boolean;
  storageProvider?: "supabase" | "cloudinary";
  storagePath?: string;
  publicId?: string;
  uploadUrl?: string;
  signature?: string;
  timestamp?: number;
  apiKey?: string;
  cloudName?: string;
  eager?: string;
  token?: string;
  signedUrl?: string;
  mediaType?: "image" | "video";
  resolvedMime?: string;
  error?: string;
}> {
  try {
    const { supabase } = await verifyAdminAuth();
    const { projectId, fileName, fileType, fileSize } = input;

    if (!projectId) {
      return { success: false, error: "Missing project ID specification." };
    }

    // 1. Validate file (MIME type, extension, size limits)
    const validation = validateMediaUpload({
      name: fileName,
      type: fileType,
      size: fileSize,
    });

    if (!validation.valid || !validation.mediaType) {
      return { success: false, error: validation.error || "File validation failed." };
    }

    // 2. Verify project exists
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return { success: false, error: "Target project does not exist in the archive." };
    }

    // 3. If Cloudinary is configured, prepare direct Cloudinary signed upload
    if (isCloudinaryConfigured()) {
      const sigResult = generateUploadSignature({
        projectId,
        fileName,
        fileType,
        fileSize,
      });

      if (!sigResult.success) {
        return { success: false, error: sigResult.error };
      }

      return {
        success: true,
        storageProvider: "cloudinary",
        storagePath: sigResult.publicId,
        publicId: sigResult.publicId,
        uploadUrl: sigResult.uploadUrl,
        signature: sigResult.signature,
        timestamp: sigResult.timestamp,
        apiKey: sigResult.apiKey,
        cloudName: sigResult.cloudName,
        eager: sigResult.eager,
        mediaType: sigResult.resourceType,
        resolvedMime: validation.resolvedMime,
      };
    }

    // 4. Fallback: Supabase Storage signed upload URL
    const storagePath = generateSafeStoragePath(projectId, fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (uploadError || !uploadData) {
      return {
        success: false,
        error: `Storage upload authorization rejected: ${uploadError?.message || "Unknown error"}`,
      };
    }

    return {
      success: true,
      storageProvider: "supabase",
      storagePath,
      token: uploadData.token,
      signedUrl: uploadData.signedUrl,
      mediaType: validation.mediaType,
      resolvedMime: validation.resolvedMime,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to prepare storage upload.";
    return { success: false, error: message };
  }
}

/**
 * Records media metadata into public.media after direct-to-storage upload completes.
 */
export async function completeMediaUploadAction(input: {
  projectId: string;
  storagePath: string;
  storageProvider?: "supabase" | "cloudinary";
  mediaType: "image" | "video";
  fileSize?: number;
  altText?: string;
  isCover?: boolean;
}): Promise<{ success: boolean; media?: MediaRecord; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();
    const {
      projectId,
      storagePath,
      storageProvider = "supabase",
      mediaType,
      fileSize,
      altText = "",
      isCover = false,
    } = input;

    if (!projectId || !storagePath) {
      return { success: false, error: "Missing required upload metadata." };
    }

    // Security Gate: Strict prefix containment to prevent cross-project spoofing and path traversal
    const expectedPrefix = `projects/${projectId}/`;
    if (!storagePath.startsWith(expectedPrefix)) {
      return {
        success: false,
        error: `Security violation: storagePath "${storagePath}" does not belong to project "${projectId}".`,
      };
    }

    // 1. Verify project exists
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id, slug, cover_path")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return { success: false, error: "Target project does not exist in the archive." };
    }

    // 2. Idempotency Check: Return existing record if already created
    const { data: existingMedia } = await supabase
      .from("media")
      .select("*")
      .eq("project_id", projectId)
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (existingMedia) {
      const signedUrl = await createMediaSignedUrl(
        supabase,
        existingMedia.storage_path,
        3600,
        existingMedia.storage_provider || "supabase",
        existingMedia.type
      );
      return {
        success: true,
        media: {
          ...(existingMedia as MediaRecord),
          signedUrl,
        },
      };
    }

    // 3. Server-side verification for Cloudinary uploads
    let verifiedBytes = fileSize || null;
    if (storageProvider === "cloudinary") {
      const verifyResult = await verifyCloudinaryAsset(
        storagePath,
        mediaType,
        projectId
      );
      if (!verifyResult.valid) {
        return {
          success: false,
          error: verifyResult.error || "Cloudinary asset verification failed.",
        };
      }
      if (verifyResult.bytes) {
        verifiedBytes = verifyResult.bytes;
      }
    }

    // 4. Calculate next sort order
    const { count } = await supabase
      .from("media")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const sortOrder = (count ?? 0) + 1;

    // 5. Insert metadata into public.media
    const { data: mediaRow, error: insertError } = await supabase
      .from("media")
      .insert({
        project_id: projectId,
        type: mediaType,
        storage_path: storagePath,
        storage_provider: storageProvider,
        file_size: verifiedBytes,
        alt_text: altText.trim() || null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertError || !mediaRow) {
      // Concurrency handling: If duplicate key violation (code 23505), fetch and return the concurrent row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((insertError as any)?.code === "23505") {
        const { data: concurrentMedia } = await supabase
          .from("media")
          .select("*")
          .eq("project_id", projectId)
          .eq("storage_path", storagePath)
          .maybeSingle();

        if (concurrentMedia) {
          const signedUrl = await createMediaSignedUrl(
            supabase,
            concurrentMedia.storage_path,
            3600,
            concurrentMedia.storage_provider || "supabase",
            concurrentMedia.type
          );
          return {
            success: true,
            media: {
              ...(concurrentMedia as MediaRecord),
              signedUrl,
            },
          };
        }
      }

      // Revert upload to prevent orphaned storage objects ONLY if within the project namespace
      if (storageProvider === "cloudinary") {
        if (storagePath.startsWith(expectedPrefix)) {
          await deleteCloudinaryAsset(storagePath, mediaType);
        }
      } else {
        if (storagePath.startsWith(expectedPrefix)) {
          await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
        }
      }
      return {
        success: false,
        error: `Database metadata write failed: ${insertError?.message || "Unknown error"}`,
      };
    }

    // 5. Handle project cover update
    if (isCover || !project.cover_path) {
      await supabase
        .from("projects")
        .update({
          cover_path: storagePath,
          cover_storage_provider: storageProvider,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    }

    // 6. Generate signed URL for immediate client preview
    const signedUrl = await createMediaSignedUrl(
      supabase,
      storagePath,
      3600,
      storageProvider,
      mediaType
    );
    const mediaWithSignedUrl: MediaRecord = {
      ...(mediaRow as MediaRecord),
      signedUrl,
    };

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}/edit`);
    revalidatePath("/work");
    revalidatePath("/");
    if (project.slug) {
      revalidatePath(`/work/${project.slug}`);
    }

    return { success: true, media: mediaWithSignedUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record uploaded media.";
    return { success: false, error: message };
  }
}

export async function uploadProjectMediaAction(
  formData: FormData
): Promise<{ success: boolean; media?: MediaRecord; error?: string }> {
  let uploadedStoragePath: string | null = null;
  try {
    const { supabase } = await verifyAdminAuth();

    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const altText = (formData.get("altText") as string) || "";
    const isCover = formData.get("isCover") === "true";

    if (!projectId) {
      return { success: false, error: "Missing project ID specification." };
    }

    if (!file) {
      return { success: false, error: "No media file provided." };
    }

    // 1. Validate file (MIME type, extension, size limits)
    const validation = validateMediaUpload({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid || !validation.mediaType) {
      return { success: false, error: validation.error || "File validation failed." };
    }

    // 2. Verify project exists
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id, slug, cover_path")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return { success: false, error: "Target project does not exist in the archive." };
    }

    // 3. Generate collision-safe storage path
    const storagePath = generateSafeStoragePath(projectId, file.name);
    uploadedStoragePath = storagePath;

    // 4. Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: validation.resolvedMime || file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Storage upload rejected: ${uploadError.message}`,
      };
    }

    // 5. Calculate next sort order
    const { count } = await supabase
      .from("media")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const sortOrder = (count ?? 0) + 1;

    // 6. Insert metadata into public.media
    const { data: mediaRow, error: insertError } = await supabase
      .from("media")
      .insert({
        project_id: projectId,
        type: validation.mediaType,
        storage_path: storagePath,
        alt_text: altText.trim() || null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertError || !mediaRow) {
      // Revert storage upload to prevent orphaned storage objects
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return {
        success: false,
        error: `Database metadata write failed: ${insertError?.message || "Unknown error"}`,
      };
    }

    // 7. Handle project cover update
    // Update cover if explicitly requested OR if the project currently has no cover
    if (isCover || !project.cover_path) {
      await supabase
        .from("projects")
        .update({
          cover_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    }

    // 8. Generate signed URL for immediate client preview
    const signedUrl = await createMediaSignedUrl(supabase, storagePath, 3600);
    const mediaWithSignedUrl: MediaRecord = {
      ...(mediaRow as MediaRecord),
      signedUrl,
    };

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}/edit`);
    revalidatePath("/work");
    revalidatePath("/");
    if (project.slug) {
      revalidatePath(`/work/${project.slug}`);
    }

    return { success: true, media: mediaWithSignedUrl };
  } catch (err: unknown) {
    // If an error occurred after upload, attempt rollback
    if (uploadedStoragePath) {
      try {
        const { supabase } = await verifyAdminAuth();
        await supabase.storage.from(STORAGE_BUCKET).remove([uploadedStoragePath]);
      } catch {
        // Rollback attempt best-effort
      }
    }
    const message = err instanceof Error ? err.message : "Unexpected server error during upload.";
    return { success: false, error: message };
  }
}

export async function deleteProjectMediaAction(
  mediaId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    // 1. Fetch media record to identify storage path
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("*")
      .eq("id", mediaId)
      .eq("project_id", projectId)
      .single();

    if (mediaError || !media) {
      return { success: false, error: "Media record not found." };
    }

    const typedMedia = media as MediaRecord;

    // 2. Fetch project to check if this media is the active cover
    const { data: project } = await supabase
      .from("projects")
      .select("id, slug, cover_path")
      .eq("id", projectId)
      .single();

    const isCurrentCover = project?.cover_path === typedMedia.storage_path;

    // 3. Remove file from storage provider
    if (typedMedia.storage_provider === "cloudinary") {
      const delRes = await deleteCloudinaryAsset(typedMedia.storage_path, typedMedia.type);
      if (!delRes.success) {
        return {
          success: false,
          error: `Failed to remove file from Cloudinary: ${delRes.error || "Unknown error"}`,
        };
      }
    } else {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([typedMedia.storage_path]);

      if (storageError) {
        return {
          success: false,
          error: `Failed to remove file from storage: ${storageError.message}`,
        };
      }
    }

    // 4. Remove row from public.media
    const { error: deleteError } = await supabase
      .from("media")
      .delete()
      .eq("id", mediaId);

    if (deleteError) {
      return {
        success: false,
        error: `Failed to delete media record: ${deleteError.message}`,
      };
    }

    // 5. If this media was the project cover, update cover_path and cover_storage_provider
    if (isCurrentCover) {
      // Find next available media item for this project
      const { data: remainingMedia } = await supabase
        .from("media")
        .select("storage_path, storage_provider")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
        .limit(1);

      const nextItem = remainingMedia && remainingMedia.length > 0 ? remainingMedia[0] : null;
      const nextCoverPath = nextItem ? nextItem.storage_path : null;
      const nextCoverProvider = nextItem ? nextItem.storage_provider || "supabase" : "supabase";

      await supabase
        .from("projects")
        .update({
          cover_path: nextCoverPath,
          cover_storage_provider: nextCoverProvider,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}/edit`);
    revalidatePath("/work");
    revalidatePath("/");
    if (project?.slug) {
      revalidatePath(`/work/${project.slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete media item.";
    return { success: false, error: message };
  }
}

export async function setProjectCoverAction(
  projectId: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    // Verify storage path belongs to this project
    const { data: media } = await supabase
      .from("media")
      .select("id, storage_provider")
      .eq("project_id", projectId)
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (!media) {
      return { success: false, error: "Selected asset does not belong to this project." };
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        cover_path: storagePath,
        cover_storage_provider: media.storage_provider || "supabase",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: `Failed to set project cover: ${error.message}` };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}/edit`);
    revalidatePath("/work");
    revalidatePath("/");
    if (project?.slug) {
      revalidatePath(`/work/${project.slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project cover.";
    return { success: false, error: message };
  }
}
