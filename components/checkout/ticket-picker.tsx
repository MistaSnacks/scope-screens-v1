"use client";

import type { TicketTier } from "@/lib/wix-checkout";

export function TicketPicker({
  tiers,
  quantities,
  onChange,
}: {
  tiers: TicketTier[];
  quantities: Record<string, number>;
  onChange: (tierId: string, quantity: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {tiers.map((tier) => {
        const qty = quantities[tier.id] ?? 0;
        return (
          <li
            key={tier.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-faint bg-cream/5 px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-body text-[0.9375rem] font-bold text-fg">{tier.name}</span>
              <span className="font-mono text-[0.75rem] text-smoke">{tier.priceLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={`Decrease ${tier.name}`}
                disabled={qty === 0}
                onClick={() => onChange(tier.id, Math.max(0, qty - 1))}
                className="h-8 w-8 rounded-full border border-faint font-body text-lg leading-none text-fg disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center font-body text-[1rem] font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label={`Increase ${tier.name}`}
                disabled={qty >= tier.limit}
                onClick={() => onChange(tier.id, Math.min(tier.limit, qty + 1))}
                className="h-8 w-8 rounded-full border border-faint font-body text-lg leading-none text-fg disabled:opacity-30"
              >
                +
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
