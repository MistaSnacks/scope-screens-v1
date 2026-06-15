import { BuyTickets } from "@/components/buy-tickets";
import { WhatIs } from "@/components/what-is";
import { ScrollControl } from "@/components/scroll-control";
import { CurtainCreditsHero } from "@/components/curtain-credits-hero";
import { Marquee } from "@/components/marquee";
import { Filmstrip } from "@/components/filmstrip";
import { MomentsReel } from "@/components/moments-reel";
import { Submissions } from "@/components/submissions";
import { PartnersMarquee } from "@/components/partners-marquee";
import { ScheduleSection } from "@/components/schedule-section";
import { SupportPress } from "@/components/support-press";
import { FounderBand } from "@/components/founder-band";
import { getPurchasableTargets } from "@/lib/wix-checkout";

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

  return (
    <main id="top" className="relative bg-bg">
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
      <FounderBand />

      {/* Chapter Three — Scope Screenings Magic (moments from the floor) */}
      <section className="band-up bg-bg-alt px-5 py-24 md:px-[90px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel n="Chapter Three" center />
          <h2 className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]">
            Scope Screenings
            <br />
            Magic
          </h2>
          <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-fg/70">
            Every last Tuesday the Central District turns into a cinema — ten films, ten directors,
            and the best room in the city.
          </p>
        </div>

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

      <PartnersMarquee band />

      <div id="support" className="scroll-mt-[120px]">
        <SupportPress />
      </div>

      {/* Chapter Four — The Archives */}
      <section
        id="films"
        className="band-down scroll-mt-[120px] bg-rust text-ink px-5 py-24 md:px-[90px]"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center gap-3"><span className="h-px w-10 bg-ink/40" /><span className="font-body text-[12px] font-bold uppercase tracking-[0.3em] text-ink/70">Chapter Four</span><span className="h-px w-10 bg-ink/40" /></div>
          <h2 className="pulp-on-gold font-display text-[56px] uppercase leading-[0.94] md:text-[80px]">The Archives</h2>
          <p className="max-w-[44ch] font-body text-[17px] leading-relaxed text-ink/70">
            Shorts, music videos, docs, animation, experiments. Every film twenty minutes or
            less, every filmmaker in the room.
          </p>
        </div>

        <Filmstrip />

        <div className="mt-14 flex justify-center">
          <a
            href="/schedule"
            className="flex items-center gap-2 border-b-2 border-ink pb-1.5 font-body text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink transition-colors hover:text-curtain"
          >
            Browse all 200+ films <span className="text-curtain">›</span>
          </a>
        </div>
      </section>

    </main>
  );
}
