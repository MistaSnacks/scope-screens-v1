# CMS Visibility Toggles — Archives & Newsletter

**Date:** 2026-06-18
**Status:** Approved, implementing
**Scope:** Main SPA (`app/page.tsx`), `main` branch

## Goal

Let a non-technical editor show/hide two not-yet-finished sections from the Wix
headless CMS, without a code deploy:

1. **Archives** — "Chapter Four — The Archives" section in `app/page.tsx`.
2. **Newsletter** — the email signup block in `components/site-footer.tsx`
   (form currently has no submit handler — visual only).

## Decisions

- **Default = visible-until-turned-off.** An unset/blank toggle renders the
  section (preserves the current live site). Editor sets the field to `false`
  to hide. Implemented as `field !== false`.
- **Toggles centralized in the `SiteSettings` singleton** (not per-section
  records), matching a "CMS settings" mental model.

## Changes

### 1. Content layer — `lib/site-content.ts`
Extend the existing `SiteSettingsContent` interface (no new collection):
```ts
export interface SiteSettingsContent {
  venueName?: string; venueAddress?: string; venueCity?: string;
  archivesVisible?: boolean;
  newsletterVisible?: boolean;
}
```
`getSiteContent()` already fetches the `SiteSettings` singleton, so the new
fields flow through automatically.

### 2. Render logic
- `app/page.tsx`: `const showArchives = content.siteSettings?.archivesVisible !== false;`
  wrap the Chapter Four `<section>` in `{showArchives && ( … )}`.
- `components/site-footer.tsx`: `const showNewsletter = content.siteSettings?.newsletterVisible !== false;`
  wrap only the newsletter heading+form block. The "See You At The Movies"
  sign-off remains; the `md:justify-between` row collapses to a single
  left-aligned item — verify spacing renders cleanly when hidden.

### 3. Wix CMS — `SiteSettings` collection
Add two boolean fields so editors get on/off toggles:
- `archivesVisible` — display "Show Archives section"
- `newsletterVisible` — display "Show Newsletter signup"
Added via Wix API if permitted; otherwise documented dashboard steps. Field keys
must match the property names read in code exactly.

### 4. Documentation — `scripts/build-cms-guide.py`
Add a "Site Settings → Visibility" entry describing both toggles and the
"blank = shown" default, then regenerate `docs/Scope-Screenings-CMS-Guide.docx`.

### 5. Wiring verification (explicit ask)
Confirm the toggles flow CMS → site end-to-end, and that the two sections read
live CMS content rather than only `festival.ts` fallbacks:
- Query the live `SiteSettings` collection through the visitor token; confirm a
  row exists and the new fields are returned.
- In dev, set each field to `false` and confirm the section disappears; unset
  and confirm it returns.

## Out of scope
- Newsletter submit/subscribe logic; real archives index/listing.
- Tickets and schedule (off-limits).
- Any change to current live appearance (purely additive).
