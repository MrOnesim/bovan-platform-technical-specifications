export default async function run(page, ui) {
  async function measure(label, blockBeam) {
    if (blockBeam) {
      await page.route("**/*unicornstudio*", (r) => r.abort());
    } else {
      await page.unroute("**/*unicornstudio*");
    }

    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Performance.enable", { timeDomain: "systime" });
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });

    let transfer = 0;
    let count = 0;
    const byType = {};
    page.on("response", async (res) => {
      count++;
      try {
        const h = await res.allHeaders();
        const size = Number(h["content-length"] || 0);
        transfer += size;
        const t = res.request().resourceType();
        byType[t] = (byType[t] || 0) + size;
      } catch {}
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/", { waitUntil: "load" });
    await page.waitForTimeout(4000);

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] || {};
      const paints = {};
      performance.getEntriesByType("paint").forEach((p) => {
        paints[p.name] = Math.round(p.startTime);
      });
      const res = performance.getEntriesByType("resource");
      return {
        ttfb: Math.round(nav.responseStart || 0),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        loadEvent: Math.round(nav.loadEventEnd || 0),
        transferEncoded: Math.round(nav.transferSize || 0),
        fcp: paints["first-contentful-paint"] || null,
        requests: res.length + 1,
        // Long tasks block the main thread and are the usual cause of jank.
        longTasks: performance
          .getEntriesByType("longtask")
          .map((t) => Math.round(t.duration)),
        domNodes: document.querySelectorAll("*").length,
      };
    });

    return {
      label,
      ...timing,
      totalBytes: Math.round(transfer / 1024) + " KB",
      largest: Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, v]) => `${k}: ${Math.round(v / 1024)}KB`),
    };
  }

  const withBeam = await measure("avec beam", false);
  const withoutBeam = await measure("sans beam", true);
  return { withBeam, withoutBeam };
}