import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  hashPassword,
  needsRehash,
  createSession,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  checkThrottle,
  recordFailure,
  clearFailures,
  burnVerificationTime,
  clientIp,
} from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Deliberately vague: telling the caller they were throttled would confirm
    the account exists. */
const THROTTLED = "Trop de tentatives. Réessayez dans quelques minutes.";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = schema.parse(await req.json());
    const ip = clientIp(req);

    const gate = checkThrottle(ip, email);
    if (!gate.allowed) {
      return NextResponse.json(
        { error: THROTTLED },
        { status: 429, headers: { "Retry-After": String(gate.retryAfter) } }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Spend the same CPU as a real verification, otherwise the response
      // time tells an attacker which emails are registered.
      burnVerificationTime();
      recordFailure(ip, email);
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      recordFailure(ip, email);
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Compte désactivé." },
        { status: 403 }
      );
    }

    clearFailures(ip, email);

    // Transparent upgrade: a legacy sha256 hash is replaced with scrypt the
    // first time the owner proves they know the password.
    if (needsRehash(user.passwordHash)) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(users.id, user.id));
    }

    const { token } = await createSession(user.id);

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: "Identifiants invalides." },
      { status: 400 }
    );
  }
}
