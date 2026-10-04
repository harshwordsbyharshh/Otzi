import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadsListClient } from "./LeadsListClient";
import { LeadRecord } from "@/types/lead";

export const metadata: Metadata = {
  title: "LEADS & INQUIRIES — Studio Console | ÖTZI",
  description: "ÖTZI Studio client enquiries and commission leads management.",
};

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const safeLeads: LeadRecord[] = error || !leads ? [] : (leads as LeadRecord[]);

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-20 flex flex-col gap-10">
      {/* Top Breadcrumb & Header Bar */}
      <div className="border-b border-[#262626] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 font-label-mono text-xs uppercase tracking-widest text-primary font-bold mb-3">
            <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
            <span>ÖTZI ADMIN CONSOLE</span>
            <span className="text-[#555]">/</span>
            <span className="text-white">LEADS</span>
          </div>
          <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 select-none">
            INQUIRIES &amp; LEADS.
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
            href="/contact"
            target="_blank"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            PUBLIC /CONTACT ↗
          </Link>
        </div>
      </div>

      {/* Main Interactive Leads Manager */}
      <LeadsListClient initialLeads={safeLeads} />
    </div>
  );
}
