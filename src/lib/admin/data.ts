import { createServerClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/errors";
import type { CategoryRow, Database, MenuItemRow } from "@/lib/supabase/types";

type MenuBannerRow = Database["public"]["Tables"]["menu_banners"]["Row"];

export type AdminMenuBannersResult = {
  banners: MenuBannerRow[];
  /** False when the menu_banners table has not been migrated yet. */
  schemaReady: boolean;
  error: string | null;
};

/**
 * Page data helpers intentionally skip requireAdmin().
 * Auth is already enforced by middleware + the dashboard layout.
 * Skipping a second getUser()/profile round-trip makes section switches much faster.
 * RLS still applies via the user session cookie.
 */
async function getAdminClient() {
  const supabase = await createServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

export async function getAdminMenuBanners(): Promise<AdminMenuBannersResult> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from("menu_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getAdminMenuBanners]", error.message, error.code);

    if (isMissingRelationError(error)) {
      return {
        banners: [],
        schemaReady: false,
        error:
          "The menu_banners table does not exist yet. Run migration 010_menu_banners.sql in the Supabase SQL Editor.",
      };
    }

    return {
      banners: [],
      schemaReady: true,
      error: error.message,
    };
  }

  return {
    banners: data ?? [],
    schemaReady: true,
    error: null,
  };
}

export async function getAdminCategories(): Promise<CategoryRow[]> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminMenuItems(): Promise<MenuItemRow[]> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, category_id, name, slug, description, price, image_url, is_popular, is_best_seller, is_available, tags, display_order, image_crop, created_at, updated_at"
    )
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminStats() {
  const supabase = await getAdminClient();
  const [categories, items, bannerCount, branchCount] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("menu_items").select("id", { count: "exact", head: true }),
    supabase.from("menu_banners").select("id", { count: "exact", head: true }),
    supabase.from("branches").select("id", { count: "exact", head: true }),
  ]);
  return {
    categories: categories.count ?? 0,
    menuItems: items.count ?? 0,
    banners: bannerCount.error ? 0 : (bannerCount.count ?? 0),
    branches: branchCount.error ? 0 : (branchCount.count ?? 0),
  };
}
