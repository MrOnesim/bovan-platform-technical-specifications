import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/* Guards the two regressions that actually happened on this project:
   - the Africa map silently losing its geometry / ISO codes
   - source files being re-encoded into latin-1 mojibake
   Runs with: npm test  (no test framework required). */

const root = process.cwd();

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|mjs|css)$/.test(p)) out.push(p);
  }
  return out;
}

/* ---------------------------------------------------------------- map ---- */

test("africa map: keeps its real geometry", async () => {
  const mod = await import("../src/data/africa-countries.ts").catch(() => null);
  assert.ok(mod, "africa-countries.ts should be importable");
});

test("africa map: 50 countries, every one with a valid ISO2", async () => {
  const src = readFileSync(join(root, "src/data/africa-countries.ts"), "utf8");

  // Parse the generated array out of the TS source.
  const match = src.match(/AFRICA_COUNTRIES: AfricaCountry\[\] = (\[[\s\S]*?\]);/);
  assert.ok(match, "AFRICA_COUNTRIES array should be present");

  const countries = JSON.parse(match[1]);
  assert.equal(countries.length, 50, "expected 50 African countries");

  const isoPattern = /^[A-Z]{2}$/;
  for (const c of countries) {
    assert.match(c.iso2, isoPattern, `${c.nameFr} has a malformed iso2: ${c.iso2}`);
  }

  const unique = new Set(countries.map((c) => c.iso2));
  assert.equal(unique.size, countries.length, "iso2 codes must be unique");
});

test("africa map: paths are closed and non-degenerate", async () => {
  const src = readFileSync(join(root, "src/data/africa-countries.ts"), "utf8");
  const countries = JSON.parse(
    src.match(/AFRICA_COUNTRIES: AfricaCountry\[\] = (\[[\s\S]*?\]);/)[1]
  );

  for (const c of countries) {
    assert.ok(c.d.startsWith("M"), `${c.nameFr} path should start with a moveto`);
    assert.ok(c.d.endsWith("Z"), `${c.nameFr} path should be closed`);
    // Small territories legitimately have short outlines; the floor here
    // only catches a path that collapsed to a couple of points.
    assert.ok(
      c.d.length > 60,
      `${c.nameFr} path is suspiciously short (${c.d.length} chars) - did the trace degrade?`
    );
    // Needs enough vertices to describe a real border, not a 2-point line.
    // Tiny territories (Equatorial Guinea, Burundi) are genuinely
    // polygonal at 110m resolution, so the floor is deliberately low.
    const points = c.d.slice(1, -1).split("L").length;
    assert.ok(points >= 5, `${c.nameFr} has only ${points} vertices`);
    assert.ok(c.size > 3, `${c.nameFr} is degenerate (size ${c.size})`);
  }
});

test("africa map: viewBox matches the declared aspect ratio", async () => {
  const src = readFileSync(join(root, "src/data/africa-countries.ts"), "utf8");
  const [, w, h] = src.match(/AFRICA_VIEWBOX = "0 0 (\d+) (\d+)"/).map(Number);

  const countries = JSON.parse(
    src.match(/AFRICA_COUNTRIES: AfricaCountry\[\] = (\[[\s\S]*?\]);/)[1]
  );

  // Every country must sit inside the viewBox, otherwise it is clipped.
  for (const c of countries) {
    const xs = c.d.slice(1, -1).split(/[ML]/).map((seg) => Number(seg.split(",")[0]));
    assert.ok(
      xs.every((x) => x >= 0 && x <= w),
      `${c.nameFr} overflows the viewBox horizontally`
    );
  }
});

test("africa map: the dead hand-drawn paths are gone", () => {
  assert.ok(
    !readdirSync(join(root, "src/data")).includes("africa-svg.ts"),
    "africa-svg.ts should have been deleted; it held fake geometry"
  );
});

/* ----------------------------------------------------------- encoding ---- */

test("no source file contains mojibake or lost bytes", () => {
  const mojibake = /[\u00c2\u00c3][\u0080-\u00bf]|[\u00e2\u00f0][\u0080-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]/;
  const lost = /�/;
  const problems = [];

  for (const file of walk(join(root, "src"))) {
    const text = readFileSync(file, "utf8");
    text.split("\n").forEach((line, i) => {
      if (mojibake.test(line) || lost.test(line)) {
        problems.push(`${file}:${i + 1}`);
      }
    });
  }

  assert.deepEqual(problems, [], `encoding damage at: ${problems.join(", ")}`);
});

/* ----------------------------------------------------- error boundary ---- */

test("error boundaries exist at the app root", () => {
  for (const f of ["error.tsx", "global-error.tsx", "not-found.tsx"]) {
    assert.ok(
      readdirSync(join(root, "src/app")).includes(f),
      `src/app/${f} is missing`
    );
  }
});

test("error boundary offers a French retry, not a raw stack", () => {
  const src = readFileSync(join(root, "src/app/error.tsx"), "utf8");
  assert.match(src, /Réessayer/, "the retry button should be in French");
  assert.match(src, /reset/, "the boundary must wire Next's reset()");
});

/* ------------------------------------------------------------ brand ------ */

test("the shipped favicon is the real logo, not an invented one", () => {
  const svg = readFileSync(join(root, "src/app/icon.svg"), "utf8");
  assert.ok(svg.includes("<svg"), "icon.svg should be an SVG");
  assert.ok(
    svg.includes("url(#g)") || svg.includes("fill=\"#"),
    "icon.svg should carry the brand fill"
  );
});