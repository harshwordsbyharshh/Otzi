import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

// Mock server credentials for isolated local unit testing
process.env.CLOUDINARY_CLOUD_NAME = "jdn58nxv";
process.env.CLOUDINARY_API_KEY = "test_api_key_123";
process.env.CLOUDINARY_API_SECRET = "test_api_secret_456789";

// Import modules under test
const {
  generateUploadSignature,
  resolveCloudinaryDeliveryUrl,
  verifyCloudinaryAsset,
  CLOUDINARY_MAX_VIDEO_SIZE_BYTES,
  CLOUDINARY_MAX_IMAGE_SIZE_BYTES,
} = await import("../lib/media/cloudinary.ts");

// ============================================================================
// FIX 1: Authenticated Video Posters & Delivery
// ============================================================================

test("Fix 1.1: Video upload signature includes eager: 'so_0/jpg' and signs it", () => {
  const result = generateUploadSignature({
    projectId: "proj-alpha",
    fileName: "motion_reel.mp4",
    fileType: "video/mp4",
    fileSize: 25 * 1024 * 1024,
  });

  assert.equal(result.success, true);
  assert.equal(result.resourceType, "video");
  assert.equal(result.type, "authenticated");
  assert.equal(result.eager, "so_0/jpg");
  assert.ok(result.signature, "Signature must be present");
  assert.ok(result.publicId?.startsWith("projects/proj-alpha/"));

  // Verify the signature manually to confirm 'eager' was part of the HMAC digest
  const expectedSignature = cloudinary.utils.api_sign_request(
    {
      eager: "so_0/jpg",
      public_id: result.publicId,
      timestamp: result.timestamp,
      type: "authenticated",
    },
    process.env.CLOUDINARY_API_SECRET
  );
  assert.equal(result.signature, expectedSignature, "HMAC signature must verify with eager parameter");
});

test("Fix 1.2: Image upload signature omits eager parameter", () => {
  const result = generateUploadSignature({
    projectId: "proj-alpha",
    fileName: "cover.jpg",
    fileType: "image/jpeg",
    fileSize: 2 * 1024 * 1024,
  });

  assert.equal(result.success, true);
  assert.equal(result.resourceType, "image");
  assert.equal(result.type, "authenticated");
  assert.equal(result.eager, undefined, "Images must not include eager transformations");

  const expectedSignature = cloudinary.utils.api_sign_request(
    {
      public_id: result.publicId,
      timestamp: result.timestamp,
      type: "authenticated",
    },
    process.env.CLOUDINARY_API_SECRET
  );
  assert.equal(result.signature, expectedSignature);
});

test("Fix 1.3: Video poster URL targets pre-generated eager so_0/jpg derived asset with authenticated signature", () => {
  const publicId = "projects/proj-alpha/12345-hero";
  const posterUrl = resolveCloudinaryDeliveryUrl(publicId, {
    resourceType: "video",
    isPoster: true,
  });

  assert.ok(posterUrl, "Poster URL must be generated");
  assert.ok(posterUrl.includes("/video/authenticated/"), "Must be authenticated delivery");
  assert.ok(posterUrl.includes("/so_0/"), "Must target eager frame-zero transformation");
  assert.ok(posterUrl.endsWith(".jpg") || posterUrl.includes(".jpg?"), "Must have .jpg format");
  assert.ok(posterUrl.includes("/s--"), "Must include HMAC signature token");
});

test("Fix 1.4: Video streaming URL uses mp4 format and no poster transformation", () => {
  const publicId = "projects/proj-alpha/12345-hero";
  const streamUrl = resolveCloudinaryDeliveryUrl(publicId, {
    resourceType: "video",
  });

  assert.ok(streamUrl, "Stream URL must be generated");
  assert.ok(streamUrl.includes("/video/authenticated/"), "Must be authenticated delivery");
  assert.ok(!streamUrl.includes("/so_0/"), "Stream URL must not include so_0 poster transformation");
  assert.ok(streamUrl.includes(".mp4"), "Must have .mp4 format");
});

test("Fix 1.5: External and static URLs bypass Cloudinary signing untouched", () => {
  const external = "https://cdn.example.com/assets/video.mp4";
  const relative = "/static/images/logo.png";

  assert.equal(resolveCloudinaryDeliveryUrl(external), external);
  assert.equal(resolveCloudinaryDeliveryUrl(relative), relative);
  assert.equal(resolveCloudinaryDeliveryUrl(""), null);
});

// ============================================================================
// FIX 2: Security Verification, Path Containment & Idempotency
// ============================================================================

test("Fix 2.1: verifyCloudinaryAsset rejects cross-project spoofing when publicId does not match expectedProjectId", async () => {
  const attackerPublicId = "projects/attacker-project/malicious-file";
  const expectedProjectId = "victim-project-id";

  const result = await verifyCloudinaryAsset(attackerPublicId, "image", expectedProjectId);
  assert.equal(result.valid, false);
  assert.ok(
    result.error?.includes("Security violation") && result.error?.includes("does not match authorized project prefix"),
    `Error should indicate security violation: ${result.error}`
  );
});

test("Fix 2.2: Oversized uploads are rejected during prepare signature phase", () => {
  const videoOver = generateUploadSignature({
    projectId: "proj-1",
    fileName: "huge.mp4",
    fileType: "video/mp4",
    fileSize: CLOUDINARY_MAX_VIDEO_SIZE_BYTES + 1024,
  });
  assert.equal(videoOver.success, false);
  assert.ok(videoOver.error?.includes("100MB"));

  const imgOver = generateUploadSignature({
    projectId: "proj-1",
    fileName: "huge.png",
    fileType: "image/png",
    fileSize: CLOUDINARY_MAX_IMAGE_SIZE_BYTES + 1024,
  });
  assert.equal(imgOver.success, false);
  assert.ok(imgOver.error?.includes("10MB"));
});

test("Fix 2.3: Security check strictly prevents deletion outside expected project prefix", async () => {
  // Mock cloudinary.uploader.destroy to inspect calls
  let destroyCalledWith = null;
  const originalDestroy = cloudinary.uploader.destroy;
  cloudinary.uploader.destroy = async (publicId, options) => {
    destroyCalledWith = { publicId, options };
    return { result: "ok" };
  };

  try {
    // Attempt verification with mismatched project prefix
    const unauthorizedPath = "projects/foreign-proj/asset";
    const res = await verifyCloudinaryAsset(unauthorizedPath, "image", "my-own-proj");
    assert.equal(res.valid, false);
    assert.equal(destroyCalledWith, null, "Compensating deletion MUST NEVER be called on cross-project paths");
  } finally {
    cloudinary.uploader.destroy = originalDestroy;
  }
});

test("Fix 2.4: Secret credentials are never leaked in generateUploadSignature", () => {
  const result = generateUploadSignature({
    projectId: "proj-safe",
    fileName: "doc.png",
    fileType: "image/png",
    fileSize: 1024,
  });

  const serialized = JSON.stringify(result);
  assert.ok(!serialized.includes(process.env.CLOUDINARY_API_SECRET), "API secret must never be exposed");
  assert.equal(result.apiSecret, undefined);
  assert.equal(result.api_secret, undefined);
});

test("Fix 2.5: verifyCloudinaryAsset rejects verification when credentials are not configured", async () => {
  const origKey = process.env.CLOUDINARY_API_KEY;
  const origSecret = process.env.CLOUDINARY_API_SECRET;
  const origUrl = process.env.CLOUDINARY_URL;

  try {
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    delete process.env.CLOUDINARY_URL;

    const res = await verifyCloudinaryAsset("projects/p1/asset1", "image", "p1");
    assert.equal(res.valid, false);
    assert.equal(
      res.error,
      "Cloudinary credentials are not configured; asset verification cannot proceed."
    );
  } finally {
    if (origKey) process.env.CLOUDINARY_API_KEY = origKey;
    if (origSecret) process.env.CLOUDINARY_API_SECRET = origSecret;
    if (origUrl) process.env.CLOUDINARY_URL = origUrl;
  }
});

// ============================================================================
// FIX 3: Database Migration Quality Checks
// ============================================================================

test("Fix 3.1: Migration scopes constraints using conrelid = 'public.media'::regclass and 'public.projects'::regclass", () => {
  const migrationPath = path.resolve(
    "supabase/migrations/20261118000000_add_cloudinary_storage_provider.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(
    content.includes("conrelid = 'public.media'::regclass"),
    "Constraint existence check must scope to public.media::regclass"
  );
  assert.ok(
    content.includes("conrelid = 'public.projects'::regclass"),
    "Constraint existence check must scope to public.projects::regclass"
  );
});

test("Fix 3.2: Migration includes unique index idx_media_project_storage_path", () => {
  const migrationPath = path.resolve(
    "supabase/migrations/20261118000000_add_cloudinary_storage_provider.sql"
  );
  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(
    content.includes("CREATE UNIQUE INDEX IF NOT EXISTS idx_media_project_storage_path"),
    "Must create unique index on (project_id, storage_path)"
  );
  assert.ok(
    content.includes("ON public.media (project_id, storage_path)"),
    "Unique index target must be (project_id, storage_path)"
  );
});

test("Fix 3.3: Migration includes prominent rollback warning comments and index drop", () => {
  const migrationPath = path.resolve(
    "supabase/migrations/20261118000000_add_cloudinary_storage_provider.sql"
  );
  const content = fs.readFileSync(migrationPath, "utf-8");

  assert.ok(
    content.includes("CAUTION / CRITICAL WARNING ON ROLLBACK"),
    "Migration must include prominent caution header"
  );
  assert.ok(
    content.includes("broken images and 404/400 playback failures"),
    "Must document consequence of rolling back active Cloudinary assets"
  );
  assert.ok(
    content.includes("DROP INDEX IF EXISTS idx_media_project_storage_path;"),
    "Rollback script must include dropping the unique index"
  );
});

// ============================================================================
// FIX 1 & 2: Client & Project Integration Checks
// ============================================================================

test("ProjectMediaManager passes eager parameter during upload", () => {
  const compPath = path.resolve("components/media/ProjectMediaManager.tsx");
  const content = fs.readFileSync(compPath, "utf-8");

  assert.ok(
    content.includes('if (prepRes.eager) {'),
    "ProjectMediaManager must check for prepRes.eager"
  );
  assert.ok(
    content.includes('uploadData.append("eager", prepRes.eager);'),
    "ProjectMediaManager must append eager parameter to FormData"
  );
});

test("mediaActions validates storagePath prefix containment and handles 23505", () => {
  const actionPath = path.resolve("app/admin/(protected)/projects/mediaActions.ts");
  const content = fs.readFileSync(actionPath, "utf-8");

  assert.ok(
    content.includes("const expectedPrefix = `projects/${projectId}/`;"),
    "Must construct expectedPrefix"
  );
  assert.ok(
    content.includes("if (!storagePath.startsWith(expectedPrefix))"),
    "Must reject storagePath not starting with expectedPrefix"
  );
  assert.ok(
    content.includes('(insertError as any)?.code === "23505"'),
    "Must handle PostgreSQL unique constraint violation 23505"
  );
  assert.ok(
    content.includes("eager?: string;"),
    "prepareMediaUploadAction signature must include eager?: string"
  );
  assert.ok(
    content.includes("eager: sigResult.eager,"),
    "prepareMediaUploadAction must return eager parameter"
  );
});

test("lib/supabase/projects resolves poster signed URL for fallback first-media Cloudinary videos", () => {
  const projPath = path.resolve("lib/supabase/projects.ts");
  const content = fs.readFileSync(projPath, "utf-8");

  assert.ok(
    content.includes('firstMedia.type === "video" && firstMedia.storage_provider === "cloudinary"'),
    "Must detect Cloudinary video in fallback first media resolution"
  );
  assert.ok(
    content.includes('{ isPoster: true }'),
    "Must request poster URL with { isPoster: true }"
  );
});

// ============================================================================
// FIX 4: Project Deletion Safety & Error Handling
// ============================================================================

test("Fix 4.1: deleteCloudinaryAsset handles 'not found' as success for idempotent retries", async () => {
  const originalDestroy = cloudinary.uploader.destroy;
  try {
    cloudinary.uploader.destroy = async () => ({ result: "not found" });
    const { deleteCloudinaryAsset } = await import("../lib/media/cloudinary.ts");
    const result = await deleteCloudinaryAsset("projects/test-proj/missing-asset", "image");
    assert.equal(result.success, true, "'not found' must resolve to success: true for idempotent retry");
  } finally {
    cloudinary.uploader.destroy = originalDestroy;
  }
});

test("Fix 4.2: Supabase Storage error stops before Cloudinary deletion and database deletion", async () => {
  const { purgeProjectMediaStorage } = await import("../lib/media/deletion.ts");

  let cloudinaryCalled = false;
  const mediaItems = [
    { storage_path: "projects/p1/legacy.jpg", storage_provider: "supabase", type: "image" },
    { storage_path: "projects/p1/cloud.mp4", storage_provider: "cloudinary", type: "video" },
  ];

  const result = await purgeProjectMediaStorage("p1", mediaItems, {
    removeSupabasePaths: async () => ({ error: { message: "Storage network error" } }),
    deleteCloudinaryAsset: async () => {
      cloudinaryCalled = true;
      return { success: true };
    },
  });

  assert.equal(result.success, false, "Must fail when Supabase storage remove fails");
  assert.equal(result.failedSupabase, true, "Must flag Supabase storage failure");
  assert.equal(cloudinaryCalled, false, "Cloudinary purge MUST NOT be called when Supabase purge fails");
  assert.ok(result.error?.includes("Database records were preserved"));
  assert.ok(result.error?.includes("Storage network error"));
});

test("Fix 4.3: Supabase Storage thrown exception stops before Cloudinary deletion", async () => {
  const { purgeProjectMediaStorage } = await import("../lib/media/deletion.ts");

  let cloudinaryCalled = false;
  const mediaItems = [
    { storage_path: "projects/p1/legacy.jpg", storage_provider: "supabase", type: "image" },
    { storage_path: "projects/p1/cloud.mp4", storage_provider: "cloudinary", type: "video" },
  ];

  const result = await purgeProjectMediaStorage("p1", mediaItems, {
    removeSupabasePaths: async () => {
      throw new Error("Socket hung up");
    },
    deleteCloudinaryAsset: async () => {
      cloudinaryCalled = true;
      return { success: true };
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.failedSupabase, true);
  assert.equal(cloudinaryCalled, false, "Cloudinary purge must not be called after storage exception");
  assert.ok(result.error?.includes("Socket hung up"));
  assert.ok(result.error?.includes("Database records were preserved"));
});

test("Fix 4.4: Cloudinary purge failure halts and reports failure to prevent database deletion", async () => {
  const { purgeProjectMediaStorage } = await import("../lib/media/deletion.ts");

  const mediaItems = [
    { storage_path: "projects/p1/cloud1.mp4", storage_provider: "cloudinary", type: "video" },
    { storage_path: "projects/p1/cloud2.jpg", storage_provider: "cloudinary", type: "image" },
  ];

  const result = await purgeProjectMediaStorage("p1", mediaItems, {
    removeSupabasePaths: async () => ({ error: null }),
    deleteCloudinaryAsset: async (path) => {
      if (path.includes("cloud1")) {
        return { success: false, error: "Cloudinary rate limit exceeded" };
      }
      return { success: true };
    },
  });

  assert.equal(result.success, false, "Must fail if any Cloudinary purge fails");
  assert.equal(result.failedCloudinaryCount, 1);
  assert.ok(result.error?.includes("Failed to remove 1 remote media asset(s) from Cloudinary"));
  assert.ok(result.error?.includes("Database records were preserved"));
});

test("Fix 4.5: Cloudinary thrown exception halts safely to prevent database deletion", async () => {
  const { purgeProjectMediaStorage } = await import("../lib/media/deletion.ts");

  const mediaItems = [
    { storage_path: "projects/p1/cloud1.mp4", storage_provider: "cloudinary", type: "video" },
  ];

  const result = await purgeProjectMediaStorage("p1", mediaItems, {
    removeSupabasePaths: async () => ({ error: null }),
    deleteCloudinaryAsset: async () => {
      throw new Error("DNS resolution failure");
    },
  });

  assert.equal(result.success, false);
  assert.ok(result.error?.includes("Unexpected error during media storage purge"));
  assert.ok(result.error?.includes("DNS resolution failure"));
  assert.ok(result.error?.includes("Database records were preserved"));
});

test("Fix 4.6: Successful purges across both providers allow deletion to proceed", async () => {
  const { purgeProjectMediaStorage } = await import("../lib/media/deletion.ts");

  let supabasePurged = false;
  let cloudinaryPurgedCount = 0;

  const mediaItems = [
    { storage_path: "projects/p1/legacy.jpg", storage_provider: "supabase", type: "image" },
    { storage_path: "projects/p1/cloud.mp4", storage_provider: "cloudinary", type: "video" },
  ];

  const result = await purgeProjectMediaStorage("p1", mediaItems, {
    removeSupabasePaths: async (paths) => {
      assert.deepEqual(paths, ["projects/p1/legacy.jpg"]);
      supabasePurged = true;
      return { error: null };
    },
    deleteCloudinaryAsset: async (path, type) => {
      assert.equal(path, "projects/p1/cloud.mp4");
      assert.equal(type, "video");
      cloudinaryPurgedCount++;
      return { success: true };
    },
  });

  assert.equal(result.success, true);
  assert.equal(supabasePurged, true);
  assert.equal(cloudinaryPurgedCount, 1);
  assert.equal(result.error, undefined);
});

test("Fix 4.7: deleteProjectAction wires purgeProjectMediaStorage, mediaDeleteError, and projectDeleteError", () => {
  const actionPath = path.resolve("app/admin/(protected)/projects/actions.ts");
  const content = fs.readFileSync(actionPath, "utf-8");

  assert.ok(
    content.includes("purgeProjectMediaStorage"),
    "Must invoke purgeProjectMediaStorage helper"
  );
  assert.ok(
    content.includes("if (!purgeResult.success)"),
    "Must halt when purgeResult.success is false"
  );
  assert.ok(
    content.includes("mediaDeleteError"),
    "Must check mediaDeleteError explicitly"
  );
  assert.ok(
    content.includes("projectDeleteError"),
    "Must check projectDeleteError explicitly"
  );
});

// ============================================================================
// FIX 5: Cloudinary Video Resource-Type Resolution & Poster Frame Generation
// ============================================================================

test("Fix 5.1: inferCoverMediaType detects video extensions, image extensions, and extensionless paths safely", async () => {
  const { inferCoverMediaType } = await import("../lib/media/coverResolution.ts");

  // Explicit video file extensions take precedence over any asset_type
  assert.equal(inferCoverMediaType("projects/p1/video.mp4", "POST"), "video");
  assert.equal(inferCoverMediaType("projects/p1/video.webm", "POST"), "video");
  assert.equal(inferCoverMediaType("projects/p1/clip.mov", undefined), "video");
  assert.equal(inferCoverMediaType("projects/p1/clip.mkv", null), "video");
  assert.equal(inferCoverMediaType("projects/p1/clip.avi", "POST"), "video");

  // Explicit image file extensions take precedence over any asset_type
  assert.equal(inferCoverMediaType("projects/p1/photo.jpg", "REEL"), "image");
  assert.equal(inferCoverMediaType("projects/p1/graphic.png", "SHORT FILM"), "image");
  assert.equal(inferCoverMediaType("projects/p1/hero.webp", "REEL"), "image");
  assert.equal(inferCoverMediaType("projects/p1/icon.svg", "REEL"), "image");

  // Extensionless Cloudinary public IDs inferred from authoritative asset_type
  assert.equal(inferCoverMediaType("projects/p1/1794995865599-cfe9990b-reel-2_resized", "REEL"), "video");
  assert.equal(inferCoverMediaType("projects/p1/1794995423457-d968dc51-whatsapp-video", "SHORT FILM"), "video");
  assert.equal(inferCoverMediaType("projects/p1/1794989942169-ce0fac34-screenshot", "POST"), "image");

  // Extensionless paths with missing, empty, or unrecognized asset_type return null (fail-safe)
  assert.equal(inferCoverMediaType(null, null), null);
  assert.equal(inferCoverMediaType("", ""), null);
  assert.equal(inferCoverMediaType("projects/p1/unknown-asset", undefined), null);
  assert.equal(inferCoverMediaType("projects/p1/unknown-asset", null), null);
  assert.equal(inferCoverMediaType("projects/p1/unknown-asset", ""), null);
  assert.equal(inferCoverMediaType("projects/p1/unknown-asset", "CAROUSEL"), null);
  assert.equal(inferCoverMediaType("projects/p1/unknown-asset", "UNKNOWN_TYPE"), null);
});

test("Fix 5.2: Cloudinary MP4 video delivery uses video resourceType and returns /video/ URL", async () => {
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const videoUrl = resolveCloudinaryDeliveryUrl(
    "projects/a862fd88-aedc-42d2-909b-e5b0de2a3d54/1794995865599-cfe9990b-reel-2_resized",
    { resourceType: "video", expiresInSeconds: 3600 }
  );

  assert.ok(videoUrl, "Video URL must be resolved");
  assert.ok(videoUrl.includes("/video/authenticated/"), "Must be a /video/authenticated/ URL, never /image/");
  assert.ok(videoUrl.includes(".mp4"), "Must specify .mp4 delivery format");
});

test("Fix 5.3: Cloudinary image delivery uses image resourceType and returns /image/ URL", async () => {
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const imageUrl = resolveCloudinaryDeliveryUrl(
    "projects/c3f28d8d-a18b-4d12-9bd9-436dc52dd825/1794989942169-ce0fac34-screenshot-2026-11-17-183317",
    { resourceType: "image", expiresInSeconds: 3600 }
  );

  assert.ok(imageUrl, "Image URL must be resolved");
  assert.ok(imageUrl.includes("/image/authenticated/"), "Must be a /image/authenticated/ URL");
  assert.ok(!imageUrl.includes("/video/"), "Must not be a /video/ URL");
});

test("Fix 5.4: resolveProjectCover for Cloudinary video resolves MP4 mediaUrl and eager JPEG poster thumbnailUrl", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const mockDeps = {
    createMediaSignedUrl: async (_client, path, expires, provider, type, opts) => {
      if (provider === "cloudinary") {
        return resolveCloudinaryDeliveryUrl(path, {
          resourceType: type,
          expiresInSeconds: expires,
          isPoster: opts?.isPoster,
        });
      }
      return null;
    },
  };

  const result = await resolveProjectCover(
    null,
    "projects/a862fd88-aedc-42d2-909b-e5b0de2a3d54/1794995865599-cfe9990b-reel-2_resized",
    "cloudinary",
    "REEL",
    mockDeps
  );

  assert.ok(result.mediaUrl, "mediaUrl must be populated");
  assert.ok(result.mediaUrl.includes("/video/authenticated/"), "mediaUrl must target /video/");
  assert.ok(result.mediaUrl.includes(".mp4"), "mediaUrl must have .mp4 format");

  assert.ok(result.thumbnailUrl, "thumbnailUrl must be populated");
  assert.ok(result.thumbnailUrl.includes("/video/authenticated/"), "thumbnailUrl must target video resource");
  assert.ok(result.thumbnailUrl.includes("/so_0/"), "thumbnailUrl must target so_0 transformation");
  assert.ok(result.thumbnailUrl.includes(".jpg"), "thumbnailUrl must have .jpg format");
});

test("Fix 5.5: resolveProjectCover for Cloudinary image resolves consistent image mediaUrl and thumbnailUrl", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const mockDeps = {
    createMediaSignedUrl: async (_client, path, expires, provider, type, opts) => {
      if (provider === "cloudinary") {
        return resolveCloudinaryDeliveryUrl(path, {
          resourceType: type,
          expiresInSeconds: expires,
          isPoster: opts?.isPoster,
        });
      }
      return null;
    },
  };

  const result = await resolveProjectCover(
    null,
    "projects/c3f28d8d-a18b-4d12-9bd9-436dc52dd825/1794989942169-ce0fac34-screenshot",
    "cloudinary",
    "POST",
    mockDeps
  );

  assert.ok(result.mediaUrl, "mediaUrl must be populated");
  assert.ok(result.mediaUrl.includes("/image/authenticated/"), "mediaUrl must target /image/");
  assert.equal(result.thumbnailUrl, result.mediaUrl, "thumbnailUrl and mediaUrl must match for static image");
});

test("Fix 5.6: resolveProjectCover preserves legacy Supabase media path without requesting Cloudinary poster", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");

  const mockDeps = {
    createMediaSignedUrl: async () => null,
    getPublicUrl: (p) => `https://mock.supabase.co/storage/v1/object/public/otzi-media/${p}`,
  };

  // Video reel in Supabase
  const videoResult = await resolveProjectCover(
    null,
    "projects/p1/reel-2_resized.mp4",
    "supabase",
    "REEL",
    mockDeps
  );
  assert.equal(
    videoResult.mediaUrl,
    "https://mock.supabase.co/storage/v1/object/public/otzi-media/projects/p1/reel-2_resized.mp4"
  );
  assert.equal(videoResult.thumbnailUrl, videoResult.mediaUrl, "Supabase video uses public URL directly without Cloudinary poster");

  // Static post in Supabase
  const imgResult = await resolveProjectCover(
    null,
    "projects/p1/cover.jpeg",
    "supabase",
    "POST",
    mockDeps
  );
  assert.equal(
    imgResult.mediaUrl,
    "https://mock.supabase.co/storage/v1/object/public/otzi-media/projects/p1/cover.jpeg"
  );
  assert.equal(imgResult.thumbnailUrl, imgResult.mediaUrl);
});

test("Fix 5.7: Listing resolution and detail-page resolution behave consistently", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const mockDeps = {
    createMediaSignedUrl: async (_client, path, expires, provider, type, opts) => {
      if (provider === "cloudinary") {
        return resolveCloudinaryDeliveryUrl(path, {
          resourceType: type,
          expiresInSeconds: expires,
          isPoster: opts?.isPoster,
        });
      }
      return null;
    },
  };

  const projectRecord = {
    cover_path: "projects/p1/1794995865599-cfe9990b-reel-2_resized",
    cover_storage_provider: "cloudinary",
    asset_type: "REEL",
  };

  const resListing = await resolveProjectCover(
    null,
    projectRecord.cover_path,
    projectRecord.cover_storage_provider,
    projectRecord.asset_type,
    mockDeps
  );

  const resDetail = await resolveProjectCover(
    null,
    projectRecord.cover_path,
    projectRecord.cover_storage_provider,
    projectRecord.asset_type,
    mockDeps
  );

  assert.deepEqual(resListing, resDetail, "Listing and detail page resolution must be completely deterministic and identical");

  // Static check on lib/supabase/projects.ts to confirm both methods wire resolveProjectCover
  const projPath = path.resolve("lib/supabase/projects.ts");
  const content = fs.readFileSync(projPath, "utf-8");
  assert.ok(
    content.includes("resolveProjectCover"),
    "lib/supabase/projects.ts must call resolveProjectCover"
  );
  assert.ok(
    !content.includes('p.cover_storage_provider || "supabase",\n            "image"'),
    "lib/supabase/projects.ts must not hardcode 'image' for cover signed URL"
  );
});

test("Fix 5.8: Extensionless Cloudinary asset with missing/unknown metadata fails safely without signing as image", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  let signedCallCount = 0;
  const mockDeps = {
    createMediaSignedUrl: async (_client, path, expires, provider, type, opts) => {
      signedCallCount++;
      if (provider === "cloudinary") {
        return resolveCloudinaryDeliveryUrl(path, {
          resourceType: type,
          expiresInSeconds: expires,
          isPoster: opts?.isPoster,
        });
      }
      return null;
    },
  };

  // Empty cover path
  const resEmpty = await resolveProjectCover(null, "", "cloudinary", null, mockDeps);
  assert.deepEqual(resEmpty, {});
  assert.equal(signedCallCount, 0, "Empty path must not attempt URL signing");

  // Extensionless Cloudinary with missing asset_type (null)
  const resMissing = await resolveProjectCover(
    null,
    "projects/p1/unknown-asset",
    "cloudinary",
    null,
    mockDeps
  );
  assert.deepEqual(resMissing, {}, "Extensionless Cloudinary with missing asset_type must return empty object");
  assert.equal(signedCallCount, 0, "Must not silently sign an unknown Cloudinary asset as an image");

  // Extensionless Cloudinary with undefined asset_type
  const resUndefined = await resolveProjectCover(
    null,
    "projects/p1/unknown-asset",
    "cloudinary",
    undefined,
    mockDeps
  );
  assert.deepEqual(resUndefined, {});
  assert.equal(signedCallCount, 0);

  // Extensionless Cloudinary with empty string asset_type
  const resEmptyType = await resolveProjectCover(
    null,
    "projects/p1/unknown-asset",
    "cloudinary",
    "",
    mockDeps
  );
  assert.deepEqual(resEmptyType, {});
  assert.equal(signedCallCount, 0);

  // Extensionless Cloudinary with unrecognized asset_type
  const resUnknown = await resolveProjectCover(
    null,
    "projects/p1/unknown-asset",
    "cloudinary",
    "UNKNOWN_TYPE",
    mockDeps
  );
  assert.deepEqual(resUnknown, {}, "Extensionless Cloudinary with unrecognized asset_type must fail safely");
  assert.equal(signedCallCount, 0);

  // Extensionless Cloudinary with ambiguous CAROUSEL asset_type
  const resCarousel = await resolveProjectCover(
    null,
    "projects/p1/unknown-asset",
    "cloudinary",
    "CAROUSEL",
    mockDeps
  );
  assert.deepEqual(resCarousel, {}, "Extensionless Cloudinary with CAROUSEL must fail safely rather than guessing");
  assert.equal(signedCallCount, 0);
});

test("Fix 5.9: Cloudinary assets with explicit extensions resolve even if asset_type is missing or contrary", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");
  const { resolveCloudinaryDeliveryUrl } = await import("../lib/media/cloudinary.ts");

  const mockDeps = {
    createMediaSignedUrl: async (_client, path, expires, provider, type, opts) => {
      if (provider === "cloudinary") {
        return resolveCloudinaryDeliveryUrl(path, {
          resourceType: type,
          expiresInSeconds: expires,
          isPoster: opts?.isPoster,
        });
      }
      return null;
    },
  };

  // Video with .mp4 extension and missing asset_type
  const videoExplicit = await resolveProjectCover(
    null,
    "projects/p1/sample_reel.mp4",
    "cloudinary",
    null,
    mockDeps
  );
  assert.ok(videoExplicit.mediaUrl?.includes("/video/authenticated/"), "Must resolve as video based on .mp4 extension");
  assert.ok(videoExplicit.thumbnailUrl?.includes("/so_0/"), "Must generate video poster based on .mp4 extension");

  // Image with .png extension and missing asset_type
  const imageExplicit = await resolveProjectCover(
    null,
    "projects/p1/sample_cover.png",
    "cloudinary",
    null,
    mockDeps
  );
  assert.ok(imageExplicit.mediaUrl?.includes("/image/authenticated/"), "Must resolve as image based on .png extension");
  assert.equal(imageExplicit.thumbnailUrl, imageExplicit.mediaUrl);
});

test("Fix 5.10: Legacy Supabase Storage resolution succeeds even for extensionless assets without asset_type", async () => {
  const { resolveProjectCover } = await import("../lib/media/coverResolution.ts");

  const mockDeps = {
    createMediaSignedUrl: async (_client, path) => `https://mock.supabase.co/storage/v1/object/sign/otzi-media/${path}?token=abc`,
    getPublicUrl: (p) => `https://mock.supabase.co/storage/v1/object/public/otzi-media/${p}`,
  };

  // Extensionless Supabase asset with null asset_type
  const resSupabase = await resolveProjectCover(
    null,
    "projects/p1/legacy-cover-raw",
    "supabase",
    null,
    mockDeps
  );
  assert.ok(resSupabase.mediaUrl?.includes("legacy-cover-raw"), "Supabase Storage URL must resolve even without file extension or asset_type");
  assert.equal(resSupabase.thumbnailUrl, resSupabase.mediaUrl, "Supabase thumbnail matches primary URL without requesting Cloudinary poster");
});
