import { BuyTickets } from "@/components/buy-tickets";
import { WhatIs } from "@/components/what-is";
import { ScrollControl } from "@/components/scroll-control";
import { CurtainCreditsHero } from "@/components/curtain-credits-hero";
import { SiteNav } from "@/components/site-nav";
import { PersistentValance } from "@/components/persistent-valance";
import { Marquee } from "@/components/marquee";
import { Filmstrip } from "@/components/filmstrip";
import { MomentsReel } from "@/components/moments-reel";
import { Submissions } from "@/components/submissions";
import { PartnersMarquee } from "@/components/partners-marquee";
import { ScheduleSection } from "@/components/schedule-section";
import { SupportPress } from "@/components/support-press";
import { SiteFooter } from "@/components/site-footer";
import { FOUNDER } from "@/lib/festival";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Parallax } from "@/components/motion/parallax";
import { KineticText } from "@/components/motion/kinetic-text";
import { getPurchasableTargets } from "@/lib/wix-checkout";

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

export default async function Home() {
  const { nextShow, seasonPass } = await getPurchasableTargets();
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
        <BuyTickets nextShow={nextShow} seasonPass={seasonPass} />
      </div>

      <div id="about" className="scroll-mt-[120px]">
        <WhatIs />
      </div>

      {/* Chapter Two — Built For Access */}
      <section className="flex flex-col items-stretch gap-14 border-t border-cream/10 px-5 py-24 md:flex-row md:px-[90px]">
        <Reveal className="w-full md:w-[520px] md:shrink-0">
          {/* The founder as a director's-monitor credential — gold frame, a REC
              header, and a film-still pulled from the Wix media library. */}
          <Parallax distance={22}>
          <figure className="rounded-lg bg-ink p-3 ring-1 ring-rust/70 shadow-[0_0_0_1px_rgba(255,187,0,0.12),0_30px_60px_-22px_rgba(0,0,0,0.85)] md:p-4">
            <div className="flex items-center justify-between px-1 pb-2.5">
              <span className="font-display text-[18px] uppercase leading-none tracking-[0.1em] text-rust md:text-[21px]">
                Scope <span className="text-rust/55">—</span> Founder
              </span>
              <span className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-smoke md:text-[12px]">
                Rec
                <span className="h-[7px] w-[7px] rounded-full bg-curtain animate-pulse" />
              </span>
            </div>
            <div className="h-px w-full bg-rust/70" />
            <div className="relative mt-3 overflow-hidden rounded-[3px] ring-1 ring-rust/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/founder-lex.jpg"
                alt="Lex Scope watching a film at a Scope Screenings night"
                className="h-[460px] w-full object-cover object-[42%_center] md:h-[620px]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/65 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-display text-[46px] uppercase leading-[0.88] text-cream md:text-[58px]">
                  {FOUNDER.name}
                </span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-smoke md:text-[12px]">
                  {FOUNDER.title} · {FOUNDER.credential}
                </span>
              </figcaption>
            </div>
          </figure>
          </Parallax>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col items-start justify-center gap-6">
          <ChapterLabel n="Chapter Two" />
          <KineticText
            as="h2"
            className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[66px]"
            text={"Built For\nAccess"}
          />
          <blockquote className="max-w-[22em] font-credits text-[26px] italic leading-snug text-fg/90 md:text-[28px]">
            &ldquo;{FOUNDER_QUOTE}&rdquo;
          </blockquote>
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[16px] font-extrabold text-fg">{FOUNDER.name}</span>
            <span className="font-body text-[14px] text-smoke">
              {FOUNDER.title} · {FOUNDER.credential}
            </span>
          </div>
          <Stagger className="flex flex-wrap gap-10 pt-2">
            {stat.map((s) => (
              <StaggerItem key={s.l} className="flex flex-col">
                <span className="font-marquee text-[40px] leading-none text-rust">{s.n}</span>
                <span className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-smoke">{s.l}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      </section>

      {/* Chapter Three — Scope Screenings Magic (moments from the floor) */}
      <section className="border-t border-cream/10 bg-bg px-5 py-24 md:px-[90px]">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel n="Chapter Three" center />
          <KineticText
            as="h2"
            className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]"
            text={"Scope Screenings\nMagic"}
          />
          <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-fg/70">
            Every last Tuesday the Central District turns into a cinema — ten films, ten directors,
            and the best room in the city.
          </p>
        </Reveal>

        <MomentsReel />

        <div className="mt-14 flex justify-center">
          <a
            href="https://instagram.com/scopescreenings"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-b-2 border-rust pb-1.5 font-body text-[13px] font-extrabold uppercase tracking-[0.14em] text-fg transition-colors hover:text-rust"
          >
            See more from the floor <span className="text-rust">›</span>
          </a>
        </div>
      </section>

      <div id="submit" className="scroll-mt-[120px]">
        <Submissions />
      </div>

      <div id="schedule" className="scroll-mt-[120px]">
        <ScheduleSection />
      </div>

      <PartnersMarquee />

      <div id="support" className="scroll-mt-[120px]">
        <SupportPress />
      </div>

      {/* Chapter Four — The Archives */}
      <section
        id="films"
        className="scroll-mt-[120px] border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]"
      >
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel n="Chapter Four" center />
          <KineticText
            as="h2"
            className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]"
            text="The Archives"
          />
          <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-fg/70">
            Shorts, music videos, docs, animation, experiments. Every film twenty minutes or
            less, every filmmaker in the room.
          </p>
        </Reveal>

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

      <SiteFooter />
    </main>
  );
}
