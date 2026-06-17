import { nextScreening, VENUE } from "@/lib/festival";
import { getLiveSchedule } from "@/lib/wix-events";
import { getSiteContent } from "@/lib/site-content";
import { buildMarqueeItems } from "@/lib/marquee";

export async function Marquee() {
  const [content, live] = await Promise.all([getSiteContent(), getLiveSchedule()]);

  // Live "now showing" line: prefer the next real Wix event, else festival.ts.
  const venue = content.siteSettings?.venueName ?? VENUE.short;
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
            <span className="font-marquee text-[1.25rem] uppercase tracking-[0.03em] text-brass">
              {item}
            </span>
            <span className="text-rust" aria-hidden>★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
