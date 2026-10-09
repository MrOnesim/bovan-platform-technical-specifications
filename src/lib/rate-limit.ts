import { createHash, scryptSync, timingSafeEqual, randomBytes } from "crypto";

/* Throttles login attempts.
   Kept in-process on purpose: it needs no migration, works on every host
   (including a single container) and fails closed. If OCD ever runs
   multi-instance, swap the Map for Redis behind the same interface - the
   three functions below are the whole contract. */

const WINDOW_MS = 15 * 60 * 1000; // sliding window
const MAX_PER_IP = 20; // per IP, any email
const MAX_PER_ACCOUNT = 8; // per email+IP pair

type Bucket = { attempts: number[]; blockedUntil: number };

const store = new Map<string, Bucket>();

// Bound the memory the Map can consume; entries are evicted on sweep.
const MAX_KEYS = 20_000;

function keyFor(scope: "ip" | "account", value: string) {
  return `${scope}:${createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
}

function sweep(now: number) {
  if (store.size <= MAX_KEYS) return;
  for (const [k, b] of store) {
    b.attempts = b.attempts.filter((t) => now - t < WINDOW_MS);
    if (b.attempts.length === 0 && b.blockedUntil < now) store.delete(k);
  }
}

function bucket(key: string, now: number): Bucket {
  let b = store.get(key);
  if (!b) {
    sweep(now);
    b = { attempts: [], blockedUntil: 0 };
    store.set(key, b);
  }
  b.attempts = b.attempts.filter((t) => now - t < WINDOW_MS);
  return b;
}

export function checkThrottle(ip: string, email: string) {
  const now = Date.now();
  const ipKey = keyFor("ip", ip);
  const acctKey = keyFor("account", `${email.toLowerCase()}|${ip}`);

  const ipB = bucket(ipKey, now);
  const acctB = bucket(acctKey, now);

  const blockedUntil = Math.max(ipB.blockedUntil, acctB.blockedUntil);
  if (blockedUntil > now) {
    return {
      allowed: false as const,
      retryAfter: Math.ceil((blockedUntil - now) / 1000),
    };
  }

  return { allowed: true as const, retryAfter: 0 };
}

export function recordFailure(ip: string, email: string) {
  const now = Date.now();
  const ipB = bucket(keyFor("ip", ip), now);
  const acctB = bucket(keyFor("account", `${email.toLowerCase()}|${ip}`), now);

  ipB.attempts.push(now);
  acctB.attempts.push(now);

  if (acctB.attempts.length >= MAX_PER_ACCOUNT || ipB.attempts.length >= MAX_PER_IP) {
    const until = now + WINDOW_MS;
    ipB.blockedUntil = Math.max(ipB.blockedUntil, until);
    acctB.blockedUntil = Math.max(acctB.blockedUntil, until);
  }
}

export function clearFailures(ip: string, email: string) {
  store.delete(keyFor("ip", ip));
  store.delete(keyFor("account", `${email.toLowerCase()}|${ip}`));
}

/* Used by tests so a run cannot inherit throttling from the previous one. */
export function resetThrottle() {
  store.clear();
}

/* --------------------------------------------------------- timing equaliser
   scrypt is only computed when the account exists, so a wrong-password
   request was ~8x slower than an unknown-email one and leaked which emails
   are registered. Burn the same work either way. */

const DECOY_SALT = randomBytes(16);
const DECOY_LEN = 64;

let decoyCache: Buffer | null = null;

function decoyKey(): Buffer {
  // Computed once and reused: the point is to spend the same CPU as a real
  // verification, not to re-derive it per request.
  if (!decoyCache) {
    decoyCache = scryptSync("decoy-password-placeholder", DECOY_SALT, DECOY_LEN, {
      N: 16384,
      r: 8,
      p: 1,
    });
  }
  return decoyCache;
}

/** Constant-ish work for a request that will fail anyway. */
export function burnVerificationTime() {
  const k = decoyKey();
  const throwaway = scryptSync("decoy-password-placeholder", DECOY_SALT, DECOY_LEN, {
    N: 16384,
    r: 8,
    p: 1,
  });
  timingSafeEqual(k, throwaway);
}

/** Client IP from the usual proxy headers. */
export function clientIp(req: { headers: Headers }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}