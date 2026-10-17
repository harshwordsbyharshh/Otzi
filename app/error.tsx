"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception to client monitoring if available
    console.error("[ÖTZI Application Error]:", error);
  }, [error]);

  return (
    <div className="flex flex-col w-full bg-black min-h-[calc(100vh-72px)] justify-center">
      <section className="w-full py-20 md:py-32" aria-labelledby="error-heading">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>SYSTEM NOTICE</span>
            </div>

            <div className="space-y-4">
              <h1
                id="error-heading"
                className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 leading-none select-none font-extrabold"
              >
                UNEXPECTED SYSTEM INTERRUPTION.
              </h1>
              <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0 pt-2">
                An unexpected condition was encountered during data retrieval or page compilation. You can retry the request or return to the main repertoire.
              </p>
              {error.digest && (
                <div className="font-label-mono text-xs text-[#666] tracking-widest uppercase">
                  INCIDENT REF: {error.digest}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => reset()}
                className="font-label-action text-label-action uppercase tracking-widest px-8 py-4 bg-primary text-white hover:bg-white hover:text-black transition-colors font-bold cursor-pointer"
              >
                RETRY REQUEST
              </button>
              <Button variant="secondary" href="/">
                RETURN TO HOMEPAGE
              </Button>
              <ArrowLink href="/work" color="white">
                VIEW WORK
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
