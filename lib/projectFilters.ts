/**
 * Helper to identify temporary AI-generated or development test productions
 * so they are never served to the public or displayed in the live repertoire.
 */
export function isTemporaryTestProject(p: {
  title?: string;
  slug?: string;
  description?: string | null;
}): boolean {
  const text = `${p.title || ""} ${p.slug || ""} ${p.description || ""}`.toLowerCase();
  return (
    text.includes("ai generated") ||
    text.includes("ai-generated") ||
    text.includes("ai reel") ||
    text.includes("ai post") ||
    text.includes("temporary reel") ||
    text.includes("temporary post") ||
    text.includes("temp reel") ||
    text.includes("temp post") ||
    text.includes("test reel") ||
    text.includes("test post") ||
    text.includes("test content") ||
    text.includes("temp content")
  );
}
