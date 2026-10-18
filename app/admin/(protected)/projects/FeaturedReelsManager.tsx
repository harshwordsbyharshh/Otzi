"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectRecord } from "@/types/project";
import {
  pinFeaturedReelAction,
  unpinFeaturedReelAction,
  reorderFeaturedReelsAction,
} from "./actions";

interface FeaturedReelsManagerProps {
  projects: ProjectRecord[];
  onProjectsChange: (updated: ProjectRecord[]) => void;
}

export function FeaturedReelsManager({
  projects,
  onProjectsChange,
}: FeaturedReelsManagerProps) {
  // Extract currently featured published reels sorted by featured_order
  const getFeaturedList = (all: ProjectRecord[]) => {
    return all
      .filter((p) => p.is_featured && p.published && p.asset_type === "REEL")
      .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999));
  };

  const [featuredList, setFeaturedList] = useState<ProjectRecord[]>(() =>
    getFeaturedList(projects)
  );
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>(() =>
    getFeaturedList(projects).map((p) => p.id)
  );

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unpinningId, setUnpinningId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string>("");
  const [isPinning, setIsPinning] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [managerSuccess, setManagerSuccess] = useState<string | null>(null);

  // Sync with incoming projects when they change externally
  useEffect(() => {
    const list = getFeaturedList(projects);
    setFeaturedList(list);
    setSavedOrderIds(list.map((p) => p.id));
  }, [projects]);

  // Check if current draft order differs from saved order
  const currentIds = featuredList.map((p) => p.id);
  const hasUnsavedReorder =
    currentIds.length === savedOrderIds.length &&
    currentIds.some((id, idx) => id !== savedOrderIds[idx]);

  // Eligible unpinned published reels for quick selection
  const eligibleUnpinnedReels = projects.filter(
    (p) => p.published && p.asset_type === "REEL" && !p.is_featured
  );

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...featuredList];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    setFeaturedList(reordered);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Accessible Move Up / Down
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredList.length) return;

    const reordered = [...featuredList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setFeaturedList(reordered);
  };

  // Save manual reorder to Supabase
  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setManagerError(null);
      setManagerSuccess(null);

      const orderedIds = featuredList.map((p) => p.id);
      const res = await reorderFeaturedReelsAction(orderedIds);

      if (!res.success) {
        setManagerError(res.error || "Failed to save featured reels order.");
        // Restore to last saved order
        const restored = projects.filter((p) => savedOrderIds.includes(p.id));
        restored.sort(
          (a, b) => savedOrderIds.indexOf(a.id) - savedOrderIds.indexOf(b.id)
        );
        setFeaturedList(restored);
        return;
      }

      // Update parent projects state with new featured_order
      const updatedProjects = projects.map((p) => {
        const orderIdx = orderedIds.indexOf(p.id);
        if (orderIdx !== -1) {
          return { ...p, is_featured: true, featured_order: orderIdx + 1 };
        }
        return p;
      });

      onProjectsChange(updatedProjects);
      setSavedOrderIds(orderedIds);
      setManagerSuccess("Featured reels order saved to public website.");
    } catch {
      setManagerError("Network or server error while persisting featured order.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to saved order
  const handleResetOrder = () => {
    const restored = projects.filter((p) => savedOrderIds.includes(p.id));
    restored.sort(
      (a, b) => savedOrderIds.indexOf(a.id) - savedOrderIds.indexOf(b.id)
    );
    setFeaturedList(restored);
    setManagerError(null);
    setManagerSuccess(null);
  };

  // Unpin action
  const handleUnpin = async (id: string) => {
    try {
      setUnpinningId(id);
      setManagerError(null);
      setManagerSuccess(null);

      const res = await unpinFeaturedReelAction(id);
      if (!res.success) {
        setManagerError(res.error || "Failed to unpin reel.");
        return;
      }

      // Update local and parent
      const remaining = featuredList.filter((p) => p.id !== id);
      const recompacted = remaining.map((p, idx) => ({
        ...p,
        featured_order: idx + 1,
      }));

      setFeaturedList(recompacted);
      setSavedOrderIds(recompacted.map((p) => p.id));

      const updatedProjects = projects.map((p) => {
        if (p.id === id) {
          return { ...p, is_featured: false, featured_order: null };
        }
        const newOrder = recompacted.findIndex((r) => r.id === p.id);
        if (newOrder !== -1) {
          return { ...p, is_featured: true, featured_order: newOrder + 1 };
        }
        return p;
      });

      onProjectsChange(updatedProjects);
      setManagerSuccess("Reel unpinned and returned to normal chronological order.");
    } catch {
      setManagerError("Failed to unpin reel from featured slots.");
    } finally {
      setUnpinningId(null);
    }
  };

  // Quick pin from dropdown
  const handleQuickPin = async () => {
    if (!selectedPinId) return;

    if (featuredList.length >= 5) {
      setManagerError(
        "Maximum 5 featured reels limit reached. You must unpin an existing reel first."
      );
      return;
    }

    try {
      setIsPinning(true);
      setManagerError(null);
      setManagerSuccess(null);

      const res = await pinFeaturedReelAction(selectedPinId);
      if (!res.success) {
        setManagerError(res.error || "Failed to pin reel.");
        return;
      }

      const pinnedProject = projects.find((p) => p.id === selectedPinId);
      if (!pinnedProject) return;

      const newOrder = res.featured_order || featuredList.length + 1;
      const updatedPinned = {
        ...pinnedProject,
        is_featured: true,
        featured_order: newOrder,
      };

      const newList = [...featuredList, updatedPinned];
      setFeaturedList(newList);
      setSavedOrderIds(newList.map((p) => p.id));

      const updatedProjects = projects.map((p) =>
        p.id === selectedPinId ? updatedPinned : p
      );
      onProjectsChange(updatedProjects);

      setSelectedPinId("");
      setManagerSuccess(
        `"${pinnedProject.title}" pinned at position #${newOrder}.`
      );
    } catch {
      setManagerError("Failed to pin reel as featured.");
    } finally {
      setIsPinning(false);
    }
  };

  const isMaxCapacity = featuredList.length >= 5;

  return (
    <div className="border border-[#262626] bg-surface-container-low p-6 md:p-8 flex flex-col gap-6">
      {/* Header and Capacity Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#262626] gap-4">
        <div>
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>FEATURED REELS CURATION</span>
            <span className="text-[#555]">/</span>
            <span className="text-white">POSITIONS 1–5</span>
          </div>
          <h2 className="font-display-sm text-lg md:text-xl uppercase tracking-tight text-white mt-1 m-0 font-bold">
            CURATED TOP REELS (HOMEPAGE &amp; WORK PRIORITY)
          </h2>
          <p className="font-body-sm text-xs text-paper-dim m-0 mt-1 max-w-2xl leading-relaxed">
            Pinned reels take absolute precedence at the top of the homepage and work page. Up to 5 reels may be pinned.
            Unpinned reels appear subsequently in chronological order (newest first), followed by static posts and carousels.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`font-label-mono text-xs uppercase tracking-widest px-3.5 py-1.5 border font-bold ${
              isMaxCapacity
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/30 bg-black text-white"
            }`}
          >
            {featuredList.length}/5 FEATURED REELS
          </div>
        </div>
      </div>

      {/* Notifications */}
      {managerError && (
        <div
          role="alert"
          className="border border-primary bg-black p-4 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed flex items-center justify-between gap-4"
        >
          <span>{managerError}</span>
          <button
            type="button"
            onClick={() => setManagerError(null)}
            className="text-primary hover:text-white transition-colors cursor-pointer text-sm font-bold px-2 py-0.5 select-none"
            title="Dismiss"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {managerSuccess && (
        <div
          role="status"
          className="border border-white/40 bg-black p-4 text-white font-label-mono text-xs uppercase tracking-wider leading-relaxed flex items-center justify-between gap-4"
        >
          <span>{managerSuccess}</span>
          <button
            type="button"
            onClick={() => setManagerSuccess(null)}
            className="text-white/60 hover:text-white transition-colors cursor-pointer text-sm font-bold px-2 py-0.5 select-none"
            title="Dismiss"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Pin Selector (when capacity allows and eligible unpinned reels exist) */}
      {!isMaxCapacity && eligibleUnpinnedReels.length > 0 && (
        <div className="border border-[#262626] bg-black p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label htmlFor="quick-pin-select" className="font-label-mono text-xs text-paper-dim uppercase tracking-wider shrink-0">
            PIN PUBLISHED REEL:
          </label>
          <select
            id="quick-pin-select"
            value={selectedPinId}
            onChange={(e) => setSelectedPinId(e.target.value)}
            disabled={isPinning}
            className="flex-1 bg-surface-container-low border border-[#262626] text-white font-label-mono text-xs px-3 py-2 uppercase tracking-wider focus:outline-none focus:border-white"
          >
            <option value="">-- SELECT PUBLISHED REEL TO PIN --</option>
            {eligibleUnpinnedReels.map((reel) => (
              <option key={reel.id} value={reel.id}>
                {reel.title} ({reel.year} • {reel.client})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleQuickPin}
            disabled={!selectedPinId || isPinning}
            className="border border-white bg-white text-black font-label-mono text-xs font-bold uppercase tracking-wider px-5 py-2 hover:bg-primary hover:border-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isPinning ? "PINNING..." : "+ PIN AS FEATURED"}
          </button>
        </div>
      )}

      {/* Max Capacity Notice */}
      {isMaxCapacity && (
        <div className="border border-[#333] bg-black/60 p-3.5 text-paper-dim font-label-mono text-xs uppercase tracking-wider flex items-center justify-between gap-4">
          <span>All 5 featured slots are occupied. To feature a different reel, unpin one of the current slots.</span>
        </div>
      )}

      {/* Featured Reels List */}
      {featuredList.length === 0 ? (
        <div className="border border-dashed border-[#262626] p-8 text-center bg-black/40 space-y-2">
          <div className="font-label-mono text-xs uppercase tracking-widest text-[#777] font-bold">
            ZERO FEATURED REELS ACTIVE (0/5)
          </div>
          <p className="font-body-sm text-xs text-paper-dim m-0 max-w-lg mx-auto leading-relaxed">
            All reels currently display chronologically (newest first). Pin up to 5 reels to lock their premier display order at the very top of the studio website.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-paper-dim font-label-mono text-[11px] uppercase tracking-wider pb-1">
            <span>DRAG OR USE ARROWS TO ORDER POSITIONS 1–{featuredList.length}:</span>
            {hasUnsavedReorder && (
              <span className="text-primary font-bold animate-pulse">● UNSAVED REORDER</span>
            )}
          </div>

          <div className="flex flex-col divide-y divide-[#262626] border border-[#262626] bg-black">
            {featuredList.map((reel, index) => {
              const isUnpinning = unpinningId === reel.id;
              const isDraggingThis = draggedIdx === index;
              const isOverThis = dragOverIdx === index;

              return (
                <div
                  key={reel.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isDraggingThis ? "opacity-30 bg-[#111]" : ""
                  } ${isOverThis ? "border-t-2 border-primary bg-primary/5" : "hover:bg-surface-container"}`}
                >
                  {/* Position Badge & Drag Handle & Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <div
                      className="text-[#666] hover:text-white cursor-grab active:cursor-grabbing font-label-mono text-base select-none px-1"
                      title="Drag to reorder"
                      aria-label="Drag handle"
                    >
                      ⠿
                    </div>

                    {/* Numeric Position Badge */}
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-primary bg-primary/10 text-primary font-label-mono text-xs font-bold">
                      #{index + 1}
                    </div>

                    {/* Project Title and Metadata */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/projects/${reel.id}/edit`}
                          className="font-bold text-white hover:text-primary transition-colors text-sm uppercase tracking-tight truncate"
                        >
                          {reel.title}
                        </Link>
                        <span className="font-label-mono text-[10px] text-paper-dim border border-[#333] px-1.5 py-0.5">
                          {reel.aspect_ratio}
                        </span>
                      </div>
                      <div className="font-label-mono text-[11px] text-paper-dim tracking-wider truncate">
                        {reel.client} • {reel.year} • /{reel.slug}
                      </div>
                    </div>
                  </div>

                  {/* Accessible Reorder & Unpin Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="border border-[#262626] hover:border-white text-paper-dim hover:text-white px-2.5 py-1 text-xs font-label-mono disabled:opacity-20 disabled:hover:border-[#262626] disabled:hover:text-paper-dim transition-colors cursor-pointer select-none"
                      title="Move reel up"
                      aria-label={`Move ${reel.title} up to position ${index}`}
                    >
                      ▲
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === featuredList.length - 1}
                      className="border border-[#262626] hover:border-white text-paper-dim hover:text-white px-2.5 py-1 text-xs font-label-mono disabled:opacity-20 disabled:hover:border-[#262626] disabled:hover:text-paper-dim transition-colors cursor-pointer select-none"
                      title="Move reel down"
                      aria-label={`Move ${reel.title} down to position ${index + 2}`}
                    >
                      ▼
                    </button>

                    {/* Unpin Button */}
                    <button
                      type="button"
                      onClick={() => handleUnpin(reel.id)}
                      disabled={isUnpinning}
                      className="border border-[#262626] hover:border-primary text-paper-dim hover:text-primary px-3 py-1 text-[11px] font-label-mono uppercase tracking-wider transition-colors cursor-pointer select-none ml-2"
                      title="Unpin from featured"
                    >
                      {isUnpinning ? "UNPINNING..." : "UNPIN"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar for Saving / Reverting Reorder */}
          {hasUnsavedReorder && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-primary bg-black">
              <span className="font-label-mono text-xs text-primary font-bold uppercase tracking-wider">
                ● You have unsaved changes to the featured reels position order.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={isSaving}
                  className="border border-[#333] hover:border-white text-paper-dim hover:text-white font-label-mono text-xs uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer"
                >
                  REVERT
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={isSaving}
                  className="border border-primary bg-primary hover:bg-white hover:border-white hover:text-black text-white font-label-mono text-xs font-bold uppercase tracking-wider px-5 py-2 transition-colors cursor-pointer"
                >
                  {isSaving ? "SAVING ORDER..." : "SAVE ORDER →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
