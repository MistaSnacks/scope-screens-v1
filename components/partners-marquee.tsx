import { Reveal } from "@/components/motion/reveal";
import { getSiteContent } from "@/lib/site-content";
import { wixImageUrl } from "@/lib/wix-media";

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

const LOCAL_LOGO: Record<string, string> = {
  "Shunpike": "shunpike", "SIFF": "siff", "Converge Media": "converge",
  "FilmFreeway": "filmfreeway", "4Culture": "4culture", "ArtsFund": "artsfund",
};

export async function PartnersMarquee() {
  const { partners } = await getSiteContent();
  const list = (partners && partners.length
    ? partners.map((p) => ({
        name: p.name ?? "",
        href: p.url ?? "#",
        logo: wixImageUrl(p.logo) ?? (p.name && LOCAL_LOGO[p.name] ? `/partners/${LOCAL_LOGO[p.name]}.png` : null),
      }))
    : PARTNERS.map((p) => ({ name: p.name, href: p.href, logo: `/partners/${p.img}.png` }))
  ).filter((p) => p.name);

  // 4 copies so half the track (the -50% animation period) always exceeds the
  // 1440px viewport — otherwise the row runs out of logos and goes blank near
  // the loop boundary (SIFF scrolling into empty space looked like clipping).
  const loop = [...list, ...list, ...list, ...list];
  return (
    <section className="border-t border-hairline bg-bg px-5 py-16 md:px-9">
      <Reveal className="mb-10 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-curtain" />
        <span className="font-body text-[0.75rem] font-bold uppercase tracking-[0.28em] text-rust">
          In Good Company
        </span>
        <span className="h-px w-8 bg-curtain" />
      </Reveal>

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
            const isDuplicate = i >= list.length;
            return (
            <a
              key={`${p.name}-${i}`}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              aria-hidden={isDuplicate || undefined}
              tabIndex={isDuplicate ? -1 : undefined}
              title={p.name}
              className="mr-16 shrink-0 opacity-60 transition-opacity duration-300 hover:opacity-100"
            >
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} className="partner-logo h-auto w-auto max-h-8 max-w-[6.5rem] md:max-h-9 md:max-w-[7.5rem]" />
              ) : (
                <span className="font-display text-[1.25rem] uppercase tracking-[0.04em] text-fg/70">{p.name}</span>
              )}
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
