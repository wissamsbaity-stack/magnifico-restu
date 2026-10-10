import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (
    process.env.ADMIN_AUTH_BACKEND === "cloudflare-access" &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-magnifico-app-shell", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/orders", "/orders/:path*"],
};
