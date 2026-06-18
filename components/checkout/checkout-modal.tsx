"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckoutTarget, TicketTier } from "@/lib/wix-checkout";
import { TicketPicker } from "./ticket-picker";

type LoadState =
  | { eventId: string; phase: "loading" }
  | { eventId: string; phase: "ready"; tiers: TicketTier[] }
  | { eventId: string; phase: "error" };

export function CheckoutModal({ target, onClose }: { target: CheckoutTarget; onClose: () => void }) {
  const [state, setState] = useState<LoadState>({ eventId: target.eventId, phase: "loading" });
  const [quantityState, setQuantityState] = useState<{
    eventId: string;
    values: Record<string, number>;
  }>({ eventId: target.eventId, values: {} });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/checkout/tickets?eventId=${encodeURIComponent(target.eventId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then(
        (d: { tiers: TicketTier[] }) =>
          active && setState({ eventId: target.eventId, phase: "ready", tiers: d.tiers })
      )
      .catch(() => active && setState({ eventId: target.eventId, phase: "error" }));
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

  const isCurrentTarget = state.eventId === target.eventId;
  const quantities = useMemo(
    () => (quantityState.eventId === target.eventId ? quantityState.values : {}),
    [quantityState, target.eventId]
  );
  const phase = isCurrentTarget ? state.phase : "loading";

  const total = useMemo(() => {
    if (!isCurrentTarget || state.phase !== "ready") return 0;
    return state.tiers.reduce((sum, t) => sum + t.priceAmount * (quantities[t.id] ?? 0), 0);
  }, [isCurrentTarget, state, quantities]);

  const hasSelection = Object.values(quantities).some((q) => q > 0);
  const fallbackUrl = `https://www.lexscopefilms.com/event-details/${target.eventSlug}`;

  async function handlePay() {
    if (!isCurrentTarget || state.phase !== "ready") return;
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
      onClick={submitting ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Buy tickets for ${target.title}`}
        className="relative flex max-h-[90vh] w-full max-w-[30rem] flex-col gap-5 overflow-y-auto rounded-2xl border border-faint bg-stage p-7 text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={submitting ? undefined : onClose}
          disabled={submitting}
          className="absolute right-4 top-4 font-body text-xl leading-none text-smoke hover:text-fg"
        >
          ×
        </button>

        <h2 className="pulp font-display text-[1.75rem] uppercase leading-none">{target.title}</h2>

        {phase === "loading" && <p className="font-body text-smoke">Loading tickets…</p>}

        {phase === "error" && (
          <div className="flex flex-col gap-3">
            <p className="font-body text-smoke">We couldn&rsquo;t load live tickets right now.</p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-lg bg-curtain px-5 py-3 font-body text-[0.8125rem] font-extrabold uppercase tracking-[0.04em] text-cream"
            >
              Buy on lexscopefilms ›
            </a>
          </div>
        )}

        {phase === "ready" && state.phase === "ready" && (
          state.tiers.length === 0 ? (
            <p className="font-body text-smoke">No tickets are available for this show right now.</p>
          ) : (
            <>
              <TicketPicker
                tiers={state.tiers}
                quantities={quantities}
                onChange={(id, q) =>
                  setQuantityState((prev) => ({
                    eventId: target.eventId,
                    values: {
                      ...(prev.eventId === target.eventId ? prev.values : {}),
                      [id]: q,
                    },
                  }))
                }
              />
              <div className="flex items-center justify-between border-t border-faint pt-4">
                <span className="font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-smoke">Total</span>
                <span className="font-marquee text-[1.75rem] leading-none text-rust">${total.toFixed(2)}</span>
              </div>
              {submitError && <p className="font-body text-[0.8125rem] text-rust">{submitError}</p>}
              <button
                type="button"
                disabled={!hasSelection || submitting}
                onClick={handlePay}
                className="rounded-lg bg-curtain py-3.5 font-body text-[0.875rem] font-extrabold uppercase tracking-[0.06em] text-cream disabled:opacity-40"
              >
                {submitting ? "Starting checkout…" : "Reserve & Pay ›"}
              </button>
              <p className="text-center font-mono text-[0.625rem] tracking-[0.1em] text-smoke">
                Secure payment completed on Wix · seats held ~20 min
              </p>
            </>
          )
        )}
      </div>
    </div>
  );
}
