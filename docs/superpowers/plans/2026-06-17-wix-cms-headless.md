# Wix Headless CMS (main SPA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let non-technical editors change all wording, titles, media, and key outbound links per section of the `main` SPA through the Wix dashboard CMS, with the site falling back to `lib/festival.ts` if Wix is unreachable.

**Architecture:** Wix Headless CMS (Wix Data collections) is the content backend. The Next.js app reads collections at request time using the existing anonymous OAuth visitor-token + REST pattern (`revalidate: 3600`), and every read returns `null` on any failure so components render the existing `festival.ts` constants as fallback. Collections are created/seeded out-of-band via the Wix MCP; the runtime only ever reads.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, React 19, Tailwind v4, Vitest, Wix Data REST API (`wixapis.com`), Wix MCP (for collection creation/seeding), python-docx (for the guide).

## Global Constraints

- Wix site: **"scope"**, id `5e0eaedc-6847-4c06-bb37-34cb6ff143b5`. Auth via `process.env.WIX_CLIENT_ID` (already in `.env`), anonymous grant — no secret.
- **Never modify** `lib/wix-checkout.ts` or `lib/wix-events.ts` (ticketing/schedule already work).
- **Out of CMS scope:** Buy Tickets, Schedule, nav labels, footer nav columns.
- Every CMS read uses `next: { revalidate: 3600 }` and returns `null` on any error (never throws to the renderer).
- All new collections must have **read permission = `ANYONE`** (required for visitor-token reads). Nothing sensitive goes in them.
- Field keys match `[a-zA-Z_][a-zA-Z0-9_-]{0,63}` (no special chars).
- Read endpoint: `POST https://www.wixapis.com/wix-data/v2/items/query`, body `{ dataCollectionId, query: { sort?, paging: { limit } } }`, response `{ dataItems: [{ data }] }`.
- TDD: write the failing test first; pure logic gets unit tests; component wiring is verified with `npm test`, `npm run build`, and `npx eslint`.
- Commit after every task. Work on branch `main` (nothing is user-facing yet).
- Brand for the guide: headings **Aachen Bold** (`app/fonts/aachen-bold.otf`, also `~/Library/Fonts/aachen-bold.otf`), body **Libre Franklin**, logo `public/popcorn-logo.png`.

## File Structure

- `lib/wix-token.ts` — shared `getVisitorToken()` (new).
- `lib/wix-cms.ts` — `queryCollection()`, `getSingleton()` (new).
- `lib/wix-media.ts` — `wixImageUrl()` (new).
- `lib/site-content.ts` — `SiteContent` types + cached `getSiteContent()` (new).
- `lib/marquee.ts` — pure `buildMarqueeItems()` (new).
- Component edits: `components/marquee.tsx`, `site-footer.tsx`, `submissions.tsx`, `partners-marquee.tsx`, `what-is.tsx`, `app/page.tsx`, `components/curtain-credits-hero.tsx`.
- `scripts/build-cms-guide.py` — generates `docs/Scope-Screenings-CMS-Guide.docx` (new).
- Tests colocated as `lib/*.test.ts`.

---

### Task 0: Pipeline spike — de-risk the whole approach

**Why:** Wix Data docs warn *"Wix Data APIs require the site's code editor to be enabled."* Confirm we can create a collection on the "scope" site, set `read=ANYONE`, and read it back with the anonymous visitor token BEFORE building anything. This is throwaway.

**Files:** none committed (spike only).

- [ ] **Step 1: Create a throwaway collection via the Wix MCP**

Using the Wix MCP (`mcp__wix__ExecuteWixAPI` or `CallWixSiteAPI`, grounded via the MCP's own docs tools), on site `5e0eaedc-6847-4c06-bb37-34cb6ff143b5`, create:
`POST https://www.wixapis.com/wix-data/v2/collections`
```json
{ "collection": { "id": "_spike", "displayName": "Spike Test",
  "fields": [{ "key": "title", "displayName": "Title", "type": "TEXT" }] } }
```
If the call fails because the code editor / CMS is not enabled, STOP and report — enabling Dev Mode / adding the CMS app on the site is a prerequisite the user must do in the dashboard. (Confirm exact `permissions` object shape with `ReadFullDocsArticle` on the create-data-collection page before calling.)

- [ ] **Step 2: Set read=ANYONE**

`POST https://www.wixapis.com/wix-data/v1/permissions`
```json
{ "dataPermissions": { "id": "_spike", "itemRead": "ANYONE",
  "itemInsert": "ADMIN", "itemUpdate": "ADMIN", "itemRemove": "ADMIN" } }
```

- [ ] **Step 3: Insert one row**

`POST https://www.wixapis.com/wix-data/v2/bulk/items/insert`
```json
{ "dataCollectionId": "_spike", "dataItems": [{ "data": { "title": "hello from CMS" } }] }
```

- [ ] **Step 4: Read it back with the anonymous visitor token**

Run from the repo (uses the real client id):
```bash
TOKEN=$(curl -s -X POST https://www.wixapis.com/oauth2/token \
  -H 'Content-Type: application/json' \
  -d "{\"clientId\":\"$(grep WIX_CLIENT_ID .env | cut -d= -f2)\",\"grantType\":\"anonymous\"}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
curl -s -X POST https://www.wixapis.com/wix-data/v2/items/query \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"dataCollectionId":"_spike","query":{"paging":{"limit":10}}}'
```
Expected: JSON containing `"dataItems":[{"data":{"title":"hello from CMS", ...}}]`.

- [ ] **Step 5: Tear down**

Delete the `_spike` collection via the MCP (`DELETE`/delete-data-collection). Record in the task notes: did create/permission/insert/read all succeed? Any dev-mode prerequisite? This gates Task 5.

---

### Task 1: Shared visitor token helper

**Files:**
- Create: `lib/wix-token.ts`
- Test: `lib/wix-token.test.ts`

**Interfaces:**
- Produces: `getVisitorToken(): Promise<string | null>`

- [ ] **Step 1: Write the failing test**

```ts
// lib/wix-token.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getVisitorToken } from "./wix-token";

describe("getVisitorToken", () => {
  beforeEach(() => { process.env.WIX_CLIENT_ID = "test-client"; });
  afterEach(() => { vi.restoreAllMocks(); });

  it("returns the access_token on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, json: async () => ({ access_token: "tok_123" }),
    })) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBe("tok_123");
  });

  it("returns null on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run lib/wix-token.test.ts`
Expected: FAIL (`getVisitorToken` not exported).

- [ ] **Step 3: Implement**

```ts
// lib/wix-token.ts
// Anonymous OAuth visitor token for headless reads. Same grant the live
// schedule already uses (lib/wix-events.ts); extracted so the CMS reader can
// share it. Returns null on any failure so callers fall back to static data.
const CLIENT_ID = process.env.WIX_CLIENT_ID;

export async function getVisitorToken(): Promise<string | null> {
  if (!CLIENT_ID) return null;
  try {
    const res = await fetch("https://www.wixapis.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: CLIENT_ID, grantType: "anonymous" }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run lib/wix-token.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/wix-token.ts lib/wix-token.test.ts
git commit -m "feat(cms): shared anonymous visitor-token helper"
```

---

### Task 2: Generic collection reader

**Files:**
- Create: `lib/wix-cms.ts`
- Test: `lib/wix-cms.test.ts`

**Interfaces:**
- Consumes: `getVisitorToken` from `lib/wix-token.ts`
- Produces:
  - `queryCollection<T>(dataCollectionId: string, opts?: { sort?: { fieldName: string; order: "ASC" | "DESC" }[] }): Promise<T[] | null>`
  - `getSingleton<T>(dataCollectionId: string): Promise<T | null>`

- [ ] **Step 1: Write the failing test**

```ts
// lib/wix-cms.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./wix-token", () => ({ getVisitorToken: vi.fn(async () => "tok") }));
import { getVisitorToken } from "./wix-token";
import { queryCollection, getSingleton } from "./wix-cms";

describe("queryCollection", () => {
  beforeEach(() => { process.env.WIX_CLIENT_ID = "c"; vi.mocked(getVisitorToken).mockResolvedValue("tok"); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("maps dataItems[].data to an array", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ dataItems: [{ data: { a: 1 } }, { data: { a: 2 } }] }),
    })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it("returns null on empty result", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ dataItems: [] }) })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toBeNull();
  });

  it("returns null on non-ok / token miss / throw", async () => {
    vi.mocked(getVisitorToken).mockResolvedValueOnce(null);
    expect(await queryCollection("X")).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toBeNull();
  });

  it("getSingleton returns first item or null", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ dataItems: [{ data: { a: 9 } }] }) })) as unknown as typeof fetch);
    expect(await getSingleton("X")).toEqual({ a: 9 });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run lib/wix-cms.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// lib/wix-cms.ts
// Generic reader for Wix Data collections via the headless visitor token.
// Mirrors the fail-safe contract of lib/wix-events.ts: any miss returns null
// so callers fall back to lib/festival.ts. Reads are cached hourly.
import { getVisitorToken } from "./wix-token";

const QUERY_URL = "https://www.wixapis.com/wix-data/v2/items/query";

export async function queryCollection<T>(
  dataCollectionId: string,
  opts?: { sort?: { fieldName: string; order: "ASC" | "DESC" }[] },
): Promise<T[] | null> {
  try {
    const token = await getVisitorToken();
    if (!token) return null;
    const res = await fetch(QUERY_URL, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        dataCollectionId,
        query: { sort: opts?.sort, paging: { limit: 100 } },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { dataItems?: { data?: T }[] };
    const items = (json.dataItems ?? [])
      .map((d) => d.data)
      .filter((d): d is T => Boolean(d));
    return items.length ? items : null;
  } catch {
    return null;
  }
}

export async function getSingleton<T>(dataCollectionId: string): Promise<T | null> {
  const items = await queryCollection<T>(dataCollectionId);
  return items?.[0] ?? null;
}
```

- [ ] **Step 4: Run test, verify it passes** → `npx vitest run lib/wix-cms.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/wix-cms.ts lib/wix-cms.test.ts
git commit -m "feat(cms): generic Wix Data collection reader with null fallback"
```

---

### Task 3: Media URL helper

**Files:**
- Create: `lib/wix-media.ts`
- Test: `lib/wix-media.test.ts`

**Interfaces:**
- Produces: `wixImageUrl(value?: string | null): string | null`

- [ ] **Step 1: Write the failing test**

```ts
// lib/wix-media.test.ts
import { describe, it, expect } from "vitest";
import { wixImageUrl } from "./wix-media";

describe("wixImageUrl", () => {
  it("converts a wix:image URI to a static URL", () => {
    expect(wixImageUrl("wix:image://v1/c51492_abc~mv2.jpg/founder.jpg#originWidth=1000&originHeight=800"))
      .toBe("https://static.wixstatic.com/media/c51492_abc~mv2.jpg");
  });
  it("passes through an http url", () => {
    expect(wixImageUrl("https://x/y.jpg")).toBe("https://x/y.jpg");
  });
  it("returns null for empty/undefined/unparseable", () => {
    expect(wixImageUrl(undefined)).toBeNull();
    expect(wixImageUrl("")).toBeNull();
    expect(wixImageUrl("garbage")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails** → FAIL.

- [ ] **Step 3: Implement**

```ts
// lib/wix-media.ts
// Wix CMS Media fields come back as `wix:image://v1/<mediaId>/<filename>#...`.
// Convert to a directly-servable static URL. http(s) values pass through;
// anything unrecognized returns null so callers fall back to a local asset.
export function wixImageUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const m = value.match(/^wix:image:\/\/v1\/([^/]+)/);
  return m ? `https://static.wixstatic.com/media/${m[1]}` : null;
}
```

- [ ] **Step 4: Run test, verify it passes** → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/wix-media.ts lib/wix-media.test.ts
git commit -m "feat(cms): wixImageUrl media converter"
```

---

### Task 4: Site content aggregator

**Files:**
- Create: `lib/site-content.ts`
- Test: `lib/site-content.test.ts`

**Interfaces:**
- Consumes: `queryCollection`, `getSingleton` from `lib/wix-cms.ts`
- Produces:
  - types `CmsSection`, `CmsPartner`, `CmsSocial`, `CmsSettings`, `SiteContent`
  - `getSiteContent(): Promise<SiteContent>` (request-deduped via React `cache`)
  - `sectionOf(content: SiteContent, key: string): CmsSection | undefined`

**Notes:** Components apply their own `?? festivalDefault` fallbacks at point of use; this module only returns CMS data (or empty/null). Collection IDs: `Sections`, `Partners`, `Marquee`, `Socials`, `Settings`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/site-content.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("./wix-cms", () => ({
  queryCollection: vi.fn(),
  getSingleton: vi.fn(),
}));
import { queryCollection, getSingleton } from "./wix-cms";
import { getSiteContent, sectionOf } from "./site-content";

afterEach(() => vi.restoreAllMocks());

it("indexes sections by sectionKey and exposes lists", async () => {
  vi.mocked(queryCollection).mockImplementation(async (id: string) => {
    if (id === "Sections") return [{ sectionKey: "submissions", ctaUrl: "https://ff/x", title: "Submit" }] as never;
    if (id === "Partners") return [{ name: "SIFF", url: "https://siff.net", order: 1 }] as never;
    if (id === "Marquee") return [{ phrase: "NOW SHOWING", order: 1 }] as never;
    if (id === "Socials") return [{ label: "Instagram", url: "https://ig", order: 1 }] as never;
    return null;
  });
  vi.mocked(getSingleton).mockResolvedValue({ contactEmail: "hi@x.com" } as never);

  const c = await getSiteContent();
  expect(sectionOf(c, "submissions")?.ctaUrl).toBe("https://ff/x");
  expect(c.partners?.[0].name).toBe("SIFF");
  expect(c.marquee?.[0].phrase).toBe("NOW SHOWING");
  expect(c.socials?.[0].label).toBe("Instagram");
  expect(c.settings?.contactEmail).toBe("hi@x.com");
});

it("tolerates all-null CMS (returns empty structures)", async () => {
  vi.mocked(queryCollection).mockResolvedValue(null);
  vi.mocked(getSingleton).mockResolvedValue(null);
  const c = await getSiteContent();
  expect(sectionOf(c, "anything")).toBeUndefined();
  expect(c.partners).toBeNull();
  expect(c.settings).toBeNull();
});
```

- [ ] **Step 2: Run test, verify it fails** → FAIL.

- [ ] **Step 3: Implement**

```ts
// lib/site-content.ts
// Aggregates all CMS-editable content for the main SPA into one request-deduped
// object. Each component applies its own festival.ts fallback at point of use,
// so a missing collection or blank field never breaks a render.
import { cache } from "react";
import { queryCollection, getSingleton } from "./wix-cms";

export interface CmsSection {
  sectionKey: string;
  displayName?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  order?: number;
}
export interface CmsPartner { name?: string; logo?: string; url?: string; tier?: string; order?: number; }
export interface CmsSocial { label?: string; url?: string; order?: number; }
export interface CmsSettings {
  contactEmail?: string; venueName?: string; venueAddress?: string; venueCity?: string;
  doorsTime?: string; screenTime?: string; newsletterHeading?: string;
  footerTagline?: string; copyright?: string;
}
export interface SiteContent {
  sections: Record<string, CmsSection>;
  partners: CmsPartner[] | null;
  marquee: { phrase?: string; order?: number }[] | null;
  socials: CmsSocial[] | null;
  settings: CmsSettings | null;
}

const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const [sections, partners, marquee, socials, settings] = await Promise.all([
    queryCollection<CmsSection>("Sections"),
    queryCollection<CmsPartner>("Partners", { sort: [{ fieldName: "order", order: "ASC" }] }),
    queryCollection<{ phrase?: string; order?: number }>("Marquee", { sort: [{ fieldName: "order", order: "ASC" }] }),
    queryCollection<CmsSocial>("Socials", { sort: [{ fieldName: "order", order: "ASC" }] }),
    getSingleton<CmsSettings>("Settings"),
  ]);
  const sectionMap: Record<string, CmsSection> = {};
  for (const s of sections ?? []) if (s.sectionKey) sectionMap[s.sectionKey] = s;
  return {
    sections: sectionMap,
    partners: partners ? [...partners].sort(byOrder) : null,
    marquee: marquee ? [...marquee].sort(byOrder) : null,
    socials: socials ? [...socials].sort(byOrder) : null,
    settings,
  };
});

export function sectionOf(content: SiteContent, key: string): CmsSection | undefined {
  return content.sections[key];
}
```

- [ ] **Step 4: Run test, verify it passes** → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/site-content.ts lib/site-content.test.ts
git commit -m "feat(cms): site-content aggregator (getSiteContent)"
```

---

### Task 5: Create + seed the 5 collections (Wix MCP)

**Prereq:** Task 0 passed. **Files:** none committed (Wix-side config). Use the Wix MCP on site `5e0eaedc-6847-4c06-bb37-34cb6ff143b5`. Before each call, confirm the exact `permissions`/field-`type` enums via `ReadFullDocsArticle` on the create-data-collection page (the MCP requires grounding).

Field `type` values used: `TEXT`, `RICH_CONTENT` (Body), `IMAGE` (Media), `URL`, `NUMBER`. (Confirm `RICH_CONTENT` vs `RICH_TEXT` against the schema; if `body` rich type is uncertain, use `TEXT`.)

- [ ] **Step 1: Create collections** — `POST /wix-data/v2/collections` for each:

`Sections`: fields `sectionKey`(TEXT), `displayName`(TEXT), `eyebrow`(TEXT), `title`(TEXT), `body`(RICH_CONTENT), `image`(IMAGE), `ctaLabel`(TEXT), `ctaUrl`(URL), `order`(NUMBER).
`Partners`: `name`(TEXT), `logo`(IMAGE), `url`(URL), `tier`(TEXT), `order`(NUMBER).
`Marquee`: `phrase`(TEXT), `order`(NUMBER).
`Socials`: `label`(TEXT), `url`(URL), `order`(NUMBER).
`Settings`: `contactEmail`(TEXT), `venueName`(TEXT), `venueAddress`(TEXT), `venueCity`(TEXT), `doorsTime`(TEXT), `screenTime`(TEXT), `newsletterHeading`(TEXT), `footerTagline`(TEXT), `copyright`(TEXT).

Give each field a human `displayName` and, where the API allows, a `description` (help text) — e.g. Sections.ctaUrl → "Where this section's button links to."

- [ ] **Step 2: Set read=ANYONE** for all five — `POST /wix-data/v1/permissions` per collection with `itemRead: "ANYONE"`, others `ADMIN`.

- [ ] **Step 3: Seed with current content** — `POST /wix-data/v2/bulk/items/insert` per collection, mirroring today's hardcoded copy:

`Sections` dataItems (`data` objects):
```
{ sectionKey:"hero", displayName:"Hero", eyebrow:"Feature Presentation", title:"Scope Screenings", body:"Seattle's Underground Film Festival", order:1 }
{ sectionKey:"whatIs", displayName:"What Is Scope", eyebrow:"SC. 01 · Roll 22 · Now Rolling", title:"What Is Scope Screenings?", body:"Seattle's underground film festival. A live, monthly short-film showcase built to put filmmakers on a real screen in front of a real, packed house — uplifting Black, brown & tan creators across the PNW. Ten directors, one night, every month.", order:2 }
{ sectionKey:"builtForAccess", displayName:"Built For Access (Founder)", eyebrow:"Chapter Two", title:"Built For Access", body:"A lot of my peers never had the chance to see their work on a big screen. I built this for access, for collaboration, and to break down the barriers placed in front of Black, brown, and tan creatives.", order:3 }
{ sectionKey:"magicGallery", displayName:"Scope Screenings Magic", eyebrow:"Chapter Three", title:"Scope Screenings Magic", body:"Every last Tuesday the Central District turns into a cinema — ten films, ten directors, and the best room in the city.", ctaLabel:"See more from the floor", ctaUrl:"https://instagram.com/scopescreenings", order:4 }
{ sectionKey:"submissions", displayName:"Submissions", eyebrow:"Open Call · Season 5 Submissions", title:"Submit Your Film", ctaLabel:"Open the Call ›", ctaUrl:"https://filmfreeway.com/scopescreenings", order:5 }
{ sectionKey:"archives", displayName:"The Archives", eyebrow:"Chapter Four", title:"The Archives", body:"Shorts, music videos, docs, animation, experiments. Every film twenty minutes or less, every filmmaker in the room.", ctaLabel:"Browse all 200+ films", ctaUrl:"/schedule", order:6 }
{ sectionKey:"footerSignoff", displayName:"Footer Sign-off", title:"See You At The Movies", order:7 }
```
`Partners` (from `components/partners-marquee.tsx`):
```
{ name:"Shunpike", url:"https://www.shunpike.org", tier:"Supporting", order:1 }
{ name:"SIFF", url:"https://www.siff.net", tier:"Major", order:2 }
{ name:"Converge Media", url:"https://convergemedia.org", tier:"Major", order:3 }
{ name:"FilmFreeway", url:"https://filmfreeway.com/ScopeScreenings", tier:"Major", order:4 }
{ name:"4Culture", url:"https://www.4culture.org", tier:"Supporting", order:5 }
{ name:"ArtsFund", url:"https://www.artsfund.org", tier:"Supporting", order:6 }
```
(Logos stay as local `/partners/<img>.png` fallbacks for now; editors can upload to the `logo` field later — Task 9 handles the precedence.)

`Marquee` (from `components/marquee.tsx`, minus the live next-show line which code injects):
```
{ phrase:"NOW SHOWING", order:1 }
{ phrase:"DOORS 6:30 / SCREEN 7:30", order:2 }
{ phrase:"10 DIRECTORS, ONE NIGHT", order:3 }
{ phrase:"TROPICAL WAVY ENERGY", order:4 }
```
`Socials` (from `lib/festival.ts` SOCIALS):
```
{ label:"Instagram", url:"https://instagram.com/scopescreenings", order:1 }
{ label:"TikTok", url:"https://tiktok.com/@scopescreenings", order:2 }
{ label:"YouTube", url:"https://youtube.com/@scopescreenings", order:3 }
```
`Settings` (single item):
```
{ contactEmail:"hello@scopescreenings.com", venueName:"Langston Hughes Performing Arts Institute", venueAddress:"104 17th Ave S", venueCity:"Seattle, WA", doorsTime:"6:30", screenTime:"7:30", newsletterHeading:"Get the lineup in your inbox", footerTagline:"Seattle's underground film festival. We put the fun back in film fests.", copyright:"© 2026 Scope Screenings · A fiscally sponsored project of Shunpike" }
```

- [ ] **Step 4: Verify reads** — run the Task 0 Step 4 curl for each collection id; confirm `dataItems` come back. Record the verification output in task notes. No code commit (Wix-side only); note completion in the plan checkbox.

---

### Task 6: Wire the Marquee (live event line + CMS phrases)

**Files:**
- Create: `lib/marquee.ts`, `lib/marquee.test.ts`
- Modify: `components/marquee.tsx`

**Interfaces:**
- Consumes: `getSiteContent` (Task 4), `getLiveSchedule` from `lib/wix-events.ts`, `nextScreening`/`VENUE` from `lib/festival.ts`
- Produces: `buildMarqueeItems(phrases: string[], liveLine: string | null): string[]`

- [ ] **Step 1: Write the failing test for the pure builder**

```ts
// lib/marquee.test.ts
import { describe, it, expect } from "vitest";
import { buildMarqueeItems } from "./marquee";

describe("buildMarqueeItems", () => {
  it("puts the live line first when present", () => {
    expect(buildMarqueeItems(["A", "B"], "NOW SHOWING · JUL 28 · Langston"))
      .toEqual(["NOW SHOWING · JUL 28 · Langston", "A", "B"]);
  });
  it("falls back to phrases only when no live line", () => {
    expect(buildMarqueeItems(["A", "B"], null)).toEqual(["A", "B"]);
  });
  it("drops empty phrases", () => {
    expect(buildMarqueeItems(["A", "", "  "], null)).toEqual(["A"]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails** → FAIL.

- [ ] **Step 3: Implement the builder**

```ts
// lib/marquee.ts
// Builds the under-hero marquee strip: an optional live "now showing" line
// (from Wix Events) followed by the editor's CMS phrases.
export function buildMarqueeItems(phrases: string[], liveLine: string | null): string[] {
  const clean = phrases.map((p) => p.trim()).filter(Boolean);
  return liveLine ? [liveLine, ...clean] : clean;
}
```

- [ ] **Step 4: Run builder test** → PASS.

- [ ] **Step 5: Rewrite the Marquee component to be async + data-driven**

Replace the whole of `components/marquee.tsx` with:
```tsx
import { nextScreening, VENUE } from "@/lib/festival";
import { getLiveSchedule } from "@/lib/wix-events";
import { getSiteContent } from "@/lib/site-content";
import { buildMarqueeItems } from "@/lib/marquee";

export async function Marquee() {
  const [content, live] = await Promise.all([getSiteContent(), getLiveSchedule()]);

  // Live "now showing" line: prefer the next real Wix event, else festival.ts.
  const venue = content.settings?.venueName ?? VENUE.short;
  const next = live?.[0];
  const label = next ? `${next.month} ${next.day}` : nextScreening().label;
  const liveLine = `NOW SHOWING · ${label} · ${venue}`;

  const phrases = content.marquee?.map((m) => m.phrase ?? "").filter(Boolean) ?? [
    "NOW SHOWING",
    "DOORS 6:30 / SCREEN 7:30",
    "10 DIRECTORS, ONE NIGHT",
    "TROPICAL WAVY ENERGY",
  ];
  const ITEMS = buildMarqueeItems(phrases, liveLine);
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden border-y-2 border-rust bg-curtain">
      <div
        className="flex w-max items-center gap-7 whitespace-nowrap py-2.5"
        style={{ animation: "marquee 50s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-7">
            <span className="font-marquee text-[20px] uppercase tracking-[0.03em] text-brass">
              {item}
            </span>
            <span className="text-rust" aria-hidden>★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npx vitest run lib/marquee.test.ts` → PASS.
Run: `npm run build` → succeeds (Marquee is rendered by `app/page.tsx`, already an async server component).
Run: `npx eslint components/marquee.tsx lib/marquee.ts` → clean.

- [ ] **Step 7: Commit**

```bash
git add lib/marquee.ts lib/marquee.test.ts components/marquee.tsx
git commit -m "feat(cms): marquee reads CMS phrases + live Wix event line"
```

---

### Task 7: Wire the Footer (socials + settings)

**Files:** Modify `components/site-footer.tsx`

**Interfaces:** Consumes `getSiteContent`; keeps `CONTACT_EMAIL`, `SOCIALS`, `VENUE` from `lib/festival.ts` as fallbacks. Footer nav columns stay hardcoded (out of scope).

- [ ] **Step 1: Make the footer async and pull CMS values**

In `components/site-footer.tsx`:
1. Add imports:
```tsx
import { getSiteContent } from "@/lib/site-content";
```
2. Change the signature to async and read content + fallbacks at the top:
```tsx
export async function SiteFooter() {
  const { settings, socials } = await getSiteContent();
  const tagline = settings?.footerTagline ??
    "Seattle’s underground film festival. We put the fun back in film fests.";
  const newsletterHeading = settings?.newsletterHeading ?? "Get the lineup in your inbox";
  const copyright = settings?.copyright ??
    `© 2026 Scope Screenings · A fiscally sponsored project of Shunpike · ${VENUE.city}`;
  const contactEmail = settings?.contactEmail ?? CONTACT_EMAIL;
  const socialLinks = (socials ?? SOCIALS.map((s) => ({ label: s.label, url: s.href })))
    .map((s) => ({ label: s.label ?? "", href: ("href" in s ? s.href : s.url) ?? "" }))
    .filter((s) => s.label && s.href);
```
3. Replace the newsletter heading text with `{newsletterHeading}`.
4. Replace the tagline `<p>` text ("Seattle's underground film festival…") with `{tagline}`.
5. Replace the legal `<span>` static copyright with `{copyright}` (drop the inline `{VENUE.city}` template since it's folded into the fallback).
6. Replace the `SOCIALS.map(...)` block with `socialLinks.map((s) => (...))` using `s.href`/`s.label`, and the mailto with `{contactEmail}`.

- [ ] **Step 2: Verify**

Run: `npm run build` → succeeds. `npx eslint components/site-footer.tsx` → clean.

- [ ] **Step 3: Commit**

```bash
git add components/site-footer.tsx
git commit -m "feat(cms): footer reads socials + settings from CMS with fallback"
```

---

### Task 8: Wire Submissions (FilmFreeway CTA + copy)

**Files:** Modify `components/submissions.tsx`

**Interfaces:** Consumes `getSiteContent`/`sectionOf`; keeps `SUBMIT_URL`, `SUBMISSION_SEASON`, etc. as fallbacks. Deadline ladder stays from `festival.ts` (Phase-2 candidate).

- [ ] **Step 1: Make async and source the CTA + headline from CMS**

In `components/submissions.tsx`:
1. Add `import { getSiteContent, sectionOf } from "@/lib/site-content";`
2. Change `export function Submissions() {` to `export async function Submissions() {` and add:
```tsx
  const content = await getSiteContent();
  const cms = sectionOf(content, "submissions");
  const submitUrl = cms?.ctaUrl ?? SUBMIT_URL;
  const ctaLabel = cms?.ctaLabel ?? "Open the Call ›";
  const heading = cms?.title ?? "Submit Your Film";
```
3. Replace the `KineticText ... text="Submit Your Film"` prop with `text={heading}`.
4. Replace `href={SUBMIT_URL}` with `href={submitUrl}`.
5. Replace the button label `Open the Call ›` with `{ctaLabel}`.

- [ ] **Step 2: Verify** → `npm run build` succeeds; `npx eslint components/submissions.tsx` clean.

- [ ] **Step 3: Commit**

```bash
git add components/submissions.tsx
git commit -m "feat(cms): submissions CTA + heading from CMS with fallback"
```

---

### Task 9: Wire Partners marquee (CMS list + add-new + logo precedence)

**Files:** Modify `components/partners-marquee.tsx`

**Interfaces:** Consumes `getSiteContent`, `wixImageUrl`. Logo source precedence: CMS `logo` (uploaded media) → local `/partners/<slug>.png` → text wordmark.

- [ ] **Step 1: Make async and merge CMS partners over local defaults**

In `components/partners-marquee.tsx`:
1. Add:
```tsx
import { getSiteContent } from "@/lib/site-content";
import { wixImageUrl } from "@/lib/wix-media";
```
2. Keep the local `PARTNERS` array as the fallback. Add a slug map so existing local logos still resolve by name:
```tsx
const LOCAL_LOGO: Record<string, string> = {
  "Shunpike": "shunpike", "SIFF": "siff", "Converge Media": "converge",
  "FilmFreeway": "filmfreeway", "4Culture": "4culture", "ArtsFund": "artsfund",
};
```
3. Change to `export async function PartnersMarquee() {` and build the list:
```tsx
  const { partners } = await getSiteContent();
  const list = (partners && partners.length
    ? partners.map((p) => ({
        name: p.name ?? "",
        href: p.url ?? "#",
        logo: wixImageUrl(p.logo) ?? (p.name && LOCAL_LOGO[p.name] ? `/partners/${LOCAL_LOGO[p.name]}.png` : null),
      }))
    : PARTNERS.map((p) => ({ name: p.name, href: p.href, logo: `/partners/${p.img}.png` }))
  ).filter((p) => p.name);
```
4. Replace `const loop = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];` with `const loop = [...list, ...list, ...list, ...list];` and `const isDuplicate = i >= list.length;`.
5. In the map, render the logo if present, else the name as a wordmark:
```tsx
{p.logo ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={p.logo} alt={p.name} className="partner-logo h-auto w-auto max-h-8 max-w-[104px] md:max-h-9 md:max-w-[120px]" />
) : (
  <span className="font-display text-[20px] uppercase tracking-[0.04em] text-fg/70">{p.name}</span>
)}
```
Use `p.name`/`p.href` for the anchor's `key`/`aria-label`/`href`/`title` (key: `${p.name}-${i}`).

- [ ] **Step 2: Verify** → `npm run build` succeeds; `npx eslint components/partners-marquee.tsx` clean.

- [ ] **Step 3: Commit**

```bash
git add components/partners-marquee.tsx
git commit -m "feat(cms): partners marquee from CMS (add-new, uploaded-logo precedence)"
```

---

### Task 10: Wire What-Is section copy

**Files:** Modify `components/what-is.tsx`

**Interfaces:** Consumes `getSiteContent`/`sectionOf`. Fallback = current hardcoded strings. Clapboard slate fields (Director/Location/Est/Runs) stay code for now.

- [ ] **Step 1: Make async and source eyebrow/heading/body**

In `components/what-is.tsx`:
1. Add `import { getSiteContent, sectionOf } from "@/lib/site-content";`
2. Change to `export async function WhatIs() {` and add:
```tsx
  const cms = sectionOf(await getSiteContent(), "whatIs");
  const eyebrow = cms?.eyebrow ?? "SC. 01 · Roll 22 · Now Rolling";
  const heading = cms?.title ?? "What Is Scope Screenings?";
  const body = cms?.body ??
    "Seattle’s underground film festival. A live, monthly short-film showcase built to put filmmakers on a real screen in front of a real, packed house — uplifting Black, brown & tan creators across the PNW. Ten directors, one night, every month.";
```
3. Replace the eyebrow `<span>` text with `{eyebrow}`, the `KineticText text="What Is Scope Screenings?"` with `text={heading}`, and the editorial `<p>` body with `{body}`.

- [ ] **Step 2: Verify** → `npm run build` succeeds; `npx eslint components/what-is.tsx` clean.

- [ ] **Step 3: Commit**

```bash
git add components/what-is.tsx
git commit -m "feat(cms): what-is copy from CMS with fallback"
```

---

### Task 11: Wire page.tsx sections + hero props

**Files:** Modify `app/page.tsx`, `components/curtain-credits-hero.tsx`

**Interfaces:** `app/page.tsx` is already `async`. Consumes `getSiteContent`/`sectionOf`. Covers: Built-For-Access (founder) copy, Magic-gallery CTA, Archives CTA, and hero eyebrow/tagline via props.

- [ ] **Step 1: Hero accepts optional props**

In `components/curtain-credits-hero.tsx`, change the signature and use props with the current literals as defaults:
```tsx
export function CurtainCreditsHero({ eyebrow = "Feature Presentation", tagline = "Seattle’s Underground Film Festival" }: { eyebrow?: string; tagline?: string } = {}) {
```
Replace `<span className={styles.eyebrow}>Feature Presentation</span>` with `{eyebrow}` and the `<span className={styles.tagline}>` text with `{tagline}`. (Wordmark "Scope / Screenings" stays.)

- [ ] **Step 2: page.tsx reads CMS and passes content down**

In `app/page.tsx`:
1. Add `import { getSiteContent, sectionOf } from "@/lib/site-content";`
2. In `Home()`, after the existing `getPurchasableTargets()` line, add:
```tsx
  const content = await getSiteContent();
  const hero = sectionOf(content, "hero");
  const access = sectionOf(content, "builtForAccess");
  const magic = sectionOf(content, "magicGallery");
  const archives = sectionOf(content, "archives");
  const FOUNDER_QUOTE_CMS = access?.body ?? FOUNDER_QUOTE;
```
3. Pass hero props: `<CurtainCreditsHero eyebrow={hero?.eyebrow} tagline={hero?.body} />` (undefined → component defaults).
4. Built-For-Access: replace the `ChapterLabel n="Chapter Two"` with `n={access?.eyebrow ?? "Chapter Two"}`, the `KineticText text={"Built For\nAccess"}` with `text={access?.title ?? "Built For\nAccess"}`, and the blockquote `{FOUNDER_QUOTE}` with `{FOUNDER_QUOTE_CMS}`.
5. Magic gallery: replace `n="Chapter Three"` with `n={magic?.eyebrow ?? "Chapter Three"}`, the `KineticText text={"Scope Screenings\nMagic"}` with `text={magic?.title ?? "Scope Screenings\nMagic"}`, the descriptive `<p>` with `{magic?.body ?? "Every last Tuesday the Central District turns into a cinema — ten films, ten directors, and the best room in the city."}`, and the "See more from the floor" CTA `href`/label with `{magic?.ctaUrl ?? "https://instagram.com/scopescreenings"}` / `{magic?.ctaLabel ?? "See more from the floor"}` (keep the trailing `›`).
6. Archives: replace `n="Chapter Four"` with `n={archives?.eyebrow ?? "Chapter Four"}`, `text="The Archives"` with `text={archives?.title ?? "The Archives"}`, the `<p>` with `{archives?.body ?? "Shorts, music videos, docs, animation, experiments. Every film twenty minutes or less, every filmmaker in the room."}`, and the CTA `href="/schedule"`/label with `{archives?.ctaUrl ?? "/schedule"}` / `{archives?.ctaLabel ?? "Browse all 200+ films"}`.

- [ ] **Step 3: Verify** → `npm run build` succeeds; `npx eslint app/page.tsx components/curtain-credits-hero.tsx` clean.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/curtain-credits-hero.tsx
git commit -m "feat(cms): wire hero, founder, magic + archives sections to CMS"
```

---

### Task 12: One-page CMS user guide (.docx)

**Files:** Create `scripts/build-cms-guide.py`; output `docs/Scope-Screenings-CMS-Guide.docx`.

**Notes:** Uses `python-docx`. Headings set to font **Aachen Bold**, body **Libre Franklin** (fonts referenced by name; Aachen is installed at `~/Library/Fonts/aachen-bold.otf`). Popcorn logo from `public/popcorn-logo.png`.

- [ ] **Step 1: Write the generator script**

```python
# scripts/build-cms-guide.py
# Generates the one-page Scope Screenings CMS editor guide as a .docx,
# styled with the site brand (Aachen Bold headings, Libre Franklin body).
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

RUST = RGBColor(0xB1, 0x3A, 0x2A)
INK = RGBColor(0x14, 0x12, 0x10)

doc = Document()
for s in doc.sections:
    s.top_margin = s.bottom_margin = Inches(0.5)
    s.left_margin = s.right_margin = Inches(0.7)

def style_run(r, font="Libre Franklin", size=10.5, bold=False, color=INK):
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

# Header: logo + title
doc.add_picture("public/popcorn-logo.png", height=Inches(0.55))
doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
h = doc.add_paragraph(); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
style_run(h.add_run("Editing Your Website Content"), font="Aachen Bold", size=22, color=RUST)
sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
style_run(sub.add_run("A 1-page guide to the Scope Screenings CMS"), size=11)

def heading(text):
    p = doc.add_paragraph(); p.space_before = Pt(8)
    style_run(p.add_run(text), font="Aachen Bold", size=13, color=RUST)

def bullet(text, label=None):
    p = doc.add_paragraph(style="List Bullet")
    if label:
        style_run(p.add_run(label + ": "), bold=True)
    style_run(p.add_run(text))

heading("The one rule")
body = doc.add_paragraph()
style_run(body.add_run("Open the CMS in your Wix dashboard → pick the collection → edit the fields → click Publish. Your live site updates within the hour."))

heading("Sections — edit any section's words, title, image, or button")
bullet("the big heading for that section.", "Title")
bullet("the small label above the title (e.g. “Chapter Three”).", "Eyebrow")
bullet("the paragraph text.", "Body")
bullet("upload a new photo for that section.", "Image")
bullet("the button text and where it links (e.g. the Submit button → FilmFreeway).", "Button label / Button link")
bullet("leave this alone — it tells the website which section this is.", "Section key")

heading("Partners — add or change sponsors")
bullet("Add a row for a new partner: name, logo (upload), link, and order. Remove a row to drop a partner.")

heading("Marquee — the scrolling banner under the hero")
bullet("Each row is one phrase. The “Now Showing” date is automatic from your ticketing — you don't edit that.")

heading("Socials & Settings")
bullet("Socials: add/edit the Instagram, TikTok, YouTube links in the footer.")
bullet("Settings: contact email, venue name/address, door & screening times, newsletter heading, footer tagline, copyright.")

heading("Leave these alone (they update themselves)")
bullet("Tickets and the Schedule come straight from Wix Events — manage those where you already sell tickets.")

doc.save("docs/Scope-Screenings-CMS-Guide.docx")
print("wrote docs/Scope-Screenings-CMS-Guide.docx")
```

- [ ] **Step 2: Generate it**

Run:
```bash
python3 -m pip install --quiet python-docx
python3 scripts/build-cms-guide.py
```
Expected: `wrote docs/Scope-Screenings-CMS-Guide.docx` and the file exists. Open it to confirm the logo renders and it fits on one page (tighten margins/sizes if it spills).

- [ ] **Step 3: Commit**

```bash
git add scripts/build-cms-guide.py docs/Scope-Screenings-CMS-Guide.docx
git commit -m "docs(cms): branded one-page CMS editor guide (.docx)"
```

---

### Task 13: Full verification + live edit smoke test

**Files:** none (verification).

- [ ] **Step 1: Run the whole suite**

Run: `npm test` → all pass. `npm run build` → succeeds. `npx eslint .` → clean.

- [ ] **Step 2: Live fallback check**

Temporarily unset the client id and confirm the site still renders with festival.ts copy:
```bash
WIX_CLIENT_ID= npm run build
```
Expected: build succeeds, no thrown errors from CMS reads.

- [ ] **Step 3: Live CMS edit check**

`npm run dev`, load the page. In the Wix dashboard CMS, change `Sections` → `submissions` → Button link to a test URL and Publish; after the revalidate window (or a hard reload in dev) confirm the Submit button points to the new URL. Revert the test edit.

- [ ] **Step 4: Final commit (if any verification tweaks were needed)**

```bash
git add -A && git commit -m "chore(cms): verification fixes" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:**
- Sections/Partners/Marquee/Socials/Settings collections → Tasks 4, 5. ✓
- Editable per-section words/titles/media/links → Tasks 6–11. ✓
- Submit link, partner links + add-new, gallery CTA → Tasks 8, 9, 11. ✓
- Marquee mapped to Wix Events → Task 6. ✓
- Footer socials/settings → Task 7. ✓
- Visitor-token reader + festival.ts fallback → Tasks 1–4. ✓
- Tickets/Schedule untouched → constraint honored (no edits to wix-checkout.ts/wix-events.ts). ✓
- read=ANYONE permissions → Tasks 0, 5. ✓
- One-page .docx guide with brand fonts/logo → Task 12. ✓
- Directors/Stats deferred → not in plan (Phase 2). ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code; component edits reference exact current source. ✓

**Type consistency:** `getVisitorToken` (Task 1) → used in Task 2. `queryCollection`/`getSingleton` (Task 2) → used in Task 4. `getSiteContent`/`sectionOf`/`CmsSection` (Task 4) → used in Tasks 6–11. `wixImageUrl` (Task 3) → used in Task 9. `buildMarqueeItems` (Task 6). All consistent. ✓

**Open risk (front-loaded):** Task 0 verifies the site's CMS/Dev-Mode is enabled and the visitor token can read `ANYONE` collections before any build work. If Task 0 fails, the user must enable the CMS/Dev Mode on the "scope" site first.
