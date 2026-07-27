import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { createSessionStorage } from "./session-cookies";

let browserClient: ReturnType<typeof createSupabaseBrowserClient<Database>> | null =
  null;

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!browserClient) {
    browserClient = createSupabaseBrowserClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: createSessionStorage(),
      },
    });
  }

  return browserClient;
}
