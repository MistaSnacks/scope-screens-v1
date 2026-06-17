import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { KineticText } from "@/components/motion/kinetic-text";
import { getSiteContent } from "@/lib/site-content";

const SUPPORT_URL = "https://shunpike.org/artist/scope-screenings/";
const PRESS_EMAIL = "press@scopescreenings.com";

const TIERS = [
  { label: "Friend $50", gold: false },
  { label: "Patron $250", gold: false },
  { label: "Producer $1,000", gold: false },
  { label: "Title Partner", gold: true },
];

const PRESS_ROWS = [
  { label: "Press kit", format: ".ZIP" },
  { label: "Fact sheet & founder bio", format: "PDF" },
  { label: "Photo & b-roll library", format: "DRIVE" },
];

export async function SupportPress() {
  const content = await getSiteContent();
  const support = content.support;

  const tiers = content.givingTiers?.length
    ? content.givingTiers.map((t) => ({ label: t.label ?? "", gold: !!t.featured }))
    : TIERS;

  const pressRows = content.pressKit?.length
    ? content.pressKit.map((r) => ({ label: r.label ?? "", format: r.format ?? "", url: r.url ?? "" }))
    : PRESS_ROWS.map((r) => ({ ...r, url: "" }));

  const donateHref = support?.donateUrl ?? SUPPORT_URL;
  const pressEmail = support?.pressEmail ?? PRESS_EMAIL;

  return (
    <section className="border-t border-hairline px-5 py-24 md:shell-x">
      <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-curtain" />
          <span className="font-body text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
            {support?.eyebrow ?? "Chapter Four"}
          </span>
          <span className="h-px w-10 bg-curtain" />
        </div>
        <KineticText
          as="h2"
          className="pulp font-display text-[3.5rem] uppercase leading-[0.94] md:text-[5rem]"
          text={support?.title ?? "Keep It Running"}
        />
      </Reveal>

      <Stagger className="mx-auto grid max-w-[78.75rem] gap-7 md:grid-cols-2">
        {/* Funders */}
        <StaggerItem className="flex flex-col rounded-xl border border-hairline bg-card p-8 shadow-[0_20px_45px_rgba(11,10,9,0.07)] md:p-10">
          <span className="font-body text-[0.75rem] font-bold uppercase tracking-[0.2em] text-curtain">Funders &amp; Philanthropy</span>
          <h3 className="mt-3 font-display text-[2.5rem] uppercase leading-none text-fg">
            {support?.funderTitle ?? "Become a Funder"}
          </h3>
          <p className="mt-4 font-body text-[0.9375rem] leading-relaxed text-fg/70">
            {support?.funderBody ??
              "A fiscally sponsored project of Shunpike, a 501(c)(3). Every dollar puts another underrepresented filmmaker on a big screen."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {tiers.map((t, i) => (
              <span
                key={`${i}-${t.label}`}
                className={`rounded-full px-4 py-2 font-body text-[0.8125rem] font-semibold ${
                  t.gold ? "bg-rust text-ink" : "border border-hairline text-fg/85"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
          <a
            href={donateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 flex items-center justify-center rounded-lg bg-rust py-4 font-body text-[0.9375rem] font-extrabold uppercase tracking-[0.06em] text-ink transition-transform hover:scale-[1.02]"
          >
            {support?.donateLabel ?? "Support the Festival ›"}
          </a>
          <span className="mt-5 font-body text-[0.8125rem] text-muted">
            In partnership with Shunpike · Converge Media · SIFF · FilmFreeway
          </span>
        </StaggerItem>

        {/* Press */}
        <StaggerItem className="flex flex-col rounded-xl border border-hairline bg-card p-8 shadow-[0_20px_45px_rgba(11,10,9,0.07)] md:p-10">
          <span className="font-body text-[0.75rem] font-bold uppercase tracking-[0.2em] text-label">Media &amp; Press</span>
          <h3 className="mt-3 font-display text-[2.5rem] uppercase leading-none text-fg">
            {support?.pressTitle ?? "Press & Media"}
          </h3>
          <p className="mt-4 font-body text-[0.9375rem] leading-relaxed text-fg/70">
            {support?.pressBody ??
              "Logos, fact sheet, founder bio, photography and b-roll. Everything you need to cover the festival."}
          </p>
          <div className="mt-6 flex flex-col">
            {pressRows.map((r, i) => (
              <div key={`${i}-${r.label}`} className="flex items-center justify-between border-b border-hairline py-3">
                <span className="font-body text-[0.9375rem] font-bold text-fg">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      {r.label}
                    </a>
                  ) : (
                    r.label
                  )}
                </span>
                <span className="font-mono text-[0.75rem] tracking-[0.14em] text-muted">{r.format}</span>
              </div>
            ))}
          </div>
          <a
            href={`mailto:${pressEmail}?subject=Scope%20Screenings%20Press%20Kit`}
            className="mt-7 flex items-center justify-center rounded-lg border border-rust py-4 font-body text-[0.9375rem] font-extrabold uppercase tracking-[0.06em] text-rust transition-colors hover:bg-rust hover:text-ink"
          >
            {support?.pressKitLabel ?? "Download Press Kit ›"}
          </a>
          <span className="mt-5 font-body text-[0.8125rem] text-muted">Media contact · {pressEmail}</span>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
