import { createClient } from "./server";
import { SelectedProject, AssetType, AspectRatio, PlatformType, ProjectMediaItem } from "@/types/homepage";
import { getAllProjects, getProjectBySlug } from "@/lib/data/homepage";
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getAllProjects();
    }

    // Exclude any temporary or AI-generated test productions from public presentation
    const validProjects = (data as ProjectRecord[]).filter(
      (p) => !isTemporaryTestProject(p)
    );

    if (validProjects.length === 0) {
      return getAllProjects();
    }

    const dbMapped: SelectedProject[] = await Promise.all(
      validProjects.map(async (p) => {
        const item = mapDbProjectToSelectedProject(p);
        if (p.cover_path) {
          const signedUrl = await createMediaSignedUrl(supabase, p.cover_path, 3600);
          if (signedUrl) {
            item.thumbnailUrl = signedUrl;
            item.mediaUrl = signedUrl;
          }
        }

        // Fallback: If no cover URL resolved, query the first attached media item
        if (!item.thumbnailUrl) {
          const { data: firstMedia } = await supabase
            .from("media")
            .select("storage_path")
            .eq("project_id", p.id)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (firstMedia?.storage_path) {
            const fallbackSignedUrl = await createMediaSignedUrl(
              supabase,
              firstMedia.storage_path,
              3600
            );
            if (fallbackSignedUrl) {
              item.thumbnailUrl = fallbackSignedUrl;
              item.mediaUrl = fallbackSignedUrl;
            }
          }
        }

        return item;
      })
    );

    return dbMapped;
  } catch {
    return getAllProjects();
  }
}

export async function getPublishedProjectBySlug(
  slug: string
): Promise<SelectedProject | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return getProjectBySlug(slug);
    }

    const p = data as ProjectRecord;

    // Strict security constraint: unpublished drafts and test projects must remain hidden
    if (!p.published || isTemporaryTestProject(p)) {
      return undefined;
    }

    const mapped = mapDbProjectToSelectedProject(p);

    // Resolve cover signed URL if present
    if (p.cover_path) {
      const coverSigned = await createMediaSignedUrl(supabase, p.cover_path, 3600);
      if (coverSigned) {
        mapped.thumbnailUrl = coverSigned;
        mapped.mediaUrl = coverSigned;
      }
    }

    // Fetch attached published media items
    const { data: mediaRows } = await supabase
      .from("media")
      .select("*")
      .eq("project_id", p.id)
      .order("sort_order", { ascending: true });

    if (mediaRows && mediaRows.length > 0) {
      const typedMedia = mediaRows as MediaRecord[];
      const mediaSequence: ProjectMediaItem[] = await Promise.all(
        typedMedia.map(async (m) => {
          const signed = await createMediaSignedUrl(supabase, m.storage_path, 3600);
          return {
            id: m.id,
            caption: m.alt_text || p.title,
            aspectRatio: (p.aspect_ratio as AspectRatio) || "9:16",
            assetType: m.type === "video" ? ("REEL" as AssetType) : ("POST" as AssetType),
            thumbnailUrl: signed || undefined,
            mediaUrl: signed || undefined,
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
  } catch {
    return getProjectBySlug(slug);
  }
}
