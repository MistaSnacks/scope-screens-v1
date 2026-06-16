// Diagnostic: capture the homepage sections BELOW the hero to see whether the
// angled .band-up/.band-down bands render. Requires prod server on :3002.
import { chromium } from "/Users/admin/.npm/_npx/bc46ece8a1067505/node_modules/playwright/index.mjs";

const OUT = "/Users/admin/SS/.shots";
const URL = "http://localhost:3002";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Hero pin is ~190% of viewport (~1710px) + letterbox. Sections start after.
// Sample down the page well past the hero so the bands are in view.
const ys = [2200, 3100, 4000, 4900, 5800, 6700];
for (let i = 0; i < ys.length; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), ys[i]);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/sec-${i + 1}.png` });
}

// Also a full-page tall capture for the whole flow at once.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/sec-fullpage.png`, fullPage: true });

console.log("CONSOLE_ERRORS:", JSON.stringify(errors.slice(0, 20), null, 2));
await browser.close();
