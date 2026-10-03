import React from "react";
import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/supabase/projects";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "WORK — Selected Productions & Media Suites | ÖTZI",
  description:
    "Explore ÖTZI's portfolio of social media management and creative productions spanning vertical reels, editorial carousels, square still assets, and widescreen narrative cuts.",
};

export default async function WorkIndexPage() {
  const allProjects = await getPublishedProjects();

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
              <span>PORTFOLIO INDEX</span>
            </div>

            {/* Monumental Page Headline */}
            <h1
              id="work-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              SELECTED PRODUCTIONS &amp; CAMPAIGN SUITES.
            </h1>

            {/* Two-Column Editorial Intro & Format Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-7 space-y-4">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  ÖTZI engineers social-first media assets and cinematic brand productions. Every format is built to command attention across dynamic feeds through aggressive contrast, monolithic typography, and disciplined craft.
                </p>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed max-w-2xl m-0">
                  Select a production below to inspect the format breakdown, creative direction, and multi-channel asset sequence.
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
                    <span className="text-paper-dim text-[10px]">REELS &amp; KINETIC MOTION</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">4:5 EDITORIAL</span>
                    <span className="text-paper-dim text-[10px]">CAROUSELS &amp; MONOGRAPHS</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">1:1 SQUARE</span>
                    <span className="text-paper-dim text-[10px]">STILLS &amp; GRID POSTS</span>
                  </div>
                  <div className="border border-[#262626] p-2.5 bg-surface-container-low">
                    <span className="text-white block font-bold">16:9 WIDE</span>
                    <span className="text-paper-dim text-[10px]">CINEMATIC &amp; BROADCAST</span>
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
          {/* Section Subhead & Count */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-6 gap-4">
            <div>
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary block mb-1 font-bold">
                REPERTOIRE
              </span>
              <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                FEATURED WORK ARCHIVE
              </h2>
            </div>
            <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim">
              TOTAL PRODUCTIONS: {allProjects.length.toString().padStart(2, "0")}
            </div>
          </div>

          {/* Primary Asymmetric Cluster: Vertical 9:16 + 4:5 Carousel & 1:1 Still */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              {allProjects[0] && <ProjectCard project={allProjects[0]} basePath="work" />}
            </div>
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {allProjects[1] && <ProjectCard project={allProjects[1]} basePath="work" />}
                {allProjects[2] && <ProjectCard project={allProjects[2]} basePath="work" />}
              </div>
              {allProjects[3] && <ProjectCard project={allProjects[3]} basePath="work" />}
            </div>
          </div>

          {/* Hairline Divider between clusters */}
          <HairlineDivider />

          {/* Secondary Balanced Grid: Remaining Productions */}
          {allProjects.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {allProjects[4] && <ProjectCard project={allProjects[4]} basePath="work" />}
              {allProjects[5] && <ProjectCard project={allProjects[5]} basePath="work" />}
            </div>
          )}

          {/* Additional Productions Grid */}
          {allProjects.length > 6 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-8 border-t border-[#262626]">
              {allProjects.slice(6).map((project) => (
                <ProjectCard key={project.id} project={project} basePath="work" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          3. DIRECT ENGAGEMENT CTA
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28" aria-label="Commission CTA">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
                <span>BOOK OUR SERVICES</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white uppercase tracking-tight m-0 font-extrabold leading-none">
                BOOK OUR SERVICES.
              </h2>
              <HairlineDivider withRunwayArrow />
              <p className="font-body-lg text-body-lg text-paper-dim max-w-2xl m-0 leading-relaxed">
                Open for brand commissions, full social ecosystem design, dynamic motion production, and editorial direction.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end mt-6 lg:mt-0">
              <Button
                variant="primary"
                href="/contact"
                className="w-full sm:w-auto text-sm px-8 py-4 font-bold"
              >
                BOOK OUR SERVICES
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
