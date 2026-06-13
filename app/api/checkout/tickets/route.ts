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
