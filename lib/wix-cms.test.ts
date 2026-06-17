import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./wix-token", () => ({ getVisitorToken: vi.fn(async () => "tok") }));
import { getVisitorToken } from "./wix-token";
import { queryCollection, getSingleton } from "./wix-cms";

describe("queryCollection", () => {
  beforeEach(() => { process.env.WIX_CLIENT_ID = "c"; vi.mocked(getVisitorToken).mockResolvedValue("tok"); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("maps dataItems[].data to an array", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ dataItems: [{ data: { a: 1 } }, { data: { a: 2 } }] }),
    })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it("returns null on empty result", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ dataItems: [] }) })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toBeNull();
  });

  it("returns null on non-ok / token miss / throw", async () => {
    vi.mocked(getVisitorToken).mockResolvedValueOnce(null);
    expect(await queryCollection("X")).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })) as unknown as typeof fetch);
    expect(await queryCollection("X")).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.mocked(getVisitorToken).mockResolvedValue("tok");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }) as unknown as typeof fetch);
    expect(await queryCollection("X")).toBeNull();
  });

  it("getSingleton returns first item or null", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ dataItems: [{ data: { a: 9 } }] }) })) as unknown as typeof fetch);
    expect(await getSingleton("X")).toEqual({ a: 9 });
  });
});
