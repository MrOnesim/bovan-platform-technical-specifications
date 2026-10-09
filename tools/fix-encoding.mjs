import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* Root cause: the bulk rewrite wrote these files through a latin-1 code page,
   so each UTF-8 byte pair became two latin-1 characters. "ô" (C3 B4) became
   U+00C3 U+00B4. Nothing was lost - decoding those pairs as UTF-8 restores
   the original character.
   Only the mangled PAIRS are touched, so accents that were already correct
   (a single U+00E9 etc.) are left alone. */

const PAIR = /[ÂÃ][-¿]/g;

function decodePair(match) {
  return Buffer.from(match, "latin1").toString("utf8");
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|mjs|css)$/.test(p)) out.push(p);
  }
  return out;
}

let totalSeq = 0;
for (const file of walk("src")) {
  const text = readFileSync(file, "utf8");
  const hits = text.match(PAIR);
  if (!hits) continue;

  const fixed = text.replace(PAIR, decodePair);
  if (fixed.includes("�")) {
    console.log(`SKIP  ${file} - decoding produced replacement chars`);
    continue;
  }

  writeFileSync(file, fixed, "utf8");
  totalSeq += hits.length;
  console.log(`fixed ${file}  (${hits.length})`);
}
console.log(`\n${totalSeq} sequences repaired`);