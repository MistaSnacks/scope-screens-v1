// "What Is Scope Screenings" — the dark film-slate section from the Concept A
// board (node 374-0): editorial copy + a tilted clapperboard of production
// credits, on the dark stage ground. Rebuilt in the LIVE type system —
// Aachen (font-display) headings, Libre (font-body) copy, JetBrains Mono
// (font-mono) for the slate codes/labels.

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">{k}</span>
      <span className="font-body text-[18px] font-bold leading-none text-cream">{v}</span>
    </div>
  );
}

export function WhatIs() {
  return (
    <section className="band-up flex flex-col items-start gap-14 overflow-hidden bg-bg-alt px-5 py-24 md:flex-row md:items-center md:justify-between md:gap-20 md:px-[90px]">
      {/* Left: editorial copy */}
      <div className="flex w-full flex-col gap-6 md:w-[560px] md:shrink-0">
        <div className="flex items-center gap-3.5">
          <span className="h-0.5 w-[30px] shrink-0 bg-curtain" />
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-curtain">
            SC. 01 · Roll 22 · Now Rolling
          </span>
        </div>
        <h2 className="pulp font-display text-[34px] uppercase leading-[0.95] sm:text-[44px] md:text-[60px]">
          What Is Scope Screenings?
        </h2>
        <p className="max-w-[36em] font-body text-[17px] font-medium leading-[27px] text-muted">
          Seattle&rsquo;s underground film festival. A live, monthly short-film
          showcase built to put filmmakers on a real screen in front of a real,
          packed house — uplifting Black, brown &amp; tan creators across the PNW.
          Ten directors, one night, every month.
        </p>
        <p className="font-body text-[18px] font-bold italic leading-[26px] text-curtain">
          &ldquo;We put the fun back in film fests.&rdquo;
        </p>
      </div>

      {/* Right: clapperboard */}
      <div className="w-full max-w-[528px] shrink-0 rotate-[1.5deg] [filter:drop-shadow(0_22px_45px_rgba(0,0,0,0.5))]">
        {/* Clapstick — straight bar of vertical stripes, rotated open (−9°) */}
        <div
          className="mb-1.5 flex h-[52px] w-full -rotate-[9deg] overflow-clip rounded-[5px]"
          style={{ background: "#0b0a09" }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-1"
              style={{ background: i % 2 === 0 ? "#f2ecdd" : "#0b0a09" }}
            />
          ))}
        </div>

        {/* Slate */}
        <div
          className="relative flex flex-col gap-5 rounded-[6px] border px-[26px] pb-[18px] pt-[22px]"
          style={{ background: "#141210", borderColor: "#2c2823" }}
        >
          {/* popcorn stamp, top corner */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/popcorn-logo.png"
            alt=""
            aria-hidden
            className="absolute right-6 top-5 h-[42px] w-auto opacity-90"
          />

          {/* inner stripe rail */}
          <div className="flex gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-[10px] flex-1 rounded-[1px]"
                style={{ background: i % 2 ? "#26221d" : "#3a342c" }}
              />
            ))}
          </div>

          {/* Production */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust">
              Production
            </span>
            <span className="font-display text-[30px] uppercase leading-none text-cream md:text-[34px]">
              Scope Screenings
            </span>
          </div>

          <div className="h-px w-full" style={{ background: "#2c2823" }} />

          {/* Director / Location */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
            <Field k="Director" v="Lex Scope" />
            <span className="hidden w-px shrink-0 sm:block" style={{ background: "#2c2823" }} />
            <Field k="Location" v="Seattle, WA" />
          </div>

          <div className="h-px w-full" style={{ background: "#2c2823" }} />

          {/* Est / Runs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
            <Field k="Est." v="June 2022" />
            <span className="hidden w-px shrink-0 sm:block" style={{ background: "#2c2823" }} />
            <Field k="Runs" v="Last Tue · Monthly" />
          </div>

          <div className="h-px w-full" style={{ background: "#2c2823" }} />

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-smoke">
              Roll 22 · Take 05
            </span>
            <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-curtain">
              <span className="size-[7px] rounded-full bg-curtain" /> Sound Speed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
