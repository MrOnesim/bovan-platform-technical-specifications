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

// Mark bounds
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (isInk(x, y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
console.log(`mark: x ${minX}..${maxX} w ${maxX - minX + 1} | y ${minY}..${maxY} h ${maxY - minY + 1}`);

const midY = Math.round((minY + maxY) / 2);
console.log(`\nvertical centre y=${midY}, mark height ${maxY - minY + 1}`);

// Find the hole (counter) of the leftmost ring along the centre row:
// ink | hole | ink  => outer-left, inner-left, inner-right
const runs = [];
let s = null;
for (let x = minX; x <= maxX; x++) {
  const ink = isInk(x, midY);
  if (ink && s === null) s = x;
  if (!ink && s !== null) {
    runs.push([s, x - 1]);
    s = null;
  }
}
if (s !== null) runs.push([s, maxX]);
console.log("centre-row runs:", runs.map(([a, b]) => `${a}-${b}(w${b - a + 1})`).join(" "));

// Outer silhouette: leftmost ink per row tells us each ring's outer arc.
console.log("\nLEFT SILHOUETTE (ring 1 outer edge):");
for (let f = 0.25; f <= 0.76; f += 0.08) {
  const y = Math.round(minY + (maxY - minY) * f);
  let a = null;
  for (let x = minX; x <= maxX; x++) if (isInk(x, y)) { a = x; break; }
  console.log(`  y=${y} (dy=${y - midY}) firstInkX=${a}`);
}

// Top silhouette of the first ring: first ink per column, left third only
console.log("\nRING1 outer profile (x, topmost ink y):");
const ring1x1 = minX, ring1x2 = minX + 300;
for (let x = ring1x1; x <= ring1x2; x += 15) {
  let t = null;
  for (let y = minY; y <= maxY; y++) if (isInk(x, y)) { t = y; break; }
  console.log(`  x=${x} top=${t}`);
}

// Stroke width of ring 1 measured across its left limb
console.log("\nRING1 limb width by row:");
for (const y of [400, 440, 480, midY, 560, 600, 640]) {
  let a = null, b = null;
  for (let x = minX; x < minX + 260; x++) {
    if (isInk(x, y)) {
      if (a === null) a = x;
      b = x;
    }
  }
  console.log(`  y=${y}: ${a}..${b} w=${b - a + 1}`);
}

// Rightmost ring outer profile
console.log("\nRING3 outer profile (x, topmost ink y):");
for (let x = maxX - 300; x <= maxX; x += 15) {
  let t = null;
  for (let y = minY; y <= maxY; y++) if (isInk(x, y)) { t = y; break; }
  console.log(`  x=${x} top=${t}`);
}

// Bottom silhouette to get each ring's lowest point
console.log("\nBOTTOM profile (x, lowest ink y):");
for (let x = minX; x <= maxX; x += 30) {
  let b = null;
  for (let y = maxY; y >= minY; y--) if (isInk(x, y)) { b = y; break; }
  console.log(`  x=${x} bottom=${b}`);
}