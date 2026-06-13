import { nextScreening } from "@/lib/festival";

export function Marquee() {
  const next = nextScreening();
  const ITEMS = [
    "NOW SHOWING",
    `${next.label} · LANGSTON HUGHES INSTITUTE`,
    "DOORS 6:30 / SCREEN 7:30",
    "10 DIRECTORS, ONE NIGHT",
    "TROPICAL WAVY ENERGY",
  ];
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y-2 border-rust bg-curtain">
      <div
        className="flex w-max items-center gap-7 whitespace-nowrap py-2.5"
        style={{ animation: "marquee 50s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-7">
            <span className="font-marquee text-[20px] uppercase tracking-[0.03em] text-brass">
              {item}
            </span>
            <span className="text-rust" aria-hidden>
              ★
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
