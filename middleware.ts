import { NextRequest, NextResponse } from "next/server";
import tenants from "./tenants.json";

function normalizeHost(host: string) {
  host = host.split(":")[0].toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

function isStaticPath(p: string) {
  // thư mục static
  if (p.startsWith("/assets/") || p.startsWith("/images/")) return true;

  // file static theo đuôi (thêm gì thì thêm ở đây)
  return /\.(css|js|mjs|png|jpg|jpeg|svg|webp|ico|json|map|txt|woff|woff2|ttf|eot)$/i.test(p);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = normalizeHost(req.headers.get("host") || "");
  const p = url.pathname;

  // ===== BỎ QUA NỘI BỘ NEXT =====
  if (p.startsWith("/_next") || p.startsWith("/api") || p === "/favicon.ico") {
    return NextResponse.next();
  }

  // ===== CHO PHÉP TRUY CẬP THẲNG /t/... (để debug/kiểm tra) =====
  if (p.startsWith("/t/")) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];

  if (!slug) {
    // chỉ rewrite đúng file này, đừng loop
    if (p === "/no-tenant.html") return NextResponse.next();
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ===== STATIC: assets/images/css/js/... phải rewrite sang /t/<slug> =====
  if (isStaticPath(p)) {
    return NextResponse.rewrite(new URL(`/t/${slug}${p}`, req.url));
  }

  // ===== PAGE ROUTES =====
  // /  -> /t/<slug>/index.html
  if (p === "/") {
    return NextResponse.rewrite(new URL(`/t/${slug}/index.html`, req.url));
  }

  // /contact.html -> /t/<slug>/contact.html (giữ link cũ)
  if (p.endsWith(".html")) {
    return NextResponse.rewrite(new URL(`/t/${slug}${p}`, req.url));
  }

  // /contact -> /t/<slug>/contact.html  (URL đẹp, không .html)
  return NextResponse.rewrite(new URL(`/t/${slug}${p}.html`, req.url));
}

export const config = {
  // KHÔNG loại /assets ra khỏi matcher vì ta cần rewrite nó
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
