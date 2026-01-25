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

  // =================================================
  // ✅ 1. HANDLE SITE TĨNH /t/*
  // =================================================
  if (pathname.startsWith("/t/")) {
    // /t/slug  hoặc /t/slug/
    if (!pathname.endsWith(".html")) {
      const clean = pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
      return NextResponse.rewrite(
        new URL(`${clean}/index.html`, req.url)
      );
    }
    return NextResponse.next();
  }

  // =================================================
  // 2. BỎ QUA PATH HỆ THỐNG
  // =================================================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // =================================================
  // 3. DOMAIN → SLUG (CHO DOMAIN THẬT)
  // =================================================
  const host = normalizeHost(req.headers.get("host") || "");
  const slug = (tenants as Record<string, string>)[host];

  if (!slug) {
    return NextResponse.rewrite(
      new URL("/no-tenant.html", req.url)
    );
  }

  const targetPath =
    `/t/${slug}` + (pathname === "/" ? "/index.html" : pathname);

  return NextResponse.rewrite(new URL(targetPath, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
