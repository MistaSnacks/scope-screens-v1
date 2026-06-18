// Clean (un-annotated) screenshots of the main SPA for the client comparison doc.
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "/Users/admin/SS/.shots/compare";
mkdirSync(OUT, { recursive: true });
const URL = process.env.CAP_URL || "http://localhost:3007";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3500);

// Hide dev-only / fixed overlays so screenshots are clean.
await page.addStyleTag({ content: `
  nextjs-portal, [data-next-badge-root], [data-nextjs-toast], #__next-build-watcher { display:none !important; }
  button[aria-label="Return to the top"] { display:none !important; }
` });

// Pre-scroll to trigger any in-view reveals, then back to top.
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);

// 1. Hero (framed at rest under reduced-motion) — viewport shot incl. nav.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/hero.png` });
console.log("hero ok");

// 2. Nav strip crop (top 96px).
await page.screenshot({ path: `${OUT}/nav.png`, clip: { x: 0, y: 0, width: 1440, height: 110 } });
console.log("nav ok");

// 3. Section element shots (clean).
async function section(key, id) {
  const el = page.locator(`#${id}`).first();
  if (await el.count() === 0) { console.log(key, "MISSING"); return; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await el.screenshot({ path: `${OUT}/${key}.png` });
  console.log(key, "ok");
}
await section("about", "about");
await section("support", "support");
await section("schedule", "schedule");

// 4. Full page at 1x (entire SPA on one scroll) — "one page" visual.
const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
await page1.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page1.waitForTimeout(3000);
await page1.addStyleTag({ content: `
  nextjs-portal, [data-next-badge-root], [data-nextjs-toast], #__next-build-watcher { display:none !important; }
  button[aria-label="Return to the top"] { display:none !important; }
` });
await page1.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
});
await page1.waitForTimeout(1000);
try {
  await page1.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });
  console.log("home-full ok");
} catch (e) { console.log("home-full FAILED:", e.message); }

await browser.close();
console.log("done");
