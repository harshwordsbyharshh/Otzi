"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-black border-t border-[#262626] overflow-hidden">
      <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 pt-16 md:pt-24 pb-8">
        {/* Top Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 border-b border-[#262626] pb-12 mb-12">
          {/* Inquiries */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div className="font-label-mono text-label-mono text-paper-dim uppercase tracking-widest font-bold">
              INQUIRIES
            </div>
            <a
              href="mailto:otzimagency@gmail.com"
              className="font-headline-md text-headline-md uppercase text-white hover:text-primary transition-colors font-bold tracking-tight inline-block"
            >
              OTZIMAGENCY@GMAIL.COM
            </a>
          </div>

          {/* Networks */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div className="font-label-mono text-label-mono text-paper-dim uppercase tracking-widest font-bold">
              NETWORKS
            </div>
            <div className="flex flex-col gap-2 font-label-action text-label-action uppercase">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper-dim hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <span>INSTAGRAM</span>
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper-dim hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <span>LINKEDIN</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Back to top & Studio info */}
          <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end space-y-4">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 font-label-action text-label-action uppercase text-white hover:text-primary border border-[#262626] hover:border-white px-4 py-2 transition-colors cursor-pointer select-none min-h-[44px]"
            >
              <span>BACK TO TOP</span>
              <span aria-hidden="true">↑</span>
            </button>
            <div className="flex flex-col items-start md:items-end gap-2.5">
              <Link href="/" aria-label="ÖTZI Agency Home" className="block select-none">
                <Image
                  src="/logo.png"
                  alt="ötzi"
                  width={1024}
                  height={409}
                  className="h-6 w-auto object-contain"
                />
              </Link>
              <div className="font-label-mono text-label-mono text-paper-dim uppercase tracking-widest">
                ÖTZI SOCIAL &amp; CREATIVE AGENCY
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Disciplines */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-paper-dim font-label-mono text-label-mono uppercase tracking-widest gap-4">
          <div>© 2026 ÖTZI CREATIVE &amp; SOCIAL PRODUCTION. ALL RIGHTS RESERVED.</div>
          <div>CREATIVE DIRECTION &amp; PRODUCTION</div>
        </div>
      </div>

      {/* Signature Massive Cropped Bleed Wordmark */}
      <div
        className="w-full select-none pointer-events-none overflow-hidden leading-none"
        aria-hidden="true"
      >
        <div className="font-display-xl text-[18vw] leading-[0.78] font-extrabold uppercase tracking-tighter text-[#181818] text-center translate-y-[15%]">
          ÖTZI
        </div>
      </div>
    </footer>
  );
}
