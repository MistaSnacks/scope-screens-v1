# Wix CMS Expansion (full per-element editability) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) tracking. Builds on the shipped phase-1 CMS (see `2026-06-17-wix-cms-headless.md`).

**Goal:** Make nearly every front-page element of the `main` SPA editable in the Wix CMS — hero (title/poster/video), the What-Is clapperboard + quote, the full Built-For-Access section (founder details, photo, stats), the Magic gallery reel, submissions copy/chips, the whole "Keep It Running" support/press section incl. links, and the footer sign-off — each with a `festival.ts` fallback.

**Architecture:** Same as phase 1 — Wix Data collections read via the anonymous visitor token through `lib/site-content.ts` (`getSiteContent`, React-cached), components apply `?? festivalDefault`. New media types (VIDEO) get a converter alongside `wixImageUrl`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, Wix Data REST, Wix MCP (collection create/seed/field-add), `wixapis.com`.

## Global Constraints
- Wix site "scope" id `5e0eaedc-6847-4c06-bb37-34cb6ff143b5`; auth via `WIX_CLIENT_ID` anonymous grant.
- Every read returns `null` on any error and components fall back to `lib/festival.ts` / current literals. Never throws to render.
- New + modified collections: read permission `ANYONE`.
- **Submission deadlines stay in `festival.ts`** (`SUBMISSION_DEADLINES`, `nextSubmissionDeadline`, notification) — do NOT CMS-ify; do NOT modify that logic.
- Do NOT modify `lib/wix-checkout.ts` / `lib/wix-events.ts`. Tickets + schedule stay out of CMS.
- Filmstrip / Archives images stay in code (deferred).
- Field keys match `[a-zA-Z_][a-zA-Z0-9_-]{0,63}`. Field types available: TEXT, NUMBER, IMAGE, VIDEO, URL, BOOLEAN, RICH_TEXT.
- TDD for pure logic; component wiring verified with `npm test` + `npm run build` + `npx eslint <files>`.
- Work on `main`. Commit per task.

## New CMS shape (created/seeded via Wix MCP)

**Add fields to `Settings`** (create-field): `founderName`, `founderTitle`, `founderCredential`, `motto`, `supportUrl` (URL), `pressEmail` (all TEXT except supportUrl). Seed: "Lex Scope" / "Festival Director" / "Seattle Film Commissioner" / "We put the fun back in film fests." / "https://shunpike.org/artist/scope-screenings/" / "press@scopescreenings.com".

**Add fields to `Sections`** (create-field): `video` (VIDEO). Update `hero` row: set `title`="Scope\nScreenings". Add rows: `support` (eyebrow "Chapter Four", title "Keep It Running", order 8); `supportFunders` (title "Become a Funder", body "A fiscally sponsored project of Shunpike, a 501(c)(3). Every dollar puts another underrepresented filmmaker on a big screen.", ctaLabel "Support the Festival ›", ctaUrl "https://shunpike.org/artist/scope-screenings/", order 9); `pressMedia` (title "Press & Media", body "Logos, fact sheet, founder bio, photography and b-roll. Everything you need to cover the festival.", ctaLabel "Download Press Kit ›", order 10).

**New collections** (all read=ANYONE, fields get displayName + description help text):
- **`Stats`** — `value` TEXT, `label` TEXT, `order` NUMBER. Seed: 200+/Films/1, 150+/Filmmakers/2, 20+/Screenings/3, 6+/Theaters/4.
- **`Moments`** — `image` IMAGE, `slug` TEXT (local fallback file), `badge` TEXT, `tone` TEXT (red|gold), `title` TEXT, `subtitle` TEXT, `order` NUMBER. Seed 6 rows from `components/moments-reel.tsx` `MOMENTS` (slug = the `img` value).
- **`Clapboard`** — `label` TEXT, `value` TEXT, `order` NUMBER. Seed: Production/Scope Screenings/1, Director/Lex Scope/2, Location/Seattle, WA/3, Est./June 2022/4, Runs/Last Tue · Monthly/5. (Render convention: row order 1 = the Production header block; rows ≥2 = the Field grid.)
- **`SubmissionChips`** — `label` TEXT, `accent` TEXT (curtain|rust), `order` NUMBER. Seed: ≤ 20 MIN/curtain/1, 6 CATEGORIES/rust/2, JUDGED AWARDS · NEW/curtain/3, JUNE–DECEMBER/rust/4.
- **`GivingTiers`** — `label` TEXT, `featured` BOOLEAN, `order` NUMBER. Seed: Friend $50/false/1, Patron $250/false/2, Producer $1,000/false/3, Title Partner/true/4.
- **`PressKit`** — `label` TEXT, `format` TEXT, `url` URL, `order` NUMBER. Seed: Press kit/.ZIP//1, Fact sheet & founder bio/PDF//2, Photo & b-roll library/DRIVE//3 (urls empty → fallback "#").

Also seed `submissions.eyebrow`="Open Call · Season 5 Submissions" and `submissions.body`="Narrative shorts, documentaries, animation, music videos, commercials, and experimental work — all under twenty minutes. Screened live on the big screen, June through December, and for the first time Season 5 brings judged awards." (update the existing submissions row).

## File Structure
- New: `lib/wix-video.ts` (+ test) — `wixVideoUrl()`.
- Modify: `lib/site-content.ts` (+ test) — add readers/types for the 6 new collections + new Settings fields.
- Modify: `components/curtain-credits-hero.tsx`, `what-is.tsx`, `moments-reel.tsx`, `submissions.tsx`, `support-press.tsx`, `site-footer.tsx`, `app/page.tsx`.

---

### Task 0: VIDEO field + converter spike (de-risk)
**Why:** A `wix:video://...` field value must convert to a playable `.mp4` URL for the hero `<video><source>`. Determine the exact value format before building the converter. Throwaway.

- [ ] Add the `video` field to `Sections` via MCP (`POST /wix-data/v2/collections/create-field`, `{ dataCollectionId:"Sections", field:{ key:"video", displayName:"Video", type:"VIDEO", description:"Hero background reel (upload in media manager)." } }`).
- [ ] In the Wix dashboard the user uploads a test video to the hero row's Video field (or, if a test asset is available, set it via API). Then read the `hero` row via the anonymous token and capture the raw `video` value string.
- [ ] Compare to the current hardcoded URL `https://video.wixstatic.com/video/c51492_990803f9c25b4ea491c4180a6eb9a435/1080p/mp4/file.mp4`. Derive the transform (typically `wix:video://v1/<mediaId>/...` → `https://video.wixstatic.com/video/<mediaId>/1080p/mp4/file.mp4`). Record the exact mapping in the task notes — this defines `wixVideoUrl()` in Task 2.
- [ ] If the format is ambiguous or no test video can be set, STOP and report: `wixVideoUrl` will passthrough http(s) values and return null otherwise, and the hero falls back to the current reel. (The hero must work regardless.)

---

### Task 1: Create + seed the new CMS shape (Wix MCP)
**Prereq:** Task 0 field added. Use MCP on the scope site; confirm field-type enums before calls.
- [ ] Add the 6 `Settings` fields (create-field) and bulk-update the single Settings item to include the seed values (bulk save with the item id + full data).
- [ ] Add 3 `Sections` rows (`support`, `supportFunders`, `pressMedia`) via bulk insert; update `hero.title`→"Scope\nScreenings", `submissions.eyebrow` + `submissions.body` via bulk save (with ids).
- [ ] Create + seed the 6 new collections (`Stats`, `Moments`, `Clapboard`, `SubmissionChips`, `GivingTiers`, `PressKit`) with read=ANYONE and help text, per "New CMS shape" above.
- [ ] Verify every new collection + the updated Settings/Sections read back via the anonymous visitor token (curl loop). Record counts. No code commit.

---

### Task 2: `wixVideoUrl()` helper (TDD)
**Files:** Create `lib/wix-video.ts`, `lib/wix-video.test.ts`.
**Produces:** `wixVideoUrl(value?: string | null): string | null`
- [ ] **Write failing test** covering: a `wix:video://v1/<id>/...` value → `https://video.wixstatic.com/video/<id>/1080p/mp4/file.mp4` (use the exact mapping recorded in Task 0); http(s) passthrough; empty/undefined/unparseable → null.
```ts
// lib/wix-video.test.ts
import { describe, it, expect } from "vitest";
import { wixVideoUrl } from "./wix-video";
describe("wixVideoUrl", () => {
  it("converts a wix:video uri to a playable mp4 url", () => {
    expect(wixVideoUrl("wix:video://v1/c51492_abc/file.mp4#posterUri=x"))
      .toBe("https://video.wixstatic.com/video/c51492_abc/1080p/mp4/file.mp4");
  });
  it("passes through http(s)", () => { expect(wixVideoUrl("https://x/y.mp4")).toBe("https://x/y.mp4"); });
  it("null for empty/garbage", () => { expect(wixVideoUrl("")).toBeNull(); expect(wixVideoUrl("g")).toBeNull(); });
});
```
- [ ] Run → FAIL.
- [ ] Implement (adjust the path segment to the Task-0 mapping):
```ts
// lib/wix-video.ts
// Converts a Wix CMS VIDEO field value (wix:video://v1/<mediaId>/...) to a
// directly-playable mp4 URL. http(s) passes through; unrecognized → null so the
// caller falls back to the bundled reel.
export function wixVideoUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const m = value.match(/^wix:video:\/\/v1\/([^/]+)/);
  return m ? `https://video.wixstatic.com/video/${m[1]}/1080p/mp4/file.mp4` : null;
}
```
- [ ] Run → PASS. Commit `feat(cms): wixVideoUrl converter`.

---

### Task 3: Extend `site-content.ts` (TDD)
**Files:** Modify `lib/site-content.ts`, `lib/site-content.test.ts`.
**Produces:** new types `CmsStat`, `CmsMoment`, `CmsClapLine`, `CmsChip`, `CmsGivingTier`, `CmsPressRow`; `CmsSettings` extended with `founderName, founderTitle, founderCredential, motto, supportUrl, pressEmail`; `SiteContent` extended with `stats, moments, clapboard, chips, givingTiers, pressKit` (each `T[] | null`, sorted by `order`).
- [ ] **Write failing test:** mock `queryCollection` to return rows for the 6 new ids and assert `getSiteContent()` exposes each sorted list; assert all-null tolerance still returns nulls.
- [ ] Run → FAIL.
- [ ] Implement: add 6 `queryCollection<T>(id, { sort:[{fieldName:"order",order:"ASC"}] })` calls inside the existing `Promise.all`, add the types and the sorted assignments (reuse the `byOrder` comparator), extend `CmsSettings`. (Follow the existing pattern exactly.)
- [ ] Run → PASS. Commit `feat(cms): site-content readers for stats/moments/clapboard/chips/tiers/press`.

---

### Task 4: Wire the hero (title + poster + video)
**Files:** `components/curtain-credits-hero.tsx`, `app/page.tsx`.
- [ ] Hero: extend props to `{ eyebrow?, tagline?, title?, posterUrl?, videoUrl? }`. Render the wordmark from `title` (split on `\n` into two lines; default `"Scope\nScreenings"`); `poster={posterUrl ?? SIZZLE_REEL_POSTER}`; `<source src={videoUrl ?? SIZZLE_REEL_MP4}>`.
- [ ] page.tsx: `import { wixImageUrl } from "@/lib/wix-media"; import { wixVideoUrl } from "@/lib/wix-video";` pass `title={hero?.title} posterUrl={wixImageUrl(hero?.image) ?? undefined} videoUrl={wixVideoUrl(hero?.video) ?? undefined}` (keep existing eyebrow/tagline). `hero?.video` requires adding `video?: string` to `CmsSection` in site-content.ts (Task 3 — add it there).
- [ ] Verify `npm test` + `npm run build` + eslint clean. Commit `feat(cms): editable hero title/poster/video`.

---

### Task 5: Wire What-Is clapperboard + quote
**Files:** `components/what-is.tsx`.
- [ ] Read `getSiteContent()` → `clapboard` + `settings.motto`. Production header = `clapboard?.[0]` (label/value, fallback "Production"/"Scope Screenings"); the Field grid = `clapboard?.slice(1)` mapped to `<Field k={label} v={value} />` (fallback to the current 4 hardcoded pairs when clapboard is null). Quote = `settings?.motto ?? "We put the fun back in film fests."` (the italic line). Eyebrow/heading/body already wired in phase 1 — keep.
- [ ] Verify test/build/eslint. Commit `feat(cms): editable clapperboard + motto`.

---

### Task 6: Wire Built-For-Access (founder details + photo + stats)
**Files:** `app/page.tsx`.
- [ ] Founder name/title/credential from `settings?.founderName ?? FOUNDER.name` etc. (used in both the figure caption and the text block). Founder photo `src={wixImageUrl(access?.image) ?? "/founder-lex.jpg"}`. Stats: replace the inline `stat` array with `content.stats` mapped (`value`/`label`), falling back to the current 4-item array when `content.stats` is null.
- [ ] Verify test/build/eslint. Commit `feat(cms): editable founder details + stats`.

---

### Task 7: Wire Magic gallery reel
**Files:** `components/moments-reel.tsx`, `app/page.tsx`.
- [ ] `MomentsReel` accepts `moments?: {image?,slug?,badge?,tone?,title?,subtitle?}[]`; when present, map to its internal render (image via `wixImageUrl(m.image) ?? "/moments/" + m.slug + ".jpg"`, tone normalized to "red"|"gold", badge/title/subtitle); fall back to the internal `MOMENTS` array when the prop is null/empty. Keep all the scroll/drag/progress logic.
- [ ] page.tsx passes `moments={content.moments ?? undefined}` to `<MomentsReel />`.
- [ ] Verify test/build/eslint. Commit `feat(cms): editable magic gallery reel`.

---

### Task 8: Wire Submissions (eyebrow + paragraph + chips)
**Files:** `components/submissions.tsx`.
- [ ] Eyebrow = `cms?.eyebrow ?? "Open Call · " + SUBMISSION_SEASON + " Submissions"`; paragraph = `cms?.body ?? <current literal>`; chips from `content.chips` (label + accent→dot class `bg-curtain`/`bg-rust`), fallback to the current `CHIPS` array. Heading + CTA already wired. **Deadlines + notification stay from festival.ts unchanged.**
- [ ] Verify test/build/eslint. Commit `feat(cms): editable submissions copy + chips`.

---

### Task 9: Wire Keep-It-Running (support + press + links)
**Files:** `components/support-press.tsx`.
- [ ] Make async; read `getSiteContent()`. Section heading from `sectionOf("support")` (eyebrow/title, fallback "Chapter Four"/"Keep It Running"). Funders card: title/body/ctaLabel from `sectionOf("supportFunders")`, donate link `ctaUrl ?? settings?.supportUrl ?? "https://shunpike.org/artist/scope-screenings/"`; tiers from `content.givingTiers` (label + featured→gold), fallback to current `TIERS`. Press card: title/body/ctaLabel from `sectionOf("pressMedia")`; press rows from `content.pressKit` (label/format, and if `url` present make the row a link), fallback to current `PRESS_ROWS`; press email `settings?.pressEmail ?? "press@scopescreenings.com"` (mailto + display).
- [ ] Verify test/build/eslint. Commit `feat(cms): editable support/press section + links`.

---

### Task 10: Wire footer sign-off
**Files:** `components/site-footer.tsx`.
- [ ] `KineticText text={...}` for the sign-off uses `sectionOf("footerSignoff")?.title ?? "See You At\nThe Movies"`. (Settings/socials already wired.)
- [ ] Verify test/build/eslint. Commit `feat(cms): editable footer sign-off`.

---

### Task 11: Full verification + end-to-end smoke
- [ ] `npm test`, `npm run build`, `npx eslint <all changed files>` (pre-existing hero/theme-provider errors are out of scope).
- [ ] Fallback build: `WIX_CLIENT_ID= npm run build` succeeds.
- [ ] End-to-end: change one new CMS value (e.g. a `Stats` value or `GivingTiers` label) → build + start prod → curl `/` → confirm it renders → revert.

## Self-Review
- Hero title/poster/video → Tasks 0,2,4. Clapperboard+quote → Task 5. Founder+stats → Task 6. Moments → Task 7. Submissions copy/chips → Task 8. Keep-It-Running+links → Task 9. Footer sign-off → Task 10. Deadlines left in code (constraint). Archives images deferred (constraint). Tickets/schedule untouched (constraint). Each component keeps a festival.ts/literal fallback.
