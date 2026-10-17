import React from "react";
import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/supabase/projects";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "WORK — Selected Productions & Media Suites",
  description:
    "Explore ÖTZI's portfolio of social media management and creative productions spanning vertical reels, editorial carousels, square still assets, and widescreen narrative cuts.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "WORK — Selected Productions & Media Suites | ÖTZI",
    description:
      "Explore ÖTZI's portfolio of social media management and creative productions spanning vertical reels, editorial carousels, square still assets, and widescreen narrative cuts.",
    url: "/work",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkIndexPage() {
  const allProjects = await getPublishedProjects();

  // Defensive deduplication by project ID
  const uniqueProjects = Array.from(
    new Map((allProjects || []).map((p) => [p.id, p])).values()
  );

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20"
        aria-labelledby="work-heading"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Header Accent Motif */}
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>SELECTED WORK</span>
            </div>

            {/* Monumental Page Headline */}
            <h1
              id="work-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              SELECTED WORK.
            </h1>

            {/* Two-Column Editorial Intro & Format Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-7 space-y-4">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  ÖTZI creates social-first content and cinematic brand productions designed to give brands a distinct presence across digital platforms. From individual assets to complete campaign suites, every piece is shaped by strategy, craft, and clear creative direction.
                </p>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed max-w-2xl m-0">
                  Explore the work below to see the formats and platforms behind each production.
                </p>
              </div>

              {/* Format Matrix Overview */}
              <div className="lg:col-span-5 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold">
                  RATIOS &amp; ASSET SUITES
                </div>
                <div className="grid grid-cols-2 gap-2 text-label-mono font-label-mono uppercase">
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">9:16 VERTICAL</span>
                    <span className="text-paper-dim text-[10px]">Reels &amp; short-form motion</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">4:5 EDITORIAL</span>
                    <span className="text-paper-dim text-[10px]">Carousels &amp; editorial compositions</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">1:1 SQUARE</span>
                    <span className="text-paper-dim text-[10px]">Still imagery &amp; grid content</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">16:9 WIDE</span>
                    <span className="text-paper-dim text-[10px]">Cinematic &amp; long-form video</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ASYMMETRIC EDITORIAL PORTFOLIO GRID
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] py-16 md:py-24"
        aria-label="All Work Productions"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-16">
          {/* Section Subhead */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-6 gap-4">
            <div>
              <h2 className="font-display-sm text-display-sm uppercase tracking-tight text-white m-0 font-bold">
                FEATURED WORK
              </h2>
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold mt-1">
                A SELECTION OF RECENT PRODUCTIONS.
              </div>
            </div>
          </div>

          {/* Case A: Zero published projects */}
          {uniqueProjects.length === 0 && (
            <div className="border border-[#262626] p-12 md:p-16 bg-surface-container-low text-center flex flex-col items-center justify-center gap-3">
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
                PRODUCTIONS CURRENTLY IN PREPARATION
              </div>
              <p className="font-body-md text-paper-dim m-0 max-w-xl leading-relaxed">
                The public portfolio is currently being curated. Contact the studio for private client credentials, full reels, or multi-format campaign archives.
              </p>
              <div className="pt-4">
                <Button variant="accent" href="/contact">
                  INQUIRE FOR PRIVATE REPERTOIRE →
                </Button>
              </div>
            </div>
          )}

          {/* Case B: Exactly one published project */}
          {uniqueProjects.length === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <ProjectCard project={uniqueProjects[0]} basePath="work" />
              </div>
            </div>
          )}

          {/* Case C: Exactly two published projects */}
          {uniqueProjects.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <ProjectCard project={uniqueProjects[0]} basePath="work" />
              <ProjectCard project={uniqueProjects[1]} basePath="work" />
            </div>
          )}

          {/* Case D: Exactly three published projects */}
          {uniqueProjects.length === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <ProjectCard project={uniqueProjects[0]} basePath="work" />
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ProjectCard project={uniqueProjects[1]} basePath="work" />
                <ProjectCard project={uniqueProjects[2]} basePath="work" />
              </div>
            </div>
          )}

          {/* Case E: Four or more published projects */}
          {uniqueProjects.length >= 4 && (
            <>
              {/* Primary Asymmetric Cluster: Vertical 9:16 + 4:5 Carousel & 1:1 Still */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <ProjectCard project={uniqueProjects[0]} basePath="work" />
                </div>
                <div className="lg:col-span-7 flex flex-col gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <ProjectCard project={uniqueProjects[1]} basePath="work" />
                    <ProjectCard project={uniqueProjects[2]} basePath="work" />
                  </div>
                  {uniqueProjects[3] && <ProjectCard project={uniqueProjects[3]} basePath="work" />}
                </div>
              </div>

              {/* Hairline Divider between clusters if more than 4 */}
              {uniqueProjects.length > 4 && <HairlineDivider />}

              {/* Secondary Balanced Grid: Projects 4 & 5 */}
              {uniqueProjects.length > 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {uniqueProjects[4] && <ProjectCard project={uniqueProjects[4]} basePath="work" />}
                  {uniqueProjects[5] && <ProjectCard project={uniqueProjects[5]} basePath="work" />}
                </div>
              )}

              {/* Additional Productions Grid: Projects 6+ */}
              {uniqueProjects.length > 6 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-8 border-t border-[#262626]">
                  {uniqueProjects.slice(6).map((project) => (
                    <ProjectCard key={project.id} project={project} basePath="work" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ====================================================================
          3. DIRECT ENGAGEMENT CTA
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28" aria-label="Start a project">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
                <span>START A PROJECT</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white uppercase tracking-tight m-0 font-extrabold leading-none">
                START A PROJECT.
              </h2>
              <HairlineDivider withRunwayArrow />
              <p className="font-body-lg text-body-lg text-paper-dim max-w-2xl m-0 leading-relaxed">
                Have a project in mind? Tell us what you&apos;re building and where you want to take it.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end mt-6 lg:mt-0">
              <Button
                variant="primary"
                href="/contact"
                className="w-full sm:w-auto text-sm px-8 py-4 font-bold"
              >
                START A PROJECT →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
