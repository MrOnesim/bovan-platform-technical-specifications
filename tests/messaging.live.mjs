/* End-to-end coverage of the messaging flow against a running server.
   This is the feature the whole platform hangs on: a company reaches out,
   the talent sees it and replies. Nothing else tests that path.

   Run with the app up:  node tests/messaging.live.mjs                */

const BASE = process.env.BASE_URL || "http://localhost:3111";
const PW = "password123";

/* Unique per run so the login throttle (per IP + account) cannot carry over
   from an earlier test that deliberately failed logins. */
const RUN_IP = `10.1.${Math.floor(process.pid / 250) % 250}.${process.pid % 250}`;

const COMPANY_EMAIL = "hello@agrimarket.africa";
const TALENT_EMAIL = "chioma.okeke@bovan.dev";
// A different talent, used to prove the thread stays private.
const OTHER_TALENT_EMAIL = "aisha.diallo@bovan.dev";

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
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* not json */
  }
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
}

const tokenOf = (r) => (/ocd_session=([^;]+)/.exec(r.setCookie || "") || [])[1];

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

async function login(email) {
  const r = await call("/api/auth/login", {
    method: "POST",
    body: { email, password: PW },
  });
  if (r.status !== 200) throw new Error(`login failed for ${email}: ${r.status}`);
  return tokenOf(r);
}

async function run() {
  const companyToken = await login(COMPANY_EMAIL);
  check("company can log in", !!companyToken);

  /* Resolve the talent the company will contact, by slug, so the test does not
     depend on listing order. The profile is a React Server Component, so the
     id lives in the RSC payload rather than in a plain attribute. */
  const talentsHtml = await (await fetch(`${BASE}/talents`)).text();
  const allSlugs = [...talentsHtml.matchAll(/href="\/talents\/([a-z0-9-]+)"/gi)].map(
    (m) => m[1]
  );
  check("public talent list exposes profile links", allSlugs.length > 0, allSlugs.join(", "));

  /* The RSC payload is double-escaped, so the props appear as
     \"talentId\":\"<uuid>\" rather than "talentId":"<uuid>". */
  const wantedLocal = TALENT_EMAIL.split("@")[0].split(".")[0];
  let slug = null;
  let talentId = null;
  for (const s of allSlugs) {
    const html = await (await fetch(`${BASE}/talents/${s}`)).text();
    const id =
      /talentId\\?":\\?"([0-9a-f-]{36})/i.exec(html)?.[1] ??
      /talentId[\\"]+:[\\"]+([0-9a-f-]{36})/i.exec(html)?.[1];
    if (id && html.toLowerCase().includes(wantedLocal.toLowerCase())) {
      slug = s;
      talentId = id;
      break;
    }
  }

  check("the target talent profile is reachable and exposes an id", !!talentId, `${slug} ${talentId || "no id"}`);
  if (!talentId) {
    console.log(`\n!! no profile matched ${TALENT_EMAIL}`);
    return;
  }

  const talentToken = await login(TALENT_EMAIL);
  check("target talent can log in", !!talentToken);

  if (!talentId) {
    console.log("\n!! cannot continue the lifecycle without a conversation id");
    return;
  }

  /* --- the actual conversation lifecycle ------------------------------- */

  const body = { talentId, message: `Bonjour, nous aimerions vous parler (${Date.now()}).` };

  const started = await call("/api/contact", {
    method: "POST",
    cookie: `ocd_session=${companyToken}`,
    body,
  });
  check(
    "company can open a conversation",
    started.status === 200 && !!started.json?.conversationId,
    `status ${started.status} ${JSON.stringify(started.json)}`
  );

  const convId = started.json?.conversationId;
  if (!convId) {
    console.log("\n!! cannot continue the lifecycle without a conversation id");
    return;
  }

  // Re-opening must reuse the same thread rather than duplicate it.
  const again = await call("/api/contact", {
    method: "POST",
    cookie: `ocd_session=${companyToken}`,
    body,
  });
  check(
    "re-contacting the same talent reuses the conversation",
    again.json?.conversationId === convId,
    `${again.json?.conversationId} vs ${convId}`
  );

  const talentThread = await call("/api/conversations", {
    cookie: `ocd_session=${talentToken}`,
  });
  check(
    "talent sees the conversation in their list",
    talentThread.status === 200 &&
      Array.isArray(talentThread.json) &&
      talentThread.json.some((c) => c.id === convId),
    `status ${talentThread.status}, ${Array.isArray(talentThread.json) ? talentThread.json.length : "?"} threads`
  );

  const companyThread = await call("/api/conversations", {
    cookie: `ocd_session=${companyToken}`,
  });
  check(
    "company sees the conversation with the talent name",
    companyThread.status === 200 &&
      companyThread.json.some((c) => c.id === convId && c.talentName),
    `status ${companyThread.status}`
  );

  const thread = await call(`/api/conversations/${convId}/messages`, {
    cookie: `ocd_session=${talentToken}`,
  });
  check(
    "talent can read the message thread",
    thread.status === 200 && thread.json.length >= 1,
    `status ${thread.status}, ${Array.isArray(thread.json) ? thread.json.length : "?"} messages`
  );

  /* --- the talent replies ---------------------------------------------- */

  const replyText = `Bonjour, je suis disponible. Cordialement. (${Date.now()})`;
  const reply = await call(`/api/conversations/${convId}/messages`, {
    method: "POST",
    cookie: `ocd_session=${talentToken}`,
    body: { content: replyText },
  });
  check(
    "talent can reply",
    reply.status === 200 && reply.json?.content === replyText,
    `status ${reply.status}`
  );

  const afterReply = await call(`/api/conversations/${convId}/messages`, {
    cookie: `ocd_session=${companyToken}`,
  });
  check(
    "company sees the reply",
    afterReply.status === 200 &&
      afterReply.json.some((m) => m.content === replyText),
    `status ${afterReply.status}, ${afterReply.json?.length} messages`
  );

  check(
    "thread is ordered oldest-first",
    Array.isArray(afterReply.json) &&
      afterReply.json.every(
        (m, i, a) => i === 0 || new Date(a[i - 1].createdAt) <= new Date(m.createdAt)
      ),
    "timestamps should ascend"
  );

  /* --- access control: a third party must be locked out ---------------- */

  const otherTalent = await login(OTHER_TALENT_EMAIL);
  const intruder = await call(`/api/conversations/${convId}/messages`, {
    cookie: `ocd_session=${otherTalent}`,
  });
  check(
    "an unrelated talent cannot read the thread",
    intruder.status === 403,
    `status ${intruder.status} (403 = correctly refused)`
  );

  const intruderWrite = await call(`/api/conversations/${convId}/messages`, {
    method: "POST",
    cookie: `ocd_session=${otherTalent}`,
    body: { content: "je m'inscris" },
  });
  check(
    "an unrelated talent cannot write into the thread",
    intruderWrite.status === 403,
    `status ${intruderWrite.status}`
  );

  const anon = await call(`/api/conversations/${convId}/messages`);
  check(
    "an anonymous visitor is refused",
    anon.status === 401,
    `status ${anon.status}`
  );

  /* --- cleanup ---------------------------------------------------------- */

  for (const t of [companyToken, talentToken, otherTalent]) {
    await call("/api/auth/logout", { method: "POST", cookie: `ocd_session=${t}` });
  }
}

console.log("=== MESSAGING LIFECYCLE ===");
try {
  await run();
} catch (e) {
  check("test harness ran to completion", false, e.message);
}

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;