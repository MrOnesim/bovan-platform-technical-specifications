export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(320);
  }
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    document.querySelector("svg.africa-map")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(800);

  const bg = await page.evaluate(() => {
    const svg = document.querySelector("svg.africa-map");
    const card = svg?.closest("div[class*='rounded-3xl']");
    const paths = document.querySelectorAll(".africa-country");
    const first = paths[0];
    return {
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
      auroraPresent: document.querySelectorAll(".aurora-mesh").length,
      mapPaths: paths.length,
      firstStroke: first ? getComputedStyle(first).stroke : null,
      firstFill: first ? getComputedStyle(first).fill : null,
    };
  });

  await page.screenshot({
    path: "C:\\Users\\L390YO~1\\AppData\\Local\\Temp\\opencode\\map-black.png",
    clip: await page.evaluate(() => {
      const r = document.querySelector("svg.africa-map")?.getBoundingClientRect();
      return { x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 40), width: Math.min(1440, r.width + 80), height: Math.min(900, r.height + 80) };
    }),
  });

  return bg;
}