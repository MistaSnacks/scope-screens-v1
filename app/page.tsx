import { BuyTickets } from "@/components/buy-tickets";
import { WhatIs } from "@/components/what-is";
import { ScrollControl } from "@/components/scroll-control";
import { CurtainCreditsHero } from "@/components/curtain-credits-hero";
import { SiteNav } from "@/components/site-nav";
import { PersistentValance } from "@/components/persistent-valance";
import { Marquee } from "@/components/marquee";
import { Filmstrip } from "@/components/filmstrip";
import { Submissions } from "@/components/submissions";
import { PartnersMarquee } from "@/components/partners-marquee";
import { ScheduleSection } from "@/components/schedule-section";
import { SupportPress } from "@/components/support-press";
import { SiteFooter } from "@/components/site-footer";
import { FOUNDER } from "@/lib/festival";

const FOUNDER_QUOTE =
  "A lot of my peers never had the chance to see their work on a big screen. I built this for access, for collaboration, and to break down the barriers placed in front of Black, brown, and tan creatives.";

function ChapterLabel({ n, center = false }: { n: string; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-10 bg-curtain" />
      <span className="font-body text-[12px] font-bold uppercase tracking-[0.3em] text-label">{n}</span>
      {center ? <span className="h-px w-10 bg-curtain" /> : null}
    </div>
  );
}

// Vertical sprocket rail — the founder portrait stands as an upright 35mm cell,
// echoing the Program filmstrip's perforations (same unexposed-leader colour).
function FilmRail() {
  return (
    <div aria-hidden className="flex w-[26px] shrink-0 flex-col items-center justify-evenly bg-ink py-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-[22px] w-3 shrink-0 rounded-[2px] bg-[#e7e0cf]" />
      ))}
    </div>
  );
}

export default function Home() {
  const stat = [
    { n: "200+", l: "Films" },
    { n: "150+", l: "Filmmakers" },
    { n: "20+", l: "Screenings" },
    { n: "6+", l: "Theaters" },
  ];

  return (
    <main id="top" className="relative bg-bg">
      {/* Persistent top chrome — the velvet valance + nav ride the whole page
          together, outside the pinned hero. Valance z-50, nav z-60 on top. */}
      <PersistentValance />
      <SiteNav active="Watch" />
      <ScrollControl />
      <CurtainCreditsHero />
      <Marquee />

      <div id="tickets" className="scroll-mt-[120px]">
        <BuyTickets />
      </div>

      <div id="about" className="scroll-mt-[120px]">
        <WhatIs />
      </div>

      {/* Chapter Two — The Program */}
      <section
        id="films"
        className="scroll-mt-[120px] border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel n="Chapter Two" center />
          <h2 className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]">The Program</h2>
          <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-fg/70">
            Shorts, music videos, docs, animation, experiments. Every film twenty minutes or
            less, every filmmaker in the room.
          </p>
        </div>

        <Filmstrip />

        <div className="mt-14 flex justify-center">
          <a
            href="/schedule"
            className="flex items-center gap-2 border-b-2 border-rust pb-1.5 font-body text-[13px] font-extrabold uppercase tracking-[0.14em] text-fg transition-colors hover:text-rust"
          >
            Browse all 200+ films <span className="text-rust">›</span>
          </a>
        </div>
      </section>

      <div id="submit" className="scroll-mt-[120px]">
        <Submissions />
      </div>

      <div id="schedule" className="scroll-mt-[120px]">
        <ScheduleSection />
      </div>

      {/* Chapter Three — Built For Access */}
      <section className="flex flex-col items-stretch gap-14 border-t border-cream/10 px-5 py-24 md:flex-row md:px-[90px]">
        <div className="w-full md:w-[520px] md:shrink-0">
          {/* The founder as a single film cell — sprocket rails L/R, frame badges
              + counter, matching the Program reel. */}
          <div className="flex overflow-hidden rounded-md bg-ink ring-1 ring-cream/10">
            <FilmRail />
            <div className="relative flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/founder.jpg" alt="Lex Scope on stage at Langston Hughes" className="h-[440px] w-full object-cover object-[center_32%] md:h-[600px]" />
              <span className="absolute left-3 top-3 rounded-[3px] bg-curtain px-2.5 py-[5px] font-body text-[10px] font-extrabold uppercase leading-[12px] tracking-[0.14em] text-cream">
                The Director
              </span>
              <span className="absolute right-3 top-3 rounded-[3px] bg-[#0b0a09b3] px-[9px] py-[5px] font-body text-[10px] font-bold leading-[12px] tracking-[0.1em] text-[#ffe9a8]">
                EST. 2022
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/90 to-transparent" />
              <span className="absolute bottom-3 left-3 font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-cream/85">
                On stage at Langston Hughes
              </span>
              <span className="absolute bottom-3 right-3 rounded-[3px] bg-[#0b0a09b3] px-[7px] py-[3px] font-mono text-[10px] leading-[12px] tracking-[0.08em] text-cream/80">
                FR 01
              </span>
            </div>
            <FilmRail />
          </div>
        </div>

        <div className="flex flex-col items-start justify-center gap-6">
          <ChapterLabel n="Chapter Three" />
          <h2 className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[66px]">
            Built For
            <br />
            Access
          </h2>
          <blockquote className="max-w-[22em] font-credits text-[26px] italic leading-snug text-fg/90 md:text-[28px]">
            &ldquo;{FOUNDER_QUOTE}&rdquo;
          </blockquote>
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[16px] font-extrabold text-fg">{FOUNDER.name}</span>
            <span className="font-body text-[14px] text-smoke">
              {FOUNDER.title} · {FOUNDER.credential}
            </span>
          </div>
          <div className="flex flex-wrap gap-10 pt-2">
            {stat.map((s) => (
              <div key={s.l} className="flex flex-col">
                <span className="font-marquee text-[40px] leading-none text-rust">{s.n}</span>
                <span className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-smoke">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnersMarquee />

      <div id="support" className="scroll-mt-[120px]">
        <SupportPress />
      </div>

      <SiteFooter />
    </main>
  );
}
