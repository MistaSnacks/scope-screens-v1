# ALT branch — artboard restyle + multi-page site

**Date:** 2026-06-14
**Branch:** `ALT` (off `main` @ `1344bb3`)
**Status:** Approved design → implementation

## Goal

Take the current single-page Scope Screenings site and, on a new `ALT` branch:

1. Port the visual styling of two Paper artboards — light **`70Y-0`** ("House Lights · DYNAMIC") and dark **`8JY-0`** ("Movie Mode · DYNAMIC (dark twin)") — into the existing light/dark theme system.
2. Convert the site from one page into a **multi-page** site: dedicated routes for every nav item **except Watch** (`/schedule`, `/submit`, `/about`, `/support`).
3. Keep the new **"Scope Screenings Magic"** moments-reel section in the build.

### Invariants (must match `main`)
- **Section order** on the homepage is unchanged.
- The **valance** (`PersistentValance`) and **nav bar** (`SiteNav`) keep their exact current design — popcorn logo, centered links, theme toggle, "Get Tickets" pill, mobile hamburger.
- **Fonts** unchanged: Aachen (display) / Anton (marquee) / Fraunces (credits+serif) / Libre Franklin (body) / JetBrains Mono (mono).

## Architecture

### Shared chrome via the root layout
Persistent chrome moves out of `app/page.tsx` into shared scope so every route renders it identically:

- `app/layout.tsx` already provides `ThemeProvider` → `CheckoutProvider` → children, plus `GrainOverlay`. Add the persistent chrome here (or in a thin client wrapper): `PersistentValance` + `SiteNav` + `SiteFooter`.
- **Home-only** (stay in `app/page.tsx`): `CurtainCreditsHero`, `ScrollControl`, `Marquee`. These are coupled to the hero's pinned ScrollTrigger math and must not ship to sub-pages.
- Sub-pages render under the fixed valance+nav, so each sub-page wraps its content in a top spacer (~140px, `pt-[140px]`-ish) so the first heading clears the chrome. The homepage doesn't need this because the hero owns the top of the viewport.

### Routing
| Nav item | Route | Page |
|---|---|---|
| Watch | `/` | Full one-pager (hero + all sections, current order) |
| Schedule | `/schedule` | Standalone "Seven Nights" calendar |
| Submit | `/submit` | From artboard `1F5-0` |
| About | `/about` | From artboard `1JG-0` |
| Support | `/support` | From artboard `3F6-0` |

- `SiteNav` switches from anchor links (`#tickets`) to Next.js route links, taking an `active` prop derived from the current pathname (it becomes a client component reading `usePathname()`, or each page passes `active`).
- The hero's internal `CREDITS` menu (Buy Tickets / Submit Your Film / The Films / Become a Funder / Press & Media / About the Festival) re-targets the real routes: Buy Tickets→`/#tickets` (tickets stays a home section), Submit→`/submit`, The Films→`/schedule`, Become a Funder & Press→`/support`, About→`/about`.
- `Filmstrip` cards already link to `/schedule` — that route now exists (previously a dead link).

### Providers
`ThemeProvider` and `CheckoutProvider` are global in the root layout, so every new route inherits theme + checkout with no per-route wiring. `/schedule` does its own server-side Wix fetch via `getLiveSchedule()` (same as the current `ScheduleSection`).

## Visual system

Both artboards are the **same layout theme-flipped** — this maps directly onto the existing semantic tokens in `app/globals.css` (Movie Mode default + `:root[data-theme="house"]` overrides). Work is *tightening* those tokens to match the boards, not rebuilding the system.

### Brand-constant accent bands (both modes)
The artboards' signature is two saturated bands that appear in **both** light and dark:
- **Gold band** (`bg-rust`, dark ink text) on the films section ("The Program" / "The Archives").
- **Red band** (`bg-curtain`, cream text) on the founder section ("Built For Access").

These are added to the homepage **in the sections' existing positions** — no reordering. All other sections keep flipping cream (`#f2ebd9`) ↔ dark via the semantic tokens.

### What flips
Neutral grounds, text, hairlines, eyebrow/heading accents flip per the existing `--color-bg / bg-alt / fg / muted / hairline / label / heading / heading-edge` tokens. Hero stays always-dark (Movie Mode) in both themes by design — unchanged.

## The four new pages (content from the dedicated artboards)

Each page reuses the homepage section components where they already exist, and adds page-specific blocks drawn from the artboards. All pages share the chrome + footer.

### `/about` (artboard `1JG-0`)
1. Hero eyebrow "ABOUT THE FESTIVAL" + huge headline "WE PUT THE FUN BACK IN FILM FESTS" + lede.
2. "WHAT IS SCOPE SCREENINGS" editorial + stat row (Last Tue / ~300 / 10 / ≤20 min).
3. "BUILT FOR ACCESS" — founder, **red band**, stats (200+/150+/20+/6+). Reuse the homepage founder block.
4. Partners ("In Good Company") — reuse `PartnersMarquee`.
5. "HOW WE GOT HERE" timeline — 2022 / 2023–24 / 2025 / 2026 rows.
6. "THE HOUSES" — venue cards (Langston Hughes, Majestic Bay, SIFF Egyptian).

### `/submit` (artboard `1F5-0`)
1. "SUBMIT YOUR FILM" headline + open-call deadline card (next `SUBMISSION_DEADLINE`, entry-from, runtime).
2. "WHAT WE'RE AFTER" — 3-up (point of view / 20 min max / made by you).
3. "MARK YOUR CALENDAR" — deadlines table from `SUBMISSION_DEADLINES` with fees + waiver note.
4. "THREE STEPS IN" — cut to twenty / enter on FilmFreeway / watch your inbox.
5. "GOT A FILM? SEND IT." CTA → `SUBMIT_URL`.

### `/support` (artboard `3F6-0`)
1. "KEEP IT RUNNING" headline + "GIVE TODAY" donate card (Shunpike 501c3).
2. "WHERE IT GOES" — stats ($0 cost barrier / 300+ seats / 100% to the work).
3. "PICK YOUR LEVEL" — 4 tiers (Friend $50 / Patron $250 / Producer $1,000 / Title Partner custom). Reconcile with `SPONSOR_TIERS` in `lib/festival.ts`.
4. 501(c)(3) note.
5. "TWO WAYS TO BACK US" — Fund the Mission / Put Your Brand On It.
6. Partners + "KEEP THE SCREEN LIT" CTA. Reuse `SupportPress` content where it overlaps.

### `/schedule` (no artboard — build to match)
Standalone page hosting the existing `ScheduleSection` (live Wix-merged "Seven Nights" calendar) with a proper page header eyebrow + heading, top spacer, and the shared footer. Season-pass CTA retained.

## Data
All content sources stay in `lib/festival.ts` (NAV_ITEMS, SUBMISSION_*, SPONSOR_TIERS, SCREENINGS, FOUNDER, VENUE, etc.). New page copy that isn't already there (timeline years, venue list, submit steps, giving levels) is added to `lib/festival.ts` as typed constants so pages stay data-driven. Checkout + Wix events unchanged.

## Testing / verification
- `npm run build` (typecheck) and `npm run lint` pass on `ALT`.
- Existing vitest suites (checkout, wix-checkout) still pass — no API changes.
- Manual visual review of `/`, `/schedule`, `/submit`, `/about`, `/support` in **both** Movie Mode and House Lights, checked against the artboards.
- Nav active states correct per route; valance+nav render identically on every page; sub-page content clears the fixed chrome.

## Out of scope
- No reordering of homepage sections.
- No changes to the nav/valance design, fonts, hero mechanics, checkout flow, or Wix integration.
- Concept B / Editorial Cinema layouts are not used.
