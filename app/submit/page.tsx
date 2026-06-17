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
import { KineticText } from "@/components/motion/kinetic-text";

export const metadata: Metadata = {
  title: "Submit — Scope Screenings",
  description:
    "Open call via FilmFreeway. Twenty minutes or less, any genre. If it's bold and it's yours, send it.",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* (a) Hero with open-call card */}
      <section className="px-5 pt-[7.5rem] md:shell-x md:pt-[9.375rem]">
        <div className="md:flex md:items-start md:justify-between md:gap-12">
          <Reveal className="md:max-w-[60%]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-curtain" />
              <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
                Open call · via FilmFreeway
              </span>
            </div>
            <KineticText
              as="h1"
              className="pulp mt-5 font-display text-[4rem] uppercase leading-[0.9] md:text-[5.5rem]"
              text="Submit Your Film"
            />
            <p className="mt-5 max-w-[44ch] font-credits text-[1.25rem] leading-relaxed text-fg/75 md:text-[1.375rem]">
              We&rsquo;re built to put underrepresented filmmakers on a big
              screen in front of a packed, loving house. Twenty minutes or less,
              any genre. If it&rsquo;s bold and it&rsquo;s yours, send it.
            </p>
          </Reveal>

          {/* Open-call card */}
          <Reveal as="aside" delay={0.12} className="mt-10 w-full rounded-lg border border-hairline bg-card p-7 md:mt-2 md:w-[21.25rem] md:shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.2em] text-label">
                Open Call
              </span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
                2026 Season
              </span>
            </div>
            <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
              Regular deadline
            </p>
            <p className="font-display text-[2.75rem] uppercase leading-none text-fg">
              Aug 31
            </p>
            <div className="mt-5 flex gap-8 border-t border-hairline pt-4">
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  Entry from
                </p>
                <p className="font-display text-[1.25rem] text-fg">$15</p>
              </div>
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  Runtime
                </p>
                <p className="font-display text-[1.25rem] text-fg">20 min or less</p>
              </div>
            </div>
            <a
              href={SUBMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 bg-curtain px-4 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-curtain-bright"
            >
              Submit on FilmFreeway ›
            </a>
          </Reveal>
        </div>
      </section>

      {/* (b) "What We're After" — 3-up */}
      <section className="mt-16 border-t border-hairline bg-bg px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              What we look for
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="What We’re After"
          />
          <p className="mt-5 max-w-[60ch] font-credits text-[1.125rem] leading-relaxed text-fg/80 md:text-[1.1875rem]">
            Scope Screenings exists to break down the barriers placed in front of
            Black, brown, and tan creatives. We program for access, for craft, and
            for films that make a room of 300 people lean all the way in.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {SUBMIT_CRITERIA.map((c) => (
            <StaggerItem key={c.n}>
              <span className="font-marquee text-[1.75rem] text-curtain">{c.n}</span>
              <h3 className="mt-2 font-display text-[1.375rem] uppercase text-fg">
                {c.title}
              </h3>
              <p className="mt-2 font-credits text-[1rem] leading-relaxed text-muted">
                {c.blurb}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* (c) "Mark Your Calendar" — deadlines table */}
      <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              Deadlines &amp; fees
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="Mark Your Calendar"
          />
        </Reveal>

        {/* Column headers */}
        <div className="mt-10 grid grid-cols-[1fr_2fr_auto] gap-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            Round
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            Closes
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted text-right">
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
              <span className="font-body text-[1.125rem] font-bold text-fg">
                {r.name}
              </span>
              <span className="font-mono text-[0.8125rem] uppercase tracking-[0.08em] text-muted">
                {r.closes}
              </span>
              <span
                className={`font-display text-[1.375rem] text-right ${i === 0 ? "text-rust" : "text-fg"}`}
              >
                {r.fee}
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Waiver note */}
        <p className="mt-8 flex items-center gap-3 font-credits text-[0.9375rem] text-muted">
          <span className="h-3 w-3 shrink-0 bg-rust" />
          Fee waivers are available — just reach out. Cost should never be the
          reason a film doesn&rsquo;t get seen.
        </p>
      </section>

      {/* (d) "Three Steps In" + closing CTA */}
      <section className="border-t border-hairline bg-bg px-5 py-24 md:shell-x">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              How to enter
            </span>
          </div>
          <KineticText
            as="h2"
            className="pulp mt-5 font-display text-[2.75rem] uppercase leading-[0.95] md:text-[4rem]"
            text="Three Steps In"
          />
        </Reveal>
        <Stagger className="mt-14 grid gap-10 md:grid-cols-3">
          {SUBMIT_STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <span className="font-marquee text-[3.5rem] leading-none text-curtain">
                {s.n}
              </span>
              <h3 className="mt-2 font-display text-[1.375rem] uppercase text-fg">
                {s.title}
              </h3>
              <p className="mt-2 font-credits text-[1rem] leading-relaxed text-muted">
                {s.blurb}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Closing CTA band */}
      <Reveal as="section" className="border-t border-hairline bg-bg-deep px-5 py-28 text-center md:shell-x">
        <KineticText
          as="h2"
          className="pulp font-display text-[3rem] uppercase leading-[0.95] md:text-[4.5rem]"
          text="Got A Film? Send It."
        />
        <p className="mx-auto mt-5 max-w-[48ch] font-credits text-[1.125rem] text-fg/75">
          Submissions run on FilmFreeway. It takes about ten minutes — and we
          read every single one.
        </p>
        <Hoverable magnetic strength={0.35} className="mt-8 inline-block">
          <a
            href={SUBMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-curtain px-7 py-4 font-mono text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-curtain-bright"
          >
            Submit on FilmFreeway ›
          </a>
        </Hoverable>
      </Reveal>
    </main>
  );
}
