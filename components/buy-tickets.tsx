"use client";

import { SEASON_PASS, VENUE, nextScreening, reserveUrl, ticketUrl } from "@/lib/festival";
import { useCheckout } from "@/components/checkout/checkout-context";
import type { CheckoutTarget } from "@/lib/wix-checkout";

const INK_BARCODE =
  "repeating-linear-gradient(90deg,#0b0a09 0,#0b0a09 2px,transparent 2px,transparent 4px,#0b0a09 4px,#0b0a09 7px,transparent 7px,transparent 9px)";
const CREAM_BARCODE =
  "repeating-linear-gradient(90deg,#f7f3e6 0,#f7f3e6 2px,transparent 2px,transparent 4px,#f7f3e6 4px,#f7f3e6 7px,transparent 7px,transparent 9px)";

function Perforation() {
  // Punched holes the colour of the section ground, straddling the tear seam.
  return (
    <div className="pointer-events-none absolute bottom-3 left-[372px] top-3 flex w-2.5 flex-col items-center justify-between">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full bg-stage" />
      ))}
    </div>
  );
}

function NightTicket({ target }: { target: CheckoutTarget | null }) {
  const next = nextScreening();
  const { openCheckout } = useCheckout();
  const body = (
    <>
      {/* Body */}
      <div className="relative flex w-[380px] flex-col gap-4 overflow-hidden rounded-l-2xl border border-r-0 border-faint bg-cream px-8 py-7 text-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/popcorn-logo.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-[-6px] top-16 h-40 w-auto opacity-[0.1]"
        />
        <div className="flex items-center justify-between">
          <span className="font-marquee text-[23px] uppercase leading-none tracking-[0.05em] text-curtain">Admit One</span>
          <span className="font-mono text-[11px] tracking-[0.16em] text-smoke">NO. 0048</span>
        </div>
        <div className="font-display text-[52px] uppercase leading-[0.9]">{next.label}</div>
        <div className="font-body text-[15px] font-semibold leading-snug text-ink/80">
          {VENUE.name}
          <br />
          {VENUE.address} · {VENUE.city}
        </div>
        <div className="border-t-2 border-dashed border-ink/20" />
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">Doors / Screen</span>
            <span className="font-body text-[17px] font-extrabold">
              {VENUE.doors.replace(" PM", "")} / {VENUE.program}
            </span>
          </div>
          <div className="h-9 w-[104px]" style={{ backgroundImage: INK_BARCODE }} aria-hidden />
        </div>
      </div>

      {/* Tear-off stub */}
      <div className="ticket-stub flex w-[168px] flex-col items-center justify-between rounded-r-2xl bg-curtain px-4 py-6 text-center text-cream">
        <span className="font-mono text-[10px] tracking-[0.22em] text-cream/80">ADMISSION</span>
        <div className="flex flex-col items-center gap-1">
          <span className="font-marquee text-[46px] leading-none">$22</span>
          <span className="font-body text-[12px] font-bold tracking-[0.04em] text-cream/90">GEN $22 · EARLY $18</span>
        </div>
        <span className="flex w-full items-center justify-center rounded-lg bg-cream py-3 font-body text-[13px] font-extrabold tracking-[0.04em] text-curtain">
          BUY TICKETS ›
        </span>
      </div>

      <Perforation />
      {/* printed-paper grain */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
        style={{ backgroundImage: "url(/grain.png)", backgroundSize: "cover" }}
        aria-hidden
      />
    </>
  );
  const className =
    "ticket relative flex w-[548px] max-w-full shrink-0 -rotate-[1.5deg] [filter:drop-shadow(0_28px_55px_rgba(0,0,0,0.45))]";
  return target ? (
    <button
      type="button"
      onClick={() => openCheckout(target)}
      aria-label={`Buy tickets for ${target.title}`}
      className={`${className} cursor-pointer border-0 bg-transparent p-0 text-left`}
    >
      {body}
    </button>
  ) : (
    <a
      href={reserveUrl(next)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Buy tickets for ${next.title}, ${next.label}`}
    >
      {body}
    </a>
  );
}

function SeasonPassLanyard({ target }: { target: CheckoutTarget | null }) {
  const { openCheckout } = useCheckout();
  const lanyardClassName =
    "lanyard relative flex w-[248px] shrink-0 flex-col items-center [filter:drop-shadow(0_24px_42px_rgba(0,0,0,0.5))]";
  const body = (
    <>
      {/* Strap V + clip — woven black with the repeating wordmark */}
      <div className="relative h-[60px] w-[210px]">
        <span className="absolute bottom-0.5 left-[78px] h-24 w-[26px] origin-bottom rotate-[20deg] overflow-hidden rounded-[3px] border border-cream/10 bg-ink">
          <span className="absolute inset-0 flex items-start justify-center pt-2">
            <span className="font-mono text-[8px] font-bold tracking-[0.16em] text-cream [writing-mode:vertical-rl]">
              SCOPE SCREENINGS
            </span>
          </span>
        </span>
        <span className="absolute bottom-0.5 right-[78px] h-24 w-[26px] origin-bottom -rotate-[20deg] overflow-hidden rounded-[3px] border border-cream/10 bg-ink">
          <span className="absolute inset-0 flex items-start justify-center pt-2">
            <span className="font-mono text-[6.5px] tracking-[0.1em] text-cream/70 [writing-mode:vertical-rl]">
              live underground film festival
            </span>
          </span>
        </span>
        <span className="absolute -bottom-2 left-[99px] z-10 flex h-[22px] w-[50px] items-center justify-center rounded-[5px] bg-[#c9c3b6]">
          <span className="h-1.5 w-6 rounded-full bg-[#15120f]" />
        </span>
      </div>

      {/* Credential — B&W documentary collage face */}
      <div
        className="relative flex w-[248px] flex-col overflow-hidden rounded-2xl border border-[#5a5550] bg-ink px-6 pb-5 pt-5"
        style={{
          backgroundImage: "url(/season-pass-collage.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* scrim for legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,rgba(11,10,9,0.62) 0%,rgba(11,10,9,0.78) 55%,rgba(11,10,9,0.92) 100%)",
          }}
          aria-hidden
        />
        <span className="mx-auto mb-3 h-2.5 w-16 rounded-full border border-[#2a241b] bg-[#15120f]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/popcorn-logo.png" alt="Scope Screenings" className="mb-1.5 -ml-0.5 h-12 w-auto self-start" />
        <div className="mb-1 flex flex-col gap-0.5">
          <span className="font-marquee text-[13px] uppercase leading-none tracking-[0.02em] text-cream">Scope Screenings</span>
          <span className="font-mono text-[7px] tracking-[0.16em] text-cream/60">live underground film festival</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.24em] text-rust">ALL-ACCESS · 2026</span>
        <span className="mt-2 w-fit self-start rounded-[2px] bg-curtain px-[9px] pb-1.5 pt-1 font-marquee text-[29px] uppercase leading-none tracking-[-0.01em] text-ink">
          Season Pass
        </span>
        <span className="my-3.5 border-t border-[#2a241b]" />
        <div className="flex items-center justify-between pb-2">
          <span className="font-mono text-[10px] tracking-[0.16em] text-cream/50">ADMITS</span>
          <span className="font-body text-[14px] font-bold text-cream">Bearer · All {SEASON_PASS.nights} Nights</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.16em] text-cream/50">SEASON</span>
          <span className="font-body text-[14px] font-bold text-cream">No. 05 · Jun–Dec</span>
        </div>
        <div className="flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-[0.16em] text-rust">SEASON PASS</span>
            <span className="font-marquee text-[38px] leading-none text-rust">{SEASON_PASS.gaPrice}</span>
          </div>
          <div className="mb-1 h-8 w-[88px]" style={{ backgroundImage: CREAM_BARCODE }} aria-hidden />
        </div>
        <span className="mt-2 font-mono text-[10px] tracking-[0.14em] text-cream/55">SS-SP-006 · TAP TO BUY ›</span>
      </div>
    </>
  );
  return target ? (
    <button
      type="button"
      onClick={() => openCheckout(target)}
      aria-label="Buy a Season Pass — all seven nights"
      className={`${lanyardClassName} cursor-pointer border-0 bg-transparent p-0 text-left`}
    >
      {body}
    </button>
  ) : (
    <a
      href={ticketUrl(SEASON_PASS.slug)}
      target="_blank"
      rel="noopener noreferrer"
      className={lanyardClassName}
      aria-label="Buy a Season Pass — all seven nights"
    >
      {body}
    </a>
  );
}

export function BuyTickets({
  nextShow,
  seasonPass,
}: {
  nextShow: CheckoutTarget | null;
  seasonPass: CheckoutTarget | null;
}) {
  return (
    <section className="flex flex-col items-center gap-14 overflow-hidden border-t border-hairline bg-bg px-5 py-24 md:px-[90px]">
      {/* Heading on top — like the Program section */}
      <div className="flex max-w-[640px] flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-curtain" />
          <span className="font-body text-[12px] font-bold uppercase tracking-[0.3em] text-label">Chapter One</span>
          <span className="h-px w-10 bg-curtain" />
        </div>
        <h2 className="pulp font-display text-[56px] uppercase leading-[0.94] md:text-[80px]">The Next Show</h2>
        <p className="font-body text-[17px] leading-relaxed text-fg/70">
          Last Tuesday of the month, June through December. Ten directors, ten films, one packed
          house in the Central District — doors at 7:00, lights down at 7:30. Go for the night, or go
          all season.
        </p>
      </div>

      {/* Ticket + lanyard underneath — scaled so neither overpowers the other */}
      <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:gap-14">
        <div className="origin-center scale-[0.58] sm:scale-75 md:scale-[0.9]">
          <NightTicket target={nextShow} />
        </div>
        <div className="origin-center md:scale-[1.12]">
          <SeasonPassLanyard target={seasonPass} />
        </div>
      </div>
    </section>
  );
}
