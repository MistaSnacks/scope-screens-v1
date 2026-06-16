# Silver-Screen Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the existing `CurtainCreditsHero` into a silver-screen hero: a logo opening on the closed curtain → curtains part on scroll → a framed cinema screen plays the muted sizzle reel (with a sound toggle) → our trimmed nav (Buy Tickets, Submit a Film, Become a Funder) sits as credits beneath the screen.

**Architecture:** Refactor the existing hero component in place. The WebGL velvet curtains, their shaders, the SSR stand-in, the scroll-pinned `ScrollTrigger` mechanics, the follow-spotlight, and the bfcache handling are all **preserved verbatim**. We change three things: (1) extract + trim the nav data to a tiny tested module; (2) replace the full-bleed background video + on-screen wordmark + credits-roll with a centered framed screen + credits beneath; (3) add a logo-opening overlay that lifts/fades off the same scroll `progress`. Source design borrowed from `/Users/admin/Scope Screenings/web/components/silver-screen.tsx` — but **all code is written here, in SS, on ALT**.

**Tech Stack:** Next.js 16 (App Router) · React 19 · GSAP + ScrollTrigger · curtains.js (WebGL) · CSS Modules · Tailwind v4 tokens · Vitest · Playwright (screenshots).

**Spec:** `docs/superpowers/specs/2026-06-15-silver-screen-hero-design.md`

---

## File structure

| File | Responsibility | Action |
|---|---|---|
| `lib/hero-nav.ts` | The hero's trimmed nav data (2 primary + 1 secondary credit) | **Create** |
| `lib/hero-nav.test.ts` | Lock the nav content/hrefs and guard against dropped items returning | **Create** |
| `components/curtain-credits-hero.tsx` | The hero component | **Modify** (4 surgical edits) |
| `components/curtain-credits-hero.module.css` | Hero styling | **Modify** (remove obsolete styles, add new) |

No changes to `app/page.tsx` (import name unchanged), `lib/festival.ts`, `components/site-nav.tsx`, routes, shaders, or `public/curtain-closed.jpg` (curtain geometry is unchanged, so the stand-in stays valid).

**Preserved verbatim in `curtain-credits-hero.tsx`** (do NOT retype — leave these regions untouched): the `vertexShader`/`fragmentShader` constants, the `PlaneLike`/`CurtainsLike` interfaces, `SIZZLE_REEL_MP4`/`SIZZLE_REEL_POSTER`, the velvet `useEffect`, the curtains.js `useEffect`, the spotlight `useEffect`, and the `pageshow` `useEffect`.

---

## Task 1: Trim + extract the hero nav data (TDD)

**Files:**
- Create: `lib/hero-nav.ts`
- Test: `lib/hero-nav.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/hero-nav.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PRIMARY_CREDITS, SECONDARY_CREDITS } from "./hero-nav";

describe("hero nav credits", () => {
  it("exposes exactly two primary actions, in order: Buy Tickets then Submit a Film", () => {
    expect(PRIMARY_CREDITS.map((c) => c.label)).toEqual(["Buy Tickets", "Submit a Film"]);
  });

  it("points the primary actions at the tickets and submit routes", () => {
    expect(PRIMARY_CREDITS.find((c) => c.label === "Buy Tickets")?.href).toBe("/#tickets");
    expect(PRIMARY_CREDITS.find((c) => c.label === "Submit a Film")?.href).toBe("/submit");
  });

  it("keeps a single secondary destination: Become a Funder -> /support", () => {
    expect(SECONDARY_CREDITS).toHaveLength(1);
    expect(SECONDARY_CREDITS[0]).toMatchObject({ label: "Become a Funder", href: "/support" });
  });

  it("never reintroduces the dropped hero destinations", () => {
    const labels = [...PRIMARY_CREDITS, ...SECONDARY_CREDITS].map((c) => c.label);
    expect(labels).not.toContain("The Films");
    expect(labels).not.toContain("Press & Media");
    expect(labels).not.toContain("About the Festival");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- hero-nav`
Expected: FAIL — cannot resolve `./hero-nav` (module does not exist yet).

- [ ] **Step 3: Create the data module**

Create `lib/hero-nav.ts`:

```ts
// The hero's nav, rendered as film credits beneath the silver screen. Trimmed to
// the three destinations the hero pushes — Buy Tickets and Submit a Film are the
// two primary actions; Become a Funder is a quiet secondary line. Everything else
// the festival offers lives in the persistent SiteNav header and the footer.
export interface HeroCredit {
  /** Small eyebrow above the label, e.g. "General · VIP · Season Pass". */
  role: string;
  /** The destination's display label, e.g. "Buy Tickets". */
  label: string;
  /** Route or in-page anchor. */
  href: string;
}

export const PRIMARY_CREDITS: HeroCredit[] = [
  { role: "General · VIP · Season Pass", label: "Buy Tickets", href: "/#tickets" },
  { role: "Open Call · FilmFreeway", label: "Submit a Film", href: "/submit" },
];

export const SECONDARY_CREDITS: HeroCredit[] = [
  { role: "Sponsor · Donate · Shunpike", label: "Become a Funder", href: "/support" },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- hero-nav`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/hero-nav.ts lib/hero-nav.test.ts
git commit -m "feat: trimmed hero nav credits data module

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Replace the hero CSS module

**Files:**
- Modify: `components/curtain-credits-hero.module.css`

This swaps the full-bleed-video / on-screen-wordmark / credits-roll styles for the framed silver screen, the credits-beneath block, and the logo opening. The curtain/canvas/stand-in/spotlight/letterbox/scroll-cue rules are kept.

- [ ] **Step 1: Overwrite the file**

Replace the **entire** contents of `components/curtain-credits-hero.module.css` with:

```css
.hero {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: radial-gradient(120% 90% at 50% 38%, #1c1a17 0%, #0d0c0a 60%, #060504 100%);
  isolation: isolate;
}

.hero:not(.awaitingCurtains) .curtainStandIn {
  visibility: hidden;
}

/* ---- The revealed stage: framed screen + credits (z-10, behind curtains z-20) ---- */
.screen {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 92px 24px 84px;
  text-align: center;
}

.topMarquee {
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-brass, #f3e0a2);
  opacity: 0.85;
}

/* ---- Silver screen frame ---- */
.silverFrame {
  position: relative;
  width: 100%;
  max-width: min(1180px, 92vw);
  aspect-ratio: 4 / 3;
  background: var(--color-stage, #0d0c0a);
  border: 1.5px solid rgba(247, 243, 230, 0.18);
  box-shadow:
    0 30px 80px -30px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(0, 0, 0, 0.6),
    inset 0 0 120px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
@media (min-width: 768px) {
  .silverFrame {
    aspect-ratio: 2.35 / 1;
  }
}

.frameVideo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 38%;
}

.projectorGlow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 55% 65% at 50% 55%,
    rgba(248, 228, 165, 0.07) 0%,
    rgba(255, 187, 0, 0.03) 35%,
    transparent 70%
  );
}

.recTick {
  position: absolute;
  left: 16px;
  top: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(247, 243, 230, 0.6);
}
.recDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-curtain-bright, #f02a1f);
  box-shadow: 0 0 8px var(--color-curtain-bright, #f02a1f);
}

.reelCounter {
  position: absolute;
  right: 16px;
  top: 12px;
  z-index: 2;
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(243, 224, 162, 0.8);
}

.soundToggle {
  position: absolute;
  right: 16px;
  bottom: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  background: rgba(6, 5, 4, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(247, 243, 230, 0.18);
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-cream, #f7f3e6);
  cursor: pointer;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}
.soundToggle:hover {
  opacity: 0.9;
  border-color: var(--color-rust, #ffbb00);
}
.soundIcon {
  width: 0;
  height: 0;
  border-left: 8px solid var(--color-cream, #f7f3e6);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.subLabel {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-smoke, #8c857a);
}
.subLabel span {
  width: 24px;
  height: 1px;
  background: rgba(140, 133, 122, 0.4);
}

/* ---- Credits beneath the screen ---- */
.creditsUnder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.creditsPrimary {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 56px;
}
@media (max-width: 767px) {
  .creditsPrimary {
    flex-direction: column;
    gap: 18px;
  }
}

.creditPrimary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}
.creditRole {
  font-family: var(--font-libre), monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-smoke, #8c857a);
  transition: color 0.3s ease;
}
.creditLabel {
  font-family: var(--font-credits), serif;
  font-weight: 700;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-cream, #f7f3e6);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}
.creditPrimary:hover .creditLabel {
  color: var(--color-rust, #ffbb00);
  text-shadow: 0 0 28px rgba(255, 187, 0, 0.45);
}
.creditPrimary:hover .creditRole {
  color: #d9a93b;
}

/* Buy Tickets — the spotlit primary */
.creditSpot .creditLabel {
  color: var(--color-rust, #ffbb00);
  text-shadow: 0 0 30px rgba(255, 187, 0, 0.45);
}
.creditSpot .creditRole {
  color: #d9a93b;
}

.creditSecondary {
  font-family: var(--font-libre), monospace;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-smoke, #8c857a);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.creditSecondary:hover {
  color: var(--color-cream, #f7f3e6);
  border-color: var(--color-rust, #ffbb00);
}

/* ---- Logo opening — glows on the closed curtain, lifts away on scroll ---- */
.logoOpening {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  pointer-events: none;
}
.logoTonight {
  font-family: var(--font-libre), monospace;
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--color-brass, #f3e0a2);
  opacity: 0.85;
}
.logoImg {
  width: auto;
  height: 300px;
  filter: drop-shadow(0 0 60px rgba(255, 187, 0, 0.4)) drop-shadow(0 10px 28px rgba(0, 0, 0, 0.65));
}
@media (max-width: 767px) {
  .logoImg {
    height: 200px;
  }
}

/* ---- Follow spotlight (unchanged) ---- */
.spot {
  position: absolute;
  top: 0;
  left: 0;
  width: 760px;
  height: 760px;
  margin-left: -380px;
  margin-top: -380px;
  z-index: 15;
  pointer-events: none;
  opacity: 0.7;
  background: radial-gradient(
    closest-side,
    rgba(255, 187, 0, 0.16) 0%,
    rgba(231, 25, 15, 0.05) 38%,
    transparent 72%
  );
}

/* ---- WebGL velvet curtain planes (unchanged) ---- */
.plane {
  position: absolute;
  top: 56px;
  bottom: 0;
  width: 50%;
  z-index: 20;
  pointer-events: none;
}
.planeL {
  left: 0;
}
.planeR {
  right: 0;
}
.glCanvas {
  position: absolute;
  inset: 0;
  z-index: 22;
  pointer-events: none;
}

/* SSR-visible first paint (unchanged) — /curtain-closed.jpg is a screenshot of
   the real closed WebGL curtain; geometry is unchanged so it stays valid. */
.curtainStandIn {
  position: absolute;
  inset: 56px 0 0;
  z-index: 21;
  pointer-events: none;
  background-color: #3a0a0a;
  background-image: url("/curtain-closed.jpg");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.letterboxBottom {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 56px;
  background: var(--color-stage-deep, #060504);
  z-index: 40;
}

.scrollCue {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 42;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: var(--font-libre), monospace;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #8c857a;
}
.scrollCueLine {
  width: 1px;
  height: 26px;
  background: #8c857a;
  opacity: 0.6;
}

/* Short viewports: shrink the frame + credits so the whole hero fits one
   pinned 100svh with no internal scroll. */
@media (max-height: 760px) {
  .silverFrame {
    max-width: min(900px, 86vw);
  }
  .creditLabel {
    font-size: clamp(22px, 3vw, 30px);
  }
  .logoImg {
    height: 230px;
  }
}

/* House Lights keeps the hero in Movie Mode (dark) in both themes. */
```

- [ ] **Step 2: Verify the stylesheet compiles**

Run: `npm run build`
Expected: build does not fail on CSS. (TypeScript errors about removed `styles.*` members surface here too — they're fixed in Task 3; if the only failures are unresolved `styles.heroVideo`/`styles.title`/etc. references in the not-yet-edited component, that's expected. Proceed to Task 3, then re-run.)

- [ ] **Step 3: Commit**

```bash
git add components/curtain-credits-hero.module.css
git commit -m "style: silver-screen frame + credits-beneath + logo-opening CSS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Rewire the hero component

**Files:**
- Modify: `components/curtain-credits-hero.tsx`

Four surgical edits. Leave the preserved regions (shaders, interfaces, SIZZLE constants, the four `useEffect`s) untouched.

- [ ] **Step 1 — Edit A: imports + drop the inline nav data**

Change the React import (line 3):

```tsx
import { useEffect, useRef, useState } from "react";
```
to:
```tsx
import { useCallback, useEffect, useRef, useState } from "react";
```

Add this import directly after `import { useTheme } from "./theme-provider";`:

```tsx
import { PRIMARY_CREDITS, SECONDARY_CREDITS } from "@/lib/hero-nav";
```

Delete the `Credit` interface entirely:

```tsx
interface Credit {
  role: string;
  label: string;
  href: string;
  spot?: boolean;
}
```

Delete the `CREDITS` comment + array entirely:

```tsx
// The navigation, rendered as an end-credits roll. Each line is a destination.
const CREDITS: Credit[] = [
  { role: "General · VIP · Season Pass", label: "Buy Tickets", href: "/#tickets", spot: true },
  { role: "Open Call · FilmFreeway", label: "Submit a Film", href: "/submit" },
  { role: "200+ Shorts · 150+ Filmmakers", label: "The Films", href: "/schedule" },
  { role: "Sponsor · Donate · Shunpike", label: "Become a Funder", href: "/support" },
  { role: "Press Kit · Coverage · Contact", label: "Press & Media", href: "/support" },
  { role: "Founded by Lex Scope · Est. 2022", label: "About the Festival", href: "/about" },
];
```

Add the logo constant directly after the `SIZZLE_REEL_POSTER` constant:

```tsx
const POPCORN_LOGO = "/popcorn-logo.png";
```

- [ ] **Step 2 — Edit B: add refs, sound state, and the toggle handler**

Replace this ref block:

```tsx
  const leftPlaneEl = useRef<HTMLDivElement>(null);
  const rightPlaneEl = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });
```
with:
```tsx
  const leftPlaneEl = useRef<HTMLDivElement>(null);
  const rightPlaneEl = useRef<HTMLDivElement>(null);
  const logoOpeningRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef({ value: 0 });
```

Replace this state block:

```tsx
  const { theme } = useTheme();
  const [velvetSrc, setVelvetSrc] = useState("");
  const [curtainsReady, setCurtainsReady] = useState(false);
  const screenVisibility = curtainsReady ? "visible" : "hidden";
```
with:
```tsx
  const { theme } = useTheme();
  const [velvetSrc, setVelvetSrc] = useState("");
  const [curtainsReady, setCurtainsReady] = useState(false);
  const [reelMuted, setReelMuted] = useState(true);
  const screenVisibility = curtainsReady ? "visible" : "hidden";

  // The reel autoplays muted (browsers require it). The toggle flips audio and
  // re-plays so the unmute counts as a user gesture.
  const toggleReelSound = useCallback(() => {
    const v = reelVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setReelMuted(v.muted);
    void v.play().catch(() => {});
  }, []);
```

- [ ] **Step 3 — Edit C: drive the logo opening off the scroll timeline**

Replace the reduced-motion branch:

```tsx
          // Reduced motion: skip the scroll choreography, show the framed hero.
          if (reduced) {
            progressRef.current.value = 1;
            gsap.set(spotRef.current, { opacity: 1 });
            return;
          }
```
with:
```tsx
          // Reduced motion: skip the scroll choreography, show the framed hero
          // with the logo opening already cleared away.
          if (reduced) {
            progressRef.current.value = 1;
            gsap.set(spotRef.current, { opacity: 1 });
            gsap.set(logoOpeningRef.current, { opacity: 0 });
            return;
          }

          // Logo opening starts visible on the closed curtain.
          gsap.set(logoOpeningRef.current, { opacity: 1, y: 0 });
```

Replace the timeline:

```tsx
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: mobile ? "+=140%" : "+=190%",
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .to(progressRef.current, { value: 1, ease: "none", duration: 1 }, 0)
            .to({}, { duration: 0.6 });
```
with:
```tsx
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: mobile ? "+=140%" : "+=190%",
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .to(progressRef.current, { value: 1, ease: "none", duration: 1 }, 0)
            // The scroll cue fades immediately; the logo lifts + fades over the
            // first third of the open, before the curtains are fully parted.
            .to(scrollCueRef.current, { opacity: 0, duration: 0.12 }, 0)
            .to(
              logoOpeningRef.current,
              { opacity: 0, y: -48, duration: 0.4, ease: "power2.in" },
              0
            )
            .to({}, { duration: 0.6 });
```

- [ ] **Step 4 — Edit D: replace the render body**

Replace the **entire** `return ( … );` statement (from `return (` through the closing `);` of the component) with:

```tsx
  return (
    <section
      ref={root}
      className={`${styles.hero} ${curtainsReady ? "" : styles.awaitingCurtains}`}
      aria-label="Scope Screenings"
    >
      {/* Preload the first-paint curtain image so it's hot before layout. */}
      <link rel="preload" as="image" href="/curtain-closed.jpg" fetchPriority="high" />

      {/* The revealed stage (z-10): framed silver screen + credits beneath.
          Behind the curtains (z-20); hidden until the curtains have painted. */}
      <div className={styles.screen} style={{ visibility: screenVisibility }}>
        <div className={styles.topMarquee} aria-hidden>
          — A LexScope Production · Scope Screenings —
        </div>

        {/* Framed silver screen — the sizzle reel plays here, muted by default. */}
        <div className={styles.silverFrame}>
          <video
            ref={reelVideoRef}
            className={styles.frameVideo}
            autoPlay
            muted
            loop
            playsInline
            poster={SIZZLE_REEL_POSTER}
            aria-hidden
          >
            <source src={SIZZLE_REEL_MP4} type="video/mp4" />
          </video>

          <div className={styles.projectorGlow} aria-hidden />

          <div className={styles.recTick} aria-hidden>
            <span className={styles.recDot} />
            REC
          </div>
          <div className={styles.reelCounter} aria-hidden>
            REEL 01 / 01
          </div>

          <button
            type="button"
            onClick={toggleReelSound}
            aria-label={reelMuted ? "Turn the reel sound on" : "Mute the reel"}
            className={styles.soundToggle}
          >
            <span className={styles.soundIcon} aria-hidden />
            {reelMuted ? "Sound On" : "Mute"}
          </button>
        </div>

        <div className={styles.subLabel} aria-hidden>
          <span />
          Now Showing
          <span />
        </div>

        {/* Nav as credits — two primary actions + one secondary line. */}
        <div className={styles.creditsUnder}>
          <div className={styles.creditsPrimary}>
            {PRIMARY_CREDITS.map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                className={`${styles.creditPrimary} ${i === 0 ? styles.creditSpot : ""}`}
              >
                <span className={styles.creditRole}>{c.role}</span>
                <span className={styles.creditLabel}>{c.label}</span>
              </a>
            ))}
          </div>
          {SECONDARY_CREDITS.map((c) => (
            <a key={c.label} href={c.href} className={styles.creditSecondary}>
              {c.label}
            </a>
          ))}
        </div>
      </div>

      {/* Follow spotlight across the revealed stage. */}
      <div
        ref={spotRef}
        aria-hidden
        className={styles.spot}
        style={{ visibility: screenVisibility }}
      />

      {/* Logo opening (z-30) — glows on the closed curtain, lifts away on scroll. */}
      <div ref={logoOpeningRef} className={styles.logoOpening}>
        <div className={styles.logoTonight}>— Tonight —</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POPCORN_LOGO} alt="Scope Screenings" className={styles.logoImg} />
      </div>
      <div ref={scrollCueRef} aria-hidden className={styles.scrollCue}>
        ↓ Scroll to enter
        <span className={styles.scrollCueLine} />
      </div>

      {/* First-paint curtain stand-in (SSR), swapped for the live canvas. */}
      <div aria-hidden className={styles.curtainStandIn} />

      {/* WebGL velvet curtain planes. The <img> is the texture sampler only. */}
      <div ref={leftPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeL}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={velvetSrc} alt="" data-sampler="velvetTexture" style={{ display: "none" }} />
      </div>
      <div ref={rightPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeR}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={velvetSrc} alt="" data-sampler="velvetTexture" style={{ display: "none" }} />
      </div>
      <div ref={canvasContainerRef} aria-hidden className={styles.glCanvas} />

      <div aria-hidden className={styles.letterboxBottom} />
    </section>
  );
```

- [ ] **Step 5: Typecheck + lint**

Run: `npm run lint`
Expected: no errors. (No lingering references to `styles.heroVideo`, `styles.heroScrim`, `styles.edgeGuardL/R`, `styles.title`, `styles.wordmark`, `styles.creditsMask`, `styles.track`, `CREDITS`, or `Credit`.)

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: PASS (compiles, type-checks, no unused-symbol errors).

- [ ] **Step 7: Run the full test suite**

Run: `npm run test`
Expected: PASS — `hero-nav` (4) and the existing `site-nav` + checkout route tests all green.

- [ ] **Step 8: Commit**

```bash
git add components/curtain-credits-hero.tsx
git commit -m "feat: silver-screen hero — logo opening, framed reel + sound toggle, credits beneath

Curtains now part to a framed cinema screen playing the muted sizzle reel
with a sound on/off toggle; the popcorn logo glows on the closed curtain
and lifts away on scroll; nav renders as credits beneath the screen
(Buy Tickets + Submit a Film primary, Become a Funder secondary). Drops
the full-bleed video, on-screen wordmark, and the credits roll.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Visual verification (desktop) + screenshot record

**Files:**
- Uses: `.shots/capture.mjs` (existing Playwright script — scrolls the pinned hero through closed → parting → mid → framed, writes PNGs to `.shots/`, prints `CONSOLE_ERRORS`)

- [ ] **Step 1: Build + start the production server on the port the script expects**

Run (background the server):
```bash
npm run build && npx next start -p 3002
```
Expected: "Ready" on http://localhost:3002.

- [ ] **Step 2: Capture the scroll sequence**

In a second shell:
```bash
node .shots/capture.mjs
```
Expected: writes `.shots/01-closed.png`, `02-parting.png`, `03-midopen.png`, `04-framed.png`, `00-closed-full.png`, and prints `CONSOLE_ERRORS: []` (empty).

- [ ] **Step 3: Review the frames against the spec**

Open `.shots/01-closed.png` and `.shots/04-framed.png`. Confirm:
- **01-closed:** closed velvet curtain + glowing popcorn logo + "— Tonight —" + "↓ Scroll to enter". No screen/credits visible.
- **02/03:** logo fading/lifting as curtains part.
- **04-framed:** framed silver screen playing the reel (REC dot top-left, "REEL 01 / 01" top-right, "Sound On" toggle bottom-right), "Now Showing" sub-label, and the three credits beneath — **Buy Tickets** (gold) + **Submit a Film** side by side, **Become a Funder** below. No logo, no clipping/overlap, everything inside one viewport.

If `CONSOLE_ERRORS` is non-empty or a frame is wrong, fix the component/CSS, re-commit, and re-run Steps 1–2 before continuing.

- [ ] **Step 4: Commit the screenshot record**

```bash
git add .shots/01-closed.png .shots/02-parting.png .shots/03-midopen.png .shots/04-framed.png .shots/00-closed-full.png
git commit -m "test: capture silver-screen hero scroll sequence (desktop)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Mobile + sound-toggle + reduced-motion verification

**Files:**
- Create: `.shots/capture-hero-mobile.mjs` (a focused Playwright check for mobile layout, the sound toggle, and reduced motion)

- [ ] **Step 1: Write the mobile/interaction capture script**

Create `.shots/capture-hero-mobile.mjs`:

```js
// Verifies the silver-screen hero on a phone viewport: closed (logo) + framed
// (screen + stacked credits), that the sound toggle flips its label, and that
// reduced-motion renders the framed end-state on load. Requires the prod server
// on :3002 (npm run build && npx next start -p 3002).
import { chromium } from "/Users/admin/.npm/_npx/bc46ece8a1067505/node_modules/playwright/index.mjs";

const OUT = "/Users/admin/SS/.shots";
const URL = "http://localhost:3002";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});

// iPhone 12-ish portrait
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/m1-closed.png` });

// Scroll to the framed end of the pin (~140% of 844).
await page.evaluate(() => window.scrollTo(0, 844 * 1.5));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/m2-framed.png` });

// Sound toggle: label should read "Sound On" then flip to "Mute".
const before = await page.locator("button", { hasText: /sound on|mute/i }).first().innerText();
await page.locator("button", { hasText: /sound on|mute/i }).first().click();
await page.waitForTimeout(300);
const after = await page.locator("button", { hasText: /sound on|mute/i }).first().innerText();
console.log("SOUND_TOGGLE:", JSON.stringify({ before, after }));

// Reduced motion: framed end-state should be visible on load (no scroll).
const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const rp = await reduced.newPage();
await rp.goto(URL, { waitUntil: "networkidle" });
await rp.waitForTimeout(2000);
await rp.screenshot({ path: `${OUT}/m3-reduced.png` });

console.log("CONSOLE_ERRORS:", JSON.stringify(errors.slice(0, 20), null, 2));
await browser.close();
```

- [ ] **Step 2: Run it (prod server from Task 4 still on :3002)**

Run: `node .shots/capture-hero-mobile.mjs`
Expected:
- `SOUND_TOGGLE: {"before":"Sound On","after":"Mute"}` (label flips).
- `CONSOLE_ERRORS: []`.

- [ ] **Step 3: Review the mobile frames**

Open `.shots/m1-closed.png`, `m2-framed.png`, `m3-reduced.png`. Confirm:
- **m1-closed:** closed curtain + logo (smaller), scroll cue. Fits 390×844.
- **m2-framed:** 4/3 framed screen (not a thin slit), sound toggle reachable, credits **stacked** (Buy Tickets over Submit a Film, then Become a Funder), no internal scroll/clipping, tap targets comfortable.
- **m3-reduced:** framed screen + credits visible on load with no logo overlay (reduced-motion path).

If anything clips or overflows on the phone, tighten `.silverFrame max-width` / `.creditLabel` sizes in the `@media (max-height)` / `(max-width: 767px)` blocks, re-commit Task 2/3, and re-run.

- [ ] **Step 4: Commit**

```bash
git add .shots/capture-hero-mobile.mjs .shots/m1-closed.png .shots/m2-framed.png .shots/m3-reduced.png
git commit -m "test: mobile + sound-toggle + reduced-motion checks for silver-screen hero

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Final review pass

- [ ] **Step 1: Confirm the whole hero against the spec checklist**

With the prod server running, manually load http://localhost:3002 and verify the spec's §8 list end-to-end:
1. Fresh load → closed curtain + glowing logo + scroll cue. ✓
2. Scroll → logo lifts/fades, curtains part, framed reel + credits beneath. ✓
3. Sound toggle flips audio **and** label both ways (you should hear the reel after the first click). ✓
4. Reduced motion → framed end-state on load, muted video, working toggle, no logo animation. ✓
5. WebGL-failure path still reveals the screen (temporarily force by renaming the curtains import is optional; the `onError`→`setCurtainsReady(true)` path is unchanged from before). ✓
6. bfcache: navigate away and use browser Back → curtains re-measure, no stuck-open/misalignment. ✓
7. Mobile 390 width → no internal scroll, reel not a slit, tap targets OK. ✓

- [ ] **Step 2: Stop the prod server**

Stop the backgrounded `next start` process.

- [ ] **Step 3: Final lint + test + build gate**

Run: `npm run lint && npm run test && npm run build`
Expected: all green.

- [ ] **Step 4: Confirm the branch**

Run: `git status && git log --oneline -8`
Expected: on `ALT`, clean tree, the Task 1–5 commits present.

---

## Self-review notes (already reconciled against the spec)

- **Spec §3.1 logo opening (A):** Task 3 Edit C + Edit D (logoOpening overlay + timeline fade/lift; reduced-motion clears it). ✓
- **Spec §3.2 layout B / fit #2:** Task 2 (`.creditsUnder`/`.creditsPrimary`/`.creditSecondary`) + Task 3 Edit D. ✓
- **Spec §3.3 three nav items:** Task 1 (`hero-nav.ts` + test). ✓
- **Spec §4 framed screen + sound toggle:** Task 2 (`.silverFrame` et al.) + Task 3 Edit B (toggle) + Edit D (markup). ✓
- **Spec §5 edit in place, no rename, no page.tsx change:** component keeps the `CurtainCreditsHero` named export. ✓
- **Spec §6 mobile / §7 a11y:** Task 2 media queries + Task 5 checks; `aria-label`s, real `<a>` links, `aria-hidden` dressing in Edit D. ✓
- **Spec non-goals (drop reel navigator, cast lists, wordmark, full-bleed video/scrim/edge-guards):** removed in Task 2 (CSS) + Task 3 Edit D (markup). ✓
- **Dropped names guard:** `hero-nav.test.ts` asserts The Films / Press & Media / About never reappear. ✓
```
