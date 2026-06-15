import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FounderBand } from "@/components/founder-band";
import { PartnersMarquee } from "@/components/partners-marquee";
import { ABOUT_STATS, TIMELINE, HOUSES } from "@/lib/festival";

export const metadata: Metadata = {
  title: "About — Scope Screenings",
  description:
    "Seattle's underground film festival — a live, monthly short-film night built for the filmmakers the industry tends to overlook.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* (a) Header */}
      <PageHeader
        eyebrow="About the Festival"
        title={
          <>
            We Put The Fun
            <br />
            Back In Film Fests
          </>
        }
        lede="Scope Screenings is Seattle's underground film festival — a live, monthly short-film night built for the filmmakers the industry tends to overlook. Tropical, wavy energy meets the illest shorts in the PNW."
      />

      {/* (b) What Is Scope Screenings */}
      <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px] mt-24">
        <div className="md:flex md:gap-16">
          {/* Left column */}
          <div className="md:w-[360px] md:shrink-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-curtain" />
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
                The short version
              </span>
            </div>
            <h2 className="pulp font-display text-[44px] uppercase leading-[0.95] md:text-[56px] mt-5">
              What Is Scope Screenings
            </h2>
          </div>

          {/* Right column */}
          <div className="max-w-[60ch] space-y-6 font-credits text-[18px] leading-relaxed text-fg/85 md:text-[19px]">
            <p>
              Founded in June 2022, Scope Screenings is a live short-film festival that runs the
              last Tuesday of every month, June through December, at the Langston Hughes Performing
              Arts Institute in Seattle&rsquo;s Central District. Each night puts ten directors and
              ten films — shorts, music videos, docs, animation, experiments, all twenty minutes or
              less — on a big screen in front of a packed house of around 300 people.
            </p>
            <p>
              But it was never just a screening. Scope was built to uplift Black, brown, tan, and
              underrepresented creators — to give them access, collaboration, and a room that shows
              up. Doors at 6:30, lights down at 7:30, and a filmmaker Q&amp;A and mixer to close the
              night.
            </p>
          </div>
        </div>

        {/* 4-up stat row */}
        <div className="mt-16 flex flex-wrap gap-x-12 gap-y-8">
          {ABOUT_STATS.map((s) => (
            <div key={s.l}>
              <span className="font-marquee text-[40px] leading-none text-rust md:text-[48px]">
                {s.n}
              </span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* (c) Founder — red band */}
      <FounderBand eyebrow="Meet the Founder" />

      {/* (d) Partners */}
      <PartnersMarquee />

      {/* (e) How We Got Here — Timeline */}
      <section className="border-t border-hairline bg-bg px-5 py-24 md:px-[90px]">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-curtain" />
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
            The story
          </span>
        </div>
        <h2 className="pulp font-display text-[44px] uppercase leading-[0.95] md:text-[64px] mt-5 mb-12">
          How We Got Here
        </h2>
        {TIMELINE.map((t) => (
          <div
            key={t.year}
            className="flex flex-col gap-2 border-t border-hairline py-8 md:flex-row md:gap-10"
          >
            <span className="font-marquee text-[40px] leading-none text-rust md:w-[200px] md:shrink-0 md:text-[52px]">
              {t.year}
            </span>
            <div className="max-w-[60ch]">
              <h3 className="font-body text-[20px] font-extrabold text-fg">{t.title}</h3>
              <p className="mt-2 font-credits text-[17px] leading-relaxed text-muted md:text-[18px]">
                {t.blurb}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* (f) The Houses */}
      <section className="border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-curtain" />
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-label">
            The houses
          </span>
        </div>
        <h2 className="pulp font-display text-[44px] uppercase leading-[0.95] md:text-[64px] mt-5 text-center">
          The Houses
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HOUSES.map((h) => (
            <div key={h.name} className="rounded-lg border border-hairline bg-card p-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-label">
                {h.eyebrow}
              </span>
              <h3 className="mt-3 font-display text-[24px] uppercase leading-tight text-fg">
                {h.name}
              </h3>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
                {h.address}
              </p>
              <p className="mt-3 font-credits text-[16px] leading-relaxed text-muted">
                {h.blurb}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
