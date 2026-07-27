import type { Category, MenuItem } from "@/types/menu";
import type { CategoryRow, MenuItemRow } from "@/lib/supabase/types";
import { parseCrop } from "@/lib/image-crop";

import { LOGO_SRC } from "@/lib/branding/logo";

const PLACEHOLDER_IMAGE = LOGO_SRC;

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

export function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    categoryId: row.category_id,
    imageUrl: row.image_url ?? PLACEHOLDER_IMAGE,
    isPopular: row.is_popular,
    isBestSeller: row.is_best_seller,
    isAvailable: row.is_available,
    displayOrder: row.display_order ?? 0,
    imageCrop: parseCrop(row.image_crop),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
