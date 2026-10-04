import React from "react";
import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data/homepage";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "CASE STUDIES — Production Briefs & Formats",
  description:
    "Explore ÖTZI case studies detailing creative direction, multi-format media execution, and platform delivery across social media and digital channels.",
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "CASE STUDIES — Production Briefs & Formats | ÖTZI",
    description:
      "Explore ÖTZI case studies detailing creative direction, multi-format media execution, and platform delivery across social media and digital channels.",
    url: "/case-studies",
  },
};

export default function CaseStudiesPage() {
  const allProjects = getAllProjects();

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20"
        aria-labelledby="case-studies-heading"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>CASE STUDIES</span>
            </div>

            <h1
              id="case-studies-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              THE WORK BEHIND THE WORK.
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-8 space-y-4">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  A closer look at selected ÖTZI projects — the work, the creative approach, and the execution behind each production.
                </p>
              </div>

              {/* Case Study Index */}
              <div className="lg:col-span-4 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-white font-bold block">
                  CASE STUDY INDEX
                </span>
                <p className="font-body-sm text-body-sm text-paper-dim m-0 leading-relaxed text-xs">
                  Explore selected ÖTZI projects and the work behind each production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. CASE STUDIES EDITORIAL LISTING
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Case Study Listings">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#262626] pb-6 gap-4">
            <div>
              <h2 className="font-display-sm text-display-sm uppercase tracking-tight text-white m-0 font-bold">
                SELECTED CASE STUDIES
              </h2>
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold mt-1">
                EXPLORE THE WORK IN DETAIL.
              </div>
            </div>
          </div>

          {/* Grid Layout matching the editorial Stitch composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {allProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                basePath="case-studies"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. DIRECT ENGAGEMENT CTA
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28" aria-label="Case Studies Engagement">
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
                Tell us what you need and where you want to take it.
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
