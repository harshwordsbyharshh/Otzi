"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setMessage("Failed to update access key. Please verify your connection.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 border border-white/20 p-8"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            ÖTZI ADMIN
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            SET NEW ACCESS KEY
          </h1>

          <p className="mt-3 text-sm text-white/60">
            Choose a new password for your studio account.
          </p>
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-[0.16em] text-white/70"
          >
            NEW ACCESS KEY
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="mt-2 w-full border border-white/20 bg-black px-4 py-3 text-white outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-xs uppercase tracking-[0.16em] text-white/70"
          >
            CONFIRM ACCESS KEY
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="mt-2 w-full border border-white/20 bg-black px-4 py-3 text-white outline-none"
          />
        </div>

        {message && (
          <p className="text-sm text-red-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-white px-4 py-4 font-bold uppercase tracking-wide"
        >
          {loading ? "UPDATING..." : "UPDATE ACCESS KEY →"}
        </button>
      </form>
    </main>
  );
}
