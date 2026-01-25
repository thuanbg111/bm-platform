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
  // ✅ 1. BỎ QUA HOÀN TOÀN SITE TĨNH /t/*
  // =================================================
  if (pathname.startsWith("/t/")) {
    return NextResponse.next();
  }

  // =================================================
  // 2. BỎ QUA CÁC PATH MẶC ĐỊNH
  // =================================================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // =================================================
  // 3. MAP DOMAIN → SLUG (GIỮ NGUYÊN LOGIC CŨ)
  // =================================================
  const host = normalizeHost(req.headers.get("host") || "");
  const slug = (tenants as Record<string, string>)[host];

  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  const targetPath =
    `/t/${slug}` + (pathname === "/" ? "/index.html" : pathname);

  return NextResponse.rewrite(new URL(targetPath, req.url));
}

// =================================================
// 4. MATCHER (GIỮ NGUYÊN)
// =================================================
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
