import type { Metadata } from "next";
import { SUPPORT_STATS, GIVING_LEVELS, DONATE_URL } from "@/lib/festival";
import { PartnersMarquee } from "@/components/partners-marquee";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Hoverable } from "@/components/motion/hoverable";
import { KineticText } from "@/components/motion/kinetic-text";

export const metadata: Metadata = {
  title: "Support — Scope Screenings",
  description:
    "Three hundred seats, ten directors, every last Tuesday — none of it is free. Keep the screen lit.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* (a) Hero + give card */}
      <section className="px-5 pt-[7.5rem] md:shell-x md:pt-[9.375rem]">
        <div className="md:flex md:items-start md:justify-between md:gap-12">
          <Reveal className="md:max-w-[60%]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-curtain" />
              <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
                Funders &amp; philanthropy
              </span>
            </div>
            <KineticText
              as="h1"
              className="pulp mt-5 font-display text-[4rem] uppercase leading-[0.9] md:text-[5.5rem]"
              text="Keep It Running"
            />
            <p className="mt-5 max-w-[46ch] font-credits text-[1.25rem] leading-relaxed text-fg/75 md:text-[1.375rem]">
              Three hundred seats, ten directors, every last Tuesday — none of
              it is free. Your support keeps the screen lit, the venue booked,
              and the doors open to filmmakers who&rsquo;d never get this shot
              otherwise.
            </p>
          </Reveal>

          <Reveal as="aside" delay={0.12} className="mt-10 w-full rounded-lg border border-hairline bg-card p-7 md:mt-2 md:w-[21.25rem] md:shrink-0">
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.2em] text-label">
              Give Today
            </span>
            <p className="mt-4 font-credits text-[1rem] leading-relaxed text-muted">
              Every dollar goes straight to access — venue, gear, and filmmaker
              stipends.
            </p>
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 bg-rust px-4 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-90"
            >
              Donate Now ›
            </a>
            <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              Tax-deductible via Shunpike 501(c)(3)
            </p>
          </Reveal>
        </div>
      </section>

      {/* (b) "Where It Goes" — stats */}
      <section className="mt-16 border-t border-hairline bg-bg px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              Why give
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="Where It Goes"
          />
          <p className="mt-5 max-w-[60ch] font-credits text-[1.125rem] leading-relaxed text-fg/80 md:text-[1.1875rem]">
            We were built to break down the barriers placed in front of Black,
            brown, and tan creatives. Funding is how that promise stays real — no
            filmmaker turned away over cost, ever.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {SUPPORT_STATS.map((s) => (
            <StaggerItem key={s.l}>
              <span className="font-marquee text-[2.75rem] leading-none text-rust md:text-[3.25rem]">
                {s.n}
              </span>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                {s.l}
              </p>
              <p className="mt-3 font-credits text-[1rem] leading-relaxed text-muted">
                {s.blurb}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* (c) "Pick Your Level" — 4 tiers */}
      <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              Giving levels
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="Pick Your Level"
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-4">
          {GIVING_LEVELS.map((g) => (
            <StaggerItem
              key={g.name}
              className={`flex h-full flex-col rounded-lg border bg-card p-6 ${
                g.featured ? "border-rust ring-1 ring-rust" : "border-hairline"
              }`}
            >
              <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-label">
                {g.name}
              </span>
              <p className="mt-3 font-display text-[2.125rem] leading-none text-fg">
                {g.amount}
                <span className="font-body text-[0.8125rem] font-normal text-muted">
                  {" "}
                  / {g.cadence}
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {g.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex gap-2 font-credits text-[0.875rem] leading-snug text-muted"
                  >
                    <span className="text-curtain">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-curtain hover:text-rust"
              >
                Give ›
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* (d) 501(c)(3) note */}
      <section className="bg-bg-alt px-5 pb-24 md:shell-x">
        <Reveal className="flex flex-col gap-4 rounded-lg bg-card p-7 md:flex-row md:items-center md:gap-8">
          <span className="font-marquee text-[1.75rem] leading-none text-rust md:shrink-0">
            501(C)(3)
          </span>
          <p className="font-credits text-[1rem] leading-relaxed text-muted">
            Scope Screenings is a fiscally sponsored project of Shunpike, a
            registered 501(c)(3) nonprofit. Every contribution is
            tax-deductible to the fullest extent of the law, and your receipt
            comes straight from Shunpike.
          </p>
        </Reveal>
      </section>

      {/* (e) "Two Ways To Back Us" */}
      <section className="border-t border-hairline bg-bg px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              Partner with us
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="Two Ways To Back Us"
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Card 1 — Funders */}
          <StaggerItem>
            <Hoverable className="h-full rounded-lg border border-hairline bg-card p-8">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-label">
              Funders &amp; foundations
            </span>
            <h3 className="mt-3 font-display text-[1.625rem] uppercase text-fg">
              Fund the Mission
            </h3>
            <p className="mt-3 font-credits text-[1rem] leading-relaxed text-muted">
              Grants and major gifts that power access and equity work. We keep
              funder support proudly distinct from commercial sponsorship — your
              name sits with the mission, not the marketing.
            </p>
            <a
              href="mailto:hello@scopescreenings.com"
              className="mt-5 inline-block font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-curtain hover:text-rust"
            >
              Talk to us ›
            </a>
            </Hoverable>
          </StaggerItem>

          {/* Card 2 — Sponsors */}
          <StaggerItem>
            <Hoverable className="h-full rounded-lg border border-hairline bg-card p-8">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-label">
              Brands &amp; sponsors
            </span>
            <h3 className="mt-3 font-display text-[1.625rem] uppercase text-fg">
              Put Your Brand On It
            </h3>
            <p className="mt-3 font-credits text-[1rem] leading-relaxed text-muted">
              Title, Major, and Supporting tiers with on-screen billing, on-site
              presence, and a packed, creative-led PNW audience. We&rsquo;ll
              build a package that actually fits your brand.
            </p>
            <a
              href="mailto:hello@scopescreenings.com"
              className="mt-5 inline-block font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-curtain hover:text-rust"
            >
              Get the deck ›
            </a>
            </Hoverable>
          </StaggerItem>
        </Stagger>
      </section>

      {/* (f) Partners + closing CTA */}
      <section className="border-t border-hairline bg-bg px-5 py-24 md:shell-x">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-curtain" />
          <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
            Our funders &amp; partners
          </span>
          <span className="h-px w-10 bg-curtain" />
        </div>
        <PartnersMarquee />
      </section>

      {/* Closing band */}
      <Reveal as="section" className="border-t border-hairline bg-bg-deep px-5 py-28 text-center md:shell-x">
        <KineticText
          as="h2"
          className="pulp font-display text-[3rem] uppercase leading-[0.95] md:text-[4.5rem]"
          text="Keep The Screen Lit"
        />
        <p className="mx-auto mt-5 max-w-[48ch] font-credits text-[1.125rem] text-fg/75">
          Any amount keeps a filmmaker&rsquo;s work on a big screen in front of
          a full house. Give once, give monthly, or back the whole season.
        </p>
        <Hoverable magnetic strength={0.35} className="mt-8 inline-block">
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-rust px-7 py-4 font-mono text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-90"
          >
            Donate Now ›
          </a>
        </Hoverable>
      </Reveal>
    </main>
  );
}
