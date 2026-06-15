interface Partner {
  name: string;
  img: string;
  href: string;
}

// Logos sourced from the Scope Screenings Wix media library.
const PARTNERS: Partner[] = [
  { name: "Shunpike", img: "shunpike", href: "https://www.shunpike.org" },
  { name: "SIFF", img: "siff", href: "https://www.siff.net" },
  { name: "Converge Media", img: "converge", href: "https://convergemedia.org" },
  { name: "FilmFreeway", img: "filmfreeway", href: "https://filmfreeway.com/ScopeScreenings" },
  { name: "4Culture", img: "4culture", href: "https://www.4culture.org" },
  { name: "ArtsFund", img: "artsfund", href: "https://www.artsfund.org" },
];

export function PartnersMarquee({ band = false }: { band?: boolean } = {}) {
  // 4 copies so half the track (the -50% animation period) always exceeds the
  // 1440px viewport — otherwise the row runs out of logos and goes blank near
  // the loop boundary (SIFF scrolling into empty space looked like clipping).
  const loop = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section
      className={
        band
          ? "band-up bg-rust px-5 py-16 md:px-9"
          : "border-t border-hairline bg-bg px-5 py-16 md:px-9"
      }
    >
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-curtain" />
        <span
          className={`font-body text-[12px] font-bold uppercase tracking-[0.28em] ${band ? "text-ink" : "text-rust"}`}
        >
          In Good Company
        </span>
        <span className="h-px w-8 bg-curtain" />
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          className="flex w-max items-center hover:[animation-play-state:paused]"
          style={{ animation: "marquee 76s linear infinite" }}
        >
          {loop.map((p, i) => {
            // Only the first set is real to assistive tech; the repeated copies
            // exist purely to fill the track for a seamless scroll.
            const isDuplicate = i >= PARTNERS.length;
            return (
            <a
              key={`${p.img}-${i}`}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              aria-hidden={isDuplicate || undefined}
              tabIndex={isDuplicate ? -1 : undefined}
              title={p.name}
              className={`mr-16 shrink-0 transition-opacity duration-300 hover:opacity-100 ${band ? "opacity-85" : "opacity-60"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/partners/${p.img}.png`}
                alt={p.name}
                // Bound by BOTH height and width so wide wordmarks (shunpike,
                // converge) get capped instead of dwarfing the compact marks.
                // h-auto/w-auto keeps the aspect ratio while fitting the box.
                className={`h-auto w-auto max-h-8 max-w-[104px] md:max-h-9 md:max-w-[120px] ${band ? "partner-logo--ink" : "partner-logo"}`}
              />
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
