// scripts/px-to-rem.mjs
// Converts Tailwind arbitrary `[<n>px]` utilities to `[<n/16>rem]`.
// Pure string transform — no filesystem access (so it is unit-testable).
//
// Matches ONLY the simple form `<prefix>[<number>px]`, identical to the audit
// grep `\[[0-9]+px\]`. Compound values (`shadow-[0_20px_…]`, `[calc(…px)]`)
// start with a non-digit after `[` and are never matched.
//
// Skips (keeps px): border/ring/outline widths, and values <= 2px (hairlines),
// so thin lines stay crisp and do not scale.

const TOKEN = /([\w:./-]*)\[(\d+(?:\.\d+)?)px\]/g;

export function convertClassNamePx(source) {
  let count = 0;
  const skipped = [];
  const out = source.replace(TOKEN, (match, prefix, numStr) => {
    const px = parseFloat(numStr);
    if (/border|ring|outline/.test(prefix) || px <= 2) {
      skipped.push(match);
      return match;
    }
    // x/16 has at most 5 decimal places (e.g. 6.5/16 = 0.40625); toFixed(5)
    // is exact, and unary + trims trailing zeros (56/16 → 3.5).
    const rem = +(px / 16).toFixed(5);
    count += 1;
    return `${prefix}[${rem}rem]`;
  });
  return { out, count, skipped };
}
