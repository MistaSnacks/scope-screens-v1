// Generic reader for Wix Data collections via the headless visitor token.
// Mirrors the fail-safe contract of lib/wix-events.ts: any miss returns null
// so callers fall back to lib/festival.ts. Reads are cached hourly.
import { getVisitorToken } from "./wix-token";

const QUERY_URL = "https://www.wixapis.com/wix-data/v2/items/query";

export async function queryCollection<T>(
  dataCollectionId: string,
  opts?: { sort?: { fieldName: string; order: "ASC" | "DESC" }[] },
): Promise<T[] | null> {
  try {
    const token = await getVisitorToken();
    if (!token) return null;
    const res = await fetch(QUERY_URL, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        dataCollectionId,
        query: { sort: opts?.sort, paging: { limit: 100 } },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { dataItems?: { data?: T }[] };
    const items = (json.dataItems ?? [])
      .map((d) => d.data)
      .filter((d): d is T => Boolean(d));
    return items.length ? items : null;
  } catch {
    return null;
  }
}

export async function getSingleton<T>(dataCollectionId: string): Promise<T | null> {
  const items = await queryCollection<T>(dataCollectionId);
  return items?.[0] ?? null;
}
