import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

const src = jpeg.decode(readFileSync("public/images/logo-OCD.jpeg"), {
  useTArray: true,
});
const { width: W, height: H, data } = src;

// Locate the orange mark: saturated orange, excluding the near-white paper.
const isInk = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  return r > 200 && g < 200 && b < 150 && r - b > 70;
};

let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!isInk((y * W + x) * 4)) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}
console.log(`mark bbox: x ${minX}..${maxX} y ${minY}..${maxY}`);

// Pad by a couple of pixels so antialiased edges are not clipped.
const pad = 2;
minX -= pad; minY -= pad; maxX += pad; maxY += pad;
const cw = maxX - minX, ch = maxY - minY;

// Square canvas: the mark is centred by extending the *source* window
// beyond the bbox on its short axis, never by moving the crop origin.
const side = Math.max(cw, ch);
const sqOx = minX - Math.floor((side - cw) / 2);
const sqOy = minY - Math.floor((side - ch) / 2);
console.log(`crop ${cw}x${ch}; square ${side}x${side} from ${sqOx},${sqOy}`);

// Build a square RGBA canvas, keeping the mark and dropping the white paper.
const out = new PNG({ width: side, height: side });
for (let y = 0; y < side; y++) {
  for (let x = 0; x < side; x++) {
    const sx = sqOx + x, sy = sqOy + y;
    const o = (y * side + x) * 4;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) {
      out.data[o + 3] = 0;
      continue;
    }
    const si = (sy * W + sx) * 4;
    const r = data[si], g = data[si + 1], b = data[si + 2];

    if (isInk(si)) {
      out.data[o] = r;
      out.data[o + 1] = g;
      out.data[o + 2] = b;
      out.data[o + 3] = 255;
      continue;
    }

    // Feathered edge: treat near-white as partially transparent so the
    // JPEG's ringing does not leave a pale halo on dark surfaces.
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 250) {
      out.data[o + 3] = 0;
    } else if (lum > 225) {
      const a = Math.round(255 * (250 - lum) / 25);
      out.data[o] = r;
      out.data[o + 1] = g;
      out.data[o + 2] = b;
      out.data[o + 3] = a;
    } else {
      out.data[o] = r;
      out.data[o + 1] = g;
      out.data[o + 2] = b;
      out.data[o + 3] = 255;
    }
  }
}
writeFileSync("logo-mark.png", PNG.sync.write(out));
console.log("wrote logo-mark.png", side, "x", side);

// Also a wide lockup (mark only, aspect preserved) for inline use.
const wide = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((minY + y) * W + (minX + x)) * 4;
    const o = (y * cw + x) * 4;
    const r = data[si], g = data[si + 1], b = data[si + 2];
    if (isInk(si)) {
      out.data; // no-op
      wide.data[o] = r; wide.data[o + 1] = g; wide.data[o + 2] = b; wide.data[o + 3] = 255;
      continue;
    }
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 250) { wide.data[o + 3] = 0; continue; }
    const a = lum > 225 ? Math.round(255 * (250 - lum) / 25) : 255;
    wide.data[o] = r; wide.data[o + 1] = g; wide.data[o + 2] = b; wide.data[o + 3] = a;
  }
}
writeFileSync("logo-mark-wide.png", PNG.sync.write(wide));
console.log("wrote logo-mark-wide.png", cw, "x", ch);