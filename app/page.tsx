import React from "react";
import { Button } from "@/components/ui/Button";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { disciplinesData, selectedProjectsData } from "@/lib/data/homepage";
import { getPublishedProjects } from "@/lib/supabase/projects";

export default async function HomePage() {
  const publishedProjects = await getPublishedProjects();
  const allProjects =
    publishedProjects && publishedProjects.length > 0
      ? publishedProjects
      : selectedProjectsData;

  const reelProject =
    allProjects.find((p) => p.aspectRatio === "9:16") || allProjects[0];
  const carouselProject =
    allProjects.find((p) => p.aspectRatio === "4:5") ||
    allProjects[1] ||
    allProjects[0];
  const squareProject =
    allProjects.find((p) => p.aspectRatio === "1:1") ||
    allProjects[2] ||
    allProjects[0];
  const cinemaProject =
    allProjects.find((p) => p.aspectRatio === "16:9") ||
    allProjects[3] ||
    allProjects[0];

  return (
    <div className="flex flex-col w-full bg-black flex-1">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626]" aria-label="Agency Overview">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Header Accent Motif */}
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>ÖTZI</span>
            </div>

            {/* Monumental Editorial Headline */}
            <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none">
              WE BUILD BRANDS THAT MOVE.
            </h1>

            {/* Supporting Line */}
            <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold">
              SOCIAL MEDIA MANAGEMENT &amp; CREATIVE PRODUCTION.
            </div>

            {/* Asymmetric Split Grid: Description & Capabilities */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 md:pt-12 border-t border-[#262626] items-start">
              <div className="lg:col-span-7 space-y-6">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  ÖTZI builds and manages the digital presence brands need to stay visible, relevant, and moving forward — from social strategy and content production to paid campaigns, SEO, and AI-powered systems.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button variant="accent" href="/contact">
                    START A PROJECT →
                  </Button>
                  <Button variant="secondary" href="/work">
                    EXPLORE WORK
                  </Button>
                </div>
              </div>

              {/* Right Specifications & Discipline Tags */}
              <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold">
                  OUR EXPERTISE
                </div>
                <div className="flex flex-wrap gap-2">
                  {disciplinesData.map((d) => (
                    <span
                      key={d.id}
                      className="border border-[#262626] px-3 py-1.5 font-label-mono text-label-mono uppercase text-paper-dim tracking-widest bg-surface-container-low"
                    >
                      {d.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. SELECTED WORK (ASYMMETRIC MULTI-FORMAT EDITORIAL GRID)
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Selected Work">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#262626] pb-6 gap-4">
            <div>
              <h2 className="font-display-sm text-display-sm uppercase tracking-tight text-white m-0 font-bold">
                SELECTED WORK.
              </h2>
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold mt-2">
                RECENT PRODUCTIONS.
              </div>
            </div>
            <ArrowLink href="/work" color="white">
              VIEW ALL WORK
            </ArrowLink>
          </div>

          {/* Asymmetric Stitch Layout: 9:16 Column + Right Media Cluster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 9:16 Vertical Reel Frame (Col 1-5) */}
            <div className="lg:col-span-5">
              <ProjectCard project={reelProject} basePath="work" />
            </div>

            {/* Right Cluster (Col 6-12) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Row of 4:5 Carousel and 1:1 Square Frame */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ProjectCard project={carouselProject} basePath="work" />
                <ProjectCard project={squareProject} basePath="work" />
              </div>

              {/* 16:9 Widescreen Cut Frame */}
              <ProjectCard project={cinemaProject} basePath="work" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. CAPABILITIES / SERVICES (FIVE DISCIPLINES)
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Capabilities">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 flex flex-col gap-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#262626] pb-6 gap-4">
            <div>
              <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary block mb-2 font-bold">
                EXPERTISE
              </span>
              <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                OUR EXPERTISE.
              </h2>
            </div>
          </div>

          {/* 5-Discipline Editorial Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {disciplinesData.map((d) => (
              <div
                key={d.id}
                className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between hover:border-paper-dim transition-colors group min-h-[260px]"
              >
                <div>
                  <div className="font-label-mono text-label-mono text-primary uppercase tracking-widest font-bold mb-3">
                    {d.number} {"//"}
                  </div>
                  <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight group-hover:text-primary transition-colors m-0 mb-3">
                    {d.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-paper-dim m-0 leading-relaxed mb-6">
                    {d.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#262626] space-y-1">
                  {d.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="font-label-mono text-[10px] text-paper-dim tracking-wider uppercase"
                    >
                      + {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. MANIFESTO / ABOUT MOMENT
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-20 md:py-32" aria-label="Manifesto">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-8 md:gap-12">
            {/* Tag */}
            <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              MANIFESTO
            </div>

            {/* Monumental Statement */}
            <h2 className="font-headline-lg text-headline-lg uppercase text-white tracking-tight m-0 max-w-5xl leading-none">
              GOOD CONTENT ISN&apos;T ENOUGH. IT NEEDS DIRECTION.
            </h2>

            {/* Split Narrative & Studio Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-7 space-y-6">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  ÖTZI brings strategy, creative production and digital execution into one system — giving brands a clearer direction and a stronger presence across the channels that matter.
                </p>
                <div className="pt-4">
                  <ArrowLink href="/about" color="white">
                    ABOUT THE STUDIO
                  </ArrowLink>
                </div>
              </div>

              {/* Tenets Grid */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-4 font-label-mono text-label-mono uppercase border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <div className="pb-3 border-b border-[#262626]">
                  <span className="text-paper-dim block mb-1">01 // DISCIPLINE</span>
                  <span className="text-white tracking-wider block font-bold">STRATEGY BEFORE EXECUTION.</span>
                </div>
                <div className="pb-3 border-b border-[#262626]">
                  <span className="text-paper-dim block mb-1">02 // APPROACH</span>
                  <span className="text-white tracking-wider block font-bold">CREATIVE WITH PURPOSE.</span>
                </div>
                <div>
                  <span className="text-paper-dim block mb-1">03 // STANDARDS</span>
                  <span className="text-white tracking-wider block font-bold">CONSISTENCY AT EVERY TOUCHPOINT.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. DIRECT ENGAGEMENT CTA
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28 overflow-hidden" aria-label="Contact Engagement">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
                <span>START A PROJECT</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white uppercase tracking-tight m-0 font-extrabold leading-none">
                LET&apos;S BUILD SOMETHING THAT MOVES.
              </h2>

              {/* Signature Runway Hairline Arrow */}
              <HairlineDivider withRunwayArrow />

              <p className="font-body-lg text-body-lg text-paper-dim max-w-2xl m-0 leading-relaxed">
                Tell us what you&apos;re building, where you&apos;re stuck, or where you want to go. We&apos;ll take it from there.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end mt-6 lg:mt-0">
              <Button
                variant="accent"
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
