// Procedural red-velvet texture, drawn once on the client into a data URL.
// Reads as real drapery (deep base + vertical folds + grain) rather than a flat
// fill. Returns "" on the server (no document).
//
// Two palettes, same red family:
//   movie  - lights-down oxblood, near-black fold shadows (the cinema dark).
//   house  - lights-UP: brighter base, softer/lighter shadow stops, less grain,
//            lower contrast, so the drape doesn't read as a black gash on cream.
const VELVET_SIZE = 256;

// Seeded PRNG (mulberry32). The velvet used to be drawn with Math.random(), so
// every page load produced a DIFFERENT drape - which meant a captured/static
// fallback could never match the live render. Seeding makes the texture byte-for-
// byte identical on every load, so the SSR fallback image and the WebGL curtain
// share the exact same velvet and the hand-off is invisible. Change SEED to
// reshuffle the weave (then re-run `.shots/capture-curtain.mjs`).
const SEED = 0x5c09e2a1;
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

  // Curtains stay the normal (lights-down) velvet in BOTH modes - the light
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

  const rng = makeRng(SEED);

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
    const n = (rng() - 0.5) * p.grain;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n * 0.35));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 0.35));
  }
  ctx.putImageData(img, 0, 0);

  let x = 0;
  while (x < VELVET_SIZE) {
    const a = p.foldMin + rng() * (p.foldMax - p.foldMin);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(x, 0, 1 + Math.floor(rng() * 2), VELVET_SIZE);
    x += 6 + Math.floor(rng() * 5);
  }

  return c.toDataURL();
}

// The hero curtain and persistent valance must use the same generated velvet.
// Memoizing preserves their original procedural look without producing visibly
// different random textures for each component.
let cachedVelvet: string | null = null;
export function getVelvetDataUrl(): string {
  if (typeof document === "undefined") return "";
  if (cachedVelvet === null) cachedVelvet = generateVelvetDataUrl();
  return cachedVelvet;
}
