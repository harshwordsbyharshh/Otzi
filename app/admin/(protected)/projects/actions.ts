"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProjectInput, ProjectRecord } from "@/types/project";

export async function verifyAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Session expired or invalid.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || (profile.role !== "admin" && profile.role !== "editor")) {
    throw new Error("UNAUTHORIZED: Insufficient permissions.");
  }

  return { supabase, user };
}

export async function createProjectAction(
  input: ProjectInput
): Promise<{ success: boolean; project?: ProjectRecord; error?: string }> {
  try {
    const { supabase, user } = await verifyAdminAuth();

    const title = input.title.trim();
    const slug = input.slug.trim().toLowerCase();
    const client = input.client.trim();
    const year = input.year.trim();
    const discipline = input.discipline.trim();
    const asset_type = input.asset_type.trim();
    const platform = input.platform.trim();
    const aspect_ratio = input.aspect_ratio.trim();
    const description = input.description?.trim() || null;
    const cover_path = input.cover_path?.trim() || null;
    const published = Boolean(input.published);

    if (!title || !slug || !client || !year || !discipline || !asset_type || !platform || !aspect_ratio) {
      return { success: false, error: "All core specification fields are required." };
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `A project with the slug "${slug}" already exists.` };
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title,
        slug,
        client,
        year,
        discipline,
        asset_type,
        platform,
        aspect_ratio,
        description,
        cover_path,
        published,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create project in database." };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true, project: data as ProjectRecord };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function updateProjectAction(
  id: string,
  input: ProjectInput
): Promise<{ success: boolean; project?: ProjectRecord; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    const title = input.title.trim();
    const slug = input.slug.trim().toLowerCase();
    const client = input.client.trim();
    const year = input.year.trim();
    const discipline = input.discipline.trim();
    const asset_type = input.asset_type.trim();
    const platform = input.platform.trim();
    const aspect_ratio = input.aspect_ratio.trim();
    const description = input.description?.trim() || null;
    const cover_path = input.cover_path?.trim() || null;
    const published = Boolean(input.published);

    if (!title || !slug || !client || !year || !discipline || !asset_type || !platform || !aspect_ratio) {
      return { success: false, error: "All core specification fields are required." };
    }

    // Check slug uniqueness excluding self
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `A project with the slug "${slug}" already exists.` };
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        title,
        slug,
        client,
        year,
        discipline,
        asset_type,
        platform,
        aspect_ratio,
        description,
        cover_path,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to update project in database." };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);
    revalidatePath("/");

    return { success: true, project: data as ProjectRecord };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function togglePublishAction(
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    const { error } = await supabase
      .from("projects")
      .update({
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    // 1. Fetch any attached media records to purge storage files
    const { data: mediaItems } = await supabase
      .from("media")
      .select("storage_path")
      .eq("project_id", id);

    if (mediaItems && mediaItems.length > 0) {
      const storagePaths = mediaItems
        .map((m) => m.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await supabase.storage.from("otzi-media").remove(storagePaths);
      }

      await supabase.from("media").delete().eq("project_id", id);
    }

    // 2. Delete project record
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function purgeAiTestProjectsAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const { supabase } = await verifyAdminAuth();

    const { data: allProjects, error } = await supabase
      .from("projects")
      .select("id, title, slug, description");

    if (error || !allProjects) {
      return { success: false, error: error?.message || "Failed to load projects." };
    }

    const testProjects = (allProjects as ProjectRecord[]).filter((p) => {
      const text = `${p.title || ""} ${p.slug || ""} ${p.description || ""}`.toLowerCase();
      return (
        text.includes("ai generated") ||
        text.includes("ai-generated") ||
        text.includes("ai reel") ||
        text.includes("ai post") ||
        text.includes("temporary reel") ||
        text.includes("temporary post") ||
        text.includes("temp reel") ||
        text.includes("temp post") ||
        text.includes("test reel") ||
        text.includes("test post") ||
        text.includes("test content") ||
        text.includes("temp content")
      );
    });

    for (const p of testProjects) {
      await deleteProjectAction(p.id);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true, count: testProjects.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

