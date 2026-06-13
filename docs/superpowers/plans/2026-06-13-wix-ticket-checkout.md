# Wix Ticket Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outbound "Buy Tickets" links with a native, on-brand modal checkout that selects tickets live from Wix Events, reserves them, then redirects to Wix's hosted form for payment and returns to a branded `/thank-you`.

**Architecture:** A server-side Wix boundary (`lib/wix-checkout.ts`) wrapped by two Next.js route handlers (`/api/checkout/*`). A client modal (selection → review → redirect) opened from any "Buy Tickets" trigger via a small React context. The anonymous Wix visitor token is minted server-side only; the browser talks solely to our own API. The final payment step is a full-page redirect to a Wix-hosted form via the Headless **Create Redirect Session** API (`eventsCheckout` flow), which returns the buyer to `/thank-you`.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind v4, Vitest + Testing Library (added in Task 1). Wix Events REST APIs (ticketing) + Wix Headless Redirects API, called with an anonymous OAuth visitor token (`WIX_CLIENT_ID` already in `.env`).

---

## Notes for the implementer

- **This project is NOT under git.** The per-task **Commit** steps assume git. Run `git init` once at the start of Task 1 if you want them to work; otherwise treat each Commit step as a logical checkpoint and skip the command.
- **All Wix calls below are verified working (2026-06-13)** with the anonymous visitor token against the live site. Real values you can use while developing:
  - Site base URL: `https://www.lexscopefilms.com`
  - Opening Night event: id `592ffa40-a82e-4e5e-adda-1319056a4a15`, slug `scope-screenings-opening-night`. Ticket defs: Donate `4b0f3b16-890b-471e-8a65-a0930db19865` ($0), Early Bird GA `83f7d84e-2280-43d0-8104-b154200ddc19` ($18), General Admission `c881d629-eb16-4dbf-892a-0dd987951355` ($22).
  - Season Pass (Season 5) event: id `5357811e-a01b-4515-9897-2b109d5d48e8`. Ticket defs: GA Season Pass `58412dc6-de2d-42f9-baaa-eddbe8ac5344` ($99), VIP Season Pass `12b7c98a-4558-4d9a-99b6-59f528302be7` ($500).
- **Verified Wix request/response shapes** (use these exactly):
  - Token: `POST https://www.wixapis.com/oauth2/token` body `{clientId, grantType:"anonymous"}` → `{access_token}`.
  - Available tickets: `POST https://www.wixapis.com/events/v1/checkout/available-tickets/query` body `{offset,limit,filter:{eventId}}` → `{metaData:{total}, definitions:[{id, name, price:{amount,currency}, limitPerCheckout, ...}]}`.
  - Create reservation: `POST https://www.wixapis.com/events/v1/ticket-reservations` body `{ticketReservation:{tickets:[{ticketDefinitionId, quantity}]}}` → `{ticketReservation:{id, status:"PENDING", expirationDate}}`.
  - Create redirect session: `POST https://www.wixapis.com/redirect-session/v1/redirect-session` body `{eventsCheckout:{reservationId, eventSlug}, callbacks:{thankYouPageUrl, postFlowUrl}}` → `{redirectSession:{fullUrl}}`.
- **Deployment prerequisite (Task 9):** the domain used in `thankYouPageUrl`/`postFlowUrl` must be an allowed redirect domain in the Wix Headless settings. `lexscopefilms.com` already works; the deployed app domain must be added before production. For local dev the redirect *returns* to whatever `NEXT_PUBLIC_SITE_URL` you set — use a domain Wix allows, or test the return leg against the deployed build.

---

## File structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config (jsdom + path alias) — Task 1 |
| `vitest.setup.ts` | Testing-library matchers — Task 1 |
| `lib/wix-checkout.ts` | Server-only Wix boundary: token, availability, reservation, redirect, target resolution — Tasks 2–5 |
| `lib/wix-checkout.test.ts` | Unit tests for the boundary — Tasks 2–5 |
| `app/api/checkout/tickets/route.ts` | `GET ?eventId=` → live tiers — Task 6 |
| `app/api/checkout/reserve/route.ts` | `POST {eventSlug, lineItems}` → `{redirectUrl, expiresAt}` — Task 7 |
| `app/api/checkout/*/route.test.ts` | Route handler tests — Tasks 6–7 |
| `components/checkout/checkout-context.tsx` | Client context: `openCheckout()` + modal mount — Task 8 |
| `components/checkout/ticket-picker.tsx` | Presentational quantity steppers — Task 8 |
| `components/checkout/checkout-modal.tsx` | Modal: fetch tiers → review → reserve → redirect — Task 8 |
| `app/thank-you/page.tsx` | Branded confirmation return page — Task 9 |
| `app/layout.tsx` | Mount `CheckoutProvider` — Task 9 |
| `components/buy-tickets.tsx` | Triggers call `openCheckout` instead of linking out — Task 9 |
| `app/page.tsx` | Resolve purchasable targets server-side, pass to `BuyTickets` — Task 9 |

---

### Task 1: Add the Vitest test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (scripts + devDependencies)
- Test: `lib/smoke.test.ts` (temporary)

- [ ] **Step 1: (optional) init git so commits work**

Run: `git init && git add -A && git commit -m "chore: baseline before checkout feature"`
Expected: a repo with one commit. Skip if you do not want version control.

- [ ] **Step 2: Install test dependencies**

Run:
```bash
npm install -D vitest@^2 @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: packages added under devDependencies, no errors.

- [ ] **Step 3: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: Write `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Add test scripts to `package.json`**

In the `"scripts"` block add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 6: Write a temporary smoke test `lib/smoke.test.ts`**

```typescript
import { describe, it, expect } from "vitest";

describe("harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 8: Delete the smoke test and commit**

Run:
```bash
rm lib/smoke.test.ts
git add -A && git commit -m "chore: add vitest harness"
```

---

### Task 2: `lib/wix-checkout.ts` — types, token, `queryAvailableTickets`

**Files:**
- Create: `lib/wix-checkout.ts`
- Test: `lib/wix-checkout.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/wix-checkout.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryAvailableTickets } from "./wix-checkout";

const TOKEN_RES = { access_token: "visitor-token-abc" };

function mockFetchSequence(responses: Array<{ ok?: boolean; json: unknown }>) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce({
      ok: r.ok ?? true,
      json: async () => r.json,
    });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.stubEnv("WIX_CLIENT_ID", "client-123");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("queryAvailableTickets", () => {
  it("normalizes Wix definitions into tiers", async () => {
    const fetchMock = mockFetchSequence([
      { json: TOKEN_RES },
      {
        json: {
          metaData: { total: 2 },
          definitions: [
            { id: "ga", name: "General Admission - $22", price: { amount: "22.00", currency: "USD" }, limitPerCheckout: 50 },
            { id: "free", name: "Donate", price: { amount: "0.00", currency: "USD" }, limitPerCheckout: 10 },
          ],
        },
      },
    ]);

    const tiers = await queryAvailableTickets("event-1");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(tiers).toEqual([
      { id: "ga", name: "General Admission - $22", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false },
      { id: "free", name: "Donate", priceAmount: 0, priceLabel: "Free", currency: "USD", limit: 10, free: true },
    ]);
  });

  it("returns null when WIX_CLIENT_ID is missing", async () => {
    vi.unstubAllEnvs();
    const tiers = await queryAvailableTickets("event-1");
    expect(tiers).toBeNull();
  });

  it("returns null when the availability call fails", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { ok: false, json: {} }]);
    const tiers = await queryAvailableTickets("event-1");
    expect(tiers).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: FAIL — cannot find module `./wix-checkout` / `queryAvailableTickets` is not a function.

- [ ] **Step 3: Implement the module**

`lib/wix-checkout.ts`:
```typescript
// Server-only Wix Events checkout boundary.
// Mints an anonymous visitor token and talks to the Events ticketing +
// Headless Redirects APIs. Every function returns null on any miss so callers
// can degrade gracefully (e.g. fall back to the outbound Wix link).
import "server-only";

const CLIENT_ID = process.env.WIX_CLIENT_ID;
const API = "https://www.wixapis.com";

export interface TicketTier {
  id: string;
  name: string;
  priceAmount: number; // numeric, e.g. 22
  priceLabel: string; // display, e.g. "$22.00" or "Free"
  currency: string;
  limit: number; // max quantity per checkout
  free: boolean;
}

async function getVisitorToken(): Promise<string | null> {
  if (!CLIENT_ID) return null;
  try {
    const res = await fetch(`${API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: CLIENT_ID, grantType: "anonymous" }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

interface WixDefinition {
  id?: string;
  name?: string;
  price?: { amount?: string; currency?: string };
  limitPerCheckout?: number;
}

export async function queryAvailableTickets(eventId: string): Promise<TicketTier[] | null> {
  const token = await getVisitorToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/events/v1/checkout/available-tickets/query`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ offset: 0, limit: 100, filter: { eventId } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { definitions } = (await res.json()) as { definitions?: WixDefinition[] };
    if (!definitions) return null;
    return definitions.map((d) => {
      const amount = Number(d.price?.amount ?? "0");
      const currency = d.price?.currency ?? "USD";
      const free = amount === 0;
      return {
        id: d.id ?? "",
        name: d.name ?? "Ticket",
        priceAmount: amount,
        priceLabel: free ? "Free" : `$${amount.toFixed(2)}`,
        currency,
        limit: d.limitPerCheckout ?? 50,
        free,
      };
    });
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Install the `server-only` package**

Run: `npm install server-only`
Expected: added to dependencies.

- [ ] **Step 5: Run tests**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/wix-checkout.ts lib/wix-checkout.test.ts package.json package-lock.json
git commit -m "feat: wix-checkout token + queryAvailableTickets"
```

---

### Task 3: `createReservation`

**Files:**
- Modify: `lib/wix-checkout.ts`
- Test: `lib/wix-checkout.test.ts`

- [ ] **Step 1: Add the failing test** (append inside `lib/wix-checkout.test.ts`)

```typescript
import { createReservation } from "./wix-checkout";

describe("createReservation", () => {
  it("reserves tickets and returns id + expiry", async () => {
    const fetchMock = mockFetchSequence([
      { json: TOKEN_RES },
      { json: { ticketReservation: { id: "res-1", status: "PENDING", expirationDate: "2026-06-13T22:50:05.045Z" } } },
    ]);

    const result = await createReservation([{ ticketDefinitionId: "ga", quantity: 2 }]);

    expect(result).toEqual({ reservationId: "res-1", expiresAt: "2026-06-13T22:50:05.045Z" });
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body).toEqual({ ticketReservation: { tickets: [{ ticketDefinitionId: "ga", quantity: 2 }] } });
  });

  it("returns null when no line items have quantity", async () => {
    const result = await createReservation([{ ticketDefinitionId: "ga", quantity: 0 }]);
    expect(result).toBeNull();
  });

  it("returns null when the reservation call fails", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { ok: false, json: {} }]);
    const result = await createReservation([{ ticketDefinitionId: "ga", quantity: 1 }]);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: FAIL — `createReservation` is not exported.

- [ ] **Step 3: Implement** (append to `lib/wix-checkout.ts`)

```typescript
export interface ReservationLineItem {
  ticketDefinitionId: string;
  quantity: number;
}

export async function createReservation(
  lineItems: ReservationLineItem[],
): Promise<{ reservationId: string; expiresAt: string } | null> {
  const tickets = lineItems.filter((l) => l.quantity > 0);
  if (tickets.length === 0) return null;
  const token = await getVisitorToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/events/v1/ticket-reservations`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ ticketReservation: { tickets } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { ticketReservation } = (await res.json()) as {
      ticketReservation?: { id?: string; expirationDate?: string };
    };
    if (!ticketReservation?.id) return null;
    return {
      reservationId: ticketReservation.id,
      expiresAt: ticketReservation.expirationDate ?? "",
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: PASS (now 6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/wix-checkout.ts lib/wix-checkout.test.ts
git commit -m "feat: createReservation"
```

---

### Task 4: `createPaymentRedirect`

**Files:**
- Modify: `lib/wix-checkout.ts`
- Test: `lib/wix-checkout.test.ts`

- [ ] **Step 1: Add the failing test** (append)

```typescript
import { createPaymentRedirect } from "./wix-checkout";

describe("createPaymentRedirect", () => {
  it("creates a redirect session and returns the full url", async () => {
    const fetchMock = mockFetchSequence([
      { json: TOKEN_RES },
      { json: { redirectSession: { fullUrl: "https://wix.example/redirect?token=xyz" } } },
    ]);

    const url = await createPaymentRedirect({
      reservationId: "res-1",
      eventSlug: "opening-night",
      thankYouPageUrl: "https://site.test/thank-you",
      postFlowUrl: "https://site.test/",
    });

    expect(url).toBe("https://wix.example/redirect?token=xyz");
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body).toEqual({
      eventsCheckout: { reservationId: "res-1", eventSlug: "opening-night" },
      callbacks: { thankYouPageUrl: "https://site.test/thank-you", postFlowUrl: "https://site.test/" },
    });
  });

  it("returns null when the session call fails", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { ok: false, json: {} }]);
    const url = await createPaymentRedirect({
      reservationId: "res-1",
      eventSlug: "opening-night",
      thankYouPageUrl: "https://site.test/thank-you",
      postFlowUrl: "https://site.test/",
    });
    expect(url).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: FAIL — `createPaymentRedirect` is not exported.

- [ ] **Step 3: Implement** (append to `lib/wix-checkout.ts`)

```typescript
export async function createPaymentRedirect(args: {
  reservationId: string;
  eventSlug: string;
  thankYouPageUrl: string;
  postFlowUrl: string;
}): Promise<string | null> {
  const token = await getVisitorToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/redirect-session/v1/redirect-session`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        eventsCheckout: { reservationId: args.reservationId, eventSlug: args.eventSlug },
        callbacks: { thankYouPageUrl: args.thankYouPageUrl, postFlowUrl: args.postFlowUrl },
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { redirectSession } = (await res.json()) as { redirectSession?: { fullUrl?: string } };
    return redirectSession?.fullUrl ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: PASS (now 8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/wix-checkout.ts lib/wix-checkout.test.ts
git commit -m "feat: createPaymentRedirect"
```

---

### Task 5: `getPurchasableTargets` — resolve which Wix events the CTAs open

**Files:**
- Modify: `lib/wix-checkout.ts`
- Test: `lib/wix-checkout.test.ts`

Resolves, from live Wix events, the two purchasable targets the homepage CTAs need: the next upcoming single screening and the current season pass. Each target is `{ eventId, eventSlug, title }`.

- [ ] **Step 1: Add the failing test** (append)

```typescript
import { getPurchasableTargets } from "./wix-checkout";

describe("getPurchasableTargets", () => {
  const EVENTS = {
    events: [
      { id: "pass5", slug: "season-pass-5", title: "Season Pass for Scope Screenings Season 5", dateAndTimeSettings: {} },
      { id: "past", slug: "old-night", title: "Scope Screenings: August 26", dateAndTimeSettings: { startDate: "2020-01-01T00:00:00Z" } },
      { id: "next", slug: "opening-night", title: "Scope Screenings: Opening Night", dateAndTimeSettings: { startDate: "2999-01-01T00:00:00Z" } },
    ],
  };

  it("picks the soonest upcoming non-pass screening and the season pass", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { json: EVENTS }]);
    const targets = await getPurchasableTargets();
    expect(targets?.nextShow).toEqual({ eventId: "next", eventSlug: "opening-night", title: "Scope Screenings: Opening Night" });
    expect(targets?.seasonPass).toEqual({ eventId: "pass5", eventSlug: "season-pass-5", title: "Season Pass for Scope Screenings Season 5" });
  });

  it("returns null targets gracefully when the events call fails", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { ok: false, json: {} }]);
    const targets = await getPurchasableTargets();
    expect(targets).toEqual({ nextShow: null, seasonPass: null });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: FAIL — `getPurchasableTargets` is not exported.

- [ ] **Step 3: Implement** (append to `lib/wix-checkout.ts`)

```typescript
export interface CheckoutTarget {
  eventId: string;
  eventSlug: string;
  title: string;
}

interface WixEventRow {
  id?: string;
  slug?: string;
  title?: string;
  dateAndTimeSettings?: { startDate?: string };
}

function nowIso(): string {
  // Server evaluation time; safe in a server module.
  return new Date().toISOString();
}

export async function getPurchasableTargets(): Promise<{
  nextShow: CheckoutTarget | null;
  seasonPass: CheckoutTarget | null;
}> {
  const empty = { nextShow: null, seasonPass: null };
  const token = await getVisitorToken();
  if (!token) return empty;
  try {
    const res = await fetch(`${API}/events/v3/events/query`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: { paging: { limit: 50 }, sort: [{ fieldName: "dateAndTimeSettings.startDate", order: "ASC" }] },
      }),
      next: { revalidate: 600 },
    });
    if (!res.ok) return empty;
    const { events } = (await res.json()) as { events?: WixEventRow[] };
    if (!events) return empty;

    const isPass = (e: WixEventRow) => /season pass/i.test(e.title ?? "");
    const toTarget = (e: WixEventRow): CheckoutTarget | null =>
      e.id && e.slug ? { eventId: e.id, eventSlug: e.slug, title: e.title ?? "" } : null;

    const today = nowIso();
    const nextShowRow = events
      .filter((e) => !isPass(e) && (e.dateAndTimeSettings?.startDate ?? "") >= today)
      .sort((a, b) => (a.dateAndTimeSettings?.startDate ?? "").localeCompare(b.dateAndTimeSettings?.startDate ?? ""))[0];

    // Season pass rows often have no startDate; pick the last one (newest season).
    const passRows = events.filter(isPass);
    const passRow = passRows[passRows.length - 1];

    return {
      nextShow: nextShowRow ? toTarget(nextShowRow) : null,
      seasonPass: passRow ? toTarget(passRow) : null,
    };
  } catch {
    return empty;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run lib/wix-checkout.test.ts`
Expected: PASS (now 10 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/wix-checkout.ts lib/wix-checkout.test.ts
git commit -m "feat: getPurchasableTargets"
```

---

### Task 6: `GET /api/checkout/tickets`

**Files:**
- Create: `app/api/checkout/tickets/route.ts`
- Test: `app/api/checkout/tickets/route.test.ts`

- [ ] **Step 1: Write the failing test**

`app/api/checkout/tickets/route.test.ts`:
```typescript
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/wix-checkout", () => ({
  queryAvailableTickets: vi.fn(),
}));

import { GET } from "./route";
import { queryAvailableTickets } from "@/lib/wix-checkout";

const mocked = vi.mocked(queryAvailableTickets);
afterEach(() => vi.clearAllMocks());

function req(url: string) {
  return new Request(url);
}

describe("GET /api/checkout/tickets", () => {
  it("400s when eventId is missing", async () => {
    const res = await GET(req("http://test/api/checkout/tickets"));
    expect(res.status).toBe(400);
  });

  it("returns tiers for a valid event", async () => {
    mocked.mockResolvedValueOnce([
      { id: "ga", name: "GA", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false },
    ]);
    const res = await GET(req("http://test/api/checkout/tickets?eventId=e1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tiers: [{ id: "ga", name: "GA", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false }] });
    expect(mocked).toHaveBeenCalledWith("e1");
  });

  it("502s when Wix is unreachable", async () => {
    mocked.mockResolvedValueOnce(null);
    const res = await GET(req("http://test/api/checkout/tickets?eventId=e1"));
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/checkout/tickets/route.test.ts`
Expected: FAIL — cannot find `./route`.

- [ ] **Step 3: Implement**

`app/api/checkout/tickets/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { queryAvailableTickets } from "@/lib/wix-checkout";

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }
  const tiers = await queryAvailableTickets(eventId);
  if (tiers === null) {
    return NextResponse.json({ error: "tickets unavailable" }, { status: 502 });
  }
  return NextResponse.json({ tiers });
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run app/api/checkout/tickets/route.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/checkout/tickets/route.ts app/api/checkout/tickets/route.test.ts
git commit -m "feat: GET /api/checkout/tickets"
```

---

### Task 7: `POST /api/checkout/reserve`

**Files:**
- Create: `app/api/checkout/reserve/route.ts`
- Test: `app/api/checkout/reserve/route.test.ts`

Reserves the chosen line items and creates the payment redirect in one round-trip. Returns `{ redirectUrl, expiresAt }`. The post-flow/thank-you URLs are derived from `NEXT_PUBLIC_SITE_URL` (fallback to the request origin).

- [ ] **Step 1: Write the failing test**

`app/api/checkout/reserve/route.test.ts`:
```typescript
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/wix-checkout", () => ({
  createReservation: vi.fn(),
  createPaymentRedirect: vi.fn(),
}));

import { POST } from "./route";
import { createReservation, createPaymentRedirect } from "@/lib/wix-checkout";

const mockReserve = vi.mocked(createReservation);
const mockRedirect = vi.mocked(createPaymentRedirect);
afterEach(() => vi.clearAllMocks());

function post(body: unknown) {
  return new Request("http://test/api/checkout/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout/reserve", () => {
  it("400s when lineItems are empty", async () => {
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [] }));
    expect(res.status).toBe(400);
  });

  it("reserves then returns a redirect url", async () => {
    mockReserve.mockResolvedValueOnce({ reservationId: "res-1", expiresAt: "2026-06-13T22:50:05Z" });
    mockRedirect.mockResolvedValueOnce("https://wix.example/redirect");
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 2 }] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ redirectUrl: "https://wix.example/redirect", expiresAt: "2026-06-13T22:50:05Z" });
    expect(mockReserve).toHaveBeenCalledWith([{ ticketDefinitionId: "ga", quantity: 2 }]);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ reservationId: "res-1", eventSlug: "opening-night" }),
    );
  });

  it("502s when reservation fails", async () => {
    mockReserve.mockResolvedValueOnce(null);
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 1 }] }));
    expect(res.status).toBe(502);
  });

  it("502s when redirect session fails", async () => {
    mockReserve.mockResolvedValueOnce({ reservationId: "res-1", expiresAt: "x" });
    mockRedirect.mockResolvedValueOnce(null);
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 1 }] }));
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/checkout/reserve/route.test.ts`
Expected: FAIL — cannot find `./route`.

- [ ] **Step 3: Implement**

`app/api/checkout/reserve/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createReservation, createPaymentRedirect, type ReservationLineItem } from "@/lib/wix-checkout";

interface ReserveBody {
  eventSlug?: string;
  lineItems?: ReservationLineItem[];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReserveBody;
  const lineItems = (body.lineItems ?? []).filter((l) => l && l.quantity > 0);
  if (!body.eventSlug || lineItems.length === 0) {
    return NextResponse.json({ error: "eventSlug and lineItems required" }, { status: 400 });
  }

  const reservation = await createReservation(lineItems);
  if (!reservation) {
    return NextResponse.json({ error: "could not reserve tickets" }, { status: 502 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const redirectUrl = await createPaymentRedirect({
    reservationId: reservation.reservationId,
    eventSlug: body.eventSlug,
    thankYouPageUrl: `${origin}/thank-you`,
    postFlowUrl: `${origin}/`,
  });
  if (!redirectUrl) {
    return NextResponse.json({ error: "could not start payment" }, { status: 502 });
  }

  return NextResponse.json({ redirectUrl, expiresAt: reservation.expiresAt });
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run app/api/checkout/reserve/route.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/checkout/reserve/route.ts app/api/checkout/reserve/route.test.ts
git commit -m "feat: POST /api/checkout/reserve"
```

---

### Task 8: Checkout UI — context, ticket picker, modal

**Files:**
- Create: `components/checkout/checkout-context.tsx`
- Create: `components/checkout/ticket-picker.tsx`
- Create: `components/checkout/checkout-modal.tsx`
- Test: `components/checkout/ticket-picker.test.tsx`
- Test: `components/checkout/checkout-modal.test.tsx`

- [ ] **Step 1: Write the failing test for the ticket picker**

`components/checkout/ticket-picker.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketPicker } from "./ticket-picker";

const TIERS = [
  { id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 2, free: false },
];

describe("TicketPicker", () => {
  it("increments quantity up to the limit and reports changes", async () => {
    const onChange = vi.fn();
    render(<TicketPicker tiers={TIERS} quantities={{}} onChange={onChange} />);

    const plus = screen.getByRole("button", { name: /increase general admission/i });
    await userEvent.click(plus);
    expect(onChange).toHaveBeenLastCalledWith("ga", 1);
  });

  it("disables increment at the per-checkout limit", async () => {
    render(<TicketPicker tiers={TIERS} quantities={{ ga: 2 }} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /increase general admission/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run components/checkout/ticket-picker.test.tsx`
Expected: FAIL — cannot find `./ticket-picker`.

- [ ] **Step 3: Implement the ticket picker**

`components/checkout/ticket-picker.tsx`:
```tsx
"use client";

import type { TicketTier } from "@/lib/wix-checkout";

export function TicketPicker({
  tiers,
  quantities,
  onChange,
}: {
  tiers: TicketTier[];
  quantities: Record<string, number>;
  onChange: (tierId: string, quantity: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {tiers.map((tier) => {
        const qty = quantities[tier.id] ?? 0;
        return (
          <li
            key={tier.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-faint bg-cream/5 px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-body text-[15px] font-bold text-fg">{tier.name}</span>
              <span className="font-mono text-[12px] text-smoke">{tier.priceLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={`Decrease ${tier.name}`}
                disabled={qty === 0}
                onClick={() => onChange(tier.id, Math.max(0, qty - 1))}
                className="h-8 w-8 rounded-full border border-faint font-body text-lg leading-none text-fg disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center font-body text-[16px] font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label={`Increase ${tier.name}`}
                disabled={qty >= tier.limit}
                onClick={() => onChange(tier.id, Math.min(tier.limit, qty + 1))}
                className="h-8 w-8 rounded-full border border-faint font-body text-lg leading-none text-fg disabled:opacity-30"
              >
                +
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: Run the picker test**

Run: `npx vitest run components/checkout/ticket-picker.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Implement the checkout context**

`components/checkout/checkout-context.tsx`:
```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CheckoutTarget } from "@/lib/wix-checkout";
import { CheckoutModal } from "./checkout-modal";

interface CheckoutContextValue {
  openCheckout: (target: CheckoutTarget) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<CheckoutTarget | null>(null);
  const openCheckout = useCallback((t: CheckoutTarget) => setTarget(t), []);
  const value = useMemo(() => ({ openCheckout }), [openCheckout]);

  return (
    <CheckoutContext.Provider value={value}>
      {children}
      {target ? <CheckoutModal target={target} onClose={() => setTarget(null)} /> : null}
    </CheckoutContext.Provider>
  );
}
```

- [ ] **Step 6: Write the failing test for the modal**

`components/checkout/checkout-modal.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutModal } from "./checkout-modal";

const TARGET = { eventId: "e1", eventSlug: "opening-night", title: "Opening Night" };

function stubFetch(handlers: Record<string, { status?: number; json: unknown }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const key = `${init?.method ?? "GET"} ${url.split("?")[0]}`;
      const h = handlers[key];
      return { ok: (h.status ?? 200) < 400, status: h.status ?? 200, json: async () => h.json };
    }),
  );
}

beforeEach(() => {
  // jsdom has no navigation; capture redirect target instead.
  vi.stubGlobal("location", { ...window.location, assign: vi.fn() });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CheckoutModal", () => {
  it("loads tiers and shows them", async () => {
    stubFetch({
      "GET /api/checkout/tickets": {
        json: { tiers: [{ id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 5, free: false }] },
      },
    });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    expect(await screen.findByText("General Admission")).toBeInTheDocument();
  });

  it("disables Reserve & Pay until a ticket is selected", async () => {
    stubFetch({
      "GET /api/checkout/tickets": {
        json: { tiers: [{ id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 5, free: false }] },
      },
    });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    await screen.findByText("General Admission");
    expect(screen.getByRole("button", { name: /reserve & pay/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /increase general admission/i }));
    expect(screen.getByRole("button", { name: /reserve & pay/i })).toBeEnabled();
  });

  it("shows the fallback link when tiers fail to load", async () => {
    stubFetch({ "GET /api/checkout/tickets": { status: 502, json: { error: "x" } } });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    expect(await screen.findByRole("link", { name: /buy on lexscopefilms/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run to verify failure**

Run: `npx vitest run components/checkout/checkout-modal.test.tsx`
Expected: FAIL — cannot find `./checkout-modal`.

- [ ] **Step 8: Implement the modal**

`components/checkout/checkout-modal.tsx`:
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckoutTarget, TicketTier } from "@/lib/wix-checkout";
import { TicketPicker } from "./ticket-picker";

type LoadState =
  | { phase: "loading" }
  | { phase: "ready"; tiers: TicketTier[] }
  | { phase: "error" };

export function CheckoutModal({ target, onClose }: { target: CheckoutTarget; onClose: () => void }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/checkout/tickets?eventId=${encodeURIComponent(target.eventId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: { tiers: TicketTier[] }) => active && setState({ phase: "ready", tiers: d.tiers }))
      .catch(() => active && setState({ phase: "error" }));
    return () => {
      active = false;
    };
  }, [target.eventId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = useMemo(() => {
    if (state.phase !== "ready") return 0;
    return state.tiers.reduce((sum, t) => sum + t.priceAmount * (quantities[t.id] ?? 0), 0);
  }, [state, quantities]);

  const hasSelection = Object.values(quantities).some((q) => q > 0);
  const fallbackUrl = `https://www.lexscopefilms.com/event-details/${target.eventSlug}`;

  async function handlePay() {
    if (state.phase !== "ready") return;
    setSubmitting(true);
    setSubmitError(null);
    const lineItems = state.tiers
      .map((t) => ({ ticketDefinitionId: t.id, quantity: quantities[t.id] ?? 0 }))
      .filter((l) => l.quantity > 0);
    try {
      const res = await fetch("/api/checkout/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: target.eventSlug, lineItems }),
      });
      if (!res.ok) throw new Error("reserve failed");
      const { redirectUrl } = (await res.json()) as { redirectUrl: string };
      window.location.href = redirectUrl;
    } catch {
      setSubmitError("Something went wrong starting checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Buy tickets for ${target.title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col gap-5 overflow-y-auto rounded-2xl border border-faint bg-stage p-7 text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 font-body text-xl leading-none text-smoke hover:text-fg"
        >
          ×
        </button>

        <h2 className="font-display text-[28px] uppercase leading-none">{target.title}</h2>

        {state.phase === "loading" && <p className="font-body text-smoke">Loading tickets…</p>}

        {state.phase === "error" && (
          <div className="flex flex-col gap-3">
            <p className="font-body text-smoke">We couldn’t load live tickets right now.</p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-lg bg-curtain px-5 py-3 font-body text-[13px] font-extrabold uppercase tracking-[0.04em] text-cream"
            >
              Buy on lexscopefilms ›
            </a>
          </div>
        )}

        {state.phase === "ready" && (
          <>
            <TicketPicker
              tiers={state.tiers}
              quantities={quantities}
              onChange={(id, q) => setQuantities((prev) => ({ ...prev, [id]: q }))}
            />
            <div className="flex items-center justify-between border-t border-faint pt-4">
              <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-smoke">Total</span>
              <span className="font-marquee text-[28px] leading-none text-rust">${total.toFixed(2)}</span>
            </div>
            {submitError && <p className="font-body text-[13px] text-rust">{submitError}</p>}
            <button
              type="button"
              disabled={!hasSelection || submitting}
              onClick={handlePay}
              className="rounded-lg bg-curtain py-3.5 font-body text-[14px] font-extrabold uppercase tracking-[0.06em] text-cream disabled:opacity-40"
            >
              {submitting ? "Starting checkout…" : "Reserve & Pay ›"}
            </button>
            <p className="text-center font-mono text-[10px] tracking-[0.1em] text-smoke">
              Secure payment completed on Wix · seats held ~20 min
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Run all checkout UI tests**

Run: `npx vitest run components/checkout/`
Expected: PASS (picker 2 + modal 3 = 5 tests).

- [ ] **Step 10: Commit**

```bash
git add components/checkout/
git commit -m "feat: checkout modal, ticket picker, context"
```

---

### Task 9: Wire it into the site + `/thank-you`

**Files:**
- Create: `app/thank-you/page.tsx`
- Modify: `app/layout.tsx` (mount provider)
- Modify: `components/buy-tickets.tsx` (triggers open the modal)
- Modify: `app/page.tsx` (resolve targets, pass to BuyTickets)

- [ ] **Step 1: Create the thank-you page**

`app/thank-you/page.tsx`:
```tsx
import Link from "next/link";

export const metadata = { title: "Thank You — Scope Screenings" };

export default function ThankYou() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-fg">
      <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-label">Admit One</span>
      <h1 className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]">You’re In</h1>
      <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-fg/70">
        Your tickets are confirmed — check your email for the details and your digital ticket.
        Doors 7:00, lights down at 7:30. See you at the show.
      </p>
      <Link
        href="/"
        className="border-b-2 border-rust pb-1.5 font-body text-[13px] font-extrabold uppercase tracking-[0.14em] text-fg transition-colors hover:text-rust"
      >
        Back to the festival ›
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Mount the provider in `app/layout.tsx`**

Add the import near the other component imports:
```tsx
import { CheckoutProvider } from "@/components/checkout/checkout-context";
```
Then wrap `{children}` inside `ThemeProvider` — change:
```tsx
        <ThemeProvider>
          <GrainOverlay />
          {children}
        </ThemeProvider>
```
to:
```tsx
        <ThemeProvider>
          <GrainOverlay />
          <CheckoutProvider>{children}</CheckoutProvider>
        </ThemeProvider>
```

- [ ] **Step 3: Make `buy-tickets.tsx` triggers open the modal**

At the top of `components/buy-tickets.tsx` add the directive and imports:
```tsx
"use client";

import { useCheckout } from "@/components/checkout/checkout-context";
import type { CheckoutTarget } from "@/lib/wix-checkout";
```
Change the `BuyTickets` export to accept targets and pass them down:
```tsx
export function BuyTickets({
  nextShow,
  seasonPass,
}: {
  nextShow: CheckoutTarget | null;
  seasonPass: CheckoutTarget | null;
}) {
  // ...existing heading JSX unchanged...
  // replace the ticket/lanyard wrapper block with:
  return (
    // ...existing <section> and heading...
    <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:gap-14">
      <div className="origin-center scale-[0.58] sm:scale-75 md:scale-[0.9]">
        <NightTicket target={nextShow} />
      </div>
      <div className="origin-center md:scale-[1.12]">
        <SeasonPassLanyard target={seasonPass} />
      </div>
    </div>
    // ...closing tags...
  );
}
```
Convert `NightTicket` and `SeasonPassLanyard` from `<a href>` to buttons. For `NightTicket`, change its signature and outer element:
```tsx
function NightTicket({ target }: { target: CheckoutTarget | null }) {
  const next = nextScreening();
  const { openCheckout } = useCheckout();
  const fallback = reserveUrl(next);
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    target ? (
      <button
        type="button"
        onClick={() => openCheckout(target)}
        aria-label={`Buy tickets for ${target.title}`}
        className="ticket relative flex w-[548px] max-w-full shrink-0 -rotate-[1.5deg] cursor-pointer border-0 bg-transparent p-0 text-left [filter:drop-shadow(0_28px_55px_rgba(0,0,0,0.45))]"
      >
        {children}
      </button>
    ) : (
      <a
        href={fallback}
        target="_blank"
        rel="noopener noreferrer"
        className="ticket relative flex w-[548px] max-w-full shrink-0 -rotate-[1.5deg] [filter:drop-shadow(0_28px_55px_rgba(0,0,0,0.45))]"
        aria-label={`Buy tickets for ${next.title}, ${next.label}`}
      >
        {children}
      </a>
    );
  return <Wrapper>{/* ...existing ticket body + stub + perforation + grain JSX unchanged... */}</Wrapper>;
}
```
Apply the same pattern to `SeasonPassLanyard` (button when `target` present → `openCheckout(target)`, else the existing `<a href={ticketUrl(SEASON_PASS.slug)}>`). Keep all inner markup unchanged.

> Because `buy-tickets.tsx` is now a client component, `nextScreening`, `reserveUrl`, `ticketUrl`, `SEASON_PASS`, `VENUE` from `@/lib/festival` must be plain exports (they are — no server-only imports there).

- [ ] **Step 4: Resolve targets in `app/page.tsx`**

Make the component async and fetch targets; pass to `BuyTickets`:
```tsx
import { getPurchasableTargets } from "@/lib/wix-checkout";
// ...
export default async function Home() {
  const { nextShow, seasonPass } = await getPurchasableTargets();
  // ...existing stat array...
  // change the tickets block:
  //   <BuyTickets />   ->   <BuyTickets nextShow={nextShow} seasonPass={seasonPass} />
}
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors; build completes. (If `tsc` flags the `Wrapper` inline component, hoist it above the return — it is defined inside `NightTicket` intentionally to capture `target`.)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all tests PASS (lib 10 + tickets route 3 + reserve route 4 + picker 2 + modal 3 = 22).

- [ ] **Step 7: Commit**

```bash
git add app/ components/buy-tickets.tsx
git commit -m "feat: wire native checkout into homepage + thank-you page"
```

---

### Task 10: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Confirm env + allowed redirect domain**

- Ensure `.env` has `WIX_CLIENT_ID` (present) and add `NEXT_PUBLIC_SITE_URL` for the domain you'll test the return leg on.
- In Wix Headless settings → OAuth app → allowed redirect domains, confirm the domain in `NEXT_PUBLIC_SITE_URL` is listed (`lexscopefilms.com` already is; add your dev/deploy domain). The Wix site connected to the Headless project must be **published**.

- [ ] **Step 2: Run the dev server**

Run: `npm run dev`
Open `http://localhost:3000`, scroll to the Tickets section.

- [ ] **Step 3: Verify the modal flow**

- Click the night ticket → modal opens, live tiers load (Donate / Early Bird $18 / GA $22 for Opening Night).
- Increase GA to 1–2, watch the total update, then click **Reserve & Pay**.
- Expected: page redirects to the Wix-hosted ticket form (attendee details + card). Completing payment returns to `/thank-you`; abandoning returns to `/`.

- [ ] **Step 4: Verify graceful fallback**

- Temporarily set an invalid `WIX_CLIENT_ID`, reload, open the modal.
- Expected: modal shows "couldn’t load live tickets" with a working **Buy on lexscopefilms** link. Restore the real client id afterward.

- [ ] **Step 5: Verify the Season Pass trigger**

- Click the Season Pass lanyard → modal loads GA Season Pass $99 / VIP Season Pass $500.

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "chore: checkout verified end-to-end"
```

---

## Self-review (completed by author)

- **Spec coverage:** native modal selection (Tasks 8–9) ✓; live ticket pull (Tasks 2, 6) ✓; reservation (Task 3, 7) ✓; redirect to hosted form via `eventsCheckout` (Tasks 4, 7) ✓; branded `/thank-you` (Task 9) ✓; server-side token only (lib is `server-only`, browser hits `/api`) ✓; graceful fallback to outbound link (Task 8 modal error state) ✓; testing (every task) ✓. Out-of-scope items (native attendee/card capture, iframe, login, coupons, seating) are not implemented, per spec.
- **Spike resolution:** the spec's two open items are resolved — `createPaymentRedirect` uses the verified `eventsCheckout` payload (Task 4), and the live call already returned a working `fullUrl`, so the raw `ticket-form` fallback is unnecessary for the happy path (kept as the modal's error-state outbound link instead).
- **Type consistency:** `TicketTier`, `ReservationLineItem`, `CheckoutTarget` are defined in `lib/wix-checkout.ts` and imported everywhere; route/modal field names (`tiers`, `redirectUrl`, `expiresAt`, `lineItems`, `eventSlug`, `eventId`) match across producer and consumer.
- **Placeholder scan:** no TBD/TODO; every code step contains complete code.
