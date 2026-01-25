import { NextRequest, NextResponse } from "next/server";
import tenants from "./tenants.json";

function normalizeHost(host: string) {
  host = host.split(":")[0].toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

function isStaticPath(p: string) {
  if (p.startsWith("/assets/") || p.startsWith("/images/")) return true;
  return /\.(css|js|mjs|png|jpg|jpeg|svg|webp|ico|json|map|txt|woff|woff2|ttf|eot)$/i.test(p);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = normalizeHost(req.headers.get("host") || "");
  const p = url.pathname;

  // Nội bộ Next
  if (p.startsWith("/_next") || p.startsWith("/api") || p === "/favicon.ico") {
    return NextResponse.next();
  }

  // Cho phép truy cập thẳng /t/... (debug)
  if (p.startsWith("/t/")) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];

  if (!slug) {
    if (p === "/no-tenant.html") return NextResponse.next();
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ✅ REDIRECT CẮT .html (URL đẹp)
  // /index.html -> /
  // /contact.html -> /contact
  if (p.endsWith(".html")) {
    const base = p.slice(0, -5); // bỏ ".html"
    const cleanPath = base === "/index" ? "/" : base;

    // Tránh redirect loop lặt vặt
    if (cleanPath !== p) {
      const to = new URL(cleanPath, req.url);
      return NextResponse.redirect(to, 308);
    }
  }

  // Static: rewrite sang /t/<slug>
  if (isStaticPath(p)) {
    return NextResponse.rewrite(new URL(`/t/${slug}${p}`, req.url));
  }

  // Pages
  if (p === "/") {
    return NextResponse.rewrite(new URL(`/t/${slug}/index.html`, req.url));
  }

  // /contact -> /t/<slug>/contact.html
  return NextResponse.rewrite(new URL(`/t/${slug}${p}.html`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
