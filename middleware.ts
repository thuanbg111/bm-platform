import { NextRequest, NextResponse } from "next/server";
import tenants from "./tenants.json";

function normalizeHost(host: string) {
  host = host.split(":")[0].toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

export function middleware(req: NextRequest) {
  const host = normalizeHost(req.headers.get("host") || "");
  const pathname = req.nextUrl.pathname;

  // bỏ qua file nội bộ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // 👉 CHỈ rewrite tới thư mục
  const target = `/t/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(new URL(target, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
