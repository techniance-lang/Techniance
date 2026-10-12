import { NextResponse, type NextRequest } from "next/server";

/**
 * CSRF defence in depth for the JSON API (session cookies are already SameSite=Lax):
 * state-changing requests must come from this site. Stripe webhooks and cron jobs
 * authenticate with signatures/secrets instead and are exempt.
 */
const EXEMPT = ["/api/billing/webhook", "/api/cron/"];

export function middleware(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (EXEMPT.some((p) => path.startsWith(p))) return NextResponse.next();

  if (req.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (!host || originHost !== host) {
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
