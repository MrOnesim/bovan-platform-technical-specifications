import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

// Renders the logo's alpha as black-on-white so potrace can vectorise it.
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

const pad = 6;
minX -= pad; minY -= pad; maxX += pad; maxY += pad;
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;

const out = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const o = (y * cw + x) * 4;
    const sx = minX + x, sy = minY + y;
    const ink = sx >= 0 && sy >= 0 && sx < W && sy < H && isInk(sx, sy);
    const v = ink ? 0 : 255; // black = ink for potrace
    out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
    out.data[o + 3] = 255;
  }
}
const fs = await import("node:fs");
fs.writeFileSync("tools/.logo-mask.png", PNG.sync.write(out));
console.log(`mask ${cw}x${ch} written`);