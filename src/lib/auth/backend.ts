export type AdminAuthBackend = "supabase" | "cloudflare-access";

export function getAdminAuthBackend(): AdminAuthBackend {
  return process.env.ADMIN_AUTH_BACKEND === "cloudflare-access"
    ? "cloudflare-access"
    : "supabase";
}

