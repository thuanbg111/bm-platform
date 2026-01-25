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

  // ✅ BỎ QUA các route nội bộ (GIỮ NGUYÊN)
  if (
    p.startsWith("/_next") ||
    p.startsWith("/api") ||
    p === "/favicon.ico" ||
    p === "/no-tenant.html" ||
    p.startsWith("/t/")
  ) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ✅ Nếu là file static (css/js/img/font/...) => rewrite thẳng vào /t/<slug>/...
  const isStatic =
    p.startsWith("/assets/") ||
    p.startsWith("/images/") ||
    /\.(css|js|png|jpg|jpeg|svg|webp|ico|map|woff2?|ttf|eot)$/i.test(p);

  if (isStatic) {
    return NextResponse.rewrite(new URL(`/t/${slug}${p}`, req.url));
  }

  // ✅ CẮT .html TRÊN URL (clean URL) nhưng vẫn trỏ đúng file .html
  let targetPath = p;

  if (p === "/") {
    targetPath = "/index.html";
  } else if (!p.endsWith(".html")) {
    targetPath = `${p}.html`;
  }

  return NextResponse.rewrite(new URL(`/t/${slug}${targetPath}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
