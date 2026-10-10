import "server-only";

import { getD1Database } from "@/lib/cloudflare/database";
import type {
  BranchRow,
  CategoryRow,
  Database,
  Json,
  MenuItemRow,
  OpeningHour,
  SiteSettingsRow,
} from "@/lib/supabase/types";

export type MenuBannerRow =
  Database["public"]["Tables"]["menu_banners"]["Row"];

type RawRow = Record<string, unknown>;

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapCategoryRow(row: RawRow): CategoryRow {
  return row as unknown as CategoryRow;
}

function mapMenuItemRow(row: RawRow): MenuItemRow {
  return {
    ...(row as unknown as MenuItemRow),
    is_popular: Boolean(row.is_popular),
    is_best_seller: Boolean(row.is_best_seller),
    is_available: Boolean(row.is_available),
    tags: parseJson<string[]>(row.tags, []),
    image_crop: parseJson<Json | null>(row.image_crop, null),
  };
}

function mapBannerRow(row: RawRow): MenuBannerRow {
  return {
    ...(row as unknown as MenuBannerRow),
    is_enabled: Boolean(row.is_enabled),
    image_crop: parseJson<Json | null>(row.image_crop, null),
  };
}

function mapBranchRow(row: RawRow): BranchRow {
  return {
    ...(row as unknown as BranchRow),
    is_active: Boolean(row.is_active),
    opening_hours: parseJson<OpeningHour[]>(row.opening_hours, []),
    image_crop: parseJson<Json | null>(row.image_crop, null),
  };
}

function mapSiteSettingsRow(row: RawRow): SiteSettingsRow {
  return {
    ...(row as unknown as SiteSettingsRow),
    singleton: Boolean(row.singleton),
    opening_hours: parseJson<OpeningHour[]>(row.opening_hours, []),
    hero_image_crop: parseJson<Json | null>(row.hero_image_crop, null),
  };
}

export async function getD1Categories(): Promise<CategoryRow[]> {
  const database = await getD1Database();
  const result = await database
    .prepare(
      "SELECT id, name, slug, description, icon, sort_order, created_at, updated_at FROM categories ORDER BY sort_order ASC, name ASC",
    )
    .all<RawRow>();
  return result.results.map(mapCategoryRow);
}

export async function getD1MenuItems(options?: {
  availableOnly?: boolean;
}): Promise<MenuItemRow[]> {
  const database = await getD1Database();
  const where = options?.availableOnly ? " WHERE is_available = 1" : "";
  const result = await database
    .prepare(
      `SELECT id, category_id, name, slug, description, price, image_url, is_popular, is_best_seller, is_available, tags, display_order, image_crop, created_at, updated_at FROM menu_items${where} ORDER BY display_order ASC, name ASC`,
    )
    .all<RawRow>();
  return result.results.map(mapMenuItemRow);
}

export async function getD1MenuBanners(options?: {
  enabledOnly?: boolean;
}): Promise<MenuBannerRow[]> {
  const database = await getD1Database();
  const where = options?.enabledOnly ? " WHERE is_enabled = 1" : "";
  const result = await database
    .prepare(
      `SELECT id, image_url, image_crop, caption, click_link, sort_order, is_enabled, created_at, updated_at FROM menu_banners${where} ORDER BY sort_order ASC`,
    )
    .all<RawRow>();
  return result.results.map(mapBannerRow);
}

export async function getD1Branches(options?: {
  activeOnly?: boolean;
}): Promise<BranchRow[]> {
  const database = await getD1Database();
  const where = options?.activeOnly ? " WHERE is_active = 1" : "";
  const result = await database
    .prepare(
      `SELECT id, name, slug, address, phone, whatsapp_phone, google_maps_url, image_url, image_crop, opening_hours, sort_order, is_active, created_at, updated_at FROM branches${where} ORDER BY sort_order ASC`,
    )
    .all<RawRow>();
  return result.results.map(mapBranchRow);
}

export async function getD1SiteSettingsRow(): Promise<SiteSettingsRow | null> {
  const database = await getD1Database();
  const row = await database
    .prepare("SELECT * FROM site_settings WHERE singleton = 1 LIMIT 1")
    .first<RawRow>();
  return row ? mapSiteSettingsRow(row) : null;
}

export async function getD1AdminStats(): Promise<{
  categories: number;
  menuItems: number;
  banners: number;
  branches: number;
}> {
  const database = await getD1Database();
  const row = await database
    .prepare(
      "SELECT (SELECT COUNT(*) FROM categories) AS categories, (SELECT COUNT(*) FROM menu_items) AS menuItems, (SELECT COUNT(*) FROM menu_banners) AS banners, (SELECT COUNT(*) FROM branches) AS branches",
    )
    .first<{
      categories: number;
      menuItems: number;
      banners: number;
      branches: number;
    }>();
  return row ?? { categories: 0, menuItems: 0, banners: 0, branches: 0 };
}
