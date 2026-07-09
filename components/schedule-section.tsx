import Link from "next/link";
import { getScheduleRows } from "@/lib/schedule";
import { SCREENINGS, SEASON_PASS, VENUE } from "@/lib/festival";
import { getSiteContent } from "@/lib/site-content";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { KineticText } from "@/components/motion/kinetic-text";

export async function ScheduleSection({ headless = false }: { headless?: boolean } = {}) {
  // Hybrid: the planned season is the skeleton; any month that already exists
  // as a live Wix event becomes reservable (real event link). Nights not yet
  // created in Wix show as "on sale soon". As the client adds events in Wix,
  // they flip to live automatically.
  const rows = await getScheduleRows();
  // Same CMS singleton the /schedule page hero reads (request-deduped).
  const page = (await getSiteContent()).schedulePage;

  return (
    <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:shell-x">
      <div className="mx-auto max-w-[78.75rem]">
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-20">
        {/* Left: heading + season pass */}
        <Reveal className="flex flex-col items-start gap-6 lg:w-[22.5rem] lg:shrink-0">
          {/* Popcorn logo — centered within the left column */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/popcorn-logo.png"
            alt="Scope Screenings"
            className="mb-2 h-[8.75rem] w-auto self-start lg:self-center"
          />
          {!headless && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-curtain" />
                <span className="font-body text-[0.75rem] font-bold uppercase tracking-[0.28em] text-label">
                  {page?.eyebrow ?? "The Season · 2026-27"}
                </span>
              </div>
              <KineticText
                as="h2"
                className="pulp font-display text-[3.25rem] uppercase leading-[0.92] md:text-[4.25rem]"
                text={page?.title ?? "Seven Nights"}
              />
            </>
          )}
          <p className="max-w-[34ch] font-body text-[1rem] leading-relaxed text-fg/65">
            {page?.lede ??
              `One screening a month, last Tuesday, ${SCREENINGS[0].month} through ${SCREENINGS[SCREENINGS.length - 1].month}. Doors ${VENUE.doors}, program ${VENUE.program}.`}
          </p>
          <Link
            href={`/events/${SEASON_PASS.slug}`}
            className="mt-1 flex h-[3.125rem] items-center rounded-full bg-rust px-7 font-body text-[0.875rem] font-extrabold uppercase tracking-[0.05em] text-ink transition-transform hover:-translate-y-px"
          >
            Season Pass · {SEASON_PASS.gaPrice}
          </Link>
        </Reveal>

        {/* Right: the schedule list */}
        <Stagger as="ul" className="flex flex-1 flex-col">
          {rows.map((s, i) => (
            <StaggerItem
              as="li"
              key={`${s.month}-${s.day}-${i}`}
              className={`flex items-center gap-5 py-5 ${i > 0 ? "border-t border-cream/10" : ""}`}
            >
              <div className="flex w-[5.5rem] shrink-0 flex-col">
                <span className="font-marquee text-[0.9375rem] uppercase tracking-[0.04em] text-rust">
                  {s.month}
                </span>
                <span className="font-display text-[2.125rem] leading-[0.85] text-fg">{s.day}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[1.375rem] uppercase leading-none text-fg">
                  {s.title}
                </span>
                <span className="mt-1 font-body text-[0.75rem] uppercase tracking-[0.12em] text-smoke">
                  {s.long}
                </span>
              </div>
              <div className="w-[7.5rem] shrink-0 text-right">
                {s.reservable ? (
                  s.slug ? (
                    // On-site event page: full rundown + inline checkout.
                    <Link
                      href={`/events/${s.slug}`}
                      className="font-body text-[0.8125rem] font-extrabold uppercase tracking-[0.08em] text-rust hover:text-fg"
                    >
                      Reserve →
                    </Link>
                  ) : (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[0.8125rem] font-extrabold uppercase tracking-[0.08em] text-rust hover:text-fg"
                  >
                    Reserve →
                  </a>
                  )
                ) : (
                  <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-smoke">
                    On sale soon
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        </div>
      </div>
    </section>
  );
}
