export type ContentBackend = "d1" | "supabase" | "static";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getContentBackend(): ContentBackend {
  const configured = process.env.CONTENT_BACKEND?.trim().toLowerCase();
  if (configured === "d1" || configured === "supabase" || configured === "static") {
    return configured;
  }
  return isSupabaseConfigured() ? "supabase" : "static";
}
