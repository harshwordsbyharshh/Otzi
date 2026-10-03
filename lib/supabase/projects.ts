import { createClient } from "./server";
import { SelectedProject, AssetType, AspectRatio, PlatformType } from "@/types/homepage";
import { getAllProjects, getProjectBySlug } from "@/lib/data/homepage";
import { ProjectRecord } from "@/types/project";

function mapDbProjectToSelectedProject(p: ProjectRecord): SelectedProject {
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
    thumbnailUrl: p.cover_path || undefined,
    mediaUrl: p.cover_path || undefined,
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

    const dbMapped = (data as ProjectRecord[]).map(mapDbProjectToSelectedProject);
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
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      return getProjectBySlug(slug);
    }

    return mapDbProjectToSelectedProject(data as ProjectRecord);
  } catch {
    return getProjectBySlug(slug);
  }
}
