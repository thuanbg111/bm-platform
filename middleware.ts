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

  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ===== STATIC FILES (assets, images, css, js) =====
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp)$/)
  ) {
    return NextResponse.rewrite(
      new URL(`/t/${slug}${pathname}`, req.url)
    );
  }

  // ===== PAGE ROUTES =====
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
  matcher: ["/:path*"],
};
