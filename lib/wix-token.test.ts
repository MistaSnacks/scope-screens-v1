import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getVisitorToken } from "./wix-token";

describe("getVisitorToken", () => {
  beforeEach(() => { process.env.WIX_CLIENT_ID = "test-client"; });
  afterEach(() => { vi.restoreAllMocks(); });

  it("returns the access_token on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, json: async () => ({ access_token: "tok_123" }),
    })) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBe("tok_123");
  });

  it("returns null on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }) as unknown as typeof fetch);
    expect(await getVisitorToken()).toBeNull();
  });
});
