import { createServerClient } from "@/lib/supabase/server";
import { mapCategory, mapMenuItem } from "@/lib/supabase/mappers";
import { sortMenuItems } from "@/lib/menu-order";
import type { Category, MenuItem } from "@/types/menu";
import type { MenuService } from "@/lib/menu-service.types";
import { StaticMenuService } from "@/lib/static-menu-service";

export class SupabaseMenuService implements MenuService {
  private async client() {
    const supabase = await createServerClient();
    if (!supabase) throw new Error("Supabase not configured");
    return supabase;
  }

  async getCategories(): Promise<Category[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
    if (error) throw error;
    return sortMenuItems((data ?? []).map(mapMenuItem));
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return sortMenuItems((data ?? []).map(mapMenuItem));
  }

  async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_available", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return sortMenuItems((data ?? []).map(mapMenuItem));
  }

  async searchItems(query: string): Promise<MenuItem[]> {
    const items = await this.getMenuItems();
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return sortMenuItems(
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    );
  }

  async getItemBySlug(slug: string): Promise<MenuItem | null> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapMenuItem(data) : null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const menuService: MenuService = isSupabaseConfigured()
  ? new SupabaseMenuService()
  : new StaticMenuService();

export async function getMenuData(): Promise<{
  categories: Category[];
  menuItems: MenuItem[];
}> {
  try {
    const [categories, menuItems] = await Promise.all([
      menuService.getCategories(),
      menuService.getMenuItems(),
    ]);
    return {
      categories: categories ?? [],
      menuItems: menuItems ?? [],
    };
  } catch (error) {
    console.error("[getMenuData] Failed to load menu:", error);

    if (isSupabaseConfigured()) {
      try {
        const fallback = new StaticMenuService();
        const [categories, menuItems] = await Promise.all([
          fallback.getCategories(),
          fallback.getMenuItems(),
        ]);
        return {
          categories: categories ?? [],
          menuItems: menuItems ?? [],
        };
      } catch (fallbackError) {
        console.error("[getMenuData] Static fallback failed:", fallbackError);
      }
    }

    return { categories: [], menuItems: [] };
  }
}
