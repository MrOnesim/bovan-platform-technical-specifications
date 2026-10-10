export default async function run(page, ui) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    await page.goto("http://localhost:3000/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const t = await page.evaluate(() => {
      const n = performance.getEntriesByType("navigation")[0] || {};
      const fcp = performance.getEntriesByType("paint").find((p) => p.name === "first-contentful-paint");
      const res = performance.getEntriesByType("resource");
      return {
        ttfb: Math.round(n.responseStart || 0),
        fcp: fcp ? Math.round(fcp.startTime) : null,
        load: Math.round(n.loadEventEnd || 0),
        totalKb: Math.round(res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) / 1024),
      };
    });
    runs.push(t);
  }

  // Does the beam eventually mount after idle?
  await page.waitForTimeout(6000);
  const beam = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("canvas").length,
    beamNode: document.querySelectorAll("[data-us-project]").length,
  }));

  const med = (k) => {
    const v = runs.map((r) => r[k]).filter((x) => x != null).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };

  return {
    median: { ttfb: med("ttfb"), fcp: med("fcp"), load: med("load"), totalKb: med("totalKb") },
    runs,
    beamAfterIdle: beam,
  };
}