import { v2 as cloudinary } from "cloudinary";

// Prevent accidental client-side bundling
if (typeof window !== "undefined") {
  throw new Error("lib/media/cloudinary cannot be imported in the browser.");
}

const DEFAULT_CLOUD_NAME = "jdn58nxv";

// Target limits confirmed for Free tier
export const CLOUDINARY_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const CLOUDINARY_MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Returns the configured Cloudinary cloud name, defaulting to jdn58nxv.
 */
export function getCloudinaryCloudName(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    DEFAULT_CLOUD_NAME
  ).trim();
}

/**
 * Checks whether Cloudinary server-side credentials are fully configured.
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = getCloudinaryCloudName();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  const cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();

  return Boolean((cloudName && apiKey && apiSecret) || cloudinaryUrl);
}

/**
 * Configures the Cloudinary SDK using environment variables.
 */
function ensureConfigured(): boolean {
  const cloudName = getCloudinaryCloudName();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }

  return false;
}

/**
 * Generates a collision-resistant public ID for Cloudinary without file extension.
 * Pattern: projects/{projectId}/{timestamp}-{uuid8}-{safeBase}
 */
export function generateCloudinaryPublicId(
  projectId: string,
  originalFilename: string
): string {
  const lastDot = originalFilename.lastIndexOf(".");
  const rawBase =
    lastDot !== -1 ? originalFilename.slice(0, lastDot) : originalFilename;

  const safeBase = rawBase
    .toLowerCase()
    .trim()
    .replace(/[^\w-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32);

  const timestamp = Date.now();
  const randomSuffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).substring(2, 10);

  return `projects/${projectId}/${timestamp}-${randomSuffix}-${safeBase || "asset"}`;
}

export interface UploadSignatureResult {
  success: boolean;
  signature?: string;
  timestamp?: number;
  apiKey?: string;
  cloudName?: string;
  publicId?: string;
  type?: "authenticated";
  resourceType?: "image" | "video";
  uploadUrl?: string;
  eager?: string;
  error?: string;
}

/**
 * Generates authenticated upload parameters and HMAC signature for direct browser uploads.
 * Bypasses serverless payload limits by authorizing the browser to POST directly to Cloudinary.
 */
export function generateUploadSignature(input: {
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}): UploadSignatureResult {
  if (!ensureConfigured()) {
    return {
      success: false,
      error:
        "Cloudinary is not fully configured on the server. Please verify CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    };
  }

  const { projectId, fileName, fileType, fileSize } = input;
  const isVideo = fileType.toLowerCase().startsWith("video") || /\.(mp4|webm)$/i.test(fileName);
  const resourceType: "video" | "image" = isVideo ? "video" : "image";

  // Validate size against Cloudinary limits
  if (isVideo && fileSize > CLOUDINARY_MAX_VIDEO_SIZE_BYTES) {
    const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `Video exceeds Cloudinary Free plan limit of 100MB (current: ${sizeMb}MB). Please compress the video before uploading.`,
    };
  }

  if (!isVideo && fileSize > CLOUDINARY_MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `Image exceeds Cloudinary Free plan limit of 10MB (current: ${sizeMb}MB). Please optimize the image before uploading.`,
    };
  }

  const cloudName = getCloudinaryCloudName();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  const publicId = generateCloudinaryPublicId(projectId, fileName);
  const timestamp = Math.floor(Date.now() / 1000);

  // Exact parameters sent to Cloudinary that must be signed
  const paramsToSign: Record<string, string | number> = {
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };

  // For authenticated video assets, eagerly generate a frame-zero JPEG poster at upload time
  // This satisfies Cloudinary's strict transformation policy on authenticated resources
  const eagerParam = isVideo ? "so_0/jpg" : undefined;
  if (eagerParam) {
    paramsToSign.eager = eagerParam;
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return {
    success: true,
    signature,
    timestamp,
    apiKey,
    cloudName,
    publicId,
    type: "authenticated",
    resourceType,
    uploadUrl,
    eager: eagerParam,
  };
}

/**
 * Verifies that an uploaded asset exists in Cloudinary and complies with format and size limits.
 * Strictly verifies ownership against expectedProjectId to prevent cross-project spoofing.
 */
export async function verifyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image",
  expectedProjectId?: string
): Promise<{
  valid: boolean;
  bytes?: number;
  format?: string;
  resourceType?: string;
  hasPoster?: boolean;
  error?: string;
}> {
  // If an expected project ID was provided, strictly enforce prefix containment
  if (expectedProjectId) {
    const expectedPrefix = `projects/${expectedProjectId}/`;
    if (!publicId.startsWith(expectedPrefix)) {
      return {
        valid: false,
        error: `Security violation: publicId "${publicId}" does not match authorized project prefix "${expectedPrefix}".`,
      };
    }
  }

  if (!ensureConfigured()) {
    return {
      valid: false,
      error: "Cloudinary credentials are not configured; asset verification cannot proceed.",
    };
  }

  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: "authenticated",
    });

    if (!result) {
      return { valid: false, error: "Asset could not be found in Cloudinary." };
    }

    // 1. Authoritative resource_type check
    if (result.resource_type !== resourceType) {
      return {
        valid: false,
        error: `Resource type mismatch: expected "${resourceType}", got "${result.resource_type}".`,
      };
    }

    // 2. Authoritative format check
    const format = (result.format || "").toLowerCase();
    const allowedFormats =
      resourceType === "video"
        ? ["mp4", "webm"]
        : ["jpg", "jpeg", "png", "webp"];

    if (!allowedFormats.includes(format)) {
      if (!expectedProjectId || publicId.startsWith(`projects/${expectedProjectId}/`)) {
        await deleteCloudinaryAsset(publicId, resourceType);
      }
      return {
        valid: false,
        error: `Disallowed file format "${format}". Permitted ${resourceType} formats: ${allowedFormats.join(", ")}. Asset was removed.`,
      };
    }

    const bytes = result.bytes || 0;

    // 3. Authoritative byte-size check
    if (resourceType === "video" && bytes > CLOUDINARY_MAX_VIDEO_SIZE_BYTES) {
      if (!expectedProjectId || publicId.startsWith(`projects/${expectedProjectId}/`)) {
        await deleteCloudinaryAsset(publicId, resourceType);
      }
      return {
        valid: false,
        error: `Uploaded video exceeds 100MB limit (${(bytes / (1024 * 1024)).toFixed(1)}MB). Asset was removed.`,
      };
    }

    if (resourceType === "image" && bytes > CLOUDINARY_MAX_IMAGE_SIZE_BYTES) {
      if (!expectedProjectId || publicId.startsWith(`projects/${expectedProjectId}/`)) {
        await deleteCloudinaryAsset(publicId, resourceType);
      }
      return {
        valid: false,
        error: `Uploaded image exceeds 10MB limit (${(bytes / (1024 * 1024)).toFixed(1)}MB). Asset was removed.`,
      };
    }

    // 4. Verify derived eager poster presence for videos
    let hasPoster = false;
    if (resourceType === "video" && Array.isArray(result.derived)) {
      hasPoster = result.derived.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) =>
          d.format === "jpg" ||
          (typeof d.transformation === "string" && d.transformation.includes("so_0"))
      );
    }

    return {
      valid: true,
      bytes,
      format,
      resourceType: result.resource_type,
      hasPoster,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary verification failed.";
    return { valid: false, error: message };
  }
}

/**
 * Resolves a signed, secure delivery URL for an authenticated Cloudinary asset.
 * Guarantees that unpublished or draft assets cannot be accessed without valid signature.
 */
export function resolveCloudinaryDeliveryUrl(
  publicId: string,
  options?: {
    resourceType?: "image" | "video";
    expiresInSeconds?: number;
    format?: string;
    isPoster?: boolean;
  }
): string | null {
  if (!publicId) return null;

  // External URLs need no Cloudinary resolution
  if (
    publicId.startsWith("http://") ||
    publicId.startsWith("https://") ||
    publicId.startsWith("/")
  ) {
    return publicId;
  }

  ensureConfigured();

  const resourceType = options?.resourceType || "image";
  // Remove any accidental extension from publicId to prevent double extensions (e.g. .mp4.mp4)
  const cleanPublicId = publicId.replace(/\.[^/.]+$/, "");

  // If requesting a poster for an authenticated video asset, target the pre-generated so_0/jpg transformation
  if (resourceType === "video" && options?.isPoster) {
    try {
      const url = cloudinary.url(cleanPublicId, {
        resource_type: "video",
        type: "authenticated",
        sign_url: true,
        secure: true,
        format: "jpg",
        start_offset: "0",
      });
      return url || null;
    } catch (err) {
      console.error("[resolveCloudinaryDeliveryUrl] Error signing poster URL for", publicId, err);
      return null;
    }
  }

  let format = options?.format;
  if (!format) {
    if (resourceType === "video") {
      format = "mp4";
    }
  }

  try {
    const url = cloudinary.url(cleanPublicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      secure: true,
      format,
    });

    return url || null;
  } catch (err) {
    console.error("[resolveCloudinaryDeliveryUrl] Error signing URL for", publicId, err);
    return null;
  }
}

/**
 * Deletes an asset from Cloudinary storage.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<{ success: boolean; error?: string }> {
  if (!ensureConfigured()) {
    return { success: false, error: "Cloudinary credentials not configured." };
  }

  try {
    const cleanPublicId = publicId.replace(/\.[^/.]+$/, "");
    const result = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: resourceType,
      type: "authenticated",
    });

    if (result.result === "ok" || result.result === "not found") {
      return { success: true };
    }

    return {
      success: false,
      error: `Cloudinary destroy returned: ${result.result || "unknown"}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary asset deletion error";
    return { success: false, error: message };
  }
}
