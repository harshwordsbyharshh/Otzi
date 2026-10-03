import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../../ProjectForm";
import { ProjectRecord } from "@/types/project";

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();

  if (!project) {
    return {
      title: "Project Not Found — Studio Console | ÖTZI",
    };
  }

  return {
    title: `EDIT ${project.title.toUpperCase()} — Studio Console | ÖTZI`,
    description: `Edit specifications and publishing parameters for ${project.title}.`,
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const typedProject = project as ProjectRecord;

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
            <span className="text-white">EDIT</span>
          </div>
          <h1 className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 select-none">
            EDIT PROJECT.
          </h1>
          <p className="font-label-mono text-xs text-paper-dim uppercase tracking-wider mt-2 mb-0">
            RECORD ID: {typedProject.id}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-paper-dim hover:text-white hover:border-white transition-colors uppercase tracking-wider"
          >
            ← BACK TO ARCHIVE
          </Link>
          {typedProject.published && (
            <Link
              href={`/work/${typedProject.slug}`}
              target="_blank"
              className="border border-[#262626] px-4 py-2.5 font-label-mono text-xs text-white hover:border-white transition-colors uppercase tracking-wider"
            >
              LIVE VIEW ↗
            </Link>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <ProjectForm mode="edit" project={typedProject} />
    </div>
  );
}
