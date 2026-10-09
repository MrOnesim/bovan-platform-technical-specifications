import { readFileSync } from "node:fs";
import jpeg from "jpeg-js";

const src = jpeg.decode(readFileSync("public/images/logo-OCD.jpeg"), { useTArray: true });
const { width: W, height: H, data } = src;

const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};

// Orange ink = strongly red-dominant, mid brightness.
const isInk = (x, y) => {
  const [r, g, b] = px(x, y);
  return r > 170 && r - b > 55 && r - g > 35;
};

// Exact ink bbox
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (isInk(x, y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
console.log(`BBOX  x:${minX}..${maxX}  y:${minY}..${maxY}  w:${maxX - minX + 1} h:${maxY - minY + 1}`);
console.log(`aspect ${((maxX - minX + 1) / (maxY - minY + 1)).toFixed(3)}`);

// Scanline runs at the vertical centre and at the extremes, to find the
// ring geometry (outer/inner radii of each letterform).
const rowRuns = (y) => {
  const runs = [];
  let start = null;
  for (let x = minX; x <= maxX; x++) {
    const ink = isInk(x, y);
    if (ink && start === null) start = x;
    if (!ink && start !== null) {
      runs.push([start, x - 1]);
      start = null;
    }
  }
  if (start !== null) runs.push([start, maxX]);
  return runs;
};

const midY = Math.round((minY + maxY) / 2);
console.log(`\nROW y=${midY} (vertical centre):`);
console.log("  " + rowRuns(midY).map(([a, b]) => `${a}-${b}`).join("  "));

for (const f of [0.15, 0.3, 0.7, 0.85]) {
  const y = Math.round(minY + (maxY - minY) * f);
  console.log(`ROW y=${y} (${(f * 100).toFixed(0)}% down):`);
  console.log("  " + rowRuns(y).map(([a, b]) => `${a}-${b}`).join("  "));
}

const colRuns = (x) => {
  const runs = [];
  let start = null;
  for (let y = minY; y <= maxY; y++) {
    const ink = isInk(x, y);
    if (ink && start === null) start = y;
    if (!ink && start !== null) {
      runs.push([start, y - 1]);
      start = null;
    }
  }
  if (start !== null) runs.push([start, maxY]);
  return runs;
};

const midX = Math.round((minX + maxX) / 2);
console.log(`\nCOL x=${midX} (horizontal centre):`);
console.log("  " + colRuns(midX).map(([a, b]) => `${a}-${b}`).join("  "));

// Palette inside the mark: quantise and count.
const buckets = new Map();
for (let y = minY; y <= maxY; y++)
  for (let x = minX; x <= maxX; x++) {
    if (!isInk(x, y)) continue;
    const [r, g, b] = px(x, y);
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    buckets.set(key, e);
  }
const top = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 8);
console.log("\nTOP INK COLOURS:");
for (const e of top) {
  const r = Math.round(e.r / e.n), g = Math.round(e.g / e.n), b = Math.round(e.b / e.n);
  console.log(
    `  rgb(${r},${g},${b})  #${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}  x${e.n}`
  );
}

// Left edge of first form at centre row => where each glyph starts.
const runs = rowRuns(midY);
console.log(`\nCentre-row ink segments: ${runs.length}`);
runs.forEach((r, i) => console.log(`  [${i}] x ${r[0]}..${r[1]}  w=${r[1] - r[0] + 1}`));