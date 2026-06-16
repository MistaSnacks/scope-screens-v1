# Silver-Screen Hero — Design Spec

**Date:** 2026-06-15 · **Branch:** ALT · **Project:** `/Users/admin/SS` (the festival site we ship)

This is the last hero pass before the CMS work. We are evolving the existing
`CurtainCreditsHero` into a **silver-screen hero**: keep our WebGL velvet
curtains, front them with a **logo opening**, and let them part to reveal a
**framed cinema screen** playing the sizzle reel (with a sound toggle), backed by
**our** nav rendered as credits **beneath** the screen.

Design input is borrowed from the *Scope Screenings* concept project
(`/Users/admin/Scope Screenings/web/components/silver-screen.tsx` +
`curtain-hero.tsx`). **We build everything here, in SS, on ALT** — nothing is
written back to the Scope Screenings project.

---

## 1. Goal & non-goals

**Goal.** A cinematic hero that:
1. opens on the **closed velvet curtain** with the **popcorn logo glowing center-stage** ("the logo opening");
2. parts the curtains **on scroll** (the mechanism we already have) to reveal a **framed silver screen**;
3. plays the **sizzle reel** on that screen, **muted by default**, with a **sound on/off toggle**;
4. presents **our nav** (Buy Tickets, Submit a Film, + Support) as **credits underneath the screen**, with Buy Tickets and Submit a Film as the clear primary actions.

**Non-goals (explicitly dropped from the Scope Screenings source):**
- The **multi-reel navigator** (prev/next, reel dots 01–06) — removed. It is the "confusing information underneath" we are replacing.
- The **per-reel cast lists** and the **auto-advancing title-card → Now Showing** carousel — removed. The screen has **one** state.
- No new color system, no new fonts — reuse existing tokens and font vars.
- No changes to the page sections below the hero, the persistent `SiteNav`, or routing.

---

## 2. What we keep vs. change

| Element | Today (`CurtainCreditsHero`) | After |
|---|---|---|
| WebGL velvet curtains | Part on scroll (pinned, scrubbed) | **Keep as-is** (shaders, planes, stand-in, bfcache handling) |
| Logo opening | none | **Add** — popcorn logo + "TONIGHT" glow on the closed curtain, lifts away as curtains part |
| Revealed surface | Full-bleed screen | **Framed silver screen** (cinemascope border, projector glow, REC + reel-counter ticks) |
| Video | Sizzle reel, muted, no control | Sizzle reel, muted by default, **+ sound on/off toggle** |
| Nav | Credits **roll over** the video | **Credits beneath** the framed screen; 2 primary + secondary row |
| Wordmark title on screen | "Scope / Screenings" over video | **Removed** — identity now carried by the logo opening; screen is pure reel |
| Follow spotlight | present | **Keep** (optional; cheap, on-brand) |

---

## 3. Layout & sequence

### 3.1 Sequence (decision: storyboard A)

The hero is pinned and scroll-scrubbed exactly as today (`ScrollTrigger`, `pin`,
`scrub`, `openFactor` 0.62 desktop / 0.76 mobile). A single `progress` 0→1 drives
the curtain open. We layer the logo opening onto the **front** of that timeline:

1. **`progress ≈ 0` (closed):** velvet curtains closed. Centered above them: the
   **popcorn logo** with a warm gold glow, a `— TONIGHT —` eyebrow above it, and
   the existing `↓ Scroll to enter` cue below.
2. **`progress ≈ 0 → 0.35` (parting begins):** the logo **lifts slightly and
   fades** (translateY up + opacity → 0, glow softens); "TONIGHT" and the scroll
   cue fade first. Curtains begin to part.
3. **`progress → 1` (framed open):** curtains settle at the framed rest position.
   The **silver screen** is revealed playing the reel, with the **nav credits**
   beneath it. Spotlight follows the cursor across the revealed area.

**Reduced motion / remembered-open / WebGL-failure:** render the framed end-state
immediately (logo already gone, screen + nav visible) — same guard logic the hero
uses today (`prefers-reduced-motion`, `setCurtainsReady` on error). The logo
opening is motion garnish, never a gate to content.

### 3.2 Revealed composition (decision: layout B, fit #2)

Within the parted (framed) curtains, centered in the pinned viewport, top → bottom:

```
        ── A LEXSCOPE PRODUCTION · SCOPE SCREENINGS ──        (top marquee, brass, optional)
   ┌───────────────────────────────────────────────┐
   │ ● REC                                 REEL 01  │        framed silver screen
   │                                                │        - cinemascope ~2.35:1 desktop
   │            [ sizzle reel video ]               │        - 4/3 on phones (so it isn't a slit)
   │                                                │        - projector-glow ellipse
   │                                    🔊 SOUND ON │        - sound toggle bottom-right
   └───────────────────────────────────────────────┘
        ──────────  CHAPTER · NOW SHOWING  ──────────        (sub-label, smoke, optional)

      GENERAL · VIP · SEASON          OPEN CALL · FILMFREEWAY
        BUY TICKETS                     SUBMIT A FILM           ← two primary credits (large)
   ───────────────────────────────────────────────────────
                    BECOME A FUNDER                            ← secondary (small, single link)
```

- **Primary credits** (Buy Tickets, Submit a Film): the big-credit treatment from
  the current hero — small role eyebrow + bold display label. Buy Tickets uses the
  gold/`rust` accent (its `spot` styling today); Submit a Film in cream. Side by
  side on desktop, stacked on mobile.
- **Secondary** (Become a Funder → Support): a single quiet link beneath the two
  primaries (mono, smoke→cream on hover). Centered; no wrapping needed.
- Exact type treatment (eyebrow optional, sizes) is final-tuned during build; the
  liked look is the reference, not a contract.

### 3.3 Nav content (decision: 3 items — 2 primary + 1 secondary)

Trim the existing `CREDITS` array to three destinations (hrefs unchanged). The
priority is unmistakably **Buy Tickets** and **Submit a Film**; everything else
the festival offers stays reachable via the persistent `SiteNav` header and the
footer.

| Tier | Role (eyebrow) | Label | href |
|---|---|---|---|
| primary | General · VIP · Season Pass | Buy Tickets | `/#tickets` |
| primary | Open Call · FilmFreeway | Submit a Film | `/submit` |
| secondary | Sponsor · Donate · Shunpike | Become a Funder | `/support` |

**Dropped from the hero** (still in header/footer nav): The Films (`/schedule`),
Press & Media, About the Festival (`/about`). The secondary link may drop its
eyebrow to stay quiet.

---

## 4. The framed silver screen (visual detail)

Ported from `silver-screen.tsx`'s screen frame, adapted to SS tokens:

- **Frame:** `aspect-[4/3]` on `<768px`, `aspect-[2.35/1]` ≥768px; `max-width ~1180px`;
  background `var(--color-stage)`; `1.5px` border `rgba(247,243,230,0.18)`;
  layered box-shadow for depth + inner vignette (as in source).
- **Projector glow:** centered radial ellipse, warm brass/gold, low alpha (source values).
- **Corner ticks:** `● REC` (curtain-bright dot + label) top-left; `REEL 01 / 01`
  top-right. Static dressing — no longer a navigator.
- **Video:** `<video autoPlay muted loop playsInline>` using the existing
  `SIZZLE_REEL_MP4` + `SIZZLE_REEL_POSTER`, `object-cover`. A directional scrim is
  **not** needed (no copy over the video now); a light vignette is fine.
- **Sound toggle:** bottom-right button (ported `toggleReelSound`): flips
  `video.muted`, re-`play()`s, label toggles `SOUND ON` ⇄ `MUTE`. Keyboard
  focusable, `aria-label` reflects state.

The framed screen sits **in front of** the revealed background (z above
video-back / edge-guards, below the curtains z-20 and the logo overlay).

---

## 5. Components & files

Keep it as **one hero component** (the current file is already self-contained and
the curtain machinery is tightly coupled to it). Refactor in place rather than
splitting, to avoid threading GSAP/curtains refs across boundaries.

- **`components/curtain-credits-hero.tsx`** — edit in place:
  - add the **logo-opening overlay** (logo + TONIGHT + scroll cue) above the curtains;
  - replace the on-screen `title` + `creditsMask` roll with the **framed silver
    screen** (video + toggle + ticks) and the **credits-beneath** block;
  - add `reelMuted` state + `toggleReelSound` (ported);
  - extend the GSAP timeline to drive the logo lift/fade off the same `progress`.
  - *(Optional, only if the file gets unwieldy: extract `SilverScreenFrame` and
    `HeroCredits` as local sub-components in the same file — no new files unless
    needed.)*
- **`components/curtain-credits-hero.module.css`** — edit in place: add
  `.silverFrame`, `.projectorGlow`, `.recTick`, `.reelCounter`, `.soundToggle`,
  `.logoOpening`, `.heroCreditsUnder` (+ primary/secondary), responsive blocks;
  remove the now-unused `.creditsMask`/`.track` roll styles (or keep if the
  optional roll ever returns — default is **remove**).
- **Rename?** The component name `CurtainCreditsHero` is still accurate enough
  (curtains + credits). **Do not rename** to avoid churn in `app/page.tsx` and
  tests; revisit only if it confuses.

No changes to `app/page.tsx` import, `lib/festival.ts`, `SiteNav`, or routes.

---

## 6. Mobile

- Screen frame **4/3** (not 2.35:1) so the reel isn't a thin slit; verify on ~360px.
- Logo opening: smaller logo, `openFactor` 0.76 (already mobile-tuned).
- Primary credits **stack** (Buy Tickets above Submit a Film), full big treatment.
- Secondary link (Become a Funder) centered beneath; tap target ≥44px.
- Everything (screen + nav) must fit the pinned `100svh` without internal scroll
  on common phones; if tight, shrink screen `max-width`/credit sizes before
  allowing overflow. Validate at 360×640 and 390×844.
- Respect `prefers-reduced-motion` (framed end-state, no logo animation, video
  still autoplays muted; sound toggle still works).

---

## 7. Accessibility

- Section keeps `aria-label="Scope Screenings"`.
- Logo `<img>`/`next/image` `alt="Scope Screenings"`; decorative glow `aria-hidden`.
- Video `aria-hidden`; sound toggle is the real control with a stateful `aria-label`.
- Credits are real `<a>` links (keyboard reachable) — same as today; primary links
  visually larger but semantically equal.
- REC/reel ticks, projector glow, spotlight all `aria-hidden`.

---

## 8. Testing & verification

- **Existing tests** (`site-nav.test.ts`, checkout route tests) must stay green.
- Manual / visual checks (dev server + screenshots):
  1. Fresh load: closed curtain + glowing logo + scroll cue.
  2. Scroll: logo lifts/fades, curtains part, framed screen + reel appears, nav beneath.
  3. Sound toggle flips audio and label both ways.
  4. Reduced-motion: framed end-state on load, muted video, working toggle, no logo anim.
  5. WebGL-failure path (`onError`): screen still reveals (no permanent blank).
  6. bfcache back/forward: curtains re-measure, no stuck-open/misaligned state.
  7. Mobile 360 & 390 widths: no internal scroll, tap targets OK, reel not a slit.
- Capture before/after screenshots into `.shots/` for the record.

---

## 9. Risks / open notes

- **Vertical budget:** framed screen + two primary credits + secondary row inside
  one pinned viewport is the tightest constraint. Mitigation: 4/3→2.35 responsive
  frame, clamp credit sizes, secondary row stays single-line where possible.
- **`curtain-closed.jpg` first paint:** unchanged; logo overlay sits above it, so
  first paint shows closed curtain then logo mounts. Acceptable.
- **Logo asset:** `/popcorn-logo.png` exists in `public/`; confirm it's the
  colored popcorn mark (palette-locked per project memory), not the black monogram
  (`ss-monogram.png`). If wrong, swap source during build.
- Curtain shaders, stand-in capture, and scroll/pin mechanics are **out of scope**
  to change — reuse verbatim.
