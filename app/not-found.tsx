import React from "react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The requested page could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col w-full bg-black min-h-[calc(100vh-72px)] justify-center">
      <section className="w-full py-20 md:py-32" aria-labelledby="not-found-heading">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>ERROR 404</span>
            </div>

            <div className="space-y-4">
              <h1
                id="not-found-heading"
                className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 leading-none select-none font-extrabold"
              >
                PAGE NOT FOUND.
              </h1>
              <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0 pt-2">
                The requested page does not exist. Check the URL or return to the homepage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#262626]">
              <Button variant="primary" href="/">
                RETURN TO HOMEPAGE
              </Button>
              <ArrowLink href="/work" color="white">
                EXPLORE WORK
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
