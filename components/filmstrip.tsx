"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";

interface Film {
  img: string;
  title: string;
  who: string;
  meta: string;
  tag: string;
  min: string;
  tone: "red" | "gold" | "doc";
}

export const FILMS: Film[] = [
  { img: "concrete-roses", title: "Concrete Roses", who: "Imani Okafor", meta: "Drama", tag: "Opening Night", min: "14", tone: "red" },
  { img: "saltwater", title: "Saltwater", who: "Marcus Yuen", meta: "Music Video", tag: "Music Video", min: "4", tone: "gold" },
  { img: "last-bus-rainier", title: "Last Bus to Rainier", who: "Deja Two-Rivers", meta: "Doc", tag: "Documentary", min: "11", tone: "doc" },
  { img: "gold-watch", title: "The Gold Watch", who: "Theo Banks", meta: "Experimental", tag: "Experimental", min: "9", tone: "doc" },
  { img: "aunties-kitchen", title: "Auntie's Kitchen", who: "Rosa Delgado", meta: "Animation", tag: "Animation", min: "6", tone: "gold" },
  { img: "graveyard-shift", title: "Graveyard Shift", who: "Andre Whitfield", meta: "Thriller", tag: "Thriller", min: "17", tone: "red" },
];

function badgeClass(tone: Film["tone"]) {
  const base = "absolute left-3 top-3 rounded-[0.1875rem] px-2.5 py-[0.3125rem] font-body text-[0.625rem] font-extrabold uppercase leading-[0.75rem] tracking-[0.14em]";
  if (tone === "red") return `${base} bg-curtain text-cream`;
  if (tone === "gold") return `${base} bg-rust text-ink`;
  return `${base} border border-rust text-rust`;
}

// Sprocket perforations - four holes, evenly spread, the colour of unexposed leader.
function Perfs() {
  return (
    <div className="flex h-6 shrink-0 items-center justify-evenly px-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-[0.6875rem] w-5 shrink-0 rounded-[2px] bg-[#e7e0cf]" />
      ))}
    </div>
  );
}

export function Filmstrip() {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(1);
  const total = FILMS.length;

  const onScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(p);
    setIndex(Math.min(total, Math.max(1, Math.round(p * (total - 1)) + 1)));
  }, [total]);

  // Click-and-drag the reel (desktop pointer drag → horizontal scroll).
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    const pd = (e: PointerEvent) => {
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const up = (e: PointerEvent) => {
      down = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", pd);
    el.addEventListener("pointermove", pm);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", pd);
      el.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <Reveal className="mx-auto mt-12 flex max-w-[78.75rem] flex-col gap-4">
      {/* The reel */}
      <div
        ref={railRef}
        onScroll={onScroll}
        className="flex cursor-grab touch-pan-x select-none overflow-x-auto overflow-y-hidden rounded-md bg-ink [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILMS.map((f, i) => (
          <a
            key={f.img}
            href="/schedule"
            draggable={false}
            className="group flex w-[18.75rem] shrink-0 flex-col border-r-[3px] border-[#161310] bg-ink sm:w-[21.375rem]"
          >
            <Perfs />
            <div
              className="relative h-[12.25rem] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(/films/${f.img}.png)` }}
            >
              <span className={badgeClass(f.tone)}>{f.tag}</span>
              <span className="absolute right-3 top-3 rounded-[0.1875rem] bg-[#0b0a09b3] px-[0.5625rem] py-[0.3125rem] font-body text-[0.625rem] font-bold leading-[0.75rem] tracking-[0.1em] text-[#ffe9a8]">
                {f.min} MIN
              </span>
              <span className="absolute bottom-2.5 left-3 rounded-[0.1875rem] bg-[#0b0a09b3] px-[0.4375rem] py-[0.1875rem] font-mono text-[0.625rem] leading-[0.75rem] tracking-[0.08em] text-cream/80">
                FR {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col gap-[0.1875rem] px-4 py-3.5">
              <span className="font-body text-[1.1875rem] font-bold leading-6 text-cream transition-colors group-hover:text-rust">
                {f.title}
              </span>
              <span className="font-body text-[0.8125rem] font-medium leading-[1.125rem] text-smoke">
                {f.who} · {f.meta}
              </span>
            </div>
            <Perfs />
          </a>
        ))}

        {/* End-of-reel leader - scan-the-reel QR end cap */}
        <div className="flex w-[16.25rem] shrink-0 flex-col bg-ink sm:w-[18.75rem]">
          <Perfs />
          <div className="relative flex h-[12.25rem] flex-col items-center justify-center gap-3">
            <span className="font-mono text-[0.6875rem] tracking-[0.34em] text-rust">SCAN THE REEL</span>
            <div className="relative flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/popcorn-logo.png" alt="" aria-hidden className="h-10 w-auto" />
            </div>
          </div>
          <div className="flex flex-col gap-[0.1875rem] px-4 py-3.5">
            <span className="font-body text-[1.1875rem] font-bold leading-6 text-cream">The Full Lineup</span>
            <span className="font-body text-[0.8125rem] font-medium leading-[1.125rem] text-smoke">200+ films · scan to browse</span>
          </div>
          <Perfs />
        </div>
      </div>

      {/* Reel bar - drag hint + progress + counter */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-curtain" />
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-smoke">Drag the reel to explore the lineup</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-1 w-[13.75rem] overflow-hidden rounded-full bg-cream/15">
            <div
              className="h-full rounded-full bg-curtain transition-[width] duration-150 ease-out"
              style={{ width: `${Math.max(12, progress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[0.75rem] tracking-[0.14em] text-fg/70">
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </Reveal>
  );
}
