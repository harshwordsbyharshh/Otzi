"use client";

import React, { useState, useEffect, useRef } from "react";
import { MediaRecord } from "@/types/project";
import {
  getProjectMediaAction,
  prepareMediaUploadAction,
  completeMediaUploadAction,
  uploadProjectMediaAction,
  deleteProjectMediaAction,
  setProjectCoverAction,
} from "@/app/admin/(protected)/projects/mediaActions";
import { validateMediaUpload, STORAGE_BUCKET } from "@/lib/supabase/mediaValidation";
import { createClient } from "@/lib/supabase/client";

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
      // Step 1: Request signed upload authorization from server
      const prepRes = await prepareMediaUploadAction({
        projectId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      if (!prepRes.success) {
        setErrorMessage(prepRes.error || "Failed to prepare storage upload.");
        setUploading(false);
        setUploadProgress(null);
        return;
      }

      // Branch A: Direct Cloudinary Upload (Authenticated, 100MB video / 10MB image)
      if (
        prepRes.storageProvider === "cloudinary" &&
        prepRes.uploadUrl &&
        prepRes.signature
      ) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        uploadData.append("api_key", prepRes.apiKey || "");
        uploadData.append("timestamp", String(prepRes.timestamp || ""));
        uploadData.append("signature", prepRes.signature);
        uploadData.append("public_id", prepRes.publicId || "");
        uploadData.append("type", "authenticated");
        if (prepRes.eager) {
          uploadData.append("eager", prepRes.eager);
        }

        const cldResult = await new Promise<{
          public_id: string;
          bytes: number;
          resource_type: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", prepRes.uploadUrl!);

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setUploadProgress(pct);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                resolve(json);
              } catch {
                reject(new Error("Invalid response received from Cloudinary."));
              }
            } else {
              try {
                const errJson = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    errJson.error?.message ||
                      `Cloudinary upload failed (HTTP ${xhr.status}).`
                  )
                );
              } catch {
                reject(
                  new Error(
                    `Cloudinary upload failed with HTTP status ${xhr.status}.`
                  )
                );
              }
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error during Cloudinary upload."));
          };

          xhr.send(uploadData);
        });

        // Step 2: Notify server to create the database record with Cloudinary metadata
        const completeRes = await completeMediaUploadAction({
          projectId,
          storagePath: cldResult.public_id || prepRes.publicId!,
          storageProvider: "cloudinary",
          mediaType:
            cldResult.resource_type === "video" ? "video" : "image",
          fileSize: cldResult.bytes || selectedFile.size,
          altText: altText.trim(),
          isCover: asCover,
        });

        if (!completeRes.success || !completeRes.media) {
          setErrorMessage(
            completeRes.error || "Failed to save media metadata in database."
          );
          setUploading(false);
          setUploadProgress(null);
          return;
        }

        const newMedia = completeRes.media;
        setMediaList((prev) => [...prev, newMedia]);
        setStatusMessage(
          `Media asset "${selectedFile.name}" uploaded successfully to Cloudinary.`
        );

        if (asCover || !currentCoverPath) {
          onCoverChange?.(newMedia.storage_path);
        }

        setSelectedFile(null);
        setAltText("");
        setAsCover(false);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Branch B: Direct Supabase Storage Upload (Legacy / Fallback)
      if (prepRes.storagePath && prepRes.token) {
        // Direct browser upload to Supabase Storage - completely bypasses Vercel 4.5MB payload limit!
        const supabase = createClient();
        const uploadResult = await supabase.storage
          .from(STORAGE_BUCKET)
          .uploadToSignedUrl(prepRes.storagePath, prepRes.token, selectedFile, {
            contentType: prepRes.resolvedMime || selectedFile.type,
          });

        if (uploadResult.error) {
          // If uploadToSignedUrl errored, try direct PUT to signedUrl
          if (prepRes.signedUrl) {
            const putRes = await fetch(prepRes.signedUrl, {
              method: "PUT",
              headers: {
                "Content-Type":
                  prepRes.resolvedMime || selectedFile.type || "application/octet-stream",
              },
              body: selectedFile,
            });
            if (!putRes.ok) {
              throw new Error(
                `Storage upload failed: ${putRes.statusText || uploadResult.error.message}`
              );
            }
          } else {
            throw new Error(`Storage upload failed: ${uploadResult.error.message}`);
          }
        }

        // Step 2: Notify server to create the database record
        const completeRes = await completeMediaUploadAction({
          projectId,
          storagePath: prepRes.storagePath,
          storageProvider: "supabase",
          mediaType:
            prepRes.mediaType || (selectedFile.type.startsWith("video") ? "video" : "image"),
          fileSize: selectedFile.size,
          altText: altText.trim(),
          isCover: asCover,
        });

        if (!completeRes.success || !completeRes.media) {
          setErrorMessage(completeRes.error || "Failed to save media metadata in database.");
          setUploading(false);
          setUploadProgress(null);
          return;
        }

        const newMedia = completeRes.media;
        setMediaList((prev) => [...prev, newMedia]);
        setStatusMessage(`Media asset "${selectedFile.name}" uploaded successfully.`);

        if (asCover || !currentCoverPath) {
          onCoverChange?.(newMedia.storage_path);
        }

        // Reset file input
        setSelectedFile(null);
        setAltText("");
        setAsCover(false);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Fallback for smaller files (under 4MB) if direct preparation was unavailable
      if (selectedFile.size <= 4 * 1024 * 1024) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("projectId", projectId);
        formData.append("altText", altText.trim());
        formData.append("isCover", asCover ? "true" : "false");

        const res = await uploadProjectMediaAction(formData);

        if (!res.success || !res.media) {
          setErrorMessage(res.error || prepRes.error || "Failed to upload media to storage.");
          setUploading(false);
          setUploadProgress(null);
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
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setErrorMessage(
          prepRes.error || "Direct storage upload could not be prepared for this file."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected network error occurred during upload.";
      const isSizeError =
        msg.includes("413") ||
        msg.toLowerCase().includes("too large") ||
        msg.toLowerCase().includes("exceeded the maximum") ||
        msg.toLowerCase().includes("size limit");
      const friendlyMsg = isSizeError
        ? `Upload rejected: File exceeds storage limits (100MB for video, 10MB for image).`
        : msg;
      setErrorMessage(friendlyMsg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
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
          <div className="flex flex-col gap-0.5">
            <span className="font-label-mono text-xs uppercase tracking-wider text-white font-bold">
              UPLOAD PRODUCTION ASSET
            </span>
            <span className="font-label-mono text-[9px] text-paper-dim uppercase tracking-wider">
              Mobile Spec: 1080x1920 (9:16), H.264 Level 4.0/4.1, Fast Start (moov at start)
            </span>
          </div>
          <span className="font-label-mono text-[10px] text-paper-dim uppercase">
            MAX: 10MB (IMAGE) / 100MB (VIDEO)
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
              {uploading
                ? uploadProgress !== null
                  ? `UPLOADING ${uploadProgress}%`
                  : "UPLOADING..."
                : "UPLOAD ASSET ↑"}
            </button>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && uploadProgress !== null && (
          <div className="flex flex-col gap-1.5 border-t border-[#262626] pt-3">
            <div className="flex justify-between text-[10px] font-label-mono text-paper-dim uppercase tracking-wider">
              <span>DIRECT STORAGE UPLOAD IN PROGRESS</span>
              <span className="text-white font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#1a1a1a] border border-[#262626] h-2 relative overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-150 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

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

                    <div className="flex items-center justify-between text-[10px] text-paper-dim uppercase">
                      <span>PROVIDER: <strong className="text-white">{item.storage_provider ? item.storage_provider.toUpperCase() : "SUPABASE"}</strong></span>
                      {item.file_size ? (
                        <span>{(item.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                      ) : null}
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
