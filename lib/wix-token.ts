// Anonymous OAuth visitor token for headless reads. Same grant the live
// schedule already uses (lib/wix-events.ts); extracted so the CMS reader can
// share it. Returns null on any failure so callers fall back to static data.

export async function getVisitorToken(): Promise<string | null> {
  const clientId = process.env.WIX_CLIENT_ID;
  if (!clientId) return null;
  try {
    const res = await fetch("https://www.wixapis.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, grantType: "anonymous" }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token ?? null;
  } catch {
    return null;
  }
}
