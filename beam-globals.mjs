export default async function run(page, ui) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));

  const res = await page.evaluate(async () => {
    const res = await fetch("https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js");
    const code = await res.text();
    let threw = null;
    try {
      // eslint-disable-next-line no-new-func
      new Function(code).call(window);
    } catch (e) {
      threw = String(e && e.message ? e.message : e);
    }
    const US = window.UnicornStudio;
    return {
      httpStatus: res.status,
      codeLen: code.length,
      threwDuringExec: threw,
      globalAfterExec: typeof US,
      globalKeys: US ? Object.keys(US) : null,
    };
  });

  return { ...res, pageErrors: errors };
}