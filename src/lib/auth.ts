import { cookies } from "next/headers";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions,
  users,
  talentProfiles,
  companies,
  type userRoleEnum,
} from "@/db/schema";

export const SESSION_COOKIE = "ocd_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/* ---------------------------------------------------------------- passwords
   scrypt from node:crypto: memory-hard and built in, so there is no native
   dependency to compile. Plain SHA-256 (the previous choice) is a fast hash,
   which is exactly the wrong property for stored secrets.
   Format: scrypt$<N>$<r>$<p>$<salt-hex>$<hash-hex> */

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password.normalize("NFKC"), salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    key.toString("hex"),
  ].join("$");
}

export function verifyPassword(password: string, stored: string): boolean {
  const normalised = password.normalize("NFKC");

  if (stored.startsWith("scrypt$")) {
    const [, n, r, p, saltHex, keyHex] = stored.split("$");
    try {
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(keyHex, "hex");
      const actual = scryptSync(normalised, salt, expected.length, {
        N: Number(n),
        r: Number(r),
        p: Number(p),
      });
      return timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  // Legacy sha256(salt + password) hashes, kept so existing accounts can log in
  // once and are transparently upgraded on the next successful login.
  const idx = stored.indexOf(":");
  if (idx === -1) return false;
  const salt = stored.slice(0, idx);
  const hash = stored.slice(idx + 1);
  const test = createHash("sha256").update(salt + password).digest("hex");
  const a = Buffer.from(test, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** True when the stored hash predates scrypt and should be upgraded. */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith("scrypt$");
}

/* ----------------------------------------------------------------- sessions
   The cookie carries an opaque random token, never the user id. Only the
   SHA-256 of the token is persisted, so a database leak does not hand out
   live sessions. */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    token: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await db
    .delete(sessions)
    .where(eq(sessions.token, hashToken(token)));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const [row] = await db
    .select({
      user: users,
      sessionToken: sessions.token,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.token, hashToken(sessionToken)),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row || !row.user.isActive) return null;

  const user = row.user;

  let talent = null;
  let company = null;
  if (user.role === "TALENT") {
    [talent] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, user.id))
      .limit(1);
  } else if (user.role === "COMPANY") {
    [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.ownerId, user.id))
      .limit(1);
  }

  return { user, talent, company };
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type Role = (typeof userRoleEnum.enumValues)[number];