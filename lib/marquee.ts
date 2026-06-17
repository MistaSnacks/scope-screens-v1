// lib/marquee.ts
// Builds the under-hero marquee strip: an optional live "now showing" line
// (from Wix Events) followed by the editor's CMS phrases.
export function buildMarqueeItems(phrases: string[], liveLine: string | null): string[] {
  const clean = phrases.map((p) => p.trim()).filter(Boolean);
  return liveLine ? [liveLine, ...clean] : clean;
}
