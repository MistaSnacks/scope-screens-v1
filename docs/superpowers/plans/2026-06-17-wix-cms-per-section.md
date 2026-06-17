# Wix CMS Restructure — Per-Section Collections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Checkbox tracking. Re-architects the shipped phase-1/2 CMS into per-section collections for editor clarity.

**Goal:** Replace the generic `Sections` table + global `Settings` with one **`SINGLE_ITEM` collection per section** (a clean form holding only that section's fields), and rename the repeating sub-list collections so they group beside their section in the Wix sidebar. Same fail-safe fallbacks; no change to which *content* is editable — only where it lives.

**Architecture:** `getSiteContent()` keeps backward-compat during migration (adds per-section objects alongside the old `sections`/`settings`), components migrate one at a time (each build stays green), then the old reads + collections are removed last.

**Tech Stack:** Next.js 16, TS, Vitest, Wix Data REST + MCP.

## Global Constraints
- Wix site "scope" `5e0eaedc-6847-4c06-bb37-34cb6ff143b5`; anonymous `WIX_CLIENT_ID`.
- All new collections read=ANYONE; section collections are `SINGLE_ITEM`.
- Every field keeps its festival.ts/literal fallback in the component (never throws/breaks; empty-`WIX_CLIENT_ID` build must pass).
- Do NOT modify `wix-checkout.ts`/`wix-events.ts`; deadlines/notification stay in `festival.ts`; tickets/schedule out of CMS; filmstrip images deferred.
- Keep `Partners`, `Marquee`, `Socials` collections as-is (already single-purpose) — optional displayName regroup only.
- TDD for `site-content.ts` logic; components verified `npm test` + `npm run build` + `npx eslint <files>`.
- Work on `main`; commit per task. Each task must leave the build green.

## Target: SINGLE_ITEM section collections (seed = current values)
- **`Hero`** — `eyebrow`="Feature Presentation", `title`="Scope\nScreenings", `tagline`="Seattle's Underground Film Festival", `poster`(IMAGE), `video`(VIDEO)
- **`WhatIs`** — `eyebrow`="SC. 01 · Roll 22 · Now Rolling", `title`="What Is Scope Screenings?", `body`=<paragraph>, `motto`="We put the fun back in film fests."
- **`BuiltForAccess`** — `eyebrow`="Chapter Two", `title`="Built For\nAccess", `quote`=<founder quote>, `founderName`="Lex Scope", `founderTitle`="Festival Director", `founderCredential`="Seattle Film Commissioner", `photo`(IMAGE)
- **`MagicGallery`** — `eyebrow`="Chapter Three", `title`="Scope Screenings\nMagic", `body`=<paragraph>, `ctaLabel`="See more from the floor", `ctaUrl`="https://instagram.com/scopescreenings"
- **`Submissions`** — `eyebrow`="Open Call · Season 5 Submissions", `title`="Submit Your Film", `intro`=<paragraph>, `ctaLabel`="Open the Call ›", `ctaUrl`="https://filmfreeway.com/scopescreenings"
- **`Archives`** — `eyebrow`="Chapter Four", `title`="The Archives", `body`=<paragraph>, `ctaLabel`="Browse all 200+ films", `ctaUrl`="/schedule"
- **`Support`** — `eyebrow`="Chapter Four", `title`="Keep It Running", `funderTitle`="Become a Funder", `funderBody`=<…>, `donateLabel`="Support the Festival ›", `donateUrl`="https://shunpike.org/artist/scope-screenings/", `pressTitle`="Press & Media", `pressBody`=<…>, `pressKitLabel`="Download Press Kit ›", `pressEmail`="press@scopescreenings.com"
- **`Footer`** — `signoff`="See You At\nThe Movies", `tagline`=<…>, `newsletterHeading`="Get the lineup in your inbox", `copyright`=<…>, `contactEmail`="hello@scopescreenings.com"
- **`SiteSettings`** — `venueName`="Langston Hughes Performing Arts Institute", `venueAddress`="104 17th Ave S", `venueCity`="Seattle, WA"

(Exact seed strings = the values currently in the live CMS / `festival.ts`; read them from the existing `Sections`/`Settings` before deleting.)

## List collections: displayName regroup (no recreation, no data change)
PATCH `displayName` only: `Clapboard`→"WhatIs — Clapperboard", `Stats`→"BuiltForAccess — Stats", `Moments`→"MagicGallery — Moments", `SubmissionChips`→"Submissions — Chips", `GivingTiers`→"Support — Giving Tiers", `PressKit`→"Support — Press Kit". (IDs unchanged → list readers in code unchanged.)

## New `getSiteContent` shape (final)
Per-section objects: `hero, whatIs, builtForAccess, magicGallery, submissions, archives, support, footer, siteSettings` (each `T | null` from a SINGLE_ITEM `getSingleton`). Lists unchanged: `clapboard, stats, moments, chips, givingTiers, pressKit, partners, marquee, socials`. Remove `sections` map, `sectionOf`, and `settings` at the end (Task K).

---

### Task A: Create + seed section collections, regroup list names (Wix MCP) — controller
- [ ] Read current `Sections` rows + `Settings` item via anon token to capture exact seed strings (bodies, etc.).
- [ ] Create the 9 `SINGLE_ITEM` collections above (`collection.singleItemOptions` / the SINGLE_ITEM capability per the create-collection schema; read=ANYONE; field displayName + description help text). Confirm the exact request shape for SINGLE_ITEM via `ReadFullDocsArticle` on create-data-collection before calling.
- [ ] Seed each with one item (the values above; carry `poster`/`video`/`photo` empty — components fall back).
- [ ] PATCH the 6 list collections' `displayName` (update-data-collection).
- [ ] Verify all 9 section collections + renamed lists read via anon token. No commit (Wix-side).

### Task B: `getSiteContent` — add per-section reads (backward-compatible) (TDD)
- [ ] In `lib/site-content.ts`, add interfaces `HeroContent, WhatIsContent, BuiltForAccessContent, MagicGalleryContent, SubmissionsContent, ArchivesContent, SupportContent, FooterContent, SiteSettingsContent` (fields per schema above), add `getSingleton` reads for the 9 new collections into the `Promise.all`, expose them on `SiteContent`. KEEP the existing `sections`/`settings`/`sectionOf` for now. Extend the test to assert the new per-section objects resolve + all-null tolerance. Commit `feat(cms): per-section content readers (additive)`.

### Tasks C–J: migrate each component to the new per-section fields (one per task, build green each)
For each: replace `sectionOf(content,"X")` → `content.X` and any `content.settings?.f` → the relevant per-section field; keep the SAME festival.ts/literal fallbacks; verify test+build+eslint; commit.
- [ ] **C** `components/curtain-credits-hero.tsx`-via-`app/page.tsx`: `content.hero` (eyebrow/title/tagline/poster/video).
- [ ] **D** `components/what-is.tsx`: `content.whatIs` (eyebrow/title/body/motto) + `content.clapboard` (unchanged).
- [ ] **E** `app/page.tsx` Built-For-Access: `content.builtForAccess` (eyebrow/title/quote/founderName/founderTitle/founderCredential/photo) + `content.stats`.
- [ ] **F** `app/page.tsx` Magic + Archives: `content.magicGallery`, `content.archives`.
- [ ] **G** `components/moments-reel.tsx` via page: `content.moments` (unchanged source) — only touch if it referenced sections; otherwise skip.
- [ ] **H** `components/submissions.tsx`: `content.submissions` (eyebrow/title/intro/ctaLabel/ctaUrl) + `content.chips`.
- [ ] **I** `components/support-press.tsx`: `content.support` (all funder+press fields) + `content.givingTiers` + `content.pressKit`.
- [ ] **J** `components/site-footer.tsx`: `content.footer` (signoff/tagline/newsletterHeading/copyright/contactEmail) + `content.socials`; `components/marquee.tsx`: venue from `content.siteSettings?.venueName`.

### Task K: remove legacy reads (TDD)
- [ ] In `lib/site-content.ts` remove the `Sections` + `Settings` reads, the `sections` map, `sectionOf`, and the old `CmsSection`/`CmsSettings` if unreferenced. Grep the repo to confirm no remaining `sectionOf`/`content.settings`/`content.sections` references. Update the test. `npm run build` green. Commit `refactor(cms): drop legacy Sections/Settings reads`.

### Task L: delete legacy collections (Wix MCP) — controller
- [ ] After Task K verified, delete the `Sections` and `Settings` collections. Verify the site still builds + renders (Task M).

### Task M: full verification + end-to-end smoke — controller
- [ ] `npm test`, `npm run build`, `WIX_CLIENT_ID= npm run build`, `npx eslint <changed files>`.
- [ ] End-to-end: edit one section's single-item field (e.g. `WhatIs.title`) → build+start+curl → confirm render → revert.

## Self-Review
Per-section single-item collections replace the generic Sections grab-bag (A,B). Each component reads its own section object with unchanged fallbacks (C–J). Lists regrouped by displayName only (A). Legacy removed last so builds stay green (K,L). Deadlines/tickets/schedule/checkout untouched (constraint). Section order remains code-defined in app/page.tsx (no CMS ordering existed).
