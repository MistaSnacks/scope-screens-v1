// Captures the open-curtain hero (full hero, framed screen) as the OpenGraph
// share image. Under reduced-motion the hero settles fully open with the title,
// credits, and framed reel already revealed — a deterministic "money shot" with
// no scroll choreography to time. Output is sized to the OG standard 1200x630.
//
// Usage: dev server (or `next start`) on $CAP_URL (default :3007), then
// `node .shots/capture-og.mjs`. Re-run whenever the hero composition changes.
import { chromium } from "playwright";
import { execFileSync } from "child_process";

const TMP = "/Users/admin/SS/.shots/og-raw.png";
const OUT = process.env.OG_OUT || "/Users/admin/SS/app/opengraph-image.jpg";
const URL = process.env.CAP_URL || "http://localhost:3007";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
// Viewport at the OG aspect (1200x630). The hero is min-h-screen, so it fills
// the viewport exactly. 2x for a crisp capture, then downsampled to 1200x630.
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
// Give curtains.js time to import, build the planes, decode the velvet, and paint
// the framed (open) state.
await page.waitForTimeout(4000);

// Hide dev-only overlays so the shot is clean.
await page.addStyleTag({ content: `
  nextjs-portal, [data-next-badge-root], [data-nextjs-toast], #__next-build-watcher { display:none !important; }
  button[aria-label="Return to the top"] { display:none !important; }
` });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

await page.screenshot({ path: TMP, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

// Downsample the 2x capture to the canonical 1200x630 JPEG (keeps the share
// image well under a megabyte for fast unfurls).
execFileSync("/usr/bin/sips", ["-z", "630", "1200", "-s", "format", "jpeg", "-s", "formatOptions", "82", TMP, "--out", OUT]);
console.log("WROTE", OUT);
