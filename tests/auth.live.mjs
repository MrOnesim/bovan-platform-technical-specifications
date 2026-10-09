const BASE = "http://localhost:3111";

/* Each run uses its own client IP. The login route throttles per IP+account,
   so a test that fires deliberate wrong passwords would otherwise lock the
   next run out of the very fixture it needs. */
const RUN_IP = `10.0.${Math.floor(process.pid / 250) % 250}.${process.pid % 250}`;

async function call(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      accept: "application/json",
      "x-forwarded-for": RUN_IP,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = res.headers.get("set-cookie");
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* not json */
  }
  return { status: res.status, setCookie, json };
}

function tokenFrom(setCookie) {
  const m = /ocd_session=([^;]+)/.exec(setCookie || "");
  return m ? m[1] : null;
}

const results = [];
const check = (name, pass, detail = "") =>
  results.push({ name, pass, detail });

/* 1. Login issues an opaque token, not the user id */
{
  const r = await call("/api/auth/login", {
    method: "POST",
    body: { email: "aisha.diallo@bovan.dev", password: "password123" },
  });
  const token = tokenFrom(r.setCookie);

  check("login succeeds", r.status === 200, `status ${r.status}`);
  check(
    "cookie is set",
    !!token,
    token ? `token len ${token.length}` : "no cookie"
  );
  check(
    "cookie is NOT the user id",
    !!token && token !== r.json?.user?.id,
    `token=${token} userId=${r.json?.user?.id}`
  );
  check(
    "cookie is opaque (no uuid shape)",
    !!token && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(token),
    "token should not look like a uuid"
  );
  check(
    "cookie flags include HttpOnly + SameSite",
    /HttpOnly/i.test(r.setCookie || "") &&
      /SameSite=Lax/i.test(r.setCookie || ""),
    (r.setCookie || "").slice(0, 60)
  );

  /* 2. The token actually authenticates */
  const authed = await call("/api/conversations", { cookie: `ocd_session=${token}` });
  check(
    "token authenticates against a protected route",
    authed.status === 200,
    `status ${authed.status}`
  );

  /* 3. An arbitrary user id must NOT work (the old vulnerability) */
  const spoof = await call("/api/conversations", {
    cookie: `ocd_session=${r.json?.user?.id}`,
  });
  check(
    "raw user id is rejected as a session token",
    spoof.status === 401,
    `status ${spoof.status} (401 = correctly refused)`
  );

  /* 4. Logout revokes server-side */
  const out = await call("/api/auth/logout", {
    method: "POST",
    cookie: `ocd_session=${token}`,
  });
  check("logout returns ok", out.status === 200, `status ${out.status}`);

  const after = await call("/api/conversations", { cookie: `ocd_session=${token}` });
  check(
    "token is dead after logout",
    after.status === 401,
    `status ${after.status} (401 = revoked in DB)`
  );

  /* 5. Wrong password is refused */
  const bad = await call("/api/auth/login", {
    method: "POST",
    body: { email: "aisha.diallo@bovan.dev", password: "mauvais" },
  });
  check("wrong password refused", bad.status === 401, `status ${bad.status}`);

  /* 5b. Validation runs before the authorisation check, so a fresh session
     with an empty body is rejected by Zod rather than crashing. */
  const fresh = await call("/api/auth/login", {
    method: "POST",
    body: { email: "aisha.diallo@bovan.dev", password: "password123" },
  });
  const freshToken = tokenFrom(fresh.setCookie);

  const empty = await call(
    "/api/conversations/00000000-0000-0000-0000-000000000000/messages",
    {
      method: "POST",
      cookie: `ocd_session=${freshToken}`,
      body: { content: "" },
    }
  );
  check(
    "empty message rejected by validation, not a crash",
    empty.status === 400,
    `status ${empty.status} json=${JSON.stringify(empty.json)}`
  );

  const missing = await call(
    "/api/conversations/00000000-0000-0000-0000-000000000000/messages",
    {
      method: "POST",
      cookie: `ocd_session=${freshToken}`,
      body: {},
    }
  );
  check(
    "missing content field rejected",
    missing.status === 400,
    `status ${missing.status}`
  );

  const unknownConv = await call(
    "/api/conversations/00000000-0000-0000-0000-000000000000/messages",
    {
      method: "POST",
      cookie: `ocd_session=${freshToken}`,
      body: { content: "bonjour" },
    }
  );
  check(
    "unknown conversation returns 404, not 500",
    unknownConv.status === 404,
    `status ${unknownConv.status}`
  );

  await call("/api/auth/logout", {
    method: "POST",
    cookie: `ocd_session=${freshToken}`,
  });
}

console.log("\n=== AUTH / SESSION ===");
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;