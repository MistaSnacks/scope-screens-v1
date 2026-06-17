# Wix Headless CMS for Scope Screenings (`main` SPA) — Design

**Date:** 2026-06-17
**Status:** Approved design → pending implementation plan
**Target branch:** `main` (the single-page version). ALT is the multipage variant; the
same collections can be reused there later if the branches merge.

## Goal

Let non-technical editors change **all wording, titles, media, and key outbound
links — per section** of the `main` SPA, through the Wix dashboard CMS, without
touching code. The site must never break if Wix is unreachable.

## Architecture

**Wix Headless CMS (Data Collections) → Next.js.** The Next.js app stays the
product. Content is read from Wix Data collections using the **same anonymous
OAuth visitor-token + REST pattern already proven in `lib/wix-events.ts`**
(`WIX_CLIENT_ID` already in `.env`; Wix site "scope", id
`5e0eaedc-6847-4c06-bb37-34cb6ff143b5`). No new auth, no SDK migration required.

**Fail-safe rule:** every CMS read returns `null` on any miss and the renderer
falls back to the existing `lib/festival.ts` constants. `festival.ts` becomes the
**seed / fallback source of truth**; the CMS overrides it field-by-field when
present.

## The `main` SPA section map (render order)

1. Nav + valance — *structural, not CMS*
2. Curtain-credits hero — title, credits, media → CMS
3. Marquee banner → CMS phrases + live next-event line
4. Buy Tickets (`#tickets`) — **already wired to Wix checkout/events, left out**
5. What Is Scope (`#about`) → CMS
6. Built For Access / founder (Chapter Two) → CMS
7. Scope Screenings Magic / gallery (Chapter Three) — incl. CTA link → CMS
8. Submissions (`#submit`) — incl. FilmFreeway CTA link → CMS
9. Schedule (`#schedule`) — **already live from Wix Events, left out**
10. Partners marquee — logos + links, add-new → CMS
11. Support / Press (`#support`) → CMS
12. The Archives (Chapter Four) — incl. CTA → CMS
13. Footer — socials, contact, venue, sign-off → CMS (nav columns stay code)

## Collection set

All collections: **read permission = "Anyone"** (required for visitor-token
reads). Every field gets a friendly name + help text. Collections are seeded with
the current `festival.ts` copy so editors start from real content.

### ① `Sections` — one row per section (primary "edit per section" surface)
| Field (editor) | Key | Type | Notes |
|---|---|---|---|
| Section | `displayName` | Text | editor-facing name |
| Eyebrow | `eyebrow` | Text | e.g. "Chapter Three" |
| Title | `title` | Text | |
| Body | `body` | Rich text | |
| Image | `image` | Media | |
| Button label | `ctaLabel` | Text | |
| Button link | `ctaUrl` | URL | Submit→FilmFreeway, gallery CTA, archives CTA |
| Order | `order` | Number | |
| (internal) | `sectionKey` | Text | stable code anchor — do not edit |

Rows (`sectionKey`): `hero`, `whatIs`, `builtForAccess`, `magicGallery`,
`submissions`, `archives`, `footerSignoff`.

### ② `Partners` (list — add/remove/reorder)
`name` (Text), `logo` (Media), `url` (URL), `tier` (Text), `order` (Number).

### ③ `Marquee` (list)
`phrase` (Text), `order` (Number). Rendered banner = these phrases **plus a live
"NOW SHOWING · {next show} · {venue}" line generated from Wix Events** so the date
is never stale.

### ④ `Socials` (list)
`label` (Text), `url` (URL), `order` (Number). Drives the footer socials.

### ⑤ `Settings` (single-item collection)
`contactEmail`, `venueName`, `venueAddress`, `venueCity`, `doorsTime`,
`screenTime`, `newsletterHeading`, `footerTagline`, `copyright`.
Used across marquee, footer, and hero.

### Left out of CMS
Buy Tickets (`wix-checkout.ts`), Schedule (`wix-events.ts`), nav labels, footer
nav columns.

### Phase 2 (later)
`Directors` (name/film/mood), `Stats` (the 200+/150+ numbers).

## Code integration

- **`lib/wix-cms.ts`** — new module. Generalizes the `wix-events.ts` visitor-token
  pattern to query Wix Data collections over REST
  (`POST https://www.wixapis.com/wix-data/v2/items/query`), `next: { revalidate: 3600 }`,
  returns `null` on any failure.
- **`getSiteContent()`** server helper — fetches all collections, merges them over
  the `festival.ts` defaults, returns one typed content object. Blank field → fall
  back to the default.
- **Components** read merged content: server components call `getSiteContent()`;
  client components receive it as props from `app/page.tsx`. Marquee additionally
  calls the live-events helper for its dynamic line.
- **Media:** `wixImageUrl()` helper converts `wix:image://…` field values to
  `static.wixstatic.com` URLs.
- **No change** to `wix-checkout.ts` / `wix-events.ts`.

## Deliverable: CMS user guide (one-pager `.docx`)

A clean, single-page editor guide saved as `.docx`, styled with the site brand:
- **Headings:** Aachen Bold (`app/fonts/aachen-bold.otf`, also in `~/Library/Fonts`).
- **Body:** Libre Franklin.
- **Logo:** `public/popcorn-logo.png` in the header.
- **Content:** how to open the CMS, the one rule (find your section → edit fields →
  publish), what each collection/field does, how to add a partner, how to change a
  link, and the "leave these alone" note (tickets/schedule are automatic).

## Build approach

Implementation uses subagents + the Wix MCP to: create + seed the collections, set
read permissions, add `lib/wix-cms.ts` + `getSiteContent()`, wire components one at
a time (each verified against fallback), and produce the `.docx` guide.

## Non-goals

- Rebuilding the site in the Wix visual editor.
- Touching the ticket or schedule data paths.
- On-canvas/inline editing (editing happens in the Wix dashboard CMS).
