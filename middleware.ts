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
  const pathname = url.pathname;

  const slug = (tenants as Record<string, string>)[host];

  // ===== DOMAIN KHÔNG MAP =====
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ===== BỎ QUA FILE TĨNH & INTERNAL =====
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico|txt|json)$/)
  ) {
    return NextResponse.next();
  }

  // ===== MAP ROUTE ĐẸP → FILE .HTML =====
  let targetPath = pathname;

  if (pathname === "/") {
    targetPath = "/index.html";
  } else if (!pathname.endsWith(".html")) {
    targetPath = `${pathname}.html`;
  }

  return NextResponse.rewrite(
    new URL(`/t/${slug}${targetPath}`, req.url)
  );
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
