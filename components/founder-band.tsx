import { FOUNDER } from "@/lib/festival";

const FOUNDER_QUOTE =
  "A lot of my peers never had the chance to see their work on a big screen. I built this for access, for collaboration, and to break down the barriers placed in front of Black, brown, and tan creatives.";

const stat = [
  { n: "200+", l: "Films" },
  { n: "150+", l: "Filmmakers" },
  { n: "20+", l: "Screenings" },
  { n: "6+", l: "Theaters" },
];

export function FounderBand({ eyebrow = "Chapter Two" }: { eyebrow?: string }) {
  return (
    <section className="flex flex-col items-stretch gap-14 bg-curtain text-cream px-5 py-24 md:flex-row md:px-[90px]">
      <div className="w-full md:w-[520px] md:shrink-0">
        {/* The founder as a director's-monitor credential — gold frame, a REC
            header, and a film-still pulled from the Wix media library. */}
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
      </div>

      <div className="flex flex-col items-start justify-center gap-6">
        <div className="flex items-center gap-3"><span className="h-px w-10 bg-cream/50" /><span className="font-body text-[12px] font-bold uppercase tracking-[0.3em] text-cream/80">{eyebrow}</span></div>
        <h2 className="pulp-on-red font-display text-[56px] uppercase leading-[0.94] md:text-[66px]">
          Built For
          <br />
          Access
        </h2>
        <blockquote className="max-w-[22em] font-credits text-[26px] italic leading-snug text-cream/90 md:text-[28px]">
          &ldquo;{FOUNDER_QUOTE}&rdquo;
        </blockquote>
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-[16px] font-extrabold text-cream">{FOUNDER.name}</span>
          <span className="font-body text-[14px] text-cream/65">
            {FOUNDER.title} · {FOUNDER.credential}
          </span>
        </div>
        <div className="flex flex-wrap gap-10 pt-2">
          {stat.map((s) => (
            <div key={s.l} className="flex flex-col">
              <span className="font-marquee text-[40px] leading-none text-rust">{s.n}</span>
              <span className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cream/65">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
