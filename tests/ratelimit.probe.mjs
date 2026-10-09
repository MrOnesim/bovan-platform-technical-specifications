const BASE = "http://localhost:3111";
const PW = "password123";

async function login(email, password = PW, ip) {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      // Distinct IP per simulated client so the per-IP bucket does not
      // interfere with what we are trying to measure.
      ...(ip ? { "x-forwarded-for": ip } : {}),
    },
    body: JSON.stringify({ email, password }),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, retryAfter: res.headers.get("retry-after") };
}

const results = [];
const check = (n, p, d = "") => results.push({ n, p, d });

/* The throttle lives in the server's memory and survives between runs, so
   every simulated client needs an address that has never been used before.
   Otherwise a second run finds the flood IP already blocked. */
const NOVELTY = process.pid;
const IP = `198.18.${Math.floor(NOVELTY / 250) % 250}.${NOVELTY % 250}`;
const floodIp = () => `198.18.7.${(NOVELTY + 1) % 250}`;

/* 1. A correct password still works after the code change */
{
  const ok = await login("chioma.okeke@bovan.dev", PW, IP);
  check("a legitimate login still succeeds", ok.status === 200, `status ${ok.status}`);
}

/* 2. Brute force is cut off */
{
  const ip = floodIp();
  let firstBlocked = -1;
  const codes = [];
  for (let i = 0; i < 14; i++) {
    const r = await login("chioma.okeke@bovan.dev", `guess-${i}`, ip);
    codes.push(r.status);
    if (r.status === 429 && firstBlocked === -1) firstBlocked = i;
  }
  check(
    "repeated failures get throttled with 429",
    firstBlocked > 0,
    `first 429 at attempt ${firstBlocked}, statuses ${codes.join(",")}`
  );

  const blocked = await login("chioma.okeke@bovan.dev", PW, ip);
  check(
    "the correct password is refused while throttled",
    blocked.status === 429,
    `status ${blocked.status}`
  );
  check(
    "a Retry-After header is returned",
    !!blocked.retryAfter,
    `Retry-After: ${blocked.retryAfter}`
  );
  check(
    "the throttle message does not confirm the account exists",
    blocked.json?.error === "Trop de tentatives. Réessayez dans quelques minutes.",
    blocked.json?.error
  );
}

/* 3. A different IP is not blocked by someone else's flood */
{
  const other = await login("chioma.okeke@bovan.dev", PW, `198.18.9.${NOVELTY % 250}`);
  check(
    "a different client IP is unaffected by the flood",
    other.status === 200,
    `status ${other.status}`
  );
}

/* 4. A different account on the blocked IP stays limited (per-IP bucket),
      but a clean IP can still get in */
{
  const clean = await login("amadou.toure@bovan.dev", PW, `198.18.10.${NOVELTY % 250}`);
  check("another account from a clean IP can log in", clean.status === 200, `status ${clean.status}`);
}

/* 5. Timing must still not leak, measured across fresh IPs */
{
  const t = async (email, ip) => {
    const t0 = performance.now();
    await login(email, "wrong", ip);
    return performance.now() - t0;
  };
  const real = await t("chioma.okeke@bovan.dev", `198.18.11.${NOVELTY % 250}`);
  const fake = await t("ghost@nowhere.test", `198.18.12.${NOVELTY % 250}`);
  const ratio = Math.max(real, fake) / Math.min(real, fake);
  check(
    "timing still does not leak account existence",
    ratio < 3,
    `real ${real.toFixed(0)}ms vs fake ${fake.toFixed(0)}ms (x${ratio.toFixed(2)})`
  );
}

console.log("\n=== RATE LIMIT / TIMING ===");
let failed = 0;
for (const r of results) {
  if (!r.p) failed++;
  console.log(`${r.p ? "PASS" : "FAIL"}  ${r.n}${r.d ? `  [${r.d}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;