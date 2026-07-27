import type { CookieOptions } from "@supabase/ssr";

/** Auth cookies expire when the browser closes (no Max-Age / Expires). */
export function toSessionCookieOptions(
  options?: Partial<CookieOptions>
): Partial<CookieOptions> {
  if (!options) {
    return {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    };
  }

  const session = { ...options };
  delete session.maxAge;
  delete session.expires;
  return session;
}

export function createSessionStorage() {
  if (typeof window === "undefined") return undefined;

  return {
    getItem: (key: string) => window.sessionStorage.getItem(key),
    setItem: (key: string, value: string) =>
      window.sessionStorage.setItem(key, value),
    removeItem: (key: string) => window.sessionStorage.removeItem(key),
  };
}
