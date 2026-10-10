import "server-only";

import { LOGO_SRC } from "@/lib/branding/logo";
import { getD1Database } from "@/lib/cloudflare/database";
import { parseCrop } from "@/lib/image-crop";
import { sortMenuItems } from "@/lib/menu-order";
import type { MenuService } from "@/lib/menu-service.types";
import type { Category, MenuItem } from "@/types/menu";

interface D1CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface D1MenuItemRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_popular: number;
  is_best_seller: number;
  is_available: number;
  display_order: number;
  image_crop: string | null;
}

function mapCategory(row: D1CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function mapMenuItem(row: D1MenuItemRow): MenuItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    imageUrl: row.image_url ?? LOGO_SRC,
    isPopular: Boolean(row.is_popular),
    isBestSeller: Boolean(row.is_best_seller),
    isAvailable: Boolean(row.is_available),
    displayOrder: row.display_order,
    imageCrop: parseCrop(row.image_crop),
  };
}

const ITEM_COLUMNS =
  "id, category_id, name, slug, description, price, image_url, is_popular, is_best_seller, is_available, display_order, image_crop";

export class D1MenuService implements MenuService {
  async getCategories(): Promise<Category[]> {
    const database = await getD1Database();
    const result = await database
      .prepare(
        "SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC, name ASC",
      )
      .all<D1CategoryRow>();
    return result.results.map(mapCategory);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const database = await getD1Database();
    const result = await database
      .prepare(
        `SELECT ${ITEM_COLUMNS} FROM menu_items WHERE is_available = 1 ORDER BY display_order ASC, name ASC`,
      )
      .all<D1MenuItemRow>();
    return sortMenuItems(result.results.map(mapMenuItem));
  }

  async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const database = await getD1Database();
    const result = await database
      .prepare(
        `SELECT ${ITEM_COLUMNS} FROM menu_items WHERE category_id = ? AND is_available = 1 ORDER BY display_order ASC, name ASC`,
      )
      .bind(categoryId)
      .all<D1MenuItemRow>();
    return sortMenuItems(result.results.map(mapMenuItem));
  }

  async searchItems(query: string): Promise<MenuItem[]> {
    const items = await this.getMenuItems();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return sortMenuItems(
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.description.toLowerCase().includes(normalized),
      ),
    );
  }

  async getItemBySlug(slug: string): Promise<MenuItem | null> {
    const database = await getD1Database();
    const row = await database
      .prepare(`SELECT ${ITEM_COLUMNS} FROM menu_items WHERE slug = ? LIMIT 1`)
      .bind(slug)
      .first<D1MenuItemRow>();
    return row ? mapMenuItem(row) : null;
  }
}
