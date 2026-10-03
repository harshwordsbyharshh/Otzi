import React from "react";
import type { Metadata } from "next";
import { getAllDisciplines } from "@/lib/data/homepage";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "SERVICES — Five Core Disciplines | ÖTZI",
  description:
    "Explore ÖTZI's five core disciplines: Social Media Management & Marketing, AI Agents, Paid Ad Management, Google Business Profile Management, and SEO Management.",
};

export default function ServicesPage() {
  const disciplines = getAllDisciplines();

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. PAGE HERO
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20"
        aria-labelledby="services-heading"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>CAPABILITIES &amp; ARCHITECTURE</span>
            </div>

            <h1
              id="services-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              FIVE DISCIPLINES.
              <br />
              ZERO DECORATIVE NOISE.
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-7 space-y-4">
                <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0">
                  ÖTZI operates across five integrated creative disciplines designed to build and command social presence. We combine strategic positioning, editorial craft, and format-specific distribution.
                </p>
                <div className="pt-2">
                  <Button variant="primary" href="/contact">
                    BOOK OUR SERVICES
                  </Button>
                </div>
              </div>

              {/* Index of Disciplines */}
              <div className="lg:col-span-5 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <div className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold">
                  DISCIPLINE DIRECTORY
                </div>
                <div className="space-y-2">
                  {disciplines.map((d) => (
                    <a
                      key={d.id}
                      href={`#${d.id}`}
                      className="group flex items-center justify-between border border-[#262626] p-3 bg-surface-container-low hover:border-paper-dim transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-label-mono text-primary font-bold">{d.number}</span>
                        <span className="font-label-action text-white uppercase tracking-wider group-hover:text-primary transition-colors">
                          {d.title}
                        </span>
                      </div>
                      <span className="font-label-mono text-paper-dim group-hover:translate-x-1 group-hover:text-primary transition-all">
                        ↓
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. DETAILED DISCIPLINE SECTIONS
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626]" aria-label="Detailed Capabilities">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 divide-y divide-[#262626]">
          {disciplines.map((discipline) => (
            <div
              key={discipline.id}
              id={discipline.id}
              className="py-16 md:py-24 scroll-mt-24 space-y-8"
            >
              {/* Discipline Header Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-3">
                  <div className="font-label-mono text-headline-md font-extrabold text-primary">
                    {discipline.number}
                  </div>
                  <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                    {discipline.title}
                  </h2>
                  {discipline.subDescription && (
                    <div className="font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
                      {discipline.subDescription}
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-widest block mb-2 font-bold">
                      RELEVANT PLATFORMS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {discipline.platforms?.map((platform, pIdx) => (
                        <span
                          key={pIdx}
                          className="border border-[#262626] px-2.5 py-1 font-label-mono text-[11px] uppercase tracking-wider text-paper-dim bg-surface-container-lowest"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Narrative & Scope */}
                <div className="lg:col-span-8 space-y-6">
                  <p className="font-body-lg text-body-lg text-white leading-relaxed m-0">
                    {discipline.description}
                  </p>
                  {discipline.scope && (
                    <p className="font-body-md text-body-md text-paper-dim leading-relaxed m-0 border-l-2 border-[#262626] pl-4">
                      {discipline.scope}
                    </p>
                  )}

                  {/* Deliverables & Methodology Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Deliverables / Sub-services */}
                    <div className="border border-[#262626] p-5 bg-surface-container-low space-y-3">
                      <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block">
                        {discipline.subServices ? "SUB-SERVICES" : "CORE DELIVERABLES"}
                      </span>
                      <ul className="space-y-2 p-0 m-0 list-none font-label-mono text-xs text-white uppercase tracking-wider">
                        {discipline.subServices ? (
                          discipline.subServices.map((sub, sIdx) => (
                            <li key={sIdx} className="flex items-center gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{sub}</span>
                            </li>
                          ))
                        ) : (
                          discipline.deliverables.map((item, dIdx) => (
                            <li key={dIdx} className="flex items-center gap-2">
                              <span className="text-primary font-bold">+</span>
                              <span>{item}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Methodology */}
                    <div className="border border-[#262626] p-5 bg-surface-container-low space-y-3">
                      <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                        METHODOLOGY &amp; RIGOR
                      </span>
                      <ul className="space-y-2 p-0 m-0 list-none font-body-sm text-xs text-paper-dim leading-relaxed">
                        {discipline.methodology?.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-[#6b6b6b] shrink-0 font-label-mono">—</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          3. ENGAGEMENT DIRECTIVE CTA
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28" aria-label="Capabilities Engagement">
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
                We take on brand engagements across strategy, multi-format content creation, and scheduled distribution.
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
