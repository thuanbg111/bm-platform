import { NextRequest, NextResponse } from "next/server";
import tenants from "./tenants.json";

function normalizeHost(host: string) {
  host = host.split(":")[0].toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = normalizeHost(req.headers.get("host") || "");
  const p = url.pathname;

  if (p.startsWith("/_next") || p.startsWith("/api") || p === "/favicon.ico") {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  const targetPath = `/t/${slug}${p === "/" ? "/index.html" : p}`;
  return NextResponse.rewrite(new URL(targetPath, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
