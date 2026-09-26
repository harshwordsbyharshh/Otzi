import React from "react";
import { AspectRatio, AssetType, PlatformType } from "@/types/homepage";

interface MediaFrameProps {
  aspectRatio: AspectRatio;
  assetType: AssetType;
  platform?: PlatformType;
  slidesCount?: number;
  thumbnailUrl?: string;
  title: string;
  className?: string;
}

export function MediaFrame({
  aspectRatio,
  assetType,
  platform,
  slidesCount,
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

  return (
    <div
      aria-label={title}
      className={`relative w-full ${getAspectClass()} bg-[#090909] border border-[#262626] overflow-hidden flex flex-col justify-between p-4 group select-none ${className}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between z-10 pointer-events-none">
        <span className="font-label-mono text-label-mono text-white bg-black/80 px-2 py-1 tracking-widest uppercase border border-[#262626]">
          {aspectRatio}
        </span>
        {slidesCount && (
          <span className="font-label-mono text-label-mono text-primary bg-black/80 px-2 py-1 tracking-widest uppercase font-bold border border-[#262626]">
            1/{slidesCount}
          </span>
        )}
        {!slidesCount && (
          <span className="font-label-mono text-label-mono text-paper-dim tracking-widest uppercase">
            ÖTZI
          </span>
        )}
      </div>

      {/* Center Technical Crosshair / Play Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Subtle corner crosshairs */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#262626]" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#262626]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#262626]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#262626]" />

        {/* Action button trigger */}
        <div className="bg-black/90 border border-[#262626] px-4 py-2 flex items-center gap-2 text-white font-label-action text-label-action tracking-widest uppercase group-hover:bg-primary group-hover:border-primary transition-colors">
          {(assetType === "REEL" || assetType === "SHORT FILM") && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 2L12 7L3 12V2Z" />
            </svg>
          )}
          <span>
            {assetType === "REEL"
              ? "PLAY REEL"
              : assetType === "SHORT FILM"
              ? "PLAY FILM"
              : assetType === "CAROUSEL"
              ? "VIEW CAROUSEL"
              : "EXPLORE STILL"}
          </span>
        </div>
      </div>

      {/* Bottom Subtle Platform / Type indicator */}
      <div className="flex items-center justify-between text-paper-dim font-label-mono text-label-mono uppercase tracking-widest z-10 pointer-events-none">
        <span>{assetType}</span>
        {platform && <span>{platform}</span>}
      </div>
    </div>
  );
}
