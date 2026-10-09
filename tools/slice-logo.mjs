import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

// Render a zoomed crop so the interlocking detail can be inspected closely.
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

const ZOOM = 3;
// Three vertical slices across the mark so each ring is legible.
const slices = [
  { name: "a-left", x0: minX, x1: minX + 300 },
  { name: "b-mid", x0: minX + 280, x1: minX + 580 },
  { name: "c-right", x0: maxX - 300, x1: maxX },
];

for (const s of slices) {
  const cw = s.x1 - s.x0, ch = maxY - minY;
  const out = new PNG({ width: cw * ZOOM, height: ch * ZOOM });
  for (let y = 0; y < ch * ZOOM; y++) {
    for (let x = 0; x < cw * ZOOM; x++) {
      const sx = s.x0 + Math.floor(x / ZOOM);
      const sy = minY + Math.floor(y / ZOOM);
      const o = (y * cw * ZOOM + x) * 4;
      const ink = isInk(sx, sy);
      const v = ink ? 0 : 255;
      out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
      out.data[o + 3] = 255;
    }
  }
  writeFileSync(`tools/.slice-${s.name}.png`, PNG.sync.write(out));
  console.log(`${s.name}: ${cw}x${ch} -> ${cw * ZOOM}x${ch * ZOOM}`);
}
console.log("mark origin:", minX, minY, "size:", maxX - minX + 1, maxY - minY + 1);