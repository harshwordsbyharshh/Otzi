import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectListClient } from "./ProjectListClient";
import { ProjectRecord } from "@/types/project";

export const metadata: Metadata = {
  title: "PROJECT MANAGEMENT — Studio Console | ÖTZI",
  description: "ÖTZI Studio project repertoire and production archive management.",
};

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const safeProjects: ProjectRecord[] = error || !projects ? [] : (projects as ProjectRecord[]);

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-20 flex flex-col gap-10">
      {/* Top Breadcrumb & Header Bar */}
      <div className="border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 font-label-mono text-xs uppercase tracking-widest text-primary font-bold mb-3">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>ÖTZI ADMIN CONSOLE</span>
            <span className="text-[#555]">/</span>
            <span className="text-white">PROJECTS</span>
          </div>
          <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 select-none">
            PROJECT ARCHIVE.
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            ← CONSOLE DASHBOARD
          </Link>
          <Link
            href="/work"
            target="_blank"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            LIVE REPERTOIRE ↗
          </Link>
        </div>
      </div>

      {/* Main Interactive Project Manager */}
      <ProjectListClient initialProjects={safeProjects} />
    </div>
  );
}
