// Wix CMS Media fields come back as `wix:image://v1/<mediaId>/<filename>#...`.
// Convert to a directly-servable static URL. http(s) values pass through;
// anything unrecognized returns null so callers fall back to a local asset.
export function wixImageUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const m = value.match(/^wix:image:\/\/v1\/([^/]+)/);
  return m ? `https://static.wixstatic.com/media/${m[1]}` : null;
}
