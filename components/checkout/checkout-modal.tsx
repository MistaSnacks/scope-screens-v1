"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckoutTarget, TicketTier } from "@/lib/wix-checkout";
import { TicketPicker } from "./ticket-picker";

type LoadState =
  | { phase: "loading" }
  | { phase: "ready"; tiers: TicketTier[] }
  | { phase: "error" };

export function CheckoutModal({ target, onClose }: { target: CheckoutTarget; onClose: () => void }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState({ phase: "loading" });
    setQuantities({});
    fetch(`/api/checkout/tickets?eventId=${encodeURIComponent(target.eventId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: { tiers: TicketTier[] }) => active && setState({ phase: "ready", tiers: d.tiers }))
      .catch(() => active && setState({ phase: "error" }));
    return () => {
      active = false;
    };
  }, [target.eventId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const total = useMemo(() => {
    if (state.phase !== "ready") return 0;
    return state.tiers.reduce((sum, t) => sum + t.priceAmount * (quantities[t.id] ?? 0), 0);
  }, [state, quantities]);

  const hasSelection = Object.values(quantities).some((q) => q > 0);
  const fallbackUrl = `https://www.lexscopefilms.com/event-details/${target.eventSlug}`;

  async function handlePay() {
    if (state.phase !== "ready") return;
    setSubmitting(true);
    setSubmitError(null);
    const lineItems = state.tiers
      .map((t) => ({ ticketDefinitionId: t.id, quantity: quantities[t.id] ?? 0 }))
      .filter((l) => l.quantity > 0);
    try {
      const res = await fetch("/api/checkout/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: target.eventSlug, lineItems }),
      });
      if (!res.ok) throw new Error("reserve failed");
      const { redirectUrl } = (await res.json()) as { redirectUrl: string };
      window.location.href = redirectUrl;
    } catch {
      setSubmitError("Something went wrong starting checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Buy tickets for ${target.title}`}
        className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col gap-5 overflow-y-auto rounded-2xl border border-faint bg-stage p-7 text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 font-body text-xl leading-none text-smoke hover:text-fg"
        >
          ×
        </button>

        <h2 className="font-display text-[28px] uppercase leading-none">{target.title}</h2>

        {state.phase === "loading" && <p className="font-body text-smoke">Loading tickets…</p>}

        {state.phase === "error" && (
          <div className="flex flex-col gap-3">
            <p className="font-body text-smoke">We couldn't load live tickets right now.</p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-lg bg-curtain px-5 py-3 font-body text-[13px] font-extrabold uppercase tracking-[0.04em] text-cream"
            >
              Buy on lexscopefilms ›
            </a>
          </div>
        )}

        {state.phase === "ready" && (
          <>
            <TicketPicker
              tiers={state.tiers}
              quantities={quantities}
              onChange={(id, q) => setQuantities((prev) => ({ ...prev, [id]: q }))}
            />
            <div className="flex items-center justify-between border-t border-faint pt-4">
              <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-smoke">Total</span>
              <span className="font-marquee text-[28px] leading-none text-rust">${total.toFixed(2)}</span>
            </div>
            {submitError && <p className="font-body text-[13px] text-rust">{submitError}</p>}
            <button
              type="button"
              disabled={!hasSelection || submitting}
              onClick={handlePay}
              className="rounded-lg bg-curtain py-3.5 font-body text-[14px] font-extrabold uppercase tracking-[0.06em] text-cream disabled:opacity-40"
            >
              {submitting ? "Starting checkout…" : "Reserve & Pay ›"}
            </button>
            <p className="text-center font-mono text-[10px] tracking-[0.1em] text-smoke">
              Secure payment completed on Wix · seats held ~20 min
            </p>
          </>
        )}
      </div>
    </div>
  );
}
