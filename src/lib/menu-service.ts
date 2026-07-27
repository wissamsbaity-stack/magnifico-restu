import type { Category, MenuItem, MenuItemWithCategory } from "@/types/menu";
import {
  menuService as dataMenuService,
} from "@/lib/supabase/menu-service";

export type { MenuService } from "@/lib/menu-service.types";
export { isSupabaseConfigured, getMenuData } from "@/lib/supabase/menu-service";

export const menuService = dataMenuService;

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
