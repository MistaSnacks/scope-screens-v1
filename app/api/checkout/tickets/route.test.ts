import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/wix-checkout", () => ({
  queryAvailableTickets: vi.fn(),
}));

import { GET } from "./route";
import { queryAvailableTickets } from "@/lib/wix-checkout";

const mocked = vi.mocked(queryAvailableTickets);
afterEach(() => vi.clearAllMocks());

function req(url: string) {
  return new Request(url);
}

describe("GET /api/checkout/tickets", () => {
  it("400s when eventId is missing", async () => {
    const res = await GET(req("http://test/api/checkout/tickets"));
    expect(res.status).toBe(400);
  });

  it("returns tiers for a valid event", async () => {
    mocked.mockResolvedValueOnce([
      { id: "ga", name: "GA", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false },
    ]);
    const res = await GET(req("http://test/api/checkout/tickets?eventId=e1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tiers: [{ id: "ga", name: "GA", priceAmount: 22, priceLabel: "$22.00", currency: "USD", limit: 50, free: false }] });
    expect(mocked).toHaveBeenCalledWith("e1");
  });

  it("502s when Wix is unreachable", async () => {
    mocked.mockResolvedValueOnce(null);
    const res = await GET(req("http://test/api/checkout/tickets?eventId=e1"));
    expect(res.status).toBe(502);
  });
});
