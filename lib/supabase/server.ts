import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function formatSupabaseUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = formatSupabaseUrl(rawUrl);

  if (!supabaseKey || !supabaseUrl) {
    throw new Error(
      "Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined."
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Creates an optional service-role Supabase client strictly for server-side operations
 * (such as generating signed URLs for published media in private buckets).
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured in the environment.
 * NEVER exposed to client-side code or browser bundles.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = formatSupabaseUrl(rawUrl);

  if (!serviceKey || !supabaseUrl) {
    return null;
  }

  try {
    return createServerClient(supabaseUrl, serviceKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  } catch (err) {
    console.error("[createServiceRoleClient] Client creation failed:", err);
    return null;
  }
}

/**
 * Creates a public, cookie-free Supabase client for reading published data
 * on public pages (homepage, work page, sitemap, static generation).
 * Never calls cookies() so it is safe to use in static generation, build-time, and serverless.
 */
export function createPublicClient() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = formatSupabaseUrl(rawUrl);

  if (!supabaseKey || !supabaseUrl) {
    return null;
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  } catch (err) {
    console.error("[createPublicClient] Client creation failed:", err);
    return null;
  }
}

