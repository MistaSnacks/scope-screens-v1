// Captures annotated per-section screenshots for the CMS editor guide.
// Drops numbered pins on the actual editable elements (located by CSS-module
// class or distinctive text), tags the section, and screenshots that element.
// The .docx generator pairs each image with a numbered legend of field names.
import { chromium } from "playwright";

const OUT = "/Users/admin/SS/.shots/guide";
const URL = process.env.GUIDE_URL || "http://localhost:3137";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3500);

await page.addStyleTag({
  content: `
    .cmsguide-pin{position:absolute;z-index:99999;width:28px;height:28px;border-radius:50%;
      background:#B13A2A;color:#fff;font:700 16px/28px Arial,sans-serif;text-align:center;
      box-shadow:0 0 0 3px #fff,0 2px 8px rgba(0,0,0,.6);transform:translate(-55%,-55%);}
    .cmsguide-ring{position:absolute;z-index:99998;border:3px solid #B13A2A;border-radius:6px;
      box-shadow:0 0 0 2px rgba(255,255,255,.7);pointer-events:none;}
  `,
});

// Find a section + pin its fields. Tags the section with data-cmsshot for the screenshot.
async function annotate(anchor, fields) {
  return await page.evaluate(
    ({ anchor, fields }) => {
      const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
      function findByText(txt, root = document.body) {
        const t = norm(txt);
        let best = null;
        for (const el of root.querySelectorAll("*")) {
          if (norm(el.textContent).includes(t)) {
            if (!best || (el.textContent || "").length <= (best.textContent || "").length) best = el;
          }
        }
        return best;
      }
      const tag = anchor.tag || "section";
      let sec = null;
      if (anchor.id) { const e = document.getElementById(anchor.id); sec = e && (e.closest(tag) || e); }
      if (!sec && anchor.text) { const e = findByText(anchor.text); sec = e && (e.closest(tag) || e.parentElement); }
      if (!sec) return { error: "section not found" };
      sec.scrollIntoView({ block: "start" });
      window.scrollBy(0, -10);
      sec.setAttribute("data-cmsshot", "1");

      const found = [];
      for (const f of fields) {
        let el = null;
        if (f.css) el = sec.querySelector(f.css);
        if (!el && f.text) el = findByText(f.text, sec) || findByText(f.text);
        if (!el) { found.push({ n: f.n, label: f.label, ok: false }); continue; }
        const r = el.getBoundingClientRect();
        const ring = document.createElement("div"); ring.className = "cmsguide-ring";
        ring.style.left = r.left + scrollX + "px"; ring.style.top = r.top + scrollY + "px";
        ring.style.width = r.width + "px"; ring.style.height = r.height + "px";
        document.body.appendChild(ring);
        const pin = document.createElement("div"); pin.className = "cmsguide-pin"; pin.textContent = f.n;
        pin.style.left = r.left + scrollX + "px"; pin.style.top = r.top + scrollY + "px";
        document.body.appendChild(pin);
        found.push({ n: f.n, label: f.label, ok: true });
      }
      return { found };
    },
    { anchor, fields },
  );
}

async function shoot(key, anchor, fields) {
  const res = await annotate(anchor, fields);
  if (res.error) { console.log(key, "ERROR", res.error); return; }
  await page.waitForTimeout(300);
  await page.locator("[data-cmsshot]").first().screenshot({ path: `${OUT}/${key}.png` });
  console.log(key, "->", res.found.map((f) => `${f.n}:${f.label}${f.ok ? "" : "(MISS)"}`).join("  "));
  await page.evaluate(() => {
    document.querySelectorAll(".cmsguide-pin,.cmsguide-ring").forEach((e) => e.remove());
    document.querySelectorAll("[data-cmsshot]").forEach((e) => e.removeAttribute("data-cmsshot"));
  });
}

// Hero: reducedMotion renders it framed (curtains parted) at rest — screen text visible.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
{
  const res = await page.evaluate(() => {
    const pinEl = (el, n) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const ring = document.createElement("div"); ring.className = "cmsguide-ring";
      ring.style.left = r.left + scrollX + "px"; ring.style.top = r.top + scrollY + "px";
      ring.style.width = r.width + "px"; ring.style.height = r.height + "px";
      document.body.appendChild(ring);
      const pin = document.createElement("div"); pin.className = "cmsguide-pin"; pin.textContent = n;
      pin.style.left = r.left + scrollX + "px"; pin.style.top = r.top + scrollY + "px";
      document.body.appendChild(pin); return true;
    };
    const eb = document.querySelector('[class*="eyebrow"]');
    const wm = document.querySelector('[class*="wordmark"]');
    const tg = document.querySelector('[class*="tagline"]');
    const ok = [pinEl(eb, "1"), pinEl(wm, "2"), pinEl(tg, "3")];
    const sec = (wm || eb)?.closest("section");
    if (sec) sec.setAttribute("data-cmsshot", "1");
    return { ok };
  });
  await page.waitForTimeout(300);
  await page.locator("[data-cmsshot]").first().screenshot({ path: `${OUT}/Hero.png` });
  console.log("Hero -> 1:Eyebrow 2:Title 3:Tagline", JSON.stringify(res.ok));
  await page.evaluate(() => {
    document.querySelectorAll(".cmsguide-pin,.cmsguide-ring").forEach((e) => e.remove());
    document.querySelectorAll("[data-cmsshot]").forEach((e) => e.removeAttribute("data-cmsshot"));
  });
}

await shoot("WhatIs", { id: "about" }, [
  { n: "1", label: "Eyebrow", text: "Now Rolling" },
  { n: "2", label: "Title", text: "What Is Scope Screenings?" },
  { n: "3", label: "Body", text: "underground film festival. A live" },
  { n: "4", label: "Motto", text: "fun back in film fests" },
  { n: "5", label: "Clapperboard (list)", text: "Lex Scope" },
]);
await shoot("BuiltForAccess", { text: "Built For" }, [
  { n: "1", label: "Eyebrow", text: "Chapter Two" },
  { n: "2", label: "Title", text: "Built For" },
  { n: "3", label: "Founder quote", text: "see their work on a big screen" },
  { n: "4", label: "Founder name", text: "Lex Scope" },
  { n: "5", label: "Stats (list)", text: "Filmmakers" },
]);
await shoot("MagicGallery", { text: "the best room in the city" }, [
  { n: "1", label: "Eyebrow", text: "Chapter Three" },
  { n: "2", label: "Title", text: "Magic" },
  { n: "3", label: "Body", text: "Central District turns into a cinema" },
  { n: "4", label: "Button", text: "See more from the floor" },
]);
await shoot("Submissions", { id: "submit" }, [
  { n: "1", label: "Eyebrow", text: "Open Call" },
  { n: "2", label: "Title", text: "Submit Your Film" },
  { n: "3", label: "Intro", text: "Narrative shorts, documentaries" },
  { n: "4", label: "Chips (list)", text: "6 CATEGORIES" },
  { n: "5", label: "Button + link", text: "Open the Call" },
]);
await shoot("Archives", { id: "films" }, [
  { n: "1", label: "Eyebrow", text: "Chapter Four" },
  { n: "2", label: "Title", text: "The Archives" },
  { n: "3", label: "Body", text: "Shorts, music videos, docs" },
  { n: "4", label: "Button + link", text: "Browse all" },
]);
await shoot("Support", { id: "support" }, [
  { n: "1", label: "Title", text: "Keep It Running" },
  { n: "2", label: "Funder copy", text: "Become a Funder" },
  { n: "3", label: "Giving tiers (list)", text: "Friend $50" },
  { n: "4", label: "Donate link", text: "Support the Festival" },
  { n: "5", label: "Press kit (list)", text: "Press kit" },
]);
await shoot("Footer", { text: "See You At", tag: "footer" }, [
  { n: "1", label: "Sign-off", text: "See You At" },
  { n: "2", label: "Newsletter heading", text: "lineup in your inbox" },
  { n: "3", label: "Socials (list)", text: "Instagram" },
  { n: "4", label: "Copyright", text: "fiscally sponsored project" },
]);

await browser.close();
console.log("done");
