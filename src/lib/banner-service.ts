import { createServerClient } from "@/lib/supabase/server";
import { mapMenuBanner } from "@/lib/supabase/banner-mappers";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { getContentBackend } from "@/lib/content-backend";
import { getD1MenuBanners } from "@/lib/cloudflare/content-queries";
import type { MenuBanner } from "@/types/banner";

/** Homepage hero slider only — never used by the Menu page. */
export async function getHomeHeroBanners(): Promise<MenuBanner[]> {
  const backend = getContentBackend();
  if (backend === "static") return [];
  if (backend === "d1") {
    try {
      return (await getD1MenuBanners({ enabledOnly: true })).map(mapMenuBanner);
    } catch (error) {
      console.error("[getHomeHeroBanners] D1 query failed", error);
      return [];
    }
  }

  const supabase = await createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("menu_banners")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingRelationError(error)) {
      console.error(
        "[getHomeHeroBanners] menu_banners table missing — run migration 010_menu_banners.sql"
      );
    } else {
      console.error("[getHomeHeroBanners]", error.message, error.code);
    }
    return [];
  }

  return (data ?? []).map(mapMenuBanner);
}
