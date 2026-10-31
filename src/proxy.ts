import { NextResponse, type NextRequest } from "next/server";

/* The V1 marketplace (talents, companies, opportunities, messaging, reviews)
   is no longer reachable from the UI: next.config.ts redirects every page to
   the OCD landing page. Its write endpoints were still live though, and
   /api/auth/register created an account and a session with no throttle and no
   email verification. They are now closed by default.

   Re-enabling is deliberate: set V1_MARKETPLACE_ENABLED=true. The route code
   is untouched, so nothing has to be rewritten when the marketplace returns. */

const V1_WRITE_PREFIXES = [
  "/api/auth/register",
  "/api/opportunities",
  "/api/contact",
  "/api/applications",
  "/api/conversations",
  "/api/profile",
  "/api/company/profile",
  "/api/reviews",
  "/api/upload",
];

export function proxy(req: NextRequest) {
  if (process.env.V1_MARKETPLACE_ENABLED === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const blocked = V1_WRITE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!blocked) return NextResponse.next();

  return NextResponse.json(
    { error: "Cette fonctionnalité n'est pas active sur ce site." },
    { status: 410 }
  );
}

export const config = {
  matcher: ["/api/:path*"],
};
