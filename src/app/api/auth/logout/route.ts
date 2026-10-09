import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  // Revoke server-side: clearing the cookie alone would leave a stolen token
  // usable until it expires.
  if (token) {
    await destroySession(token);
  }
  cookieStore.delete(SESSION_COOKIE);

  // Detect if this is a fetch (JSON expected) or form submit (redirect expected)
  const accept = req.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}

export async function GET(req: NextRequest) {
  return POST(req);
}