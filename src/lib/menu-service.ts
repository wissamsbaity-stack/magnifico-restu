import type { Category, MenuItem, MenuItemWithCategory } from "@/types/menu";
import { D1MenuService } from "@/lib/cloudflare/menu-service";
import { getContentBackend } from "@/lib/content-backend";
import { StaticMenuService } from "@/lib/static-menu-service";
import { SupabaseMenuService } from "@/lib/supabase/menu-service";

export type { MenuService } from "@/lib/menu-service.types";
export { getContentBackend, isSupabaseConfigured } from "@/lib/content-backend";

function createMenuService() {
  switch (getContentBackend()) {
    case "d1":
      return new D1MenuService();
    case "supabase":
      return new SupabaseMenuService();
    default:
      return new StaticMenuService();
  }
}

export const menuService = createMenuService();

export async function getMenuData(): Promise<{
  categories: Category[];
  menuItems: MenuItem[];
}> {
  try {
    const [categories, menuItems] = await Promise.all([
      menuService.getCategories(),
      menuService.getMenuItems(),
    ]);
    return { categories, menuItems };
  } catch (error) {
    console.error(`[getMenuData] ${getContentBackend()} backend failed:`, error);
    const fallback = new StaticMenuService();
    const [categories, menuItems] = await Promise.all([
      fallback.getCategories(),
      fallback.getMenuItems(),
    ]);
    return { categories, menuItems };
  }
}

export function getMenuItemWithCategory(
  item: MenuItem,
  categories: Category[]
): MenuItemWithCategory {
  const category = categories.find((c) => c.id === item.categoryId)!;
  return { ...item, category };
}

export async function getAllItemsWithCategories(): Promise<MenuItemWithCategory[]> {
  const [categories, items] = await Promise.all([
    menuService.getCategories(),
    menuService.getMenuItems(),
  ]);
  return items.map((item) => getMenuItemWithCategory(item, categories));
}
