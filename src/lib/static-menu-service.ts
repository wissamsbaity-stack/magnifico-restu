import { categories as staticCategories, menuItems as staticMenuItems } from "@/data/menu";
import { sortMenuItems } from "@/lib/menu-order";
import type { MenuService } from "@/lib/menu-service.types";
import type { Category, MenuItem } from "@/types/menu";

export class StaticMenuService implements MenuService {
  async getCategories(): Promise<Category[]> {
    return [...staticCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return sortMenuItems(staticMenuItems.filter((item) => item.isAvailable));
  }

  async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return sortMenuItems(
      staticMenuItems.filter(
        (item) => item.categoryId === categoryId && item.isAvailable,
      ),
    );
  }

  async searchItems(query: string): Promise<MenuItem[]> {
    const normalized = query.trim().toLowerCase();
    const available = staticMenuItems.filter((item) => item.isAvailable);
    if (!normalized) return sortMenuItems(available);
    return sortMenuItems(
      available.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.description.toLowerCase().includes(normalized),
      ),
    );
  }

  async getItemBySlug(slug: string): Promise<MenuItem | null> {
    return staticMenuItems.find((item) => item.slug === slug) ?? null;
  }
}
