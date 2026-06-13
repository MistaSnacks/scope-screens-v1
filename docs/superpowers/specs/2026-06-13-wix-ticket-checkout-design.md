# Design: Native Ticket Checkout — Scope Screenings

**Date:** 2026-06-13
**Project:** `scope-screenings` (Next.js 16 headless site, `/Users/admin/SS`)
**Status:** Approved decisions, pending spec review → implementation plan

## Goal

Bring ticket buying in-house. Today every "Buy Tickets" CTA is an outbound `<a>`
to a Wix-hosted event page (`reserveUrl`/`ticketUrl` in `lib/festival.ts`, used by
`components/buy-tickets.tsx`). Replace those with a native, on-brand checkout: the
buyer selects tickets and reviews their order inside a modal on the existing
one-page site, then hands off to Wix's hosted form only for the final
attendee-details + card step, returning to a branded confirmation page.

## Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Payment model | Native selection + Wix-hosted payment | Wix has **no embeddable card-capture widget** for headless. Hosted form keeps PCI/tax/Apple-Pay on Wix. |
| What's sold | Whatever Wix has configured (pull live) | Live prices differ from hardcoded `festival.ts` ($18/$22/$99/$500 vs $22/$85/$109/$550.50). Single source of truth = Wix. |
| Checkout surface | Modal/overlay on the one-pager | Fits the theatrical single-page design; selection feels seamless. |
| Attendee details | Collected on the Wix hosted form (v1) | Verified online-payment path. Native attendee collection deferred. |
| Hosted handoff | Full-page redirect → branded `/thank-you` | Most reliable. Iframe-in-modal risks JS framebust + cross-origin Cashier/cookie failure. |

## Architecture

A self-contained **checkout module** added to the existing site. All Wix API
calls run **server-side** (route handlers under `app/api/checkout/`) so the
anonymous visitor token is minted on the server and never reaches the browser.
The browser talks only to our own API. The marketing site gains exactly one new
page: `/thank-you` (the redirect return target).

## Data flow (verified against live Wix 2026-06-13)

```
[modal opens for an event]
  1. POST /events/v1/checkout/available-tickets/query   → live tiers, prices, limitPerCheckout
     (scope SCOPE.EVENTS.EVENTS-CHECKOUT — already granted to the OAuth app)
[buyer picks tiers/quantities → Review]
  2. POST /events/v1/ticket-reservations                → holds seats (status PENDING, ~5–30 min)
[buyer clicks "Reserve & Pay"]
  3. Create Redirect Session (Events checkout flow, reservationId, return domain)
        → redirect whole page to Wix hosted form (attendee details + Cashier card)
  4. Wix returns buyer to  /thank-you                   → branded confirmation
```

### Verified endpoints
- Anonymous token: `POST https://www.wixapis.com/oauth2/token` `{clientId, grantType:"anonymous"}` (reuse the pattern in `lib/wix-events.ts`).
- Available tickets: `POST /events/v1/checkout/available-tickets/query` body `{offset,limit,filter:{eventId}}` → `{metaData, definitions[]}`. **Confirmed 200 with visitor token.**
- Create reservation: `POST /events/v1/ticket-reservations` (scope `SCOPE.EVENTS.EVENTS-CHECKOUT`). Returns `ticketReservation.id` + `expirationDate`.
- `eventPageUrl` (for slug/return building) comes from `GET/query` events v3: `{base, path}`.

## Components / modules

Each unit has one purpose and a defined interface.

- **`lib/wix-checkout.ts`** (server-only) — the Wix boundary.
  - `getVisitorToken(): Promise<string|null>` — token mint (reuse `wix-events.ts` pattern; cache per request).
  - `queryAvailableTickets(eventId): Promise<TicketTierLive[]|null>` — normalizes Wix `definitions[]` to a small typed shape (`id, name, priceAmount, currency, limitPerCheckout, free`).
  - `createReservation(eventId, lineItems): Promise<{reservationId, expiresAt}|null>` — `lineItems` = `[{ticketDefinitionId, quantity}]`.
  - `createPaymentRedirect(reservationId, eventSlug): Promise<{url}|null>` — Create Redirect Session for the Events-checkout flow with our `/thank-you` return.
  - All functions return `null` on any miss (never throw to the route) so callers can fall back.

- **`app/api/checkout/tickets/route.ts`** — `GET ?eventId=` → available tiers.
- **`app/api/checkout/reserve/route.ts`** — `POST {eventId, lineItems}` → `{reservationId, redirectUrl, expiresAt}`. (Reserves, then builds the redirect in one round-trip.)

- **`components/checkout/checkout-modal.tsx`** — overlay shell, theatrical styling consistent with `buy-tickets.tsx` (cream/curtain/ink palette, ticket motifs). Steps: **Select → Review → Redirecting…**. Closes on backdrop/Esc.
- **`components/checkout/ticket-picker.tsx`** — per-tier quantity steppers, enforces `limitPerCheckout`, hides $0 "Donate" tier behind an optional toggle, running subtotal.
- **`components/checkout/checkout-context.tsx`** — tiny client context: `openCheckout(eventId, eventSlug)`. Lets any CTA trigger the modal.

- **`app/thank-you/page.tsx`** — branded confirmation return page (reads order/redirect params Wix appends; shows a graceful generic confirmation if params are absent).

### Trigger wiring
`NightTicket`, `SeasonPassLanyard` (in `buy-tickets.tsx`) and the `TICKET_TIERS`
CTAs change from outbound `<a href>` to buttons calling `openCheckout(...)`. The
event each maps to is resolved from live Wix events (Opening Night → its eventId;
Season Pass → the Season-5 pass eventId), replacing the static slug links.

## Live Wix reference (captured 2026-06-13, sandbox/live read)

- Opening Night `592ffa40-a82e-4e5e-adda-1319056a4a15` (`scope-screenings-opening-night`):
  Donate $0 · Early Bird GA $18 · General Admission $22.
- Season Pass — Season 5 `5357811e-a01b-4515-9897-2b109d5d48e8`:
  GA Season Pass $99 · VIP Season Pass $500.
- Site base: `https://www.lexscopefilms.com`.

## Error handling

- **Availability load fails** → modal falls back to the existing outbound link to
  the Wix event page. The site never loses its "buy" path.
- **Reservation fails / sold out** → friendly message + retry; surfaces Wix's
  reason when present.
- **Reservation expiry** → modal shows a countdown from `expiresAt`; on expiry the
  buyer re-reserves with one click.
- Route handlers return typed `{error}` JSON; the client never sees the visitor token.

## Testing

- **Unit:** `lib/wix-checkout.ts` normalization against recorded real Wix responses (captured today).
- **Integration:** route handlers against the live Opening-Night + Season-Pass event IDs (confirmed working).
- **Manual:** full reserve → redirect → `/thank-you` loop against the real hosted form, incl. expiry and the availability-fallback path.

## Open items — Phase 0 spikes (resolve during planning, not blockers)

1. **Create Redirect Session payload for the Events-checkout flow.** The exact
   request shape (likely an `eventsCheckout`-style key carrying `eventId` +
   `reservationId` + slug) isn't fully spelled out in docs. Spike: confirm the
   payload and that it returns the buyer to our `/thank-you`. The OAuth app's
   **allowed redirect domain** must include our site domain.
2. **Fallback redirect:** if Create Redirect Session can't return to our domain,
   fall back to the raw hosted `…/event-details/{slug}/ticket-form?reservationId=…`
   URL (verified to exist), accepting that it lands on Wix's own confirmation.

## Out of scope (YAGNI for v1)

- Native attendee-details collection and native card capture.
- Iframe-in-modal hosted form.
- Member login / saved orders (anonymous guest checkout only).
- Coupons/discounts UI (hosted form already supports codes).
- Seating-map selection.
