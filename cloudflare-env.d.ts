/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB?: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  CONTENT_BACKEND?: "d1" | "supabase" | "static";
  MEDIA_PUBLIC_BASE_URL?: string;
  ADMIN_AUTH_BACKEND?: "supabase" | "cloudflare-access";
  ADMIN_EMAILS?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}
