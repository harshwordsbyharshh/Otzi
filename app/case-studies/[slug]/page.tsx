import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/data/homepage";
import { MediaFrame } from "@/components/media/MediaFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";

interface CaseStudyDetailPageProps {
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
}: CaseStudyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Case Study Not Found | ÖTZI",
    };
  }

  return {
    title: `${project.title} — Case Study Brief | ÖTZI`,
    description:
      project.summary ||
      `Case study brief for ${project.title}, exploring format architecture and campaign delivery across ${project.platform}.`,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: CaseStudyDetailPageProps) {
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
          1. BREADCRUMB NAVIGATION
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-6" aria-label="Case Study Breadcrumbs">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between">
          <ArrowLink href="/case-studies" direction="left" color="dim">
            CASE STUDIES ARCHIVE
          </ArrowLink>
          <div className="font-label-mono text-label-mono text-paper-dim uppercase tracking-widest hidden sm:block">
            ANALYSIS BRIEF — {project.assetType}
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. CASE STUDY HEADER & METADATA
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] pt-12 md:pt-16 pb-12" aria-labelledby="case-study-title">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>CASE STUDY BRIEF</span>
            </div>

            <h1
              id="case-study-title"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-5xl leading-none select-none"
            >
              {project.title}
            </h1>
          </div>

          {/* Factual Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-[#262626] pt-8">
            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                CLIENT
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.client}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                YEAR
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.year}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                FORMAT
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.aspectRatio}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                ASSET TYPE
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.assetType}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                PLATFORM
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block">
                {project.platform}
              </span>
            </div>

            <div className="border border-[#262626] p-4 bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-1.5 mb-2">
                DISCIPLINE
              </span>
              <span className="font-label-action text-white uppercase tracking-wider font-bold block truncate">
                {project.discipline || "SOCIAL MEDIA STRATEGY"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. HERO MEDIA FRAME
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16" aria-label="Primary Asset Frame">
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
              <span>DOCUMENTED PRODUCTION ASSET</span>
              <span>{project.aspectRatio} &mdash; {project.assetType}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CASE STUDY NARRATIVE & DELIVERABLES
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Case Study Narrative">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-4">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block">
                  PROJECT SUMMARY
                </span>
                <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                  CHALLENGE &amp; STRATEGIC APPROACH
                </h2>
                <p className="font-body-lg text-body-lg text-white leading-relaxed m-0 border-l-2 border-primary pl-4 py-1">
                  {project.summary}
                </p>
              </div>

              {project.context && (
                <div className="space-y-3 border-t border-[#262626] pt-6">
                  <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-semibold">
                    CREATIVE DIRECTION &amp; AUDIENCE RECEPTION
                  </h3>
                  <p className="font-body-md text-body-md text-paper-dim leading-relaxed m-0">
                    {project.context}
                  </p>
                </div>
              )}

              {project.execution && (
                <div className="space-y-3 border-t border-[#262626] pt-6">
                  <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-semibold">
                    PLATFORM DEPLOYMENT
                  </h3>
                  <p className="font-body-md text-body-md text-paper-dim leading-relaxed m-0">
                    {project.execution}
                  </p>
                </div>
              )}
            </div>

            {/* Right Deliverables Spec */}
            <div className="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-[#262626] pt-8 lg:pt-0 lg:pl-8">
              {/* Deliverables List */}
              <div className="space-y-4">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                  PRODUCTION DELIVERABLES
                </span>
                <div className="space-y-2">
                  {project.deliverables?.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-[#262626] p-3 font-label-mono text-label-mono uppercase tracking-wider text-white bg-surface-container-low flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <span className="text-paper-dim font-bold">+</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. MULTI-FRAME MEDIA SEQUENCE SHOWCASE
          ==================================================================== */}
      {project.mediaSequence && project.mediaSequence.length > 0 && (
        <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Asset Sequence">
          <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-6 gap-4">
              <div>
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary block mb-1 font-bold">
                  MEDIA BREAKDOWN
                </span>
                <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                  CAMPAIGN ASSET SUITE
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
          6. NEXT CASE STUDY NAVIGATION
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626]" aria-label="Case Study Navigation">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-[#262626] p-6 bg-surface-container-low">
            <div className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
                PREVIOUS BRIEF
              </span>
              <ArrowLink href={`/case-studies/${prevProject.slug}`} direction="left" color="white">
                {prevProject.title}
              </ArrowLink>
            </div>

            <div className="text-center border-y md:border-y-0 md:border-x border-[#262626] py-4 md:py-0">
              <Link
                href="/case-studies"
                className="font-label-action text-label-action uppercase tracking-widest text-white hover:text-primary transition-colors border-b border-primary pb-1"
              >
                INDEX / CASE STUDIES
              </Link>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
                NEXT BRIEF
              </span>
              <ArrowLink href={`/case-studies/${nextProject.slug}`} direction="right" color="white">
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
              COLLABORATION
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
              REQUEST A CAMPAIGN PROPOSAL.
            </h2>
            <p className="font-body-md text-body-md text-paper-dim m-0">
              Open for brand commissions, full social ecosystem design, dynamic motion production, and editorial direction.
            </p>
          </div>
          <Button variant="primary" href="/contact" className="px-8 py-4 text-sm font-bold shrink-0">
            BOOK OUR SERVICES
          </Button>
        </div>
      </section>
    </div>
  );
}
