// scripts/px-to-rem.run.mjs
// Walks app/ and components/ and applies convertClassNamePx in place.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { convertClassNamePx } from "./px-to-rem.mjs";

const ROOTS = ["app", "components"];
const EXT = /\.tsx?$/;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (EXT.test(name)) acc.push(p);
  }
  return acc;
}

let total = 0;
const allSkipped = [];
for (const file of ROOTS.flatMap((r) => walk(r))) {
  const src = readFileSync(file, "utf8");
  const { out, count, skipped } = convertClassNamePx(src);
  allSkipped.push(...skipped);
  if (count > 0) {
    writeFileSync(file, out);
    console.log(`${file}: ${count}`);
  }
  total += count;
}
console.log(`\nTotal converted: ${total}`);
console.log(`Kept px: ${[...new Set(allSkipped)].sort().join(", ") || "(none)"}`);
