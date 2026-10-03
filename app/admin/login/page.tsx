"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

function UnauthorizedBanner() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  if (!errorParam) return null;

  if (errorParam === "recovery") {
    return (
      <div
        role="alert"
        className="border border-primary bg-black p-4 mb-6 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
      >
        RECOVERY ERROR: Password recovery link is invalid or has expired.
      </div>
    );
  }

  if (errorParam === "unauthorized") {
    return (
      <div
        role="alert"
        className="border border-primary bg-black p-4 mb-6 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
      >
        ACCESS RESTRICTED: Your account does not have administrative permissions.
      </div>
    );
  }

  return null;
}

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your operator email above to receive recovery instructions.");
      return;
    }

    try {
      setRecoveryLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Recovery instructions sent. Please check your operator email.");
      }
    } catch {
      setErrorMessage("Unable to send recovery instructions. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      // 1. signInWithPassword()
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (authError || !authData.user) {
        // Generic error message: do not expose whether an email exists
        setErrorMessage("Invalid email or password. Please verify your credentials.");
        setLoading(false);
        return;
      }

      // 2. Redirect directly to /admin/dashboard
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Authentication failed. Please verify your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 border border-[#262626] bg-surface-container-low">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3 border-b border-[#262626] pb-6 mb-6">
        <Link href="/" aria-label="ÖTZI Home" className="block select-none mb-1">
          <Image
            src="/logo.png"
            alt="ötzi"
            width={1024}
            height={409}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-2 font-label-mono text-xs uppercase tracking-widest text-primary font-bold">
          <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
          <span>ADMINISTRATIVE PORTAL</span>
        </div>
        <h1 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
          STUDIO CONTROL
        </h1>
        <p className="font-body-sm text-xs text-paper-dim m-0 leading-relaxed max-w-xs">
          Restricted access. Invite-only production environment. Access is restricted to authorized studio accounts.
        </p>
      </div>

      {/* Query Error Banner */}
      <Suspense fallback={null}>
        <UnauthorizedBanner />
      </Suspense>

      {/* Form Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="border border-primary bg-black p-4 mb-6 text-primary font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div
          role="status"
          className="border border-white/40 bg-black p-4 mb-6 text-white font-label-mono text-xs uppercase tracking-wider leading-relaxed"
        >
          {successMessage}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="admin-email"
            className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
          >
            OPERATOR EMAIL
          </label>
          <input
            id="admin-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@otzi.studio"
            className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-body-md text-sm placeholder:text-[#555] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="admin-password"
            className="font-label-mono text-xs text-paper-dim uppercase tracking-wider"
          >
            ACCESS KEY
          </label>
          <input
            id="admin-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-black border border-[#262626] focus:border-white focus:outline-none px-4 py-3 text-white font-body-md text-sm placeholder:text-[#555] transition-colors"
          />
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={recoveryLoading || loading}
              className="font-label-mono text-[10px] text-paper-dim hover:text-white uppercase tracking-wider transition-colors cursor-pointer select-none"
            >
              {recoveryLoading ? "SENDING..." : "FORGOT ACCESS KEY?"}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="accent"
            disabled={loading}
            className="w-full py-4 text-xs font-bold tracking-widest uppercase cursor-pointer"
          >
            {loading ? "AUTHENTICATING..." : "ENTER CONSOLE"}
          </Button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-between text-paper-dim font-label-mono text-[11px] uppercase tracking-wider">
        <Link
          href="/"
          className="text-paper-dim hover:text-white transition-colors"
        >
          ← PUBLIC SITE
        </Link>
        <span>ÖTZI SECURE ACCESS</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="w-full flex-1 flex items-center justify-center py-16 md:py-24 px-4 bg-black min-h-[calc(100vh-72px)]">
      <LoginForm />
    </div>
  );
}
