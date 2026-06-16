import type { Metadata } from "next";
import {
  SUBMIT_URL,
  SUBMISSION_ROUNDS,
  SUBMIT_CRITERIA,
  SUBMIT_STEPS,
} from "@/lib/festival";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Hoverable } from "@/components/motion/hoverable";

export const metadata: Metadata = {
  title: "Submit — Scope Screenings",
  description:
    "Open call via FilmFreeway. Twenty minutes or less, any genre. If it's bold and it's yours, send it.",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* (a) Hero with open-call card */}
      <section className="px-5 pt-[120px] md:px-[90px] md:pt-[150px]">
        <div className="md:flex md:items-start md:justify-between md:gap-12">
          <Reveal className="md:max-w-[60%]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-curtain" />
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
                Open call · via FilmFreeway
              </span>
            </div>
            <h1 className="pulp mt-5 font-display text-[64px] uppercase leading-[0.9] md:text-[88px]">
              Submit Your Film
            </h1>
            <p className="mt-5 max-w-[44ch] font-credits text-[20px] leading-relaxed text-fg/75 md:text-[22px]">
              We&rsquo;re built to put underrepresented filmmakers on a big
              screen in front of a packed, loving house. Twenty minutes or less,
              any genre. If it&rsquo;s bold and it&rsquo;s yours, send it.
            </p>
          </Reveal>

          {/* Open-call card */}
          <Reveal as="aside" delay={0.12} className="mt-10 w-full rounded-lg border border-hairline bg-card p-7 md:mt-2 md:w-[340px] md:shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-label">
                Open Call
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                2026 Season
              </span>
            </div>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Regular deadline
            </p>
            <p className="font-display text-[44px] uppercase leading-none text-fg">
              Aug 31
            </p>
            <div className="mt-5 flex gap-8 border-t border-hairline pt-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Entry from
                </p>
                <p className="font-display text-[20px] text-fg">$15</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Runtime
                </p>
                <p className="font-display text-[20px] text-fg">20 min or less</p>
              </div>
            </div>
            <a
              href={SUBMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 bg-curtain px-4 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-curtain-bright"
            >
              Submit on FilmFreeway ›
            </a>
          </Reveal>
        </div>
      </section>

      {/* (b) "What We're After" — 3-up */}
      <section className="mt-16 border-t border-hairline bg-bg px-5 py-24 md:px-[90px]">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
              What we look for
            </span>
          </div>
          <h2 className="pulp mt-5 font-display text-[44px] uppercase leading-[0.95] md:text-[64px]">
            What We&rsquo;re After
          </h2>
          <p className="mt-5 max-w-[60ch] font-credits text-[18px] leading-relaxed text-fg/80 md:text-[19px]">
            Scope Screenings exists to break down the barriers placed in front of
            Black, brown, and tan creatives. We program for access, for craft, and
            for films that make a room of 300 people lean all the way in.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {SUBMIT_CRITERIA.map((c) => (
            <StaggerItem key={c.n}>
              <span className="font-marquee text-[28px] text-curtain">{c.n}</span>
              <h3 className="mt-2 font-display text-[22px] uppercase text-fg">
                {c.title}
              </h3>
              <p className="mt-2 font-credits text-[16px] leading-relaxed text-muted">
                {c.blurb}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* (c) "Mark Your Calendar" — deadlines table */}
      <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
              Deadlines &amp; fees
            </span>
          </div>
          <h2 className="pulp mt-5 font-display text-[44px] uppercase leading-[0.95] md:text-[64px]">
            Mark Your Calendar
          </h2>
        </Reveal>

        {/* Column headers */}
        <div className="mt-10 grid grid-cols-[1fr_2fr_auto] gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Round
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Closes
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted text-right">
            Entry fee
          </span>
        </div>

        {/* Rows */}
        <Stagger>
          {SUBMISSION_ROUNDS.map((r, i) => (
            <StaggerItem
              key={r.name}
              className="grid grid-cols-[1fr_2fr_auto] gap-4 border-t border-hairline py-5"
            >
              <span className="font-body text-[18px] font-bold text-fg">
                {r.name}
              </span>
              <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-muted">
                {r.closes}
              </span>
              <span
                className={`font-display text-[22px] text-right ${i === 0 ? "text-rust" : "text-fg"}`}
              >
                {r.fee}
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Waiver note */}
        <p className="mt-8 flex items-center gap-3 font-credits text-[15px] text-muted">
          <span className="h-3 w-3 shrink-0 bg-rust" />
          Fee waivers are available — just reach out. Cost should never be the
          reason a film doesn&rsquo;t get seen.
        </p>
      </section>

      {/* (d) "Three Steps In" + closing CTA */}
      <section className="border-t border-hairline bg-bg px-5 py-24 md:px-[90px]">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
              How to enter
            </span>
          </div>
          <h2 className="pulp mt-5 font-display text-[44px] uppercase leading-[0.95] md:text-[64px]">
            Three Steps In
          </h2>
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {SUBMIT_STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <span className="font-marquee text-[56px] leading-none text-curtain">
                {s.n}
              </span>
              <h3 className="mt-2 font-display text-[22px] uppercase text-fg">
                {s.title}
              </h3>
              <p className="mt-2 font-credits text-[16px] leading-relaxed text-muted">
                {s.blurb}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Closing CTA band */}
      <Reveal as="section" className="border-t border-hairline bg-bg-deep px-5 py-28 text-center md:px-[90px]">
        <h2 className="pulp font-display text-[48px] uppercase leading-[0.95] md:text-[72px]">
          Got A Film? Send It.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] font-credits text-[18px] text-fg/75">
          Submissions run on FilmFreeway. It takes about ten minutes — and we
          read every single one.
        </p>
        <Hoverable magnetic strength={0.35} className="mt-8 inline-block">
          <a
            href={SUBMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-curtain px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-curtain-bright"
          >
            Submit on FilmFreeway ›
          </a>
        </Hoverable>
      </Reveal>
    </main>
  );
}
