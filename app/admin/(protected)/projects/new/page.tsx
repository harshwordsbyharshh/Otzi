import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = {
  title: "NEW PROJECT — Studio Console | ÖTZI",
  description: "Initialize and configure a new production record in the ÖTZI portfolio archive.",
};

export default function NewProjectPage() {
  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-20 flex flex-col gap-10">
      {/* Top Header Bar */}
      <div className="border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 font-label-mono text-xs uppercase tracking-widest text-primary font-bold mb-3">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>ÖTZI ADMIN CONSOLE</span>
            <span className="text-[#555]">/</span>
            <Link href="/admin/projects" className="text-paper-dim hover:text-white transition-colors">
              PROJECTS
            </Link>
            <span className="text-[#555]">/</span>
            <span className="text-white">INITIALIZE NEW</span>
          </div>
          <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 select-none">
            CREATE PROJECT.
          </h1>
        </div>

        <div>
          <Link
            href="/admin/projects"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            ← BACK TO ARCHIVE
          </Link>
        </div>
      </div>

      {/* Project Creation Form */}
      <ProjectForm mode="create" />
    </div>
  );
}
