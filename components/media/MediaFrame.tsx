"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AspectRatio, AssetType, PlatformType } from "@/types/homepage";

interface MediaFrameProps {
  aspectRatio: AspectRatio;
  assetType: AssetType;
  platform?: PlatformType;
  slidesCount?: number;
  thumbnailUrl?: string;
  mediaUrl?: string;
  title: string;
  className?: string;
}

export function MediaFrame({
  aspectRatio,
  assetType,
  platform,
  slidesCount,
  thumbnailUrl,
  mediaUrl,
  title,
  className = "",
}: MediaFrameProps) {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16]";
      case "4:5":
        return "aspect-[4/5]";
      case "1:1":
        return "aspect-square";
      case "16:9":
      default:
        return "aspect-video";
    }
  };

  const activeMediaUrl = mediaUrl || thumbnailUrl;

  const isVideoFile =
    Boolean(activeMediaUrl) &&
    (activeMediaUrl!.toLowerCase().includes(".mp4") ||
      activeMediaUrl!.toLowerCase().includes(".webm"));

  const isImageExtension =
    Boolean(activeMediaUrl) &&
    /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(activeMediaUrl!);

  const isPlayableVideo =
    Boolean(activeMediaUrl) &&
    (isVideoFile ||
      (!isImageExtension &&
        (assetType === "REEL" || assetType === "SHORT FILM")));

  const posterUrl =
    thumbnailUrl && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(thumbnailUrl)
      ? thumbnailUrl
      : undefined;

  // Mobile Safari optimization: Appending #t=0.001 forces iOS WebKit to seek to 1ms
  // and render the first video frame as a poster instead of displaying an empty black box.
  const videoSrc =
    isPlayableVideo && activeMediaUrl
      ? posterUrl || activeMediaUrl.includes("#")
        ? activeMediaUrl
        : `${activeMediaUrl}#t=0.001`
      : activeMediaUrl;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      setPlaybackError(null);

      // Kickstart stalled metadata decoding on mobile connections
      if (video.readyState === 0) {
        try {
          video.load();
        } catch {
          // ignore load trigger errors
        }
      }

      try {
        video.muted = isMuted;
        await video.play();
        setIsPlaying(true);
      } catch {
        // Fallback if mobile browser policy blocks unmuted audio on gesture
        try {
          video.muted = true;
          setIsMuted(true);
          await video.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn("[MediaFrame] Playback blocked or failed on device:", playErr);
          if (video.error) {
            setPlaybackError(
              video.error.code === 3
                ? "DECODE ERROR (REQUIRES 1080P H.264 CUTDOWN)"
                : "PLAYBACK UNSUPPORTED ON THIS DEVICE"
            );
          }
        }
      }
      showControlsTemporarily();
    } else {
      video.pause();
      setIsPlaying(false);
      setControlsVisible(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    showControlsTemporarily();
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ("webkitEnterFullscreen" in video) {
      // iOS Safari fallback
      (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
    showControlsTemporarily();
  };

  return (
    <div
      aria-label={title}
      onMouseMove={isPlaying ? showControlsTemporarily : undefined}
      onMouseEnter={isPlaying ? showControlsTemporarily : undefined}
      className={`relative w-full ${getAspectClass()} bg-[#090909] border border-[#262626] overflow-hidden flex flex-col justify-between p-4 group select-none ${className}`}
    >
      {/* Background Media (Image or Video) if present */}
      {activeMediaUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {isPlayableVideo ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterUrl}
              preload="metadata"
              playsInline
              {...({ "webkit-playsinline": "true", "x5-playsinline": "true" } as Record<string, string>)}
              loop
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
                setPlaybackError(null);
              }}
              onError={(e) => {
                const err = e.currentTarget.error;
                console.warn("[MediaFrame] Video error:", err?.code, err?.message);
                if (err?.code === 3) {
                  setPlaybackError("DECODE ERROR (REQUIRES 1080P H.264 CUTDOWN)");
                } else if (err?.code === 4) {
                  setPlaybackError("VIDEO FORMAT UNSUPPORTED");
                } else {
                  setPlaybackError("PLAYBACK ERROR");
                }
                setIsPlaying(false);
              }}
              onPlay={() => {
                setIsPlaying(true);
                setPlaybackError(null);
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeMediaUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Subtle contrast overlay: only active when not actively playing */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          )}
        </div>
      )}

      {/* Top Meta Bar */}
      <div
        className={`flex items-center justify-between z-10 pointer-events-none transition-opacity duration-200 ${
          isPlaying && !controlsVisible ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="font-label-mono text-label-mono text-white bg-black/80 px-2 py-1 tracking-widest uppercase border border-[#262626]">
          {aspectRatio}
        </span>
        {slidesCount && (
          <span className="font-label-mono text-label-mono text-primary bg-black/80 px-2 py-1 tracking-widest uppercase font-bold border border-[#262626]">
            1/{slidesCount}
          </span>
        )}
        {!slidesCount && (
          <span className="font-label-mono text-label-mono text-paper-dim tracking-widest uppercase bg-black/70 px-1.5 py-0.5">
            ÖTZI
          </span>
        )}
      </div>

      {/* Center Technical Crosshair & Play Trigger */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* Subtle corner crosshairs */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#262626]" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#262626]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#262626]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#262626]" />

        {/* Play indicator trigger: Rendered when playable video exists and is currently paused.
            If a mobile codec / decode error occurred, render an informative ÖTZI-styled badge. */}
        {isPlayableVideo && !isPlaying && (
          playbackError ? (
            <div className="pointer-events-auto bg-black/95 border border-[#333] p-4 flex flex-col items-center gap-2 max-w-[280px] text-center z-20 shadow-2xl">
              <span className="font-label-mono text-[10px] text-primary uppercase tracking-widest font-bold">
                {playbackError}
              </span>
              <span className="font-label-mono text-[9px] text-paper-dim uppercase tracking-wider leading-relaxed">
                Hardware decoder exceeded on this mobile device. Tap below to retry.
              </span>
              <button
                type="button"
                onClick={togglePlay}
                className="mt-1 bg-surface-container hover:bg-surface-container-high border border-[#444] px-3 py-1 font-label-mono text-[10px] text-white uppercase tracking-widest cursor-pointer transition-colors"
              >
                RETRY PLAYBACK
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                assetType === "SHORT FILM"
                  ? "Play Film with audio"
                  : "Play Reel with audio"
              }
              className="pointer-events-auto bg-black/90 border border-[#262626] hover:border-white px-5 py-2.5 flex items-center gap-2.5 text-white font-label-action text-label-action tracking-widest uppercase transition-colors cursor-pointer select-none z-20 shadow-xl"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 2L12 7L3 12V2Z" />
              </svg>
              <span>
                {assetType === "SHORT FILM" ? "PLAY FILM" : "PLAY REEL"}
              </span>
            </button>
          )
        )}
      </div>

      {/* Bottom Controls Bar: Active during playback */}
      {isPlayableVideo && isPlaying && (
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 pt-6 z-20 flex flex-col gap-2 transition-opacity duration-200 pointer-events-auto ${
            controlsVisible ? "opacity-100" : "opacity-0 hover:opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Timeline Scrubber */}
          <div
            role="slider"
            aria-label="Video scrubber"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={currentTime}
            tabIndex={0}
            onClick={handleSeek}
            className="w-full h-1 bg-[#333] hover:h-2 transition-all cursor-pointer relative"
          >
            <div
              className="h-full bg-primary"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white font-label-mono text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer select-none min-h-[44px] min-w-[44px]"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 1h3v10H2zm5 0h3v10H7z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 1l9 5-9 5V1z" />
                  </svg>
                )}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>

              <span className="text-paper-dim text-[10px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Audio Mute/Unmute toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer select-none min-h-[44px] px-2"
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                    </svg>
                    <span className="text-primary font-bold">MUTED</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span className="text-white">AUDIO ON</span>
                  </>
                )}
              </button>

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-paper-dim hover:text-white transition-colors cursor-pointer select-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Full screen video"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Subtle Platform / Type indicator (hidden during playback when controls are hidden) */}
      {!isPlaying && (
        <div className="flex items-center justify-between text-paper-dim font-label-mono text-label-mono uppercase tracking-widest z-10 pointer-events-none">
          <span className="bg-black/70 px-1.5 py-0.5">{assetType}</span>
          {platform && <span className="bg-black/70 px-1.5 py-0.5">{platform}</span>}
        </div>
      )}
    </div>
  );
}
