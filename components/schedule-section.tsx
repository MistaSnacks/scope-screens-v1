import { getLiveSchedule, type ScheduleRow } from "@/lib/wix-events";
import { SCREENINGS, SEASON_PASS, VENUE, reserveUrl, ticketUrl } from "@/lib/festival";

export async function ScheduleSection({ headless = false }: { headless?: boolean } = {}) {
  // Hybrid: the planned season is the skeleton; any month that already exists
  // as a live Wix event becomes reservable (real event link). Nights not yet
  // created in Wix show as "on sale soon". As the client adds events in Wix,
  // they flip to live automatically.
  const live = (await getLiveSchedule()) ?? [];
  const liveByMonth = new Map(live.map((r) => [r.month, r]));

  const rows: ScheduleRow[] = SCREENINGS.map(
    (s) =>
      liveByMonth.get(s.month) ?? {
        month: s.month,
        day: s.day,
        title: s.title,
        long: s.long,
        href: reserveUrl(s),
        reservable: s.status === "open",
      }
  );
  // Include any live events that fall outside the planned skeleton.
  for (const r of live) {
    if (!SCREENINGS.some((s) => s.month === r.month)) rows.push(r);
  }

  return (
    <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]">
      <div className="mx-auto max-w-[1260px]">
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-20">
        {/* Left: heading + season pass */}
        <div className="flex flex-col items-start gap-6 lg:w-[360px] lg:shrink-0">
          {/* Popcorn logo — centered within the left column */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/popcorn-logo.png"
            alt="Scope Screenings"
            className="mb-2 h-[140px] w-auto self-start lg:self-center"
          />
          {!headless && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-curtain" />
                <span className="font-body text-[12px] font-bold uppercase tracking-[0.28em] text-label">
                  The Season · 2026—27
                </span>
              </div>
              <h2 className="pulp font-display text-[52px] uppercase leading-[0.92] md:text-[68px]">
                Seven Nights
              </h2>
            </>
          )}
          <p className="max-w-[34ch] font-body text-[16px] leading-relaxed text-fg/65">
            One screening a month, last Tuesday, {SCREENINGS[0].month} through{" "}
            {SCREENINGS[SCREENINGS.length - 1].month}. Doors {VENUE.doors}, program {VENUE.program}.
          </p>
          <a
            href={ticketUrl(SEASON_PASS.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex h-[50px] items-center rounded-full bg-rust px-7 font-body text-[14px] font-extrabold uppercase tracking-[0.05em] text-ink transition-transform hover:-translate-y-px"
          >
            Season Pass · {SEASON_PASS.gaPrice}
          </a>
        </div>

        {/* Right: the schedule list */}
        <ul className="flex flex-1 flex-col">
          {rows.map((s, i) => (
            <li
              key={`${s.month}-${s.day}-${i}`}
              className={`flex items-center gap-5 py-5 ${i > 0 ? "border-t border-cream/10" : ""}`}
            >
              <div className="flex w-[88px] shrink-0 flex-col">
                <span className="font-marquee text-[15px] uppercase tracking-[0.04em] text-rust">
                  {s.month}
                </span>
                <span className="font-display text-[34px] leading-[0.85] text-fg">{s.day}</span>
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-display text-[22px] uppercase leading-none text-fg">
                  {s.title}
                </span>
                <span className="mt-1 font-body text-[12px] uppercase tracking-[0.12em] text-smoke">
                  {s.long}
                </span>
              </div>
              <div className="w-[120px] shrink-0 text-right">
                {s.reservable ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[13px] font-extrabold uppercase tracking-[0.08em] text-rust hover:text-fg"
                  >
                    Reserve →
                  </a>
                ) : (
                  <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-smoke">
                    On sale soon
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
