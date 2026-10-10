export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*unicornstudio*", (r) => r.abort());
  await page.route("**/assets.unicorn.studio/**", (r) => r.abort());
  await page.goto("http://localhost:3000/", { waitUntil: "load" });
  await page.waitForTimeout(3000);

  return await page.evaluate(() => {
    const res = performance.getEntriesByType("resource");
    const byType = {};
    res.forEach((r) => {
      const t = r.initiatorType;
      const kb = (r.transferSize || r.encodedBodySize || 0) / 1024;
      byType[t] = byType[t] || { kb: 0, n: 0 };
      byType[t].kb += kb;
      byType[t].n++;
    });

    const biggest = res
      .map((r) => ({
        url: r.name.replace("http://localhost:3000", "").slice(0, 70),
        type: r.initiatorType,
        kb: Math.round((r.transferSize || r.encodedBodySize || 0) / 1024),
      }))
      .sort((a, b) => b.kb - a.kb)
      .slice(0, 12);

    return {
      byType: Object.entries(byType)
        .map(([k, v]) => ({ type: k, kb: Math.round(v.kb), n: v.n }))
        .sort((a, b) => b.kb - a.kb),
      biggest,
    };
  });
}