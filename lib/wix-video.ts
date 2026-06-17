// Converts a Wix CMS VIDEO field value (wix:video://v1/<mediaId>/...) to a
// directly-playable mp4 URL. http(s) passes through; unrecognized → null so the
// caller falls back to the bundled reel.
export function wixVideoUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const m = value.match(/^wix:video:\/\/v1\/([^/]+)/);
  return m ? `https://video.wixstatic.com/video/${m[1]}/1080p/mp4/file.mp4` : null;
}
