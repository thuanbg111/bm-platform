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

  // ✅ BỎ QUA static & nội bộ (GIỮ NGUYÊN NHƯ MÀY ĐANG DÙNG)
  if (
    p.startsWith("/_next") ||
    p.startsWith("/api") ||
    p === "/favicon.ico" ||
    p === "/no-tenant.html" ||
    p.startsWith("/t/") ||
    p.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico|txt|json)$/)
  ) {
    return NextResponse.next();
  }

  const slug = (tenants as Record<string, string>)[host];
  if (!slug) {
    return NextResponse.rewrite(new URL("/no-tenant.html", req.url));
  }

  // ===============================
  // 🔥 CHỈ SỬA 1 ĐOẠN Ở ĐÂY
  // ===============================
  let targetPath = p;

  if (p === "/") {
    targetPath = "/index.html";
  } else if (!p.endsWith(".html")) {
    targetPath = `${p}.html`;
  }

  return NextResponse.rewrite(
    new URL(`/t/${slug}${targetPath}`, req.url)
  );
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
