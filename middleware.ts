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

  // ===== BỎ QUA STATIC & NỘI BỘ =====
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/no-tenant.html"
  ) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ===== ROOT =====
  if (pathname === "/") {
    return NextResponse.rewrite(
      new URL(`/t/${slug}/index.html`, req.url)
    );
  }

  // ===== ĐÃ CÓ .html → giữ nguyên =====
  if (pathname.endsWith(".html")) {
    return NextResponse.rewrite(
      new URL(`/t/${slug}${pathname}`, req.url)
    );
  }

  // ===== URL ĐẸP → MAP SANG .html =====
  return NextResponse.rewrite(
    new URL(`/t/${slug}${pathname}.html`, req.url)
  );
}

export const config = {
  matcher: ["/:path*"],
};
