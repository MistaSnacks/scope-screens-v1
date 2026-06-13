// Live schedule from Wix Events (the CMS the client already manages).
// Uses a Wix Headless visitor token (OAuth client ID, no secret) to read
// published events. Falls back to null on any miss so the caller can use the
// static festival.ts data — the site never breaks if Wix is unreachable or
// the season's events haven't been created yet.

const CLIENT_ID = process.env.WIX_CLIENT_ID;

export interface ScheduleRow {
  month: string; // "JUL"
  day: string; // "28"
  title: string;
  long: string; // "Tuesday · July 28, 2026"
  href: string; // event page / reserve URL
  reservable: boolean;
}

interface WixEvent {
  title?: string;
  slug?: string;
  eventPageUrl?: string;
  dateAndTimeSettings?: {
    startDate?: string;
    formatted?: { startDate?: string };
  };
}

async function getVisitorToken(): Promise<string | null> {
  const res = await fetch("https://www.wixapis.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: CLIENT_ID, grantType: "anonymous" }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.access_token ?? null;
}

export async function getLiveSchedule(): Promise<ScheduleRow[] | null> {
  if (!CLIENT_ID) return null;
  try {
    const token = await getVisitorToken();
    if (!token) return null;

    const res = await fetch("https://www.wixapis.com/events/v3/events/query", {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: {
          filter: { status: { $ne: "CANCELED" } },
          paging: { limit: 24 },
          sort: [{ fieldName: "dateAndTimeSettings.startDate", order: "ASC" }],
        },
      }),
      // Refresh hourly; events change rarely.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const { events } = (await res.json()) as { events?: WixEvent[] };
    if (!events?.length) return null;

    const now = Date.now();
    const rows: ScheduleRow[] = [];

    for (const ev of events) {
      const iso = ev.dateAndTimeSettings?.startDate;
      const formatted = ev.dateAndTimeSettings?.formatted?.startDate; // localized, no TZ shift
      if (!iso) continue;
      if (new Date(iso).getTime() < now) continue; // upcoming only

      // Prefer the localized string so the day number matches the venue's time zone.
      const d = new Date(formatted ?? iso);
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = String(d.getDate());
      const weekday = d.toLocaleString("en-US", { weekday: "long" });
      const long = formatted ? `${weekday} · ${formatted}` : d.toLocaleDateString("en-US");

      rows.push({
        month,
        day,
        title:
          (ev.title ?? "").replace(/^\s*scope screenings:?\s*/i, "").trim() ||
          "Scope Screenings",
        long,
        href:
          ev.eventPageUrl ||
          (ev.slug ? `https://www.lexscopefilms.com/event-details/${ev.slug}` : "#"),
        reservable: true,
      });
    }

    return rows.length ? rows.slice(0, 8) : null;
  } catch {
    return null;
  }
}
