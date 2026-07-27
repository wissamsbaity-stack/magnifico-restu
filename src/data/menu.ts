import type { Category, MenuItem } from "@/types/menu";
import demoMenu from "./magnifico-menu.json";

export const DELIVERY_FEE = 0;

export const categories: Category[] = demoMenu.categories
  .map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
  }))
  .sort((a, b) => a.sortOrder - b.sortOrder);

export const menuItems: MenuItem[] = demoMenu.menuItems.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  description: item.description,
  price: item.price,
  categoryId: item.categoryId,
  imageUrl: item.imageUrl,
  isPopular: item.isPopular,
  isBestSeller: item.isBestSeller ?? false,
  isAvailable: item.isAvailable,
  displayOrder: (item as { displayOrder?: number }).displayOrder ?? 0,
  imageCrop: null,
}));

export const menuStats = demoMenu.stats;
