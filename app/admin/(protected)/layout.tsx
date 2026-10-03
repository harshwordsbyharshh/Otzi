import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex flex-col w-full bg-black min-h-[calc(100vh-72px)] text-white">
      {children}
    </div>
  );
}