"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProjectRecord, ProjectFilterStatus } from "@/types/project";
import { togglePublishAction, deleteProjectAction, purgeAiTestProjectsAction } from "./actions";
import { isTemporaryTestProject } from "@/lib/projectFilters";
import { Button } from "@/components/ui/Button";

interface ProjectListClientProps {
  initialProjects: ProjectRecord[];
}

export function ProjectListClient({ initialProjects }: ProjectListClientProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [filter, setFilter] = useState<ProjectFilterStatus>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [purgingTest, setPurgingTest] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const testProjectsCount = projects.filter((p) => isTemporaryTestProject(p)).length;

  const handlePurgeTestProjects = async () => {
    try {
      setPurgingTest(true);
      setActionError(null);
      setActionSuccess(null);

      const res = await purgeAiTestProjectsAction();
      if (!res.success) {
        setActionError(res.error || "Failed to purge test projects.");
      } else {
        setProjects((prev) => prev.filter((p) => !isTemporaryTestProject(p)));
        setActionSuccess(
          `Purged ${res.count || 0} temporary/AI test items from the studio archive.`
        );
      }
    } catch {
      setActionError("Failed to purge temporary test projects.");
    } finally {
      setPurgingTest(false);
    }
  };

  const publishedCount = projects.filter((p) => p.published).length;

  const draftCount = projects.length - publishedCount;

  const filteredProjects = projects.filter((p) => {
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    return true;
  });

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      setTogglingId(id);

      const targetState = !currentPublished;
      const res = await togglePublishAction(id, targetState);

      if (!res.success) {
        setActionError(res.error || "Failed to update publication status.");
        setTogglingId(null);
        return;
      }

      setProjects((prev) =>
        prev.map((item) => (item.id === id ? { ...item, published: targetState } : item))
      );
      setActionSuccess(
        targetState ? "Production published to public repertoire." : "Production reverted to draft."
      );
    } catch {
      setActionError("Network or server failure while updating publication status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      setDeletingId(id);

      const res = await deleteProjectAction(id);

      if (!res.success) {
        setActionError(res.error || "Failed to delete production.");
        setDeletingId(null);
        setConfirmDeleteId(null);
        return;
      }

      setProjects((prev) => prev.filter((item) => item.id !== id));
      setActionSuccess("Production removed permanently from archive.");
      setConfirmDeleteId(null);
    } catch {
      setActionError("Failed to delete production. Please verify permissions.");
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`font-label-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors cursor-pointer select-none ${
              filter === "all"
                ? "border-white bg-white text-black font-bold"
                : "border-[#262626] text-paper-dim hover:text-white hover:border-white/50"
            }`}
          >
            ALL ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("published")}
            className={`font-label-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors cursor-pointer select-none ${
              filter === "published"
                ? "border-white bg-white text-black font-bold"
                : "border-[#262626] text-paper-dim hover:text-white hover:border-white/50"
            }`}
          >
            PUBLISHED ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("draft")}
            className={`font-label-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors cursor-pointer select-none ${
              filter === "draft"
                ? "border-white bg-white text-black font-bold"
                : "border-[#262626] text-paper-dim hover:text-white hover:border-white/50"
            }`}
          >
            DRAFTS ({draftCount})
          </button>
        </div>

        {/* Primary Create Action */}
        <Button
          variant="primary"
          href="/admin/projects/new"
          className="text-xs px-6 py-3 font-bold tracking-widest uppercase cursor-pointer"
        >
          CREATE PROJECT →
        </Button>
      </div>

      {/* Temporary Test Content Warning Banner */}
      {testProjectsCount > 0 && (
        <div className="border border-primary bg-surface-container-low p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-label-mono text-xs text-primary font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>TEMPORARY TEST CONTENT DETECTED ({testProjectsCount})</span>
            </div>
            <p className="font-body-sm text-xs text-paper-dim m-0">
              Temporary or AI-generated development test items were detected. These are hidden from public view and can be permanently purged.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePurgeTestProjects}
            disabled={purgingTest}
            className="border border-primary bg-primary text-white hover:bg-white hover:text-black font-label-action uppercase tracking-widest text-xs px-5 py-2.5 font-bold transition-colors cursor-pointer select-none shrink-0"
          >
            {purgingTest ? "PURGING..." : "PURGE TEST CONTENT →"}
          </button>
        </div>
      )}

      {/* Action Messages */}
      {actionError && (
        <div
          role="alert"
          className="border border-primary bg-black p-4 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="border border-white/40 bg-black p-4 text-white font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {actionSuccess}
        </div>
      )}

      {/* Projects List / Table */}
      {filteredProjects.length === 0 ? (
        <div className="border border-[#262626] p-12 text-center bg-surface-container-low space-y-4">
          <div className="font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            ARCHIVE STATUS
          </div>
          <p className="font-body-md text-sm text-paper-dim m-0 max-w-md mx-auto">
            {filter === "all"
              ? "No productions found in the database. Initialize your first project record to populate the studio archive."
              : `No ${filter} productions found matching the active filter.`}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              href="/admin/projects/new"
              className="text-xs px-6 py-3 font-bold uppercase tracking-wider"
            >
              CREATE FIRST PROJECT →
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col border border-[#262626] divide-y divide-[#262626] bg-surface-container-low">
          {/* Table Header Row (Hidden on mobile) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3.5 bg-black font-label-mono text-[11px] text-paper-dim uppercase tracking-wider font-bold">
            <div className="col-span-4">PRODUCTION / SLUG</div>
            <div className="col-span-2">CLIENT / YEAR</div>
            <div className="col-span-2">FORMAT</div>
            <div className="col-span-2">STATE</div>
            <div className="col-span-2 text-right">ACTIONS</div>
          </div>

          {/* Project Rows */}
          {filteredProjects.map((p) => {
            const isToggling = togglingId === p.id;
            const isDeleting = deletingId === p.id;
            const isConfirmingDelete = confirmDeleteId === p.id;

            return (
              <div
                key={p.id}
                className="p-6 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center hover:bg-surface-container transition-colors"
              >
                {/* Title & Slug */}
                <div className="lg:col-span-4 flex flex-col gap-1 w-full">
                  <Link
                    href={`/admin/projects/${p.id}/edit`}
                    className="font-bold text-white hover:text-primary transition-colors text-sm uppercase tracking-tight"
                  >
                    {p.title}
                  </Link>
                  <div className="font-label-mono text-[11px] text-paper-dim tracking-wider truncate">
                    /{p.slug}
                  </div>
                </div>

                {/* Client & Year */}
                <div className="lg:col-span-2 flex flex-col gap-0.5 w-full">
                  <span className="font-label-mono text-xs uppercase text-white font-bold">
                    {p.client}
                  </span>
                  <span className="font-label-mono text-[11px] text-paper-dim">
                    {p.year} • {p.discipline}
                  </span>
                </div>

                {/* Format specs */}
                <div className="lg:col-span-2 flex flex-col gap-0.5 w-full">
                  <span className="font-label-mono text-xs text-white uppercase">
                    {p.asset_type} ({p.aspect_ratio})
                  </span>
                  <span className="font-label-mono text-[11px] text-paper-dim uppercase">
                    {p.platform}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="lg:col-span-2 flex items-center gap-2">
                  {p.published ? (
                    <span className="inline-flex items-center gap-1.5 border border-white/60 bg-black px-2.5 py-1 text-white font-label-mono text-[10px] uppercase tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 bg-white inline-block" aria-hidden="true" />
                      PUBLISHED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 border border-[#333] bg-black px-2.5 py-1 text-paper-dim font-label-mono text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-[#555] inline-block" aria-hidden="true" />
                      DRAFT
                    </span>
                  )}
                </div>

                {/* Action Controls */}
                <div className="lg:col-span-2 flex items-center justify-start lg:justify-end gap-3 w-full pt-2 lg:pt-0 border-t lg:border-t-0 border-[#262626]">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={isDeleting}
                        className="bg-primary text-white text-[10px] font-label-mono uppercase tracking-wider px-3 py-1 font-bold hover:bg-white hover:text-black transition-colors cursor-pointer"
                      >
                        {isDeleting ? "..." : "CONFIRM"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                        className="border border-[#262626] text-paper-dim text-[10px] font-label-mono uppercase tracking-wider px-2 py-1 hover:text-white cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Publish / Unpublish Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p.id, p.published)}
                        disabled={isToggling}
                        className="font-label-mono text-[11px] text-paper-dim hover:text-white uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 border border-[#262626] hover:border-white/40"
                      >
                        {isToggling ? "..." : p.published ? "UNPUBLISH" : "PUBLISH"}
                      </button>

                      {/* Edit Link */}
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="font-label-mono text-[11px] text-white hover:text-primary uppercase tracking-wider transition-colors py-1 px-2 border border-white hover:border-primary font-bold"
                      >
                        EDIT →
                      </Link>

                      {/* Delete Trigger */}
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="font-label-mono text-[11px] text-[#777] hover:text-primary uppercase tracking-wider transition-colors cursor-pointer py-1 px-1"
                        title="Delete project"
                        aria-label="Delete project"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
