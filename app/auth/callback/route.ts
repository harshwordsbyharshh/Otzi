import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=recovery", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/admin/login?error=recovery", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/admin/reset-password", request.url)
    );
  } catch (err) {
    console.error("[auth/callback] Exception exchanging code:", err);
    return NextResponse.redirect(
      new URL("/admin/login?error=recovery", request.url)
    );
  }
}
