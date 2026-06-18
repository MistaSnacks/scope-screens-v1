// Assembles the client-facing site-comparison HTML with embedded (base64) brand
// logo + marked-up screenshots. Self-contained single file, Scope Screenings brand.
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const WEB = "/Users/admin/SS/.shots/compare/web";
const OUT_DIR = "/Users/admin/SS/docs/reports";
mkdirSync(OUT_DIR, { recursive: true });

const b64 = (f, mime) => `data:${mime};base64,${readFileSync(`${WEB}/${f}`).toString("base64")}`;
const IMG = {
  logo: b64("logo.png", "image/png"),
  hero: b64("hero.jpg", "image/jpeg"),
  about: b64("about.jpg", "image/jpeg"),
  support: b64("support.jpg", "image/jpeg"),
  schedule: b64("schedule.jpg", "image/jpeg"),
  nav: b64("nav.jpg", "image/jpeg"),
};

// pin: {n, x, y, side} percentages; legend keyed by n
function figure(img, alt, pins, legend, caption) {
  const pinEls = pins.map(p =>
    `<span class="pin" style="left:${p.x}%;top:${p.y}%">${p.n}</span>`).join("");
  const legendEls = legend.map(l =>
    `<li><span class="pin-sm">${l.n}</span><div><b>${l.t}</b>${l.d ? `<span>${l.d}</span>` : ""}</div></li>`).join("");
  return `<figure class="shot">
  <div class="shot-frame"><img src="${img}" alt="${alt}" loading="lazy">${pinEls}</div>
  ${caption ? `<figcaption>${caption}</figcaption>` : ""}
  <ol class="legend">${legendEls}</ol>
</figure>`;
}

const heroFig = figure(IMG.hero, "Scope Screenings home — opening curtain and marquee title",
  [{ n: 1, x: 24, y: 3 }, { n: 2, x: 34, y: 27 }, { n: 3, x: 8, y: 55 }],
  [
    { n: 1, t: "Same menu, two behaviors.", d: "In Version A the menu glides you down to that part of the page. In Version B the same menu opens a separate page." },
    { n: 2, t: "All of this is yours to edit.", d: "In Version A every headline, photo and link is editable by you in the Wix dashboard — no developer needed." },
    { n: 3, t: "One shared identity.", d: "The velvet curtain, gold marquee title and rolling credits open both versions identically." },
  ],
  "The home screen — identical in both versions. The differences are in how the site is structured behind it.");

const aboutFig = figure(IMG.about, "About / What Is Scope Screenings section",
  [{ n: 1, x: 4, y: 24 }, { n: 2, x: 60, y: 30 }],
  [
    { n: 1, t: "Version A: a section you scroll past.", d: "A tight, high-impact summary of the festival lives inline on the one page." },
    { n: 2, t: "Version B: a full “About” page.", d: "The same intro expands into a dedicated /about page with the founder timeline, venues, and the full story." },
  ],
  "Every topic can live two ways: a scroll-section (Version A) or its own page (Version B).");

const supportFig = figure(IMG.support, "Support section — Become a Funder and Press & Media",
  [{ n: 1, x: 6, y: 34 }, { n: 2, x: 53, y: 34 }],
  [
    { n: 1, t: "Funders + Press, condensed.", d: "Version A folds giving and press into one focused section." },
    { n: 2, t: "Room to grow.", d: "Version B gives each its own space on a /support page — giving tiers, press kit, partners, and more." },
  ],
  "More to say about a topic? Version B has the room. Version A keeps it punchy.");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scope Screenings — Website Versions, Side by Side</title>
<style>
  :root{
    --ink:#161210; --ink-soft:#4a423b; --muted:#7a7167;
    --paper:#f7f3e6; --paper-2:#fffdf6; --card:#ffffff;
    --red:#e6180f; --red-deep:#7d120d; --gold:#ffbb00; --gold-deep:#a87a00;
    --line:rgba(22,18,16,.12); --line-soft:rgba(22,18,16,.07);
    --display:"Rockwell","Cooper Black",Georgia,"Times New Roman",serif;
    --body:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);
    font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1060px;margin:0 auto;padding:0 24px}
  a{color:var(--red);text-decoration:none}
  a:hover{text-decoration:underline}
  h1,h2,h3{font-family:var(--display);font-weight:700;letter-spacing:.005em;line-height:1.04;margin:0}
  .ey{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.28em;
    text-transform:uppercase;color:var(--red)}
  .lede{font-size:18px;color:var(--ink-soft);max-width:64ch}

  /* Header / cover */
  header.cover{background:
      radial-gradient(120% 120% at 80% -10%, rgba(230,24,15,.10), transparent 55%),
      linear-gradient(180deg,#100e0c,#1b1714);
    color:var(--paper);padding:34px 0 30px;border-bottom:4px solid var(--gold)}
  .cover .wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
  .cover img.logo{height:74px;width:auto;filter:drop-shadow(0 3px 10px rgba(0,0,0,.5))}
  .cover .ct{flex:1;min-width:280px}
  .cover .ey{color:var(--gold)}
  .cover h1{color:var(--paper);font-size:38px;margin:.18em 0 .12em;text-transform:uppercase;
    text-shadow:0 1px 0 var(--red-deep),0 2px 0 var(--red-deep)}
  .cover h1 b{color:var(--gold)}
  .cover .sub{color:#cfc6b6;font-size:15px}
  .cover .meta{margin-top:6px;font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;
    text-transform:uppercase;color:#9a9082}

  section{padding:46px 0}
  section + section{border-top:1px solid var(--line-soft)}
  h2.sec{font-size:27px;text-transform:uppercase}
  h2.sec .n{color:var(--red);font-size:16px;vertical-align:super;margin-right:.4em;font-family:var(--mono)}
  .sub-h{margin:.5em 0 1.4em;color:var(--muted);max-width:62ch}

  /* Two big version cards */
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  @media(max-width:820px){.pair{grid-template-columns:1fr}}
  .vcard{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 22px 20px;
    box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 10px 26px -20px rgba(22,18,16,.5)}
  .vcard .tag{display:inline-block;font-family:var(--mono);font-size:11px;font-weight:700;
    letter-spacing:.16em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:12px}
  .vcard.a .tag{background:rgba(230,24,15,.1);color:var(--red)}
  .vcard.b .tag{background:rgba(168,122,0,.16);color:var(--gold-deep)}
  .vcard h3{font-size:23px;text-transform:uppercase;margin-bottom:.2em}
  .vcard .one{font-size:14.5px;color:var(--muted);margin:.2em 0 14px}
  .vcard ul{margin:0;padding:0;list-style:none}
  .vcard li{position:relative;padding:7px 0 7px 24px;font-size:14.5px;border-top:1px solid var(--line-soft)}
  .vcard li:before{content:"";position:absolute;left:2px;top:14px;width:9px;height:9px;border-radius:50%}
  .vcard.a li:before{background:var(--red)}
  .vcard.b li:before{background:var(--gold)}
  .vcard .best{margin-top:14px;font-size:13.5px;background:var(--paper);border-radius:9px;padding:10px 12px;color:var(--ink-soft)}
  .vcard .best b{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);display:block;margin-bottom:3px}

  /* Comparison table */
  table{width:100%;border-collapse:collapse;font-size:14.5px;background:var(--card);
    border:1px solid var(--line);border-radius:12px;overflow:hidden}
  thead th{background:#1b1714;color:var(--paper);font-family:var(--mono);font-size:11px;
    letter-spacing:.14em;text-transform:uppercase;text-align:left;padding:12px 14px;font-weight:700}
  thead th.a{color:var(--gold)} thead th.b{color:#ffd9a8}
  tbody td{padding:12px 14px;border-top:1px solid var(--line);vertical-align:top}
  tbody td:first-child{font-weight:700;width:20%;color:var(--ink)}
  tbody tr:nth-child(even){background:#fbf8ee}
  td .dim{color:var(--muted);font-size:13px}
  .ck{color:var(--red);font-weight:700}

  /* Screenshots */
  .shot{margin:0 0 30px}
  .shot-frame{position:relative;border:1px solid var(--line);border-radius:12px;overflow:hidden;
    background:#100e0c;box-shadow:0 16px 40px -26px rgba(22,18,16,.7);line-height:0}
  .shot-frame img{width:100%;height:auto;display:block}
  .pin{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;
    background:var(--gold);color:#161210;font-family:var(--mono);font-weight:700;font-size:15px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 3px rgba(22,18,16,.85),0 2px 8px rgba(0,0,0,.5);z-index:3}
  figcaption{font-size:14px;color:var(--ink-soft);margin:12px 2px 10px;font-style:italic}
  ol.legend{list-style:none;margin:0;padding:0;display:grid;gap:10px;grid-template-columns:1fr 1fr}
  @media(max-width:760px){ol.legend{grid-template-columns:1fr}}
  ol.legend li{display:flex;gap:10px;align-items:flex-start;background:var(--card);
    border:1px solid var(--line);border-radius:10px;padding:11px 13px}
  .pin-sm{flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:var(--gold);
    color:#161210;font-family:var(--mono);font-weight:700;font-size:12px;
    display:flex;align-items:center;justify-content:center;margin-top:1px}
  ol.legend b{display:block;font-family:var(--body);font-size:14px}
  ol.legend span{display:block;color:var(--muted);font-size:13px;margin-top:2px}

  /* Possibility cards */
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  @media(max-width:820px){.grid3{grid-template-columns:1fr}}
  .pcard{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
  .pcard .ic{width:34px;height:34px;border-radius:9px;background:rgba(230,24,15,.1);color:var(--red);
    display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:19px;margin-bottom:10px}
  .pcard h3{font-size:16px;font-family:var(--body);font-weight:800;text-transform:none;margin-bottom:5px}
  .pcard p{margin:0;font-size:14px;color:var(--ink-soft)}

  .callout{background:linear-gradient(180deg,#1b1714,#100e0c);color:var(--paper);border-radius:14px;
    padding:24px 26px;border-left:5px solid var(--gold)}
  .callout h3{color:var(--gold);font-size:20px;text-transform:uppercase;margin-bottom:.4em}
  .callout p{margin:.4em 0;color:#d8cfbf;font-size:15px}
  .callout b{color:var(--paper)}

  footer.f{background:#100e0c;color:#cfc6b6;padding:26px 0;margin-top:8px;border-top:4px solid var(--red)}
  footer.f .wrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between}
  footer.f img{height:42px}
  footer.f .r{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;text-align:right}
  .diagram{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
  .diagram svg{width:100%;height:auto;display:block}
  @media print{
    header.cover,footer.f{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    section{padding:24px 0;break-inside:avoid}
    .shot,.vcard,.pcard,table{break-inside:avoid}
  }
</style>
</head>
<body>

<header class="cover">
  <div class="wrap">
    <img class="logo" src="${IMG.logo}" alt="Scope Screenings">
    <div class="ct">
      <div class="ey">Prepared for Scope Screenings</div>
      <h1>Your Website, <b>Two Ways</b></h1>
      <div class="sub">A side-by-side look at the two versions we built — what's different, and what's possible.</div>
      <div class="meta">Comparison brief · June 2026 · Single-Page vs Multi-Page</div>
    </div>
  </div>
</header>

<section><div class="wrap">
  <div class="ey">In one line</div>
  <h2 class="sec" style="margin-top:.3em">Same festival. Same look. Two ways to build it.</h2>
  <p class="lede">We built your site in two complete versions. They share the exact same brand,
  artwork, ticketing and schedule — the difference is <b>how the content is organized</b>.
  <b>Version A</b> puts everything on one cinematic, scrolling page that you can edit yourself.
  <b>Version B</b> splits it into focused, dedicated pages with room to go deeper. You can launch
  either one — and we can move pieces between them at any time.</p>
</div></section>

<section><div class="wrap">
  <h2 class="sec"><span class="n">01</span>The two versions at a glance</h2>
  <p class="sub-h">Pick the structure that fits how your audience uses the site. Nothing about the brand or the booking experience changes.</p>
  <div class="pair">
    <div class="vcard a">
      <span class="tag">Version A</span>
      <h3>The Single-Page Site</h3>
      <div class="one">One continuous, scrolling experience.</div>
      <ul>
        <li>Everything lives on one page — tickets, about, submit, schedule, support.</li>
        <li>The menu smooth-scrolls you to each part of the page.</li>
        <li><b>You edit it yourself</b> — words, photos and links update from the Wix dashboard.</li>
        <li>Feels like a movie trailer: momentum, story, one uninterrupted scroll.</li>
      </ul>
      <div class="best"><b>Best for</b>Launch buzz, storytelling, mobile scrolling, and a hands-on team that wants to update copy without a developer.</div>
    </div>
    <div class="vcard b">
      <span class="tag">Version B</span>
      <h3>The Multi-Page Site</h3>
      <div class="one">A landing page plus dedicated pages.</div>
      <ul>
        <li>Each topic gets its own page: Tickets, Schedule, Submit, About, Support.</li>
        <li>The menu loads a focused page for whatever a visitor wants.</li>
        <li>Room to go deep — founder timeline, venues, giving tiers, submission rounds.</li>
        <li>Cleaner web addresses for each topic (great for search & sharing).</li>
      </ul>
      <div class="best"><b>Best for</b>Search visibility, returning visitors hunting specifics, and topics that need a lot of detail on their own page.</div>
    </div>
  </div>
</div></section>

<section><div class="wrap">
  <h2 class="sec"><span class="n">02</span>How each one is built</h2>
  <p class="sub-h">The same sections, arranged two ways. The menu items are identical — only their destination changes.</p>
  <div class="diagram">
    <svg viewBox="0 0 920 300" preserveAspectRatio="xMidYMid meet" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <!-- Version A -->
      <text x="20" y="26" font-size="14" font-weight="700" fill="#e6180f">VERSION A — ONE PAGE</text>
      <rect x="20" y="40" width="150" height="44" rx="9" fill="#1b1714"/>
      <text x="95" y="67" text-anchor="middle" font-size="12" font-weight="700" fill="#ffbb00">MENU</text>
      <g font-size="11.5" fill="#161210">
        <rect x="210" y="40" width="210" height="34" rx="7" fill="#fffdf6" stroke="#d8cfbe"/><text x="224" y="61">Tickets</text>
        <rect x="210" y="80" width="210" height="34" rx="7" fill="#fffdf6" stroke="#d8cfbe"/><text x="224" y="101">About</text>
        <rect x="210" y="120" width="210" height="34" rx="7" fill="#fffdf6" stroke="#d8cfbe"/><text x="224" y="141">Submit</text>
        <rect x="210" y="160" width="210" height="34" rx="7" fill="#fffdf6" stroke="#d8cfbe"/><text x="224" y="181">Schedule</text>
        <rect x="210" y="200" width="210" height="34" rx="7" fill="#fffdf6" stroke="#d8cfbe"/><text x="224" y="221">Support</text>
      </g>
      <rect x="200" y="32" width="230" height="212" rx="11" fill="none" stroke="#e6180f" stroke-dasharray="5 4"/>
      <text x="315" y="262" text-anchor="middle" font-size="11" fill="#7a7167">All on one scrolling page</text>
      <path d="M172 62 C190 62, 190 57, 200 57" stroke="#7a7167" fill="none" marker-end="url(#ar)"/>
      <text x="186" y="34" text-anchor="middle" font-size="10.5" fill="#7a7167">scrolls ↓</text>
      <!-- divider -->
      <line x1="470" y1="40" x2="470" y2="250" stroke="#d8cfbe"/>
      <!-- Version B -->
      <text x="520" y="26" font-size="14" font-weight="700" fill="#a87a00">VERSION B — MANY PAGES</text>
      <rect x="520" y="40" width="150" height="44" rx="9" fill="#1b1714"/>
      <text x="595" y="67" text-anchor="middle" font-size="12" font-weight="700" fill="#ffbb00">MENU</text>
      <g font-size="11.5" fill="#161210">
        <rect x="710" y="40" width="190" height="34" rx="7" fill="#fff" stroke="#e7c98f"/><text x="724" y="61">/tickets</text>
        <rect x="710" y="80" width="190" height="34" rx="7" fill="#fff" stroke="#e7c98f"/><text x="724" y="101">/about</text>
        <rect x="710" y="120" width="190" height="34" rx="7" fill="#fff" stroke="#e7c98f"/><text x="724" y="141">/submit</text>
        <rect x="710" y="160" width="190" height="34" rx="7" fill="#fff" stroke="#e7c98f"/><text x="724" y="181">/schedule</text>
        <rect x="710" y="200" width="190" height="34" rx="7" fill="#fff" stroke="#e7c98f"/><text x="724" y="221">/support</text>
      </g>
      <g stroke="#7a7167" fill="none">
        <path d="M672 62 C690 62,692 57,710 57" marker-end="url(#ar)"/>
        <path d="M672 64 C690 80,694 97,710 97" marker-end="url(#ar)"/>
        <path d="M672 66 C690 110,694 137,710 137" marker-end="url(#ar)"/>
        <path d="M672 68 C690 140,694 177,710 177" marker-end="url(#ar)"/>
        <path d="M672 70 C690 170,694 217,710 217" marker-end="url(#ar)"/>
      </g>
      <text x="805" y="262" text-anchor="middle" font-size="11" fill="#7a7167">A separate page each</text>
      <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7a7167"/></marker></defs>
    </svg>
  </div>
</div></section>

<section><div class="wrap">
  <h2 class="sec"><span class="n">03</span>Side-by-side comparison</h2>
  <p class="sub-h">The practical differences, in plain terms.</p>
  <table>
    <thead><tr><th>What</th><th class="a">Version A — Single Page</th><th class="b">Version B — Multi-Page</th></tr></thead>
    <tbody>
      <tr><td>Structure</td><td>Everything on one scrolling page</td><td>A landing page + a page per topic</td></tr>
      <tr><td>The menu</td><td>Glides you to a section of the page</td><td>Opens a dedicated page</td></tr>
      <tr><td>First impression</td><td>One cinematic, uninterrupted scroll</td><td>A focused entry, then deep pages</td></tr>
      <tr><td>Content depth</td><td>Punchy highlights per section</td><td>Room to expand each topic fully <span class="dim">(timeline, venues, giving tiers…)</span></td></tr>
      <tr><td>Editing today</td><td><span class="ck">You edit it yourself</span> — copy, images &amp; links via Wix</td><td>Updated in code by us <span class="dim">(self-editing can be added)</span></td></tr>
      <tr><td>Search &amp; sharing</td><td>One web address</td><td>A clean address per topic <span class="dim">(stronger SEO)</span></td></tr>
      <tr><td>Pages</td><td>1 home <span class="dim">(+ privacy / terms)</span></td><td>~6 pages <span class="dim">(+ privacy / terms)</span></td></tr>
      <tr><td>Shared by both</td><td colspan="2" style="text-align:center;font-weight:700;color:var(--red)">Identical brand, artwork, components, ticketing &amp; live schedule (Wix)</td></tr>
    </tbody>
  </table>
</div></section>

<section><div class="wrap">
  <h2 class="sec"><span class="n">04</span>See the differences</h2>
  <p class="sub-h">The screens below are from the live site. The numbered pins call out where the two versions diverge. Where the design looks the same, it <i>is</i> the same — both versions share every component.</p>
  ${heroFig}
  ${aboutFig}
  ${supportFig}
</div></section>

<section><div class="wrap">
  <h2 class="sec"><span class="n">05</span>What's possible</h2>
  <p class="sub-h">You're not locked in. Both versions come from one shared codebase and one brand system, so we can mix, move, and grow.</p>
  <div class="grid3">
    <div class="pcard"><div class="ic">A/B</div><h3>Ship either version</h3><p>Both are complete and on-brand. Choose the one that fits your audience — we can go live with it as-is.</p></div>
    <div class="pcard"><div class="ic">⇄</div><h3>Port any component</h3><p>Any section — a ticket block, the founder band, the press kit — can be moved from one version into the other.</p></div>
    <div class="pcard"><div class="ic">✎</div><h3>Add self-editing anywhere</h3><p>The Wix "edit-it-yourself" layer lives in Version A today and can be extended to Version B's pages too.</p></div>
    <div class="pcard"><div class="ic">◑</div><h3>Go hybrid</h3><p>Keep the one-page home and add a few deep pages (e.g. a full Submit page) — the best of both.</p></div>
    <div class="pcard"><div class="ic">↗</div><h3>Start one, grow into the other</h3><p>Launch the single page now, expand into dedicated pages later. Same brand, no rebuild.</p></div>
    <div class="pcard"><div class="ic">🎟</div><h3>Booking stays put</h3><p>Tickets and the live schedule run through Wix in both versions — nothing to re-wire whichever you pick.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="callout">
    <h3>How to choose</h3>
    <p><b>Lean Version A</b> if you want a bold, scrolling launch page you can update yourself, and most visitors arrive to "feel" the festival and grab tickets.</p>
    <p><b>Lean Version B</b> if you expect people to come hunting for specifics (submission rules, schedule, sponsorship) and you want each topic to rank and share on its own.</p>
    <p style="margin-top:.8em">Still unsure? We can put both in front of a few people, or start with one and grow into the other. <b>There's no wrong door — and no rebuild to switch.</b></p>
  </div>
</div></section>

<footer class="f"><div class="wrap">
  <img src="${IMG.logo}" alt="Scope Screenings">
  <div class="r">Scope Screenings · Website comparison brief<br>Seattle's underground film festival · We put the fun back in film fests</div>
</div></footer>

</body>
</html>`;

const outPath = `${OUT_DIR}/2026-06-18-site-comparison.html`;
writeFileSync(outPath, html);
console.log("wrote", outPath, (html.length / 1024).toFixed(0) + "kb");
