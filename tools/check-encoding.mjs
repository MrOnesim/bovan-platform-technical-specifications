import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* Scans the source tree for the two failure modes seen in this project:
   1. mojibake  - a UTF-8 sequence decoded as cp1252: 2-byte starts Â/Ã,
                  3-byte starts â, 4-byte (emoji) starts ð
   2. U+FFFD    - a replacement character, i.e. a byte that was actually lost
   Reports count + first offending location per file. Exits non-zero on hit. */

const MOJIBAKE =
  /[\u00c2\u00c3][\u0080-\u00bf]|[\u00e2\u00f0][\u0080-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]/;
const REPLACEMENT = /�/;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|mjs|css)$/.test(p)) out.push(p);
  }
  return out;
}

let problems = 0;

for (const file of walk("src")) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (MOJIBAKE.test(line) || REPLACEMENT.test(line)) {
      const kind = REPLACEMENT.test(line) ? "LOST BYTE" : "MOJIBAKE";
      console.log(`${file}:${i + 1} [${kind}] ${line.trim().slice(0, 90)}`);
      problems++;
    }
  }
}

if (problems === 0) {
  console.log("OK - no encoding damage found in src/");
} else {
  console.log(`\n${problems} problem(s) found`);
  process.exitCode = 1;
}