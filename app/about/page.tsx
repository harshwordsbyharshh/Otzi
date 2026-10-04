import React from "react";
import type { Metadata } from "next";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "ABOUT — Agency Philosophy & Craft Standards",
  description:
    "ÖTZI is a social media management and creative production agency helping brands build a stronger presence across digital platforms through thoughtful direction, consistent execution, and creative production.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "ABOUT — Agency Philosophy & Craft Standards | ÖTZI",
    description:
      "ÖTZI is a social media management and creative production agency helping brands build a stronger presence across digital platforms through thoughtful direction, consistent execution, and creative production.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. ABOUT HERO & MANIFESTO
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20"
        aria-labelledby="about-heading"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>ABOUT ÖTZI</span>
            </div>

            <h1
              id="about-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              BUILT WITH INTENTION.
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-8 space-y-6">
                <p className="font-body-lg text-body-lg text-white leading-relaxed max-w-3xl m-0 font-medium">
                  ÖTZI is a social media management and creative production agency helping brands build a stronger presence across digital platforms. We combine thoughtful direction, consistent execution, and creative production to help brands communicate with clarity.
                </p>
                <p className="font-body-md text-body-md text-paper-dim leading-relaxed max-w-3xl m-0">
                  Our approach is simple: understand the brand, understand the platform, and create work with a clear purpose. We value consistency, attention to detail, and work that feels considered rather than excessive.
                </p>
              </div>

              {/* Our Principles */}
              <div className="lg:col-span-4 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                  OUR PRINCIPLES
                </span>
                <div className="space-y-3 font-label-mono text-xs">
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold uppercase">CLARITY</span>
                      <span className="text-primary font-bold">01</span>
                    </div>
                    <span className="text-paper-dim text-[11px] font-body-sm">
                      Every piece of work should have a clear purpose.
                    </span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold uppercase">CONSISTENCY</span>
                      <span className="text-primary font-bold">02</span>
                    </div>
                    <span className="text-paper-dim text-[11px] font-body-sm">
                      Strong brands are built through consistent execution.
                    </span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold uppercase">CRAFT</span>
                      <span className="text-primary font-bold">03</span>
                    </div>
                    <span className="text-paper-dim text-[11px] font-body-sm">
                      Details matter. We take the time to get them right.
                    </span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold uppercase">DIRECTION</span>
                      <span className="text-primary font-bold">04</span>
                    </div>
                    <span className="text-paper-dim text-[11px] font-body-sm">
                      Good creative starts with knowing where you&apos;re going.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. HOW WE WORK
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="How We Work">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-12">
          <div className="border-b border-[#262626] pb-6">
            <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block mb-1">
              PROCESS
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
              HOW WE WORK
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Step 1 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[260px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  01 //
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  UNDERSTAND
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  We start by understanding the brand, its audience, and what it needs to communicate.
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                CONTEXT BEFORE CREATION
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[260px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  02 //
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  CREATE
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  We develop content and creative work that fits the brand and the platform it lives on.
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                IDEAS WITH PURPOSE
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[260px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  03 //
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  EXECUTE
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  We turn direction into consistent work through careful production, management, and delivery.
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                CONSISTENCY IN EXECUTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. DIRECT ENGAGEMENT CTA STRIP
          ==================================================================== */}
      <section className="w-full bg-black py-20 md:py-28" aria-label="About Engagement CTA">
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
                Have something in mind? Tell us what you need and where you want to go.
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
