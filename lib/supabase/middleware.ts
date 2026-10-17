import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function formatSupabaseUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");

  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = formatSupabaseUrl(rawUrl);
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Defensive guard: If Supabase credentials are missing or unconfigured
  if (!supabaseUrl || !supabaseKey) {
    if (isAdminRoute && !isAdminLogin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      return NextResponse.redirect(redirectUrl);
    }
    // Public routes must render gracefully without crashing
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Modern Supabase SSR pattern: verify session/token claims and refresh auth tokens
    const { data } = await supabase.auth.getClaims();

    // Protect /admin routes (except /admin/login)
    if (isAdminRoute && !isAdminLogin) {
      if (!data?.claims) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/login";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If already authenticated and visiting /admin/login, redirect to /admin/dashboard unless in an error state
    if (pathname === "/admin/login" && data?.claims) {
      const isUnauthorized =
        request.nextUrl.searchParams.get("error") === "unauthorized";
      if (!isUnauthorized) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Session update exception:", error);
    if (isAdminRoute && !isAdminLogin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next({ request });
  }
}
