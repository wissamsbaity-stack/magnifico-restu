import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import { toSessionCookieOptions } from "./session-cookies";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            toSessionCookieOptions(options)
          )
        );
      },
    },
  });

  // Cookie-only check (no Auth API round-trip). Full validation stays in requireAdmin() on hard loads.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  const isOrdersRoute =
    request.nextUrl.pathname.startsWith("/orders") &&
    !request.nextUrl.pathname.startsWith("/orders/login");

  if ((isAdminRoute || isOrdersRoute) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isOrdersRoute ? "/orders/login" : "/admin/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/admin/login" && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  if (request.nextUrl.pathname === "/orders/login" && user) {
    const ordersUrl = request.nextUrl.clone();
    ordersUrl.pathname = "/orders";
    return NextResponse.redirect(ordersUrl);
  }

  // Tell the root layout to skip public-site providers (cart/branches/chrome).
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") || path.startsWith("/orders")) {
    supabaseResponse.headers.set("x-magnifico-app-shell", "1");
  }

  return supabaseResponse;
}
