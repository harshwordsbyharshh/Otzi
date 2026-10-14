/**
 * Resolves the canonical site URL from environment variables with deployment fallback.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. NEXT_PUBLIC_APP_URL
 * 3. VERCEL_PROJECT_PRODUCTION_URL
 * 4. VERCEL_URL
 * 5. Production fallback: https://otzi-coral.vercel.app
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return url.startsWith("http://") || url.startsWith("https://")
      ? url.replace(/\/$/, "")
      : `https://${url}`.replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim();
    return url.startsWith("http://") || url.startsWith("https://")
      ? url.replace(/\/$/, "")
      : `https://${url}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const url = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim();
    return url.startsWith("http://") || url.startsWith("https://")
      ? url.replace(/\/$/, "")
      : `https://${url}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL.trim();
    return url.startsWith("http://") || url.startsWith("https://")
      ? url.replace(/\/$/, "")
      : `https://${url}`.replace(/\/$/, "");
  }

  return "https://otzi-coral.vercel.app";
}
