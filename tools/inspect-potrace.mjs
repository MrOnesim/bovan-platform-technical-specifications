import { readFileSync, writeFileSync } from "node:fs";
import { Potrace } from "potrace";
import { PNG } from "pngjs";

const { width, height } = PNG.sync.read(readFileSync("tools/.logo-mask.png"));
const t = new Potrace({
  turdSize: 10,
  alphaMax: 1.0,
  optCurve: true,
  optTolerance: 0.12,
});
const svg = await new Promise((res, rej) =>
  t.loadImage("tools/.logo-mask.png", (e) => (e ? rej(e) : res(t.getSVG())))
);

console.log("transform count:", (svg.match(/transform/g) || []).length);
console.log("<g> count:", (svg.match(/<g/g) || []).length);
console.log("fill values:", [...new Set(svg.match(/fill="[^"]*"/g) || [])]);
console.log("HEAD:", svg.slice(0, 300));
console.log("TAIL:", svg.slice(-300));
writeFileSync("tools/.potrace-raw.svg", svg);