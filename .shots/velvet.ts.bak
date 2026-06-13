// Procedural red-velvet texture, drawn once on the client into a data URL.
// Reads as real drapery (deep base + vertical folds + grain) rather than a flat
// fill. Returns "" on the server (no document).
//
// Two palettes, same red family:
//   movie  — lights-down oxblood, near-black fold shadows (the cinema dark).
//   house  — lights-UP: brighter base, softer/lighter shadow stops, less grain,
//            lower contrast, so the drape doesn't read as a black gash on cream.
const VELVET_SIZE = 256;

export type VelvetTheme = "movie" | "house";

interface VelvetPalette {
  base: string;
  edge: string; // outer darkening at the fold margins
  mid: string;
  center: string;
  grain: number; // ± luminance noise
  foldMin: number; // vertical streak alpha range
  foldMax: number;
}

const PALETTES: Record<VelvetTheme, VelvetPalette> = {
  movie: {
    base: "#5a0f0f",
    edge: "rgba(0,0,0,0.55)",
    mid: "rgba(80,12,12,0.25)",
    center: "rgba(150,30,30,0)",
    grain: 46,
    foldMin: 0.05,
    foldMax: 0.18,
  },
  house: {
    // same hue family as #e6180f, just lit and softened.
    base: "#b22a20",
    edge: "rgba(74,14,12,0.3)",
    mid: "rgba(150,42,36,0.16)",
    center: "rgba(225,95,84,0)",
    grain: 26,
    foldMin: 0.03,
    foldMax: 0.1,
  },
};

export function generateVelvetDataUrl(theme: VelvetTheme = "movie"): string {
  if (typeof document === "undefined") return "";

  // Curtains stay the normal (lights-down) velvet in BOTH modes — the light
  // mode instead balances the curtain EDGE against the cream canvas (see the
  // hero's :root[data-theme="house"] .screen vignette). `theme` is accepted for
  // call-site compatibility but no longer changes the drape colour.
  void theme;
  const p = PALETTES.movie;

  const c = document.createElement("canvas");
  c.width = VELVET_SIZE;
  c.height = VELVET_SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, VELVET_SIZE, VELVET_SIZE);

  const grad = ctx.createLinearGradient(0, 0, VELVET_SIZE, 0);
  grad.addColorStop(0, p.edge);
  grad.addColorStop(0.22, p.mid);
  grad.addColorStop(0.5, p.center);
  grad.addColorStop(0.78, p.mid);
  grad.addColorStop(1, p.edge);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VELVET_SIZE, VELVET_SIZE);

  const img = ctx.getImageData(0, 0, VELVET_SIZE, VELVET_SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * p.grain;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n * 0.35));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 0.35));
  }
  ctx.putImageData(img, 0, 0);

  let x = 0;
  while (x < VELVET_SIZE) {
    const a = p.foldMin + Math.random() * (p.foldMax - p.foldMin);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, 0, 1 + Math.floor(Math.random() * 2), VELVET_SIZE);
    x += 6 + Math.floor(Math.random() * 5);
  }

  return c.toDataURL();
}
