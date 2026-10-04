"use client";

import React, { useState, useEffect, useRef } from "react";
import { MediaRecord } from "@/types/project";
import {
  getProjectMediaAction,
  uploadProjectMediaAction,
  deleteProjectMediaAction,
  setProjectCoverAction,
} from "@/app/admin/(protected)/projects/mediaActions";
import { validateMediaUpload } from "@/lib/supabase/media";

interface ProjectMediaManagerProps {
  projectId?: string;
  currentCoverPath?: string | null;
  onCoverChange?: (newCoverPath: string | null) => void;
  isCreateMode?: boolean;
  onInitializeProject?: () => void;
}

export function ProjectMediaManager({
  projectId,
  currentCoverPath,
  onCoverChange,
  isCreateMode = false,
  onInitializeProject,
}: ProjectMediaManagerProps) {
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);

  // Selected file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [asCover, setAsCover] = useState(false);

  // Feedback states
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media items when editing an existing project
  useEffect(() => {
    if (!projectId || isCreateMode) return;

    let isMounted = true;
    async function loadMedia() {
      setLoadingMedia(true);
      const res = await getProjectMediaAction(projectId!);
      if (!isMounted) return;
      if (res.success && res.media) {
        setMediaList(res.media);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
      setLoadingMedia(false);
    }

    loadMedia();

    return () => {
      isMounted = false;
    };
  }, [projectId, isCreateMode]);

  // File selection & client-side validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setStatusMessage(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = validateMediaUpload({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || "Selected file is invalid.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    // If no cover is currently set, suggest setting this file as cover
    if (!currentCoverPath && mediaList.length === 0) {
      setAsCover(true);
    }
  };

  // Perform upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMessage("Please initialize project specifications before uploading media.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select an image or video file to upload.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("projectId", projectId);
      formData.append("altText", altText.trim());
      formData.append("isCover", asCover ? "true" : "false");

      const res = await uploadProjectMediaAction(formData);

      if (!res.success || !res.media) {
        setErrorMessage(res.error || "Failed to upload media to storage.");
        setUploading(false);
        return;
      }

      const newMedia = res.media;
      setMediaList((prev) => [...prev, newMedia]);
      setStatusMessage(`Media asset "${selectedFile.name}" uploaded successfully.`);

      if (asCover || !currentCoverPath) {
        onCoverChange?.(newMedia.storage_path);
      }

      // Reset file input
      setSelectedFile(null);
      setAltText("");
      setAsCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setErrorMessage("An unexpected network error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  // Set active cover
  const handleSetCover = async (storagePath: string) => {
    if (!projectId) return;
    setErrorMessage(null);
    setStatusMessage(null);
    setSettingCoverId(storagePath);

    try {
      const res = await setProjectCoverAction(projectId, storagePath);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update project cover.");
      } else {
        onCoverChange?.(storagePath);
        setStatusMessage("Project cover asset updated.");
      }
    } catch {
      setErrorMessage("Network error updating cover.");
    } finally {
      setSettingCoverId(null);
    }
  };

  // Delete media asset
  const handleDeleteMedia = async (mediaId: string, storagePath: string) => {
    if (!projectId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this media file? It will be removed from storage and database."
    );
    if (!confirmDelete) return;

    setErrorMessage(null);
    setStatusMessage(null);
    setDeletingId(mediaId);

    try {
      const res = await deleteProjectMediaAction(mediaId, projectId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete media asset.");
      } else {
        const remaining = mediaList.filter((m) => m.id !== mediaId);
        setMediaList(remaining);
        setStatusMessage("Media asset removed from storage.");

        if (currentCoverPath === storagePath) {
          const nextCover = remaining.length > 0 ? remaining[0].storage_path : null;
          onCoverChange?.(nextCover);
        }
      }
    } catch {
      setErrorMessage("Network error while removing media.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isCreateMode) {
    return (
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>03. MEDIA ASSETS &amp; PRODUCTION COVER</span>
          </div>
          <span className="font-label-mono text-[10px] text-paper-dim uppercase">
            STEP 1 OF 2
          </span>
        </div>

        <div className="border border-[#262626] p-6 bg-black flex flex-col gap-4">
          <div className="space-y-1">
            <span className="font-label-mono text-xs uppercase tracking-wider text-white font-bold block">
              INITIALIZE RECORD TO ENABLE UPLOADS
            </span>
            <p className="font-body-sm text-xs text-paper-dim m-0 leading-relaxed max-w-2xl">
              Media assets are stored under secure scoped paths in the private{" "}
              <code className="text-white font-label-mono text-[11px]">otzi-media</code> bucket linked to the production record. Complete the primary specifications above and save the draft to immediately access the media upload suite.
            </p>
          </div>

          {onInitializeProject && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onInitializeProject}
                className="bg-white text-black hover:bg-primary hover:text-white px-6 py-3 font-label-action text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer select-none"
              >
                INITIALIZE RECORD &amp; PROCEED TO UPLOAD →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
      {/* Section Header */}
      <div className="border-b border-[#262626] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
          <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
          <span>03. MEDIA ASSETS &amp; PRODUCTION COVER</span>
        </div>
        <div className="flex items-center gap-2 font-label-mono text-[10px] text-paper-dim uppercase">
          <span>PRIVATE BUCKET:</span>
          <span className="text-white font-bold">otzi-media</span>
        </div>
      </div>

      {/* Status & Error Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="border border-primary bg-black p-4 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="border border-white/40 bg-black p-4 text-white font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {statusMessage}
        </div>
      )}

      {/* Upload Dropzone & Controls */}
      <div className="border border-[#262626] p-5 bg-black flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
          <span className="font-label-mono text-xs uppercase tracking-wider text-white font-bold">
            UPLOAD PRODUCTION ASSET
          </span>
          <span className="font-label-mono text-[10px] text-paper-dim uppercase">
            MAX: 15MB (IMAGE) / 50MB (VIDEO)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* File Picker */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <label
              htmlFor="media-file-input"
              className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider"
            >
              SELECT FILE (JPG, PNG, WEBP, MP4, WEBM) *
            </label>
            <input
              id="media-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full bg-surface-container-low border border-[#262626] file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-label-mono file:uppercase file:bg-white file:text-black hover:file:bg-primary hover:file:text-white file:cursor-pointer text-xs text-white p-2 font-label-mono transition-colors"
            />
          </div>

          {/* Optional Caption / Alt Text */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label
              htmlFor="media-alt-input"
              className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider"
            >
              ASSET CAPTION / ALT TEXT (OPTIONAL)
            </label>
            <input
              id="media-alt-input"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Master Vertical Cut — 9:16"
              disabled={uploading}
              className="w-full bg-surface-container-low border border-[#262626] focus:border-white focus:outline-none px-4 py-2.5 text-white font-body-md text-xs placeholder:text-[#555] transition-colors"
            />
          </div>

          {/* Set as Cover Checkbox & Upload Button */}
          <div className="md:col-span-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={asCover}
                onChange={(e) => setAsCover(e.target.checked)}
                disabled={uploading}
                className="w-3.5 h-3.5 accent-primary cursor-pointer"
              />
              <span className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider hover:text-white">
                SET AS COVER
              </span>
            </label>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-primary hover:bg-white text-white hover:text-black disabled:opacity-40 disabled:cursor-not-allowed font-label-action text-xs uppercase tracking-widest px-5 py-2.5 font-bold transition-colors cursor-pointer select-none whitespace-nowrap text-center"
            >
              {uploading ? "UPLOADING..." : "UPLOAD ASSET ↑"}
            </button>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between text-[11px] font-label-mono text-paper-dim border-t border-[#262626] pt-2">
            <span>
              READY TO UPLOAD: <strong className="text-white">{selectedFile.name}</strong>
            </span>
            <span>
              SIZE: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; TYPE:{" "}
              {selectedFile.type || "unknown"}
            </span>
          </div>
        )}
      </div>

      {/* Uploaded Media Gallery */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <span className="font-label-mono text-xs uppercase tracking-wider text-paper-dim font-bold">
            ATTACHED ASSETS ({mediaList.length})
          </span>
          <span className="font-label-mono text-[10px] text-paper-dim uppercase">
            ACTIVE COVER:{" "}
            <strong className="text-white">
              {currentCoverPath ? "DEFINED" : "NOT SET"}
            </strong>
          </span>
        </div>

        {loadingMedia ? (
          <div className="p-8 text-center border border-[#262626] bg-black font-label-mono text-xs text-paper-dim uppercase tracking-widest">
            LOADING MEDIA ASSETS...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-8 text-center border border-[#262626] bg-black font-label-mono text-xs text-paper-dim uppercase tracking-widest">
            NO MEDIA ASSETS ATTACHED YET. UPLOAD AN IMAGE OR VIDEO ABOVE.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((item, index) => {
              const isCover = currentCoverPath === item.storage_path;
              const isVideo = item.type === "video";

              return (
                <div
                  key={item.id}
                  className={`border p-4 bg-black flex flex-col gap-3 transition-colors ${
                    isCover ? "border-primary" : "border-[#262626] hover:border-paper-dim"
                  }`}
                >
                  {/* Media Preview Box */}
                  <div className="relative aspect-video w-full bg-[#0d0d0d] border border-[#262626] overflow-hidden flex items-center justify-center">
                    {item.signedUrl ? (
                      isVideo ? (
                        <video
                          src={item.signedUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.signedUrl}
                          alt={item.alt_text || "Project Media"}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="font-label-mono text-[11px] text-paper-dim uppercase tracking-widest">
                        {isVideo ? "VIDEO ASSET" : "IMAGE ASSET"}
                      </div>
                    )}

                    {/* Cover Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 bg-primary text-white font-label-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow">
                        PROJECT COVER
                      </div>
                    )}

                    {/* Sequence Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 text-white border border-[#262626] font-label-mono text-[10px] px-1.5 py-0.5 uppercase tracking-wider">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Metadata Info */}
                  <div className="flex flex-col gap-1 border-t border-[#262626] pt-2 font-label-mono text-[11px]">
                    <div className="flex items-center justify-between text-paper-dim uppercase">
                      <span>TYPE: <strong className="text-white">{item.type.toUpperCase()}</strong></span>
                      <span>ORDER: <strong className="text-white">#{item.sort_order}</strong></span>
                    </div>

                    <div className="text-white truncate" title={item.alt_text || item.storage_path}>
                      {item.alt_text || (
                        <span className="text-paper-dim italic">No caption specified</span>
                      )}
                    </div>

                    <div className="text-[10px] text-paper-dim truncate" title={item.storage_path}>
                      PATH: {item.storage_path.split("/").pop()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-[#262626] pt-2 gap-2 mt-auto">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => handleSetCover(item.storage_path)}
                        disabled={settingCoverId === item.storage_path}
                        className="font-label-mono text-[11px] text-paper-dim hover:text-white uppercase tracking-wider border border-[#262626] hover:border-white px-3 py-1.5 transition-colors cursor-pointer select-none"
                      >
                        {settingCoverId === item.storage_path ? "SETTING..." : "SET AS COVER"}
                      </button>
                    ) : (
                      <span className="font-label-mono text-[11px] text-primary uppercase tracking-wider font-bold py-1.5">
                        &bull; ACTIVE COVER
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(item.id, item.storage_path)}
                      disabled={deletingId === item.id}
                      className="font-label-mono text-[11px] text-primary hover:text-white uppercase tracking-wider px-2 py-1.5 transition-colors cursor-pointer select-none"
                    >
                      {deletingId === item.id ? "REMOVING..." : "REMOVE"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
