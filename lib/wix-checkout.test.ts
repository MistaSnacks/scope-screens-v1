import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryAvailableTickets } from "./wix-checkout";

const TOKEN_RES = { access_token: "visitor-token-abc" };

function mockFetchSequence(responses: Array<{ ok?: boolean; json: unknown }>) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce({
      ok: r.ok ?? true,
      json: async () => r.json,
    });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.stubEnv("WIX_CLIENT_ID", "client-123");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("queryAvailableTickets", () => {
  it("normalizes Wix definitions into tiers", async () => {
    const fetchMock = mockFetchSequence([
      { json: TOKEN_RES },
      {
        json: {
          metaData: { total: 2 },
          definitions: [
            { id: "ga", name: "General Admission - $22", price: { amount: "22.00", currency: "USD" }, limitPerCheckout: 50 },
            { id: "free", name: "Donate", price: { amount: "0.00", currency: "USD" }, limitPerCheckout: 10 },
          ],
        },
      },
    ]);

    const tiers = await queryAvailableTickets("event-1");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(tiers).toEqual([
      { id: "ga", name: "General Admission - $22", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false },
      { id: "free", name: "Donate", priceAmount: 0, priceLabel: "Free", currency: "USD", limit: 10, free: true },
    ]);
  });

  it("returns null when WIX_CLIENT_ID is missing", async () => {
    vi.unstubAllEnvs();
    const tiers = await queryAvailableTickets("event-1");
    expect(tiers).toBeNull();
  });

  it("returns null when the availability call fails", async () => {
    mockFetchSequence([{ json: TOKEN_RES }, { ok: false, json: {} }]);
    const tiers = await queryAvailableTickets("event-1");
    expect(tiers).toBeNull();
  });
});
