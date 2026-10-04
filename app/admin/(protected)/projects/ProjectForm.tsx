"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectRecord, ProjectInput } from "@/types/project";
import { createProjectAction, updateProjectAction, deleteProjectAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { ProjectMediaManager } from "@/components/media/ProjectMediaManager";

interface ProjectFormProps {
  project?: ProjectRecord;
  mode: "create" | "edit";
}

function generateSafeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ASSET_TYPES = ["REEL", "CAROUSEL", "POST", "SHORT FILM"];
const PLATFORMS = ["INSTAGRAM", "X", "YOUTUBE", "DIGITAL"];
const ASPECT_RATIOS = ["9:16", "4:5", "1:1", "16:9"];
const DISCIPLINES = [
  "SOCIAL MEDIA MANAGEMENT & MARKETING",
  "AI AGENTS",
  "PAID AD MANAGEMENT",
  "GOOGLE BUSINESS PROFILE MANAGEMENT",
  "SEO MANAGEMENT",
  "CONTENT PRODUCTION",
  "CREATIVE DIRECTION",
];

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [client, setClient] = useState(project?.client || "");
  const [year, setYear] = useState(project?.year || new Date().getFullYear().toString());
  const [discipline, setDiscipline] = useState(
    project?.discipline || "SOCIAL MEDIA MANAGEMENT & MARKETING"
  );
  const [assetType, setAssetType] = useState(project?.asset_type || "REEL");
  const [platform, setPlatform] = useState(project?.platform || "INSTAGRAM");
  const [aspectRatio, setAspectRatio] = useState(project?.aspect_ratio || "9:16");
  const [description, setDescription] = useState(project?.description || "");
  const [coverPath, setCoverPath] = useState(project?.cover_path || "");
  const [published, setPublished] = useState(project?.published ?? false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched && mode === "create") {
      setSlug(generateSafeSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim().toLowerCase();
    const trimmedClient = client.trim();
    const trimmedYear = year.trim();

    if (!trimmedTitle || !trimmedSlug || !trimmedClient || !trimmedYear) {
      setErrorMessage("Please complete all required fields (Title, Slug, Client, Year).");
      return;
    }

    const payload: ProjectInput = {
      title: trimmedTitle,
      slug: trimmedSlug,
      client: trimmedClient,
      year: trimmedYear,
      discipline: discipline.trim(),
      asset_type: assetType,
      platform,
      aspect_ratio: aspectRatio,
      description: description.trim() || null,
      cover_path: coverPath.trim() || null,
      published,
    };

    try {
      setLoading(true);

      if (mode === "create") {
        const res = await createProjectAction(payload);
        if (!res.success || !res.project) {
          setErrorMessage(res.error || "Failed to create project.");
          setLoading(false);
          return;
        }

        router.push(`/admin/projects/${res.project.id}/edit?created=true`);
        router.refresh();
      } else {
        if (!project) return;
        const res = await updateProjectAction(project.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to update project.");
          setLoading(false);
          return;
        }

        setSuccessMessage("Production specifications updated successfully.");
        setLoading(false);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network or server error occurred.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      setDeleting(true);
      const res = await deleteProjectAction(project.id);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete project.");
        setDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }
      router.push("/admin/projects?deleted=true");
      router.refresh();
    } catch {
      setErrorMessage("Failed to delete project. Please try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-10 max-w-5xl">
      {/* Status Messages */}
      {errorMessage && (
        <div
          role="alert"
          className="border border-primary bg-black p-4 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="border border-white/40 bg-black p-4 text-white font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {successMessage}
        </div>
      )}

      {/* Primary Identity Section */}
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>01. PRODUCTION IDENTIFIER</span>
          </div>
          {mode === "edit" && project?.published && (
            <Link
              href={`/work/${project.slug}`}
              target="_blank"
              className="font-label-mono text-[11px] text-paper-dim hover:text-white uppercase tracking-wider transition-colors"
            >
              LIVE VIEW ↗
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-title"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              PRODUCTION TITLE *
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. VERTICAL REEL PRODUCTION 01"
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-body-md text-sm placeholder:text-[#555] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="project-slug"
                className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
              >
                URL SLUG *
              </label>
              <button
                type="button"
                onClick={() => setSlug(generateSafeSlug(title))}
                className="font-label-mono text-[10px] text-paper-dim hover:text-white uppercase tracking-wider cursor-pointer"
              >
                SYNC FROM TITLE
              </button>
            </div>
            <input
              id="project-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g. vertical-reel-production-01"
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-label-mono text-sm placeholder:text-[#555] transition-colors lowercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-client"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              CLIENT / BRAND *
            </label>
            <input
              id="project-client"
              type="text"
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. CLIENT NAME"
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-body-md text-sm placeholder:text-[#555] transition-colors uppercase"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-year"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              PRODUCTION YEAR *
            </label>
            <input
              id="project-year"
              type="text"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2026"
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-label-mono text-sm placeholder:text-[#555] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Format & Classification Section */}
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>02. FORMAT &amp; TAXONOMY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-asset-type"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              ASSET TYPE *
            </label>
            <select
              id="project-asset-type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-label-mono text-xs uppercase cursor-pointer"
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-platform"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              PLATFORM *
            </label>
            <select
              id="project-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-label-mono text-xs uppercase cursor-pointer"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="project-aspect-ratio"
              className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
            >
              ASPECT RATIO *
            </label>
            <select
              id="project-aspect-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-label-mono text-xs uppercase cursor-pointer"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="project-discipline"
            className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
          >
            DISCIPLINE / CATEGORY *
          </label>
          <input
            id="project-discipline"
            type="text"
            required
            list="discipline-options"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            placeholder="e.g. SOCIAL MEDIA MANAGEMENT & MARKETING"
            className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-body-md text-sm placeholder:text-[#555] transition-colors uppercase"
          />
          <datalist id="discipline-options">
            {DISCIPLINES.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>03. EDITORIAL NARRATIVE &amp; BRIEF</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="project-description"
            className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
          >
            EDITORIAL SUMMARY &amp; BRIEF
          </label>
          <textarea
            id="project-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed creative brief, narrative breakdown, and production objectives..."
            className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none p-4 text-white font-body-md text-sm placeholder:text-[#555] transition-colors resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Media Management Suite & Active Cover */}
      <ProjectMediaManager
        projectId={project?.id}
        currentCoverPath={coverPath}
        onCoverChange={(newCover) => setCoverPath(newCover || "")}
        isCreateMode={mode === "create"}
        onInitializeProject={() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        }}
      />

      {/* Publishing Status & Action Controls */}
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>05. PUBLISHING STATE &amp; CONTROLS</span>
          </div>
        </div>

        <div className="flex items-center justify-between border border-[#262626] p-4 bg-black">
          <div className="space-y-1">
            <span className="font-label-mono text-xs text-white uppercase tracking-wider block font-bold">
              {published ? "STATUS: PUBLISHED TO REPERTOIRE" : "STATUS: UNPUBLISHED DRAFT"}
            </span>
            <p className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider m-0">
              {published
                ? "This production is active and available to public portfolio viewers."
                : "This production is saved as a studio draft and hidden from public pages."}
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="font-label-mono text-xs uppercase tracking-wider text-white">
              {published ? "PUBLISHED" : "DRAFT"}
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#262626]">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-widest uppercase cursor-pointer"
            >
              {loading
                ? "SAVING SPECIFICATIONS..."
                : mode === "create"
                ? "INITIALIZE PRODUCTION →"
                : "SAVE CHANGES →"}
            </Button>

            <Link
              href="/admin/projects"
              className="border border-[#262626] px-5 py-4 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider text-center"
            >
              CANCEL
            </Link>
          </div>

          {mode === "edit" && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-primary hover:text-white font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer py-2 border-b border-transparent hover:border-white"
            >
              DELETE PRODUCTION
            </button>
          )}
        </div>

        {/* Delete Confirmation Dialogue */}
        {mode === "edit" && showDeleteConfirm && (
          <div
            role="alertdialog"
            className="border border-primary bg-black p-6 space-y-4 mt-2"
          >
            <div className="space-y-1">
              <span className="font-label-mono text-xs uppercase tracking-widest text-primary font-bold block">
                CONFIRM DELETION
              </span>
              <p className="font-body-sm text-xs text-paper-dim m-0 leading-relaxed">
                Are you sure you want to permanently remove &ldquo;{title}&rdquo; from the database? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-primary text-white hover:bg-white hover:text-black font-label-action text-xs uppercase tracking-widest px-6 py-3 font-bold transition-colors cursor-pointer"
              >
                {deleting ? "DELETING..." : "CONFIRM PERMANENT DELETE"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="border border-[#262626] text-paper-dim hover:text-white px-5 py-3 font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                KEEP PRODUCTION
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
