/**
 * Resolves the canonical site URL from environment variables with deployment fallback.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. VERCEL_PROJECT_PRODUCTION_URL
 * 3. Default fallback: https://otzi.studio
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    return url.startsWith("http://") || url.startsWith("https://")
      ? url.replace(/\/$/, "")
      : `https://${url}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`.replace(/\/$/, "");
  }

  return "https://otzi.studio";
}
