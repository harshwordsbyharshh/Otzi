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

    // Check if project was previously featured (defensive against un-migrated DB)
    let wasFeatured = false;
    try {
      const { data: existingProject, error: featErr } = await supabase
        .from("projects")
        .select("is_featured")
        .eq("id", id)
        .maybeSingle();

      if (!featErr && existingProject) {
        wasFeatured = Boolean(existingProject.is_featured);
      }
    } catch {
      // Column does not exist yet in remote schema
    }

    const shouldUnpin = wasFeatured && (!published || asset_type !== "REEL");

    const updatePayload: Record<string, unknown> = {
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
    };

    if (shouldUnpin) {
      updatePayload.is_featured = false;
      updatePayload.featured_order = null;
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to update project in database." };
    }

    if (shouldUnpin) {
      await recompactFeaturedReelsHelper(supabase);
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

    let wasFeatured = false;
    let projectSlug: string | undefined = undefined;

    // Defensive lookup to avoid failing if is_featured column is not yet migrated
    const { data: projectRecord, error: pError } = await supabase
      .from("projects")
      .select("slug, is_featured")
      .eq("id", id)
      .maybeSingle();

    if (!pError && projectRecord) {
      projectSlug = projectRecord.slug;
      wasFeatured = Boolean(projectRecord.is_featured);
    } else {
      const { data: fallbackRecord } = await supabase
        .from("projects")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
      projectSlug = fallbackRecord?.slug;
    }

    const updatePayload: Record<string, unknown> = {
      published,
      updated_at: new Date().toISOString(),
    };

    // If unpublishing a featured reel, unpin it to keep the public featured list valid
    if (!published && wasFeatured) {
      updatePayload.is_featured = false;
      updatePayload.featured_order = null;
    }

    const { error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!published && wasFeatured) {
      await recompactFeaturedReelsHelper(supabase);
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/work");
    if (projectSlug) {
      revalidatePath(`/work/${projectSlug}`);
    }
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

    let wasFeatured = false;
    let projectSlug: string | undefined = undefined;

    const { data: projectRecord, error: pError } = await supabase
      .from("projects")
      .select("slug, is_featured")
      .eq("id", id)
      .maybeSingle();

    if (!pError && projectRecord) {
      projectSlug = projectRecord.slug;
      wasFeatured = Boolean(projectRecord.is_featured);
    } else {
      const { data: fallbackRecord } = await supabase
        .from("projects")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
      projectSlug = fallbackRecord?.slug;
    }

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

    if (wasFeatured) {
      await recompactFeaturedReelsHelper(supabase);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath("/work");
    if (projectRecord?.slug) {
      revalidatePath(`/work/${projectRecord.slug}`);
    }
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

// ============================================================================
// FEATURED REELS SERVER ACTIONS & RECOMPACTION HELPERS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recompactFeaturedReelsHelper(supabase: any) {
  try {
    const { data: featured, error } = await supabase
      .from("projects")
      .select("id, published, asset_type, featured_order")
      .eq("is_featured", true)
      .order("featured_order", { ascending: true });

    if (error || !featured) return;

    // Filter strictly to published reels
    const valid = (featured as Array<{ id: string; published: boolean; asset_type: string }>).filter(
      (p) => p.published === true && p.asset_type === "REEL"
    );
    const invalid = (featured as Array<{ id: string; published: boolean; asset_type: string }>).filter(
      (p) => !(p.published === true && p.asset_type === "REEL")
    );

    for (const inv of invalid) {
      await supabase
        .from("projects")
        .update({ is_featured: false, featured_order: null, updated_at: new Date().toISOString() })
        .eq("id", inv.id);
    }

    // Cap at 5
    const keep = valid.slice(0, 5);
    const overflow = valid.slice(5);

    for (const ov of overflow) {
      await supabase
        .from("projects")
        .update({ is_featured: false, featured_order: null, updated_at: new Date().toISOString() })
        .eq("id", ov.id);
    }

    const orderedIds = keep.map((p) => p.id);

    // Try RPC first
    const { error: rpcErr } = await supabase.rpc("reorder_featured_reels", {
      p_project_ids: orderedIds,
    });

    if (rpcErr) {
      // Safe two-step fallback
      await supabase
        .from("projects")
        .update({ is_featured: false, featured_order: null })
        .eq("is_featured", true);

      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from("projects")
          .update({
            is_featured: true,
            featured_order: i + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderedIds[i]);
      }
    }
  } catch {
    // Graceful error capture during recompact
  }
}

export async function pinFeaturedReelAction(
  id: string
): Promise<{ success: boolean; featured_order?: number; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    // 1. Attempt atomic database RPC first (advisory-locked & concurrency-safe)
    const { data: rpcOrder, error: rpcErr } = await supabase.rpc("pin_featured_reel", {
      p_project_id: id,
    });

    if (!rpcErr && typeof rpcOrder === "number") {
      revalidatePath("/admin/projects");
      revalidatePath("/work");
      revalidatePath("/");
      return { success: true, featured_order: rpcOrder };
    }

    // If RPC failed due to validation or permission error (other than function missing), surface it
    if (rpcErr && !rpcErr.message.includes("function") && !rpcErr.message.includes("does not exist")) {
      return { success: false, error: rpcErr.message };
    }

    // 2. Safe Fallback: Verify existence and eligibility using core project columns
    const { data: project, error: pError } = await supabase
      .from("projects")
      .select("id, title, published, asset_type")
      .eq("id", id)
      .maybeSingle();

    if (pError) {
      return { success: false, error: pError.message || "Failed to query project from database." };
    }

    if (!project) {
      return { success: false, error: "Project not found in studio archive." };
    }

    if (!project.published) {
      return {
        success: false,
        error: "Only published projects can be pinned as featured reels.",
      };
    }

    if (project.asset_type !== "REEL") {
      return {
        success: false,
        error: `Only projects of format "REEL" can be pinned as featured. This project is "${project.asset_type}".`,
      };
    }

    // 3. Fetch currently featured reels to enforce max 5 limit
    const { data: currentFeatured, error: fError } = await supabase
      .from("projects")
      .select("id, featured_order")
      .eq("is_featured", true)
      .order("featured_order", { ascending: true });

    if (fError) {
      if (fError.message.includes("is_featured") || fError.message.includes("42703") || (fError as { code?: string }).code === "42703") {
        return {
          success: false,
          error:
            "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
        };
      }
      return { success: false, error: fError.message };
    }

    const featuredList = currentFeatured || [];
    if (featuredList.length >= 5) {
      return {
        success: false,
        error: "Maximum of 5 featured reels reached. You must unpin an existing reel first.",
      };
    }

    const nextOrder = featuredList.length + 1;

    // 4. Update project
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        is_featured: true,
        featured_order: nextOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      if (updateError.message.includes("is_featured") || updateError.message.includes("42703") || (updateError as { code?: string }).code === "42703") {
        return {
          success: false,
          error:
            "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
        };
      }
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true, featured_order: nextOrder };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function unpinFeaturedReelAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    // 1. Attempt atomic database RPC first
    const { error: rpcErr } = await supabase.rpc("unpin_featured_reel", {
      p_project_id: id,
    });

    if (!rpcErr) {
      revalidatePath("/admin/projects");
      revalidatePath("/work");
      revalidatePath("/");
      return { success: true };
    }

    // If RPC failed due to validation or permission error, surface it
    if (!rpcErr.message.includes("function") && !rpcErr.message.includes("does not exist")) {
      return { success: false, error: rpcErr.message };
    }

    // 2. Fallback: Unpin target project
    const { error: unpinError } = await supabase
      .from("projects")
      .update({
        is_featured: false,
        featured_order: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (unpinError) {
      if (unpinError.message.includes("is_featured") || unpinError.message.includes("42703") || (unpinError as { code?: string }).code === "42703") {
        return {
          success: false,
          error:
            "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
        };
      }
      return { success: false, error: unpinError.message };
    }

    // 3. Recompact remaining featured reels
    await recompactFeaturedReelsHelper(supabase);

    revalidatePath("/admin/projects");
    revalidatePath("/work");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function reorderFeaturedReelsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    if (!Array.isArray(orderedIds)) {
      return { success: false, error: "Invalid ordered list format." };
    }

    if (orderedIds.length > 5) {
      return { success: false, error: "Maximum of 5 featured reels allowed." };
    }

    // Verify uniqueness
    const uniqueIds = Array.from(new Set(orderedIds));
    if (uniqueIds.length !== orderedIds.length) {
      return { success: false, error: "Duplicate projects detected in ordering list." };
    }

    // If empty array, unpin all
    if (orderedIds.length === 0) {
      const { error: clearErr } = await supabase
        .from("projects")
        .update({ is_featured: false, featured_order: null, updated_at: new Date().toISOString() })
        .eq("is_featured", true);

      if (clearErr && (clearErr.message.includes("is_featured") || (clearErr as { code?: string }).code === "42703")) {
        return {
          success: false,
          error:
            "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
        };
      }

      revalidatePath("/admin/projects");
      revalidatePath("/work");
      revalidatePath("/");
      return { success: true };
    }

    // Verify all requested IDs exist, are published reels
    const { data: projectsToOrder, error: pErr } = await supabase
      .from("projects")
      .select("id, published, asset_type")
      .in("id", orderedIds);

    if (pErr) {
      return { success: false, error: pErr.message || "Failed to query projects from database." };
    }

    if (!projectsToOrder || projectsToOrder.length !== orderedIds.length) {
      return { success: false, error: "One or more projects could not be found." };
    }

    const ineligible = (projectsToOrder as Array<{ published: boolean; asset_type: string }>).find(
      (p) => !p.published || p.asset_type !== "REEL"
    );
    if (ineligible) {
      return {
        success: false,
        error: "All featured items must be published projects with format REEL.",
      };
    }

    // Try RPC first
    const { error: rpcErr } = await supabase.rpc("reorder_featured_reels", {
      p_project_ids: orderedIds,
    });

    if (rpcErr) {
      // Fallback: two-pass update
      // Pass 1: unpin all currently featured
      const { error: unpinAllErr } = await supabase
        .from("projects")
        .update({ is_featured: false, featured_order: null })
        .eq("is_featured", true);

      if (unpinAllErr && (unpinAllErr.message.includes("is_featured") || (unpinAllErr as { code?: string }).code === "42703")) {
        return {
          success: false,
          error:
            "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
        };
      }

      // Pass 2: assign new 1..N order
      for (let i = 0; i < orderedIds.length; i++) {
        const { error: assignErr } = await supabase
          .from("projects")
          .update({
            is_featured: true,
            featured_order: i + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderedIds[i]);

        if (assignErr) {
          if (assignErr.message.includes("is_featured") || (assignErr as { code?: string }).code === "42703") {
            return {
              success: false,
              error:
                "Database migration required: The 'is_featured' and 'featured_order' columns have not been added to your Supabase database yet. Please run the SQL migration (20261018220000_featured_reels.sql) in your Supabase SQL editor.",
            };
          }
          return { success: false, error: assignErr.message };
        }
      }
    }

    revalidatePath("/admin/projects");
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

