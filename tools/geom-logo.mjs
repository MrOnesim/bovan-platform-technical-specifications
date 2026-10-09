import { readFileSync } from "node:fs";
import jpeg from "jpeg-js";

const src = jpeg.decode(readFileSync("public/images/logo-OCD.jpeg"), { useTArray: true });
const { width: W, height: H, data } = src;

const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const isInk = (x, y) => {
  const [r, g, b] = px(x, y);
  return r > 170 && r - b > 55 && r - g > 35;
};

let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (isInk(x, y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

// Sample the gradient along the top of the mark.
console.log("GRADIENT (top edge row, every 60px):");
for (let x = minX; x <= maxX; x += 60) {
  for (let y = minY; y <= maxY; y++) {
    if (isInk(x, y)) {
      const [r, g, b] = px(x, y);
      const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
      console.log(`  x=${x} y=${y}  #${hex}`);
      break;
    }
  }
}

// Per-row extents to find each glyph's outer silhouette.
console.log("\nROW EXTENTS (first/last ink per row):");
for (let f = 0; f <= 1.0001; f += 1 / 20) {
  const y = Math.round(minY + (maxY - minY) * f);
  let a = null, b = null, n = 0;
  for (let x = minX; x <= maxX; x++)
    if (isInk(x, y)) {
      if (a === null) a = x;
      b = x;
      n++;
    }
  console.log(`  y=${y}  x ${a}..${b}  w=${b - a + 1}  ink=${n}`);
}

// Column extents, to locate the three glyph clusters.
console.log("\nCOLUMN DENSITY (columns with ink, 10px buckets):");
const cols = [];
for (let x = minX; x <= maxX; x++) {
  let n = 0;
  for (let y = minY; y <= maxY; y++) if (isInk(x, y)) n++;
  cols.push(n);
}
// Find contiguous groups of columns that carry ink -> glyph boundaries.
const groups = [];
let start = null;
for (let i = 0; i < cols.length; i++) {
  if (cols[i] > 0 && start === null) start = i;
  if (cols[i] === 0 && start !== null) {
    groups.push([minX + start, minX + i - 1]);
    start = null;
  }
}
if (start !== null) groups.push([minX + start, minX + cols.length - 1]);
console.log("  vertical ink bands:", groups.map((g) => `${g[0]}..${g[1]}(w${g[1] - g[0] + 1})`).join("  "));

// For each glyph band, find the vertical centre and the stroke runs.
console.log("\nGLYPH BANDS detail:");
for (const [gx0, gx1] of groups) {
  const w = gx1 - gx0 + 1;
  // vertical extent of this band
  let ty = null, by = null;
  for (let y = minY; y <= maxY; y++) {
    let any = false;
    for (let x = gx0; x <= gx1; x++) if (isInk(x, y)) { any = true; break; }
    if (any) { if (ty === null) ty = y; by = y; }
  }
  console.log(`  band x ${gx0}..${gx1} w=${w}  y ${ty}..${by} h=${by - ty + 1}`);
}

// Ring stroke width: sample a horizontal cut through the leftmost glyph.
console.log("\nLEFT GLYPH cuts (x, runs of ink):");
const cut = (y, x0, x1) => {
  const runs = [];
  let s = null;
  for (let x = x0; x <= x1; x++) {
    const ink = isInk(x, y);
    if (ink && s === null) s = x;
    if (!ink && s !== null) { runs.push(`${s}-${x - 1}(${x - s})`); s = null; }
  }
  if (s !== null) runs.push(`${s}-${x1}(${x1 - s + 1})`);
  return runs.join(" ");
};
for (const y of [420, 440, 460, 480, 500, 519, 540, 560, 580, 600, 620, 640, 660]) {
  console.log(`  y=${y}: ${cut(y, minX, maxX)}`);
}