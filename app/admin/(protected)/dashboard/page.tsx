import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ADMIN DASHBOARD — Studio Console | ÖTZI",
  description: "ÖTZI Studio operational administration console.",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // Project archive counts
  const { count: totalCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: publishedCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  const totalProjects = totalCount ?? 0;
  const publishedProjects = publishedCount ?? 0;
  const draftProjects = Math.max(0, totalProjects - publishedProjects);

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-20 flex flex-col gap-12">
      {/* Top Header Bar */}
      <div className="border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold mb-3">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>ÖTZI ADMIN CONSOLE</span>
          </div>
          <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 select-none">
            STUDIO CONTROL.
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            ← PUBLIC SITE
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Production Management Quick Action Section */}
      <div className="border border-[#262626] p-6 md:p-8 bg-surface-container-low flex flex-col gap-6">
        <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-label-mono text-xs uppercase tracking-widest text-primary font-bold block mb-1">
              PORTFOLIO ARCHIVE MANAGEMENT
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
              PRODUCTIONS &amp; REPERTOIRE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects"
              className="border border-white bg-black hover:border-primary text-white font-label-action uppercase tracking-widest text-xs px-6 py-3 font-bold transition-colors text-center"
            >
              PROJECT ARCHIVE →
            </Link>
            <Link
              href="/admin/projects/new"
              className="border border-[#262626] hover:border-white text-paper-dim hover:text-white font-label-mono uppercase tracking-wider text-xs px-5 py-3 transition-colors text-center"
            >
              + NEW PRODUCTION
            </Link>
          </div>
        </div>

        {/* Project Counters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#262626] p-4 bg-black">
            <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
              TOTAL RECORD ARCHIVE
            </span>
            <span className="font-display-lg text-display-lg text-white font-bold block leading-none">
              {totalProjects}
            </span>
          </div>

          <div className="border border-[#262626] p-4 bg-black">
            <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
              PUBLISHED PRODUCTIONS
            </span>
            <span className="font-display-lg text-display-lg text-white font-bold block leading-none">
              {publishedProjects}
            </span>
          </div>

          <div className="border border-[#262626] p-4 bg-black">
            <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-1">
              STUDIO DRAFTS
            </span>
            <span className="font-display-lg text-display-lg text-paper-dim font-bold block leading-none">
              {draftProjects}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Status Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[160px]">
          <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-2 mb-3">
            AUTHENTICATED OPERATOR
          </span>
          <div>
            <div className="text-white font-bold font-label-action text-sm truncate">
              {user.email}
            </div>
            <div className="font-label-mono text-[11px] text-primary uppercase tracking-wider mt-1">
              ROLE: {role ? role.toUpperCase() : "UNASSIGNED"}
            </div>
          </div>
        </div>

        <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[160px]">
          <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-2 mb-3">
            SECURITY INTEGRITY
          </span>
          <div>
            <div className="text-white font-bold font-label-action text-sm">
              VERIFIED SECURE SESSION
            </div>
            <div className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider mt-1">
              SUPABASE SSR AUTH
            </div>
          </div>
        </div>

        <div className="border border-[#262626] p-6 bg-surface-container-low flex flex-col justify-between min-h-[160px]">
          <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block border-b border-[#262626] pb-2 mb-3">
            OPERATIONAL SCOPE
          </span>
          <div>
            <div className="text-white font-bold font-label-action text-sm">
              PROJECT MANAGEMENT &amp; PUBLISHING
            </div>
            <div className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider mt-1">
              FULL PRODUCTION CRUD V1
            </div>
          </div>
        </div>
      </div>

      {/* Operator Scope Notice */}
      <div className="border border-[#262626] p-6 bg-surface-container-lowest max-w-3xl">
        <div className="font-label-mono text-xs text-primary font-bold uppercase tracking-widest mb-2">
          AUTHENTICATED OPERATOR AREA
        </div>
        <p className="font-body-md text-sm text-paper-dim m-0 leading-relaxed">
          You are authenticated as an authorized studio administrator. Manage productions, publish campaign assets to the public repertoire, and calibrate project specifications.
        </p>
      </div>
    </div>
  );
}
