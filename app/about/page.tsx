import React from "react";
import type { Metadata } from "next";
import { HairlineDivider } from "@/components/ui/HairlineDivider";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "ABOUT — Agency Philosophy & Craft Standards | ÖTZI",
  description:
    "ÖTZI is a social media management and creative production agency engineered for cultural velocity, disciplined craft, and cross-platform narrative coherence.",
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
              <span>AGENCY POSTURE</span>
            </div>

            <h1
              id="about-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              THE FEED DEMANDS FRICTION,
              <br />
              NOT DECORATIVE NOISE.
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[#262626] items-start">
              <div className="lg:col-span-8 space-y-6">
                <p className="font-body-lg text-body-lg text-white leading-relaxed max-w-3xl m-0 font-medium">
                  ÖTZI is a social media management and creative production agency. We provide strategic direction, content creation, and multi-format campaign execution for brands.
                </p>
                <p className="font-body-md text-body-md text-paper-dim leading-relaxed max-w-3xl m-0">
                  ÖTZI operates at the intersection of editorial authority and social production—treating digital content with craft, structure, and intentional visual direction. In an era where algorithmic feeds favor mindless volume and homogeneous styling, we produce assets engineered with friction, typographic weight, and unmistakable point of view.
                </p>
              </div>

              {/* Core Tenets Checklist */}
              <div className="lg:col-span-4 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-[#262626] pt-6 lg:pt-0 lg:pl-8">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                  AGENCY PRINCIPLES
                </span>
                <div className="space-y-2 text-label-mono font-label-mono uppercase text-xs">
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex items-center justify-between">
                    <span className="text-white font-bold">CRAFT OVER NOISE</span>
                    <span className="text-primary">01</span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex items-center justify-between">
                    <span className="text-white font-bold">PLATFORM-NATIVE RIGOR</span>
                    <span className="text-primary">02</span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex items-center justify-between">
                    <span className="text-white font-bold">MONOLITHIC PRECISION</span>
                    <span className="text-primary">03</span>
                  </div>
                  <div className="border border-[#262626] p-3 bg-surface-container-low flex items-center justify-between">
                    <span className="text-white font-bold">COHERENT ARCHITECTURE</span>
                    <span className="text-primary">04</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. EDITORIAL PILLARS / HOW WE OPERATE
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Editorial Pillars">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 space-y-12">
          <div className="border-b border-[#262626] pb-6">
            <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block mb-1">
              OPERATIONAL STANDARDS
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
              THE ÖTZI OPERATING MODEL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Pillar 1 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[300px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  PILLAR 01
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  EDITORIAL BRUTALISM
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  We discard decorative softness—no gradient washes, no ambient blurs, no pill-shaped containers. Every pixel aligns to structural hairlines, razor-sharp 90-degree perimeters, and pitch-black planes.
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                TACTILE VISUAL AUTHORITY
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[300px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  PILLAR 02
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  NATIVE FORMAT ARCHITECTURE
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  Content must respect the physical constraints of native viewports. We calibrate compositions specifically for vertical reels (9:16), editorial monographs (4:5), high-impact stills (1:1), and widescreen cuts (16:9).
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                SCREEN-SPECIFIC DISCIPLINE
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[300px] space-y-6">
              <div className="space-y-3">
                <span className="font-label-mono text-primary font-bold text-sm block">
                  PILLAR 03
                </span>
                <h3 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                  COMMISSIONED INTENT
                </h3>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0">
                  Every asset has a singular strategic purpose within a broader distribution cadence. We align publishing velocity with long-term brand equity, ensuring every broadcast strengthens brand conviction.
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                STRATEGIC COHERENCE
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
                <span>INITIATE COLLABORATION</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white uppercase tracking-tight m-0 font-extrabold leading-none">
                START A PROJECT.
              </h2>
              <HairlineDivider withRunwayArrow />
              <p className="font-body-lg text-body-lg text-paper-dim max-w-2xl m-0 leading-relaxed">
                Open for brand commissions, ongoing social ecosystem management, dynamic motion infrastructure, and creative production.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end mt-6 lg:mt-0">
              <Button
                variant="primary"
                href="/contact"
                className="w-full sm:w-auto text-sm px-8 py-4 font-bold"
              >
                INITIATE DIALOGUE
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
