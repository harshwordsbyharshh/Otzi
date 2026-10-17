import { createServiceRoleClient, createPublicClient } from "./server";
import { SelectedProject, AssetType, AspectRatio, PlatformType, ProjectMediaItem } from "@/types/homepage";
import { ProjectRecord, MediaRecord } from "@/types/project";
import { createMediaSignedUrl } from "./media";

import { isTemporaryTestProject } from "@/lib/projectFilters";
export { isTemporaryTestProject };

function mapDbProjectToSelectedProject(p: ProjectRecord): SelectedProject {
  const isDirectUrl =
    p.cover_path?.startsWith("http://") ||
    p.cover_path?.startsWith("https://") ||
    p.cover_path?.startsWith("/");

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    client: p.client,
    year: p.year,
    assetType: (p.asset_type as AssetType) || "REEL",
    aspectRatio: (p.aspect_ratio as AspectRatio) || "9:16",
    platform: (p.platform as PlatformType) || "INSTAGRAM",
    discipline: p.discipline,
    synopsis: p.description || undefined,
    summary: p.description || undefined,
    context: p.description || undefined,
    execution: undefined,
    deliverables: [],
    thumbnailUrl: isDirectUrl ? p.cover_path! : undefined,
    mediaUrl: isDirectUrl ? p.cover_path! : undefined,
  };
}

export async function getPublishedProjects(): Promise<SelectedProject[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return [];
    }

    const serviceClient = createServiceRoleClient();
    const storageClient = serviceClient || supabase;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getPublishedProjects] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Exclude any temporary or AI-generated test productions from public presentation
    const validProjects = (data as ProjectRecord[]).filter(
      (p) => !isTemporaryTestProject(p)
    );

    if (validProjects.length === 0) {
      return [];
    }

    // Defensive deduplication by project id and slug to guarantee unique cards
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const distinctProjects: ProjectRecord[] = [];

    for (const p of validProjects) {
      if (seenIds.has(p.id) || seenSlugs.has(p.slug)) {
        continue;
      }
      seenIds.add(p.id);
      seenSlugs.add(p.slug);
      distinctProjects.push(p);
    }

    const dbMapped: (SelectedProject | null)[] = await Promise.all(
      distinctProjects.map(async (p) => {
        const item = mapDbProjectToSelectedProject(p);
        if (p.cover_path) {
          const signedUrl = await createMediaSignedUrl(storageClient, p.cover_path, 3600);
          if (signedUrl) {
            item.thumbnailUrl = signedUrl;
            item.mediaUrl = signedUrl;
          } else {
            const publicUrl = storageClient.storage.from("otzi-media").getPublicUrl(p.cover_path).data?.publicUrl;
            item.thumbnailUrl = publicUrl || p.cover_path;
            item.mediaUrl = publicUrl || p.cover_path;
          }
        }

        // Fallback: If no cover URL resolved, query the first attached media item
        if (!item.thumbnailUrl) {
          const { data: firstMedia } = await (serviceClient || supabase)
            .from("media")
            .select("storage_path")
            .eq("project_id", p.id)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (firstMedia?.storage_path) {
            const fallbackSignedUrl = await createMediaSignedUrl(
              storageClient,
              firstMedia.storage_path,
              3600
            );
            const fallbackPublicUrl = storageClient.storage.from("otzi-media").getPublicUrl(firstMedia.storage_path).data?.publicUrl;
            const resolvedFallback = fallbackSignedUrl || fallbackPublicUrl || firstMedia.storage_path;
            if (resolvedFallback) {
              item.thumbnailUrl = resolvedFallback;
              item.mediaUrl = resolvedFallback;
            }
          }
        }

        // Case F: Exclude only if TRULY neither cover_path nor media items exist.
        if (!p.cover_path && !item.thumbnailUrl && !item.mediaUrl) {
          console.warn(
            `[getPublishedProjects] Project "${p.title}" (${p.slug}) has no media. Excluded from public display.`
          );
          return null;
        }

        return item;
      })
    );

    return dbMapped.filter((p): p is SelectedProject => p !== null);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected fetch error";
    console.error("[getPublishedProjects] Exception during project retrieval:", message);
    return [];
  }
}

export async function getPublishedProjectBySlug(
  slug: string
): Promise<SelectedProject | undefined> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return undefined;
    }

    const serviceClient = createServiceRoleClient();
    const storageClient = serviceClient || supabase;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    const p = data as ProjectRecord;

    // Strict security constraint: unpublished drafts and test projects must remain hidden
    if (!p.published || isTemporaryTestProject(p)) {
      return undefined;
    }

    const mapped = mapDbProjectToSelectedProject(p);

    // Resolve cover signed URL if present
    if (p.cover_path) {
      const coverSigned = await createMediaSignedUrl(storageClient, p.cover_path, 3600);
      if (coverSigned) {
        mapped.thumbnailUrl = coverSigned;
        mapped.mediaUrl = coverSigned;
      } else {
        const publicUrl = storageClient.storage.from("otzi-media").getPublicUrl(p.cover_path).data?.publicUrl;
        mapped.thumbnailUrl = publicUrl || p.cover_path;
        mapped.mediaUrl = publicUrl || p.cover_path;
      }
    }

    // Fetch attached published media items
    const { data: mediaRows } = await (serviceClient || supabase)
      .from("media")
      .select("*")
      .eq("project_id", p.id)
      .order("sort_order", { ascending: true });

    if (mediaRows && mediaRows.length > 0) {
      const typedMedia = mediaRows as MediaRecord[];
      const mediaSequence: ProjectMediaItem[] = await Promise.all(
        typedMedia.map(async (m) => {
          const signed = await createMediaSignedUrl(storageClient, m.storage_path, 3600);
          const publicUrl = storageClient.storage.from("otzi-media").getPublicUrl(m.storage_path).data?.publicUrl;
          const resolvedUrl = signed || publicUrl || m.storage_path;
          return {
            id: m.id,
            caption: m.alt_text || p.title,
            aspectRatio: (p.aspect_ratio as AspectRatio) || "9:16",
            assetType: m.type === "video" ? ("REEL" as AssetType) : ("POST" as AssetType),
            thumbnailUrl: resolvedUrl,
            mediaUrl: resolvedUrl,
          };
        })
      );

      mapped.mediaSequence = mediaSequence;

      // If no explicit cover was resolved, fallback to the first media item
      if (!mapped.thumbnailUrl && mediaSequence[0]?.thumbnailUrl) {
        mapped.thumbnailUrl = mediaSequence[0].thumbnailUrl;
        mapped.mediaUrl = mediaSequence[0].mediaUrl;
      }
    }

    return mapped;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected fetch error";
    console.error(`[getPublishedProjectBySlug] Exception retrieving "${slug}":`, message);
    return undefined;
  }
}

