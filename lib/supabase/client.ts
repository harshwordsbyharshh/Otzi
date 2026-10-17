import { createBrowserClient } from "@supabase/ssr";

function formatSupabaseUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function createClient() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  const supabaseUrl =
    formatSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || "";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
