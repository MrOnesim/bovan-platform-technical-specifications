const BASE = "http://localhost:3111";
const PW = "password123";

async function call(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, ms: 0 };
}

const results = [];
const check = (n, p, d = "") => results.push({ n, p, d });

/* 1. User enumeration: does a wrong password and a missing account differ? */
{
  const badPwd = await call("/api/auth/login", {
    method: "POST",
    body: { email: "chioma.okeke@bovan.dev", password: "wrong-password" },
  });
  const noUser = await call("/api/auth/login", {
    method: "POST",
    body: { email: "nobody@nowhere.test", password: "wrong-password" },
  });
  const malformed = await call("/api/auth/login", {
    method: "POST",
    body: { email: "not-an-email", password: "x" },
  });

  check(
    "bad password and unknown user give the identical message",
    badPwd.json?.error === noUser.json?.error,
    `"${badPwd.json?.error}" vs "${noUser.json?.error}"`
  );
  check(
    "both cases return the same status",
    badPwd.status === noUser.status,
    `${badPwd.status} vs ${noUser.status}`
  );
  check("malformed email returns 400", malformed.status === 400, `status ${malformed.status}`);

  /* 2. Timing: an unknown email should not return dramatically faster,
        otherwise it confirms which emails exist. */
  const t = async (email) => {
    const t0 = performance.now();
    for (let i = 0; i < 3; i++) {
      await call("/api/auth/login", { method: "POST", body: { email, password: "wrong" } });
    }
    return (performance.now() - t0) / 3;
  };
  const tReal = await t("chioma.okeke@bovan.dev");
  const tFake = await t("nobody@nowhere.test");
  const ratio = Math.max(tReal, tFake) / Math.min(tReal, tFake);
  check(
    "login timing does not leak account existence",
    ratio < 3,
    `real ${tReal.toFixed(0)}ms vs fake ${tFake.toFixed(0)}ms (x${ratio.toFixed(2)})`
  );
}

/* 3. Brute force: is there any throttling at all? */
{
  const t0 = performance.now();
  const N = 30;
  for (let i = 0; i < N; i++) {
    await call("/api/auth/login", {
      method: "POST",
      body: { email: "chioma.okeke@bovan.dev", password: `guess-${i}` },
    });
  }
  const per = (performance.now() - t0) / N;
  check(
    "note: repeated failures are NOT throttled",
    per < 50,
    `${N} attempts in ${(performance.now() - t0).toFixed(0)}ms (${per.toFixed(1)}ms each) - informational`
  );
}

/* 4. Registration: can the same email be taken twice? */
{
  const email = `dupe-${Date.now()}@bovan.dev`;
  const payload = {
    email,
    password: "password123",
    role: "TALENT",
    firstName: "Test",
    lastName: "Double",
  };
  const first = await call("/api/auth/register", { method: "POST", body: payload });
  const second = await call("/api/auth/register", { method: "POST", body: payload });
  check(
    "duplicate email is rejected on register",
    second.status >= 400,
    `first ${first.status}, second ${second.status}`
  );
}

/* 5. Weak password accepted? */
{
  const weak = await call("/api/auth/register", {
    method: "POST",
    body: {
      email: `weak-${Date.now()}@bovan.dev`,
      password: "123456",
      role: "TALENT",
      firstName: "A",
      lastName: "B",
    },
  });
  check(
    "note: a 6-char all-digit password is accepted",
    weak.status === 200,
    `status ${weak.status} - informational`
  );
}

console.log("\n=== AUTH HARDENING PROBE ===");
let failed = 0;
for (const r of results) {
  if (!r.p) failed++;
  console.log(`${r.p ? "PASS" : "FAIL"}  ${r.n}${r.d ? `  [${r.d}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);