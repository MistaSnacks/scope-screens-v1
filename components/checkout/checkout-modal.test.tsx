import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutModal } from "./checkout-modal";

const TARGET = { eventId: "e1", eventSlug: "opening-night", title: "Opening Night" };

function stubFetch(handlers: Record<string, { status?: number; json: unknown }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const key = `${init?.method ?? "GET"} ${url.split("?")[0]}`;
      const h = handlers[key];
      return { ok: (h.status ?? 200) < 400, status: h.status ?? 200, json: async () => h.json };
    }),
  );
}

beforeEach(() => {
  // jsdom has no navigation; capture redirect target instead.
  vi.stubGlobal("location", { ...window.location, assign: vi.fn() });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CheckoutModal", () => {
  it("loads tiers and shows them", async () => {
    stubFetch({
      "GET /api/checkout/tickets": {
        json: { tiers: [{ id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 5, free: false }] },
      },
    });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    expect(await screen.findByText("General Admission")).toBeInTheDocument();
  });

  it("disables Reserve & Pay until a ticket is selected", async () => {
    stubFetch({
      "GET /api/checkout/tickets": {
        json: { tiers: [{ id: "ga", name: "General Admission", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 5, free: false }] },
      },
    });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    await screen.findByText("General Admission");
    expect(screen.getByRole("button", { name: /reserve & pay/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /increase general admission/i }));
    expect(screen.getByRole("button", { name: /reserve & pay/i })).toBeEnabled();
  });

  it("shows the fallback link when tiers fail to load", async () => {
    stubFetch({ "GET /api/checkout/tickets": { status: 502, json: { error: "x" } } });
    render(<CheckoutModal target={TARGET} onClose={() => {}} />);
    expect(await screen.findByRole("link", { name: /buy on lexscopefilms/i })).toBeInTheDocument();
  });
});
