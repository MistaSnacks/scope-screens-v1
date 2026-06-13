// Server-only Wix Events checkout boundary.
// Mints an anonymous visitor token and talks to the Events ticketing +
// Headless Redirects APIs. Every function returns null on any miss so callers
// can degrade gracefully (e.g. fall back to the outbound Wix link).
import "server-only";

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
  const clientId = process.env.WIX_CLIENT_ID;
  if (!clientId) return null;
  try {
    const res = await fetch(`${API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, grantType: "anonymous" }),
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
      const amount = Number(d.price?.amount ?? "0") || 0; // guard against NaN from a bad price string
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
