import { chromium } from "/Users/admin/.npm/_npx/bc46ece8a1067505/node_modules/playwright/index.mjs";

const OUT = "/Users/admin/SS/.shots";
const URL = "http://localhost:3002";

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
// Let curtains.js init + GSAP ScrollTrigger pin settle
await page.waitForTimeout(2500);

// The hero is pinned and scrubbed. progress 0->1 maps over the pin distance
// (~190% of viewport). Sample scrollY across that range.
const vh = 900;
const samples = [
  { name: "01-closed",   y: 0 },
  { name: "02-parting",  y: vh * 0.55 },
  { name: "03-midopen",  y: vh * 1.05 },
  { name: "04-framed",   y: vh * 1.75 },
];

for (const s of samples) {
  await page.evaluate((y) => window.scrollTo(0, y), s.y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${s.name}.png` });
  console.log("shot", s.name, "@y", s.y);
}

// Closed: full + a tight crop of the center meeting line to inspect the
// gold fringe + velvet pile up close.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/00-closed-full.png` });
await page.screenshot({ path: `${OUT}/05-seam-crop.png`, clip: { x: 520, y: 120, width: 400, height: 600 } });

// Two frames ~700ms apart at the closed drape to confirm the billow flows
// (pixels should differ if the cloth is moving).
await page.screenshot({ path: `${OUT}/06-flow-a.png`, clip: { x: 120, y: 120, width: 520, height: 560 } });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/07-flow-b.png`, clip: { x: 120, y: 120, width: 520, height: 560 } });

console.log("CONSOLE_ERRORS:", JSON.stringify(errors.slice(0, 20), null, 2));
await browser.close();
