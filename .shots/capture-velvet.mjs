// Bakes the procedural velvet tile to a STATIC png so the persistent valance
// can paint on first frame instead of waiting for a client-side canvas pass.
//
// It does NOT re-implement the velvet: it transpiles the real lib/velvet.ts and
// runs the actual generateVelvetDataUrl() inside a real browser canvas, then
// writes the exact PNG bytes it produces. Because lib/velvet.ts is seeded
// (mulberry32, fixed SEED) the output is deterministic, so public/velvet.png is
// byte-for-byte the same drape the WebGL curtains and the live generator use.
//
// PNG, not JPEG: the tile is high-frequency grain + 1-2px fold streaks and it
// REPEATS across the bar, so JPEG artifacts read as a different fabric. PNG is
// lossless — identical pixels.
//
// Usage: `node .shots/capture-velvet.mjs`  (no dev server needed)
// Re-run whenever SEED, the palette, or the draw routine in lib/velvet.ts change.
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "/Users/admin/SS/node_modules/playwright/index.mjs";
import { transformSync } from "/Users/admin/SS/node_modules/esbuild/lib/main.js";

const OUT = "/Users/admin/SS/public/velvet.png";
const SRC = "/Users/admin/SS/lib/velvet.ts";

// Transpile the real source so the in-page generator can never drift from it.
const ts = readFileSync(SRC, "utf8");
const { code } = transformSync(ts, { loader: "ts", format: "iife", globalName: "__velvet" });

const browser = await chromium.launch();
const page = await browser.newPage();

const dataUrl = await page.evaluate((js) => {
  // eslint-disable-next-line no-eval
  const mod = eval(js + "; __velvet");
  return mod.generateVelvetDataUrl("movie");
}, code);

if (!dataUrl || !dataUrl.startsWith("data:image/png;base64,")) {
  console.error("UNEXPECTED data URL:", String(dataUrl).slice(0, 64));
  await browser.close();
  process.exit(1);
}

const b64 = dataUrl.slice("data:image/png;base64,".length);
writeFileSync(OUT, Buffer.from(b64, "base64"));
console.log("WROTE", OUT, Buffer.from(b64, "base64").length, "bytes");
await browser.close();
