// .shots/verify-scale.mjs
// Usage: node .shots/verify-scale.mjs <outDir>
// Screenshots the homepage at six widths into .shots/<outDir>/<width>.png
// Requires `npm run dev` (or `npm run build && npm start`) on http://localhost:3000.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: node .shots/verify-scale.mjs <outDir>");
  process.exit(1);
}
const WIDTHS = [375, 800, 1024, 1440, 1920, 2560];
const dir = `.shots/${outDir}`;
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // `domcontentloaded` not `networkidle`: the dev server's HMR websocket keeps
  // the network busy so networkidle never fires.
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  // Settle hero/GSAP, then capture a stable frame.
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${dir}/${width}.png`, fullPage: true });
  await page.close();
  console.log(`${dir}/${width}.png`);
}
await browser.close();
