import React from "react";
import Link from "next/link";
import { SelectedProject } from "@/types/homepage";
import { MediaFrame } from "@/components/media/MediaFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";

interface ProjectCardProps {
  project: SelectedProject;
  basePath?: "work" | "case-studies";
  className?: string;
}

export function ProjectCard({
  project,
  basePath = "case-studies",
  className = "",
}: ProjectCardProps) {
  const targetHref = `/${basePath}/${project.slug}`;

  return (
    <div
      className={`flex flex-col border border-[#262626] p-4 bg-surface-container-low group hover:border-paper-dim transition-colors ${className}`}
    >
      {/* Media Well */}
      <Link href={targetHref} className="block">
        <MediaFrame
          aspectRatio={project.aspectRatio}
          assetType={project.assetType}
          platform={project.platform}
          slidesCount={project.slidesCount}
          thumbnailUrl={project.thumbnailUrl}
          title={project.title}
        />
      </Link>

      {/* Metadata & Title Block */}
      <div className="pt-4 flex flex-col gap-1 border-t border-[#262626] mt-4">
        <div className="flex items-center justify-between text-paper-dim font-label-mono text-label-mono uppercase tracking-widest">
          <span>CLIENT: {project.client}</span>
          <span>YEAR: {project.year}</span>
        </div>
        <Link href={targetHref}>
          <h3 className="font-title-sm text-title-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors mt-1 mb-0">
            {project.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1 text-paper-dim font-label-mono text-label-mono uppercase tracking-widest">
          <span>TYPE: {project.assetType}</span>
          <span>PLATFORM: {project.platform}</span>
        </div>
        <div className="pt-2 border-t border-[#262626] mt-2">
          <ArrowLink href={targetHref} color="primary">
            {basePath === "work" ? "VIEW PROJECT" : "EXPLORE CASE STUDY"}
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}
