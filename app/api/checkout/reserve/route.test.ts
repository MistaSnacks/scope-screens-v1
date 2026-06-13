import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/wix-checkout", () => ({
  createReservation: vi.fn(),
  createPaymentRedirect: vi.fn(),
}));

import { POST } from "./route";
import { createReservation, createPaymentRedirect } from "@/lib/wix-checkout";

const mockReserve = vi.mocked(createReservation);
const mockRedirect = vi.mocked(createPaymentRedirect);
afterEach(() => vi.clearAllMocks());

function post(body: unknown) {
  return new Request("http://test/api/checkout/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout/reserve", () => {
  it("400s when lineItems are empty", async () => {
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [] }));
    expect(res.status).toBe(400);
  });

  it("reserves then returns a redirect url", async () => {
    mockReserve.mockResolvedValueOnce({ reservationId: "res-1", expiresAt: "2026-06-13T22:50:05Z" });
    mockRedirect.mockResolvedValueOnce("https://wix.example/redirect");
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 2 }] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ redirectUrl: "https://wix.example/redirect", expiresAt: "2026-06-13T22:50:05Z" });
    expect(mockReserve).toHaveBeenCalledWith([{ ticketDefinitionId: "ga", quantity: 2 }]);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ reservationId: "res-1", eventSlug: "opening-night" }),
    );
  });

  it("502s when reservation fails", async () => {
    mockReserve.mockResolvedValueOnce(null);
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 1 }] }));
    expect(res.status).toBe(502);
  });

  it("502s when redirect session fails", async () => {
    mockReserve.mockResolvedValueOnce({ reservationId: "res-1", expiresAt: "x" });
    mockRedirect.mockResolvedValueOnce(null);
    const res = await POST(post({ eventSlug: "opening-night", lineItems: [{ ticketDefinitionId: "ga", quantity: 1 }] }));
    expect(res.status).toBe(502);
  });
});
