import { readFileSync, writeFileSync } from "node:fs";
import { Potrace } from "potrace";
import { PNG } from "pngjs";

// potrace bundles its own Jimp, so hand it the file path rather than an
// image object built by a different Jimp version.
const MASK = "tools/.logo-mask.png";
const { width: maskW, height: maskH } = PNG.sync.read(readFileSync(MASK));
console.log(`tracing ${MASK} (${maskW}x${maskH})`);

const tracer = new Potrace({
  turdSize: 4,
  alphamax: 0.8,
  opticurve: true,
  opttolerance: 0.2,
  fillrule: "evenodd",
});

const svg = await new Promise((resolve, reject) => {
  tracer.loadImage(MASK, (err) => (err ? reject(err) : resolve(tracer.getSVG())));
});

const paths = svg.match(/<path[^>]*>/g) || [];
console.log("paths:", paths.length);
console.log("svg bytes:", svg.length);

// Extract every path's d attribute, and normalise colour to the gradient.
const ds = paths
  .map((p) => {
    const m = p.match(/\sd="([^"]+)"/);
    return m ? m[1] : null;
  })
  .filter(Boolean);
console.log("d attrs:", ds.length, "total chars:", ds.reduce((a, b) => a + b.length, 0));

const w = maskW;
const h = maskH;
const dAll = ds.join(" ");

const defs = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.3">
<stop offset="0" stop-color="#f26904"/><stop offset="0.5" stop-color="#e56205"/><stop offset="1" stop-color="#c2500a"/></linearGradient></defs>`;

writeFileSync(
  "public/brand/logo-mark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="OCD">${defs}<path fill="url(#g)" fill-rule="evenodd" d="${dAll}"/></svg>`
);
console.log("wrote public/brand/logo-mark.svg");

const side = Math.ceil(Math.max(w, h) * 1.06);
const tx = ((side - w) / 2).toFixed(2);
const ty = ((side - h) / 2).toFixed(2);
writeFileSync(
  "src/app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}" role="img" aria-label="OCD">${defs}<g transform="translate(${tx} ${ty})"><path fill="url(#g)" fill-rule="evenodd" d="${dAll}"/></g></svg>`
);
console.log("wrote src/app/icon.svg", side);