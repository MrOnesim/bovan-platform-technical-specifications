import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(
  readFileSync("node_modules/world-atlas/countries-110m.json", "utf8")
);
const geo = feature(topo, topo.objects.countries);

console.log("total features:", geo.features.length);

// Africa bounding region (generous): lon -20..55, lat -38..38
const inAfrica = (f) => {
  const coords = [];
  const walk = (c) => {
    if (typeof c[0] === "number") coords.push(c);
    else c.forEach(walk);
  };
  (f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat())
    .forEach(walk);
  let any = false;
  for (const [lon, lat] of coords) {
    if (lon >= -20 && lon <= 55 && lat >= -38 && lat <= 38) any = true;
    if (any) break;
  }
  return any;
};

const africa = geo.features.filter(inAfrica);
console.log("africa-ish features:", africa.length);
console.log(
  africa
    .map((f) => `${f.id}:${f.properties?.name}`)
    .join("\n")
);