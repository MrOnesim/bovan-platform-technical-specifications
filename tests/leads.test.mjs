import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { consumeSubmission, resetSubmissions } from "../src/lib/rate-limit.ts";

/* The booking form is the only conversion path on the site. These tests guard
   the properties that make it trustworthy: it stores the lead server-side, it
   throttles abuse, it ignores bots, and the V1 write endpoints stay closed. */

const root = process.cwd();

test("leads: a submission is throttled per IP after five requests", () => {
  resetSubmissions();
  const ip = "203.0.113.7";

  // Distinct emails, so only the per-IP bucket can trigger here.
  for (let i = 0; i < 5; i++) {
    const gate = consumeSubmission(ip, `client${i}@example.com`);
    assert.equal(gate.allowed, true, `request ${i + 1} should be allowed`);
  }

  const blocked = consumeSubmission(ip, "client-new@example.com");
  assert.equal(blocked.allowed, false, "the sixth request must be refused");
  assert.ok(blocked.retryAfter > 0, "retryAfter should be positive");
  resetSubmissions();
});

test("leads: one address cannot be replayed more than three times", () => {
  resetSubmissions();
  const ip = "203.0.113.9";
  const email = "insistant@example.com";
  for (let i = 0; i < 3; i++) {
    assert.equal(consumeSubmission(ip, email).allowed, true);
  }
  assert.equal(consumeSubmission(ip, email).allowed, false);
  resetSubmissions();
});

test("leads: buckets are isolated per IP", () => {
  resetSubmissions();
  for (let i = 0; i < 5; i++) {
    consumeSubmission("198.51.100.1", `a${i}@example.com`);
  }
  assert.equal(
    consumeSubmission("198.51.100.1", "a-final@example.com").allowed,
    false
  );
  assert.equal(
    consumeSubmission("198.51.100.2", "b@example.com").allowed,
    true,
    "another IP must not inherit the block"
  );
  resetSubmissions();
});

test("leads: the API persists submissions without sending email", () => {
  const src = readFileSync(join(root, "src/app/api/leads/route.ts"), "utf8");
  const insertAt = src.indexOf(".insert(inquiries)");
  assert.ok(insertAt > -1, "the route must insert into inquiries");
  assert.ok(!src.includes("notifyLead("), "email notifications must remain disabled");
  assert.match(src, /consumeSubmission/, "the route must throttle");
  assert.match(src, /website/, "the route must read the honeypot field");
});

test("leads: the form posts to the API instead of opening a mail client", () => {
  const src = readFileSync(join(root, "src/components/OcdInquiryForm.tsx"), "utf8");
  assert.match(src, /fetch\("\/api\/leads"/, "the form must POST to /api/leads");
  assert.ok(
    !src.includes("window.location.href"),
    "the form must no longer navigate to a mailto: URL"
  );
  assert.match(src, /role="status"/, "success must be announced to screen readers");
});

test("leads: the inquiries table exists with its enum", () => {
  const src = readFileSync(join(root, "src/db/schema.ts"), "utf8");
  assert.match(src, /inquiryStatusEnum = pgEnum\("inquiry_status"/);
  assert.match(src, /pgTable\(\s*"inquiries"/);
});

test("leads: inquiries are visible only in the authenticated admin page", () => {
  const page = readFileSync(join(root, "src/app/admin/page.tsx"), "utf8");
  const config = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(page, /session\.user\.role !== "ADMIN"/);
  assert.match(page, /from\(inquiries\)/);
  assert.match(page, /\.limit\(30\)/);
  assert.doesNotMatch(config, /source:\s*"\/admin"/);
  assert.doesNotMatch(config, /source:\s*"\/auth\/:path\*"/);
});

test("v1: the marketplace write endpoints are closed by default", () => {
  const src = readFileSync(join(root, "src/proxy.ts"), "utf8");
  assert.ok(
    src.includes('process.env.V1_MARKETPLACE_ENABLED === "true"'),
    "the switch must be opt-in"
  );
  for (const route of ["/api/auth/register", "/api/upload", "/api/opportunities"]) {
    assert.ok(src.includes(route), `${route} should be in the closed list`);
  }
  assert.match(src, /status: 410/, "closed endpoints should answer 410");
});

test("v1: the kill switch is documented in .env.example", () => {
  const src = readFileSync(join(root, ".env.example"), "utf8");
  assert.match(src, /V1_MARKETPLACE_ENABLED=false/);
});
