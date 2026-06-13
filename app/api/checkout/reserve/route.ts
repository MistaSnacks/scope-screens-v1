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
