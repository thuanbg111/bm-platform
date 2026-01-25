import { NextRequest, NextResponse } from "next/server";
import tenants from "./tenants.json";

function normalizeHost(host: string) {
  host = host.split(":")[0].toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // ==============================
  // 1. CHO PHÉP TRUY CẬP STATIC /t/*
  // ==============================
  if (pathname.startsWith("/t/")) {
    return NextResponse.next();
  }

  // ==============================
  // 2. BỎ QUA HỆ THỐNG
  // ==============================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ==============================
  // 3. DOMAIN → SLUG
  // ==============================
  const host = normalizeHost(req.headers.get("host") || "");
  const slug = (tenants as Record<string, string>)[host];

  if (!slug) {
    return NextResponse.rewrite(
      new URL("/no-tenant.html", req.url)
    );
  }

  // ==============================
  // 4. REWRITE DOMAIN → /t/slug
  // ==============================
  const targetPath =
    pathname === "/" ? `/t/${slug}` : `/t/${slug}${pathname}`;

  return NextResponse.rewrite(new URL(targetPath, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
