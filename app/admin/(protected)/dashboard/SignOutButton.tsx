"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="border border-[#262626] hover:border-primary text-white hover:text-primary px-5 py-2.5 font-label-action text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer select-none min-h-[44px]"
    >
      {loading ? "SIGNING OUT..." : "SIGN OUT"}
    </button>
  );
}
