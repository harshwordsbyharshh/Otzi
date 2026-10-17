import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/admin/login");
    }

    // Server-side authorization check against public.profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      error ||
      !profile ||
      (profile.role !== "admin" && profile.role !== "editor")
    ) {
      redirect("/admin/login?error=unauthorized");
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: string }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest === "DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.error("[ProtectedAdminLayout] Auth verification failed:", err);
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col w-full bg-black min-h-[calc(100vh-72px)] text-white">
      {children}
    </div>
  );
}