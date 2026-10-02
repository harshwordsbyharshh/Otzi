import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/data/homepage";
import { MediaFrame } from "@/components/media/MediaFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";

interface WorkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | ÖTZI",
    };
  }

  return {
    title: `${project.title} — Production Details | ÖTZI`,
    description:
      project.summary ||
      `Explore ${project.title}, an ÖTZI ${project.assetType} production engineered for ${project.platform} in ${project.aspectRatio} format.`,
  };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = getAllProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];
  const prevProject =
    allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. TOP NAVIGATION / BREADCRUMB
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-6" aria-label="Breadcrumb Navigation">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between">
          <ArrowLink href="/work" direction="left" color="dim">
            ALL PRODUCTIONS
          </ArrowLink>
          <div className="font-label-mono text-label-mono text-paper-dim uppercase tracking-widest hidden sm:block">
            {project.aspectRatio} FORMAT — {project.platform}
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. PROJECT HERO & FACTUAL METADATA
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] pt-12 md:pt-16 pb-12" aria-labelledby="project-title">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>PROJECT SPECIFICATION</span>
            </div>

            <h1
              id="project-title"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-5xl leading-none select-none"
            >
              {project.title}
            </h1>
          </div>

          {/* Factual Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-[#262626] pt-8">
            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                CLIENT
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.client}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                YEAR
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.year}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                ASPECT RATIO
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.aspectRatio}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                ASSET TYPE
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.assetType}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                PLATFORM
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.platform}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
                DISCIPLINE
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block truncate">
                {project.discipline || "CREATIVE"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. PRIMARY HERO MEDIA DISPLAY
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16" aria-label="Hero Media Frame">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="border border-[#262626] p-4 md:p-8 bg-surface-container-low">
            <MediaFrame
              aspectRatio={project.aspectRatio}
              assetType={project.assetType}
              platform={project.platform}
              slidesCount={project.slidesCount}
              title={project.title}
              className="max-h-[75vh] w-auto mx-auto shadow-none"
            />
            <div className="flex items-center justify-between pt-4 border-t border-[#262626] mt-4 font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
              <span>PRIMARY PRODUCTION CUT</span>
              <span>{project.aspectRatio} &mdash; {project.assetType}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. STRUCTURED SUMMARY & STRATEGIC CONTEXT
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Project Summary">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Narrative: Summary, Context, Execution */}
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-4">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block">
                  PROJECT SUMMARY
                </span>
                <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                  DIRECTIVE &amp; PRODUCTION EXECUTION
                </h2>
                <p className="font-body-lg text-body-lg text-white leading-relaxed m-0 border-l-2 border-primary pl-4 py-1">
                  {project.summary}
                </p>
              </div>

              {project.context && (
                <div className="space-y-3 border-t border-[#262626] pt-6">
                  <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-semibold">
                    STRATEGIC CONTEXT
                  </h3>
                  <p className="font-body-md text-body-md text-paper-dim leading-relaxed m-0">
                    {project.context}
                  </p>
                </div>
              )}

              {project.execution && (
                <div className="space-y-3 border-t border-[#262626] pt-6">
                  <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-semibold">
                    TECHNICAL EXECUTION
                  </h3>
                  <p className="font-body-md text-body-md text-paper-dim leading-relaxed m-0">
                    {project.execution}
                  </p>
                </div>
              )}
            </div>

            {/* Right Specification Block: Deliverables & Telemetry Note */}
            <div className="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-[#262626] pt-8 lg:pt-0 lg:pl-8">
              <div className="space-y-4">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                  DELIVERABLE SPECIFICATIONS
                </span>
                <div className="space-y-2">
                  {project.deliverables?.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-[#262626] p-3 font-label-mono text-label-mono uppercase tracking-wider text-white bg-surface-container-low flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <span className="text-primary font-bold">✓</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Production Pipeline Notice */}
              <div className="border border-[#262626] p-4 bg-surface-container-lowest space-y-2">
                <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-widest block font-bold">
                  DATA INTEGRATION NOTICE
                </span>
                <p className="font-body-sm text-body-sm text-paper-dim m-0 leading-relaxed text-xs">
                  Production telemetry and live engagement metrics for this project will be integrated from verified client telemetry streams in future development phases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. MULTI-FORMAT MEDIA SEQUENCE SHOWCASE
          ==================================================================== */}
      {project.mediaSequence && project.mediaSequence.length > 0 && (
        <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Media Sequence">
          <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-6 gap-4">
              <div>
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary block mb-1 font-bold">
                  ASSET BREAKDOWN
                </span>
                <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                  MULTI-FORMAT SEQUENCE
                </h2>
              </div>
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
                FRAMES: {project.mediaSequence.length.toString().padStart(2, "0")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {project.mediaSequence.map((item) => (
                <div
                  key={item.id}
                  className="border border-[#262626] p-4 bg-surface-container-low flex flex-col gap-3 group hover:border-paper-dim transition-colors"
                >
                  <MediaFrame
                    aspectRatio={item.aspectRatio}
                    assetType={item.assetType}
                    title={item.caption}
                  />
                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between font-label-mono text-label-mono text-paper-dim uppercase tracking-wider">
                    <span>{item.caption}</span>
                    <span>{item.aspectRatio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          6. PROJECT NAVIGATION BAR
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626]" aria-label="Project Navigation">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-[#262626] p-6 bg-surface-container-low">
            {/* Previous Project Link */}
            <div className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
                PREVIOUS PRODUCTION
              </span>
              <ArrowLink href={`/work/${prevProject.slug}`} direction="left" color="white">
                {prevProject.title}
              </ArrowLink>
            </div>

            {/* Work Index Center Anchor */}
            <div className="text-center border-y md:border-y-0 md:border-x border-[#262626] py-4 md:py-0">
              <Link
                href="/work"
                className="font-label-action text-label-action uppercase tracking-widest text-white hover:text-primary transition-colors border-b border-primary pb-1"
              >
                INDEX / ALL WORK
              </Link>
            </div>

            {/* Next Project Link */}
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
                NEXT PRODUCTION
              </span>
              <ArrowLink href={`/work/${nextProject.slug}`} direction="right" color="white">
                {nextProject.title}
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. DIRECT ENGAGEMENT CTA STRIP
          ==================================================================== */}
      <section className="w-full bg-black py-20" aria-label="Direct Engagement">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-[#262626] p-8 md:p-12 bg-surface-container-low">
          <div className="space-y-2 max-w-2xl">
            <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block">
              ENGAGEMENT
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
              COMMISSION A SIMILAR PRODUCTION.
            </h2>
            <p className="font-body-md text-body-md text-paper-dim m-0">
              Open for selective brand commissions, multi-format media production, and social campaign direction.
            </p>
          </div>
          <Button variant="primary" href="/contact" className="px-8 py-4 text-sm font-bold shrink-0">
            START A PROJECT
          </Button>
        </div>
      </section>
    </div>
  );
}
