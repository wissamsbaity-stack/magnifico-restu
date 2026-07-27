import type { Category, MenuItem } from "@/types/menu";

/** Compare two menu items: displayOrder first, then name A→Z. */
export function compareMenuItems(a: MenuItem, b: MenuItem): number {
  const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  });
}

export function sortMenuItems(items: MenuItem[]): MenuItem[] {
  return [...items].sort(compareMenuItems);
}

export function sortCategories(categories: Category[]): Category[] {
  return [...(categories ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
}

/** Group items under their category in category sortOrder (Appetizers → Beverages). */
export function groupMenuItemsByCategory(
  items: MenuItem[],
  categories: Category[]
): { category: Category; items: MenuItem[] }[] {
  const sorted = sortMenuItems(items);

  return sortCategories(categories)
    .map((category) => ({
      category,
      items: sorted.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);
}

/** First available item image per category — for category tiles without fake photography. */
export function getCategoryCoverMap(
  items: MenuItem[]
): Map<string, { imageUrl: string; imageCrop: MenuItem["imageCrop"] }> {
  const map = new Map<
    string,
    { imageUrl: string; imageCrop: MenuItem["imageCrop"] }
  >();

  for (const item of sortMenuItems(items)) {
    if (!item.isAvailable || !item.imageUrl || map.has(item.categoryId)) {
      continue;
    }
    map.set(item.categoryId, {
      imageUrl: item.imageUrl,
      imageCrop: item.imageCrop,
    });
  }

  return map;
}

/** Available item count per category. */
export function getCategoryItemCounts(items: MenuItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.isAvailable) continue;
    map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
  }
  return map;
}
