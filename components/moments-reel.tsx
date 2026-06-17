"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/motion/parallax";
import { wixImageUrl } from "@/lib/wix-media";

interface Moment {
  img: string;
  badge: string;
  tone: "red" | "gold";
  title: string;
  sub: string;
  /** background-position for the cover crop, from the Paper source */
  pos: string;
}

// "Moments from the floor" — festival photos pulled from the Paper concept
// (Concept A · Watch Movies Meet People Have Fun). Badges alternate red/gold.
export const MOMENTS: Moment[] = [
  { img: "01-egyptian", badge: "Marquee", tone: "red", title: "Live at the Egyptian", sub: "Seattle's underground film festival · Capitol Hill", pos: "50% 42%" },
  { img: "02-sold-out", badge: "The House", tone: "gold", title: "Sold-Out House", sub: "Langston Hughes Performing Arts Institute", pos: "50% 45%" },
  { img: "03-lobby", badge: "The Lobby", tone: "red", title: "Good Vibes, All Love", sub: "Before the lights go down", pos: "50% 50%" },
  { img: "04-front-row", badge: "Front Row", tone: "gold", title: "Ten Films, One Room", sub: "Doors 6:30 · Screen 7:30", pos: "50% 38%" },
  { img: "05-marquee", badge: "Marquee", tone: "red", title: "On the Marquee", sub: "SIFF Cinema Uptown", pos: "50% 50%" },
  { img: "06-after-party", badge: "After Party", tone: "gold", title: "Stay for the People", sub: "@scopescreenings", pos: "50% 48%" },
];

function badgeClass(tone: Moment["tone"]) {
  const base =
    "absolute left-4 top-4 rounded-[4px] px-3.5 py-2 font-body text-[11px] font-extrabold uppercase leading-[13px] tracking-[0.14em]";
  return tone === "gold" ? `${base} bg-rust text-ink` : `${base} bg-curtain text-cream`;
}

// 35mm sprocket perforations — unexposed-leader colour, top + bottom of each
// frame. Tiled as a 40px-pitch SVG so holes stay evenly spaced at any card width.
const PERF_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'%3E%3Crect x='9' y='9' width='22' height='12' rx='2' fill='%23e7e0cf'/%3E%3C/svg%3E\")";

function Perfs() {
  return (
    <div
      aria-hidden
      className="h-[30px] shrink-0 bg-center bg-repeat-x"
      style={{ backgroundImage: PERF_BG, backgroundSize: "40px 30px" }}
    />
  );
}

type CmsMomentInput = {
  image?: string;
  slug?: string;
  badge?: string;
  tone?: string;
  title?: string;
  subtitle?: string;
};

type NormalizedMoment = {
  bg: string;
  badge: string;
  tone: Moment["tone"];
  title: string;
  sub: string;
  pos: string;
};

function normalizeMoments(moments?: CmsMomentInput[]): NormalizedMoment[] {
  if (moments && moments.length > 0) {
    return moments.map((m) => {
      const src = wixImageUrl(m.image) ?? `/moments/${m.slug ?? ""}.jpg`;
      return {
        bg: `url(${src})`,
        badge: m.badge ?? "",
        tone: m.tone === "gold" ? "gold" : "red",
        title: m.title ?? "",
        sub: m.subtitle ?? "",
        pos: "50% 50%",
      };
    });
  }
  return MOMENTS.map((m) => ({
    bg: `url(/moments/${m.img}.jpg)`,
    badge: m.badge,
    tone: m.tone,
    title: m.title,
    sub: m.sub,
    pos: m.pos,
  }));
}

export function MomentsReel({ moments }: { moments?: CmsMomentInput[] } = {}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(1);
  const items = normalizeMoments(moments);
  const total = items.length;

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
    <Parallax distance={26} className="mx-auto mt-12 flex max-w-[1260px] flex-col gap-4">
      {/* The reel */}
      <div
        ref={railRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory cursor-grab touch-pan-x select-none scroll-smooth overflow-x-auto overflow-y-hidden rounded-md bg-ink ring-1 ring-cream/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex w-[90%] max-w-[1120px] shrink-0 snap-start flex-col border-r-[3px] border-[#161310] bg-ink"
          >
            <Perfs />
            <div
              className="relative h-[280px] w-full bg-cover sm:h-[400px] md:h-[480px]"
              style={{ backgroundImage: item.bg, backgroundPosition: item.pos }}
            >
              <span className={badgeClass(item.tone)}>{item.badge}</span>
              <span className="absolute right-5 top-5 rounded-[3px] bg-[#0b0a09b3] px-[9px] py-[5px] font-mono text-[11px] font-semibold leading-[14px] tracking-[0.08em] text-cream">
                FR {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 px-6 pb-6 pt-5">
              <span className="font-body text-[24px] font-bold leading-[1.1] text-cream sm:text-[28px] md:text-[30px]">
                {item.title}
              </span>
              <span className="font-body text-[14px] font-medium leading-5 text-smoke sm:text-[15px]">
                {item.sub}
              </span>
            </div>
            <Perfs />
          </div>
        ))}
      </div>

      {/* Reel bar — drag hint + progress + counter */}
      <div className="flex items-center justify-between gap-4 rounded-md border border-hairline bg-bg-alt px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] leading-[14px] text-curtain">&#9679;</span>
          <span className="hidden font-mono text-[11px] uppercase leading-[14px] tracking-[0.18em] text-smoke sm:inline">
            Drag the reel · moments from the floor
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="relative h-1 w-[160px] overflow-hidden rounded-full bg-cream/15 sm:w-[220px]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-curtain transition-[width] duration-150 ease-out"
              style={{ width: `${Math.max(14, progress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[12px] tracking-[0.14em] text-fg/70">
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </Parallax>
  );
}
