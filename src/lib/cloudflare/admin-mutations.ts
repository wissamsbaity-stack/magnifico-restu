import "server-only";

import { getD1Database } from "@/lib/cloudflare/database";
import type { ImageCrop } from "@/lib/image-crop";
import type { OpeningHour } from "@/lib/supabase/types";

function json(value: unknown): string | null {
  return value === null || value === undefined ? null : JSON.stringify(value);
}

function flag(value: boolean): number {
  return value ? 1 : 0;
}

function bumpContentVersion(database: D1Database): D1PreparedStatement {
  return database.prepare(
    "UPDATE content_version SET version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = 1",
  );
}

async function mutate(...statements: D1PreparedStatement[]): Promise<void> {
  const database = await getD1Database();
  await database.batch([...statements, bumpContentVersion(database)]);
}

export async function createD1Category(input: {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare(
        "INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)",
      )
      .bind(input.id, input.name, input.slug, input.sortOrder),
  );
}

export async function updateD1Category(input: {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare(
        "UPDATE categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?",
      )
      .bind(input.name, input.slug, input.sortOrder, input.id),
  );
}

export async function deleteD1Category(id: string): Promise<void> {
  const database = await getD1Database();
  await mutate(database.prepare("DELETE FROM categories WHERE id = ?").bind(id));
}

export interface D1MenuItemInput {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  imageCrop: ImageCrop | null;
  isPopular: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
}

export async function createD1MenuItem(input: D1MenuItemInput): Promise<void> {
  const database = await getD1Database();
  const last = await database
    .prepare(
      "SELECT COALESCE(MAX(display_order), -1) AS display_order FROM menu_items WHERE category_id = ?",
    )
    .bind(input.categoryId)
    .first<{ display_order: number }>();
  await mutate(
    database
      .prepare(
        "INSERT INTO menu_items (id, name, slug, category_id, description, price, image_url, image_crop, display_order, is_popular, is_best_seller, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        input.id,
        input.name,
        input.slug,
        input.categoryId,
        input.description,
        input.price,
        input.imageUrl,
        json(input.imageCrop),
        Number(last?.display_order ?? -1) + 1,
        flag(input.isPopular),
        flag(input.isBestSeller),
        flag(input.isAvailable),
      ),
  );
}

export async function updateD1MenuItem(
  input: Omit<D1MenuItemInput, "slug">,
): Promise<void> {
  const database = await getD1Database();
  const existing = await database
    .prepare("SELECT category_id FROM menu_items WHERE id = ?")
    .bind(input.id)
    .first<{ category_id: string }>();
  let displayOrder: number | null = null;
  if (existing && existing.category_id !== input.categoryId) {
    const last = await database
      .prepare(
        "SELECT COALESCE(MAX(display_order), -1) AS display_order FROM menu_items WHERE category_id = ?",
      )
      .bind(input.categoryId)
      .first<{ display_order: number }>();
    displayOrder = Number(last?.display_order ?? -1) + 1;
  }

  await mutate(
    database
      .prepare(
        "UPDATE menu_items SET name = ?, category_id = ?, description = ?, price = ?, image_url = ?, image_crop = ?, is_popular = ?, is_best_seller = ?, is_available = ?, display_order = COALESCE(?, display_order) WHERE id = ?",
      )
      .bind(
        input.name,
        input.categoryId,
        input.description,
        input.price,
        input.imageUrl,
        json(input.imageCrop),
        flag(input.isPopular),
        flag(input.isBestSeller),
        flag(input.isAvailable),
        displayOrder,
        input.id,
      ),
  );
}

export async function deleteD1MenuItem(id: string): Promise<void> {
  const database = await getD1Database();
  await mutate(database.prepare("DELETE FROM menu_items WHERE id = ?").bind(id));
}

export async function reorderD1MenuItems(orderedIds: string[]): Promise<void> {
  if (!orderedIds.length) return;
  const database = await getD1Database();
  await mutate(
    ...orderedIds.map((id, index) =>
      database
        .prepare("UPDATE menu_items SET display_order = ? WHERE id = ?")
        .bind(index, id),
    ),
  );
}

export interface D1BannerInput {
  id?: string;
  imageUrl: string;
  imageCrop: ImageCrop | null;
  caption: string | null;
  clickLink: string | null;
  isEnabled: boolean;
}

export async function createD1MenuBanner(input: D1BannerInput): Promise<void> {
  const database = await getD1Database();
  const count = await database
    .prepare("SELECT COUNT(*) AS count FROM menu_banners")
    .first<{ count: number }>();
  await mutate(
    database
      .prepare(
        "INSERT INTO menu_banners (id, image_url, image_crop, caption, click_link, sort_order, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        input.id ?? crypto.randomUUID(),
        input.imageUrl,
        json(input.imageCrop),
        input.caption,
        input.clickLink,
        Number(count?.count ?? 0),
        flag(input.isEnabled),
      ),
  );
}

export async function updateD1MenuBanner(
  input: D1BannerInput & { id: string },
): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare(
        "UPDATE menu_banners SET image_url = ?, image_crop = ?, caption = ?, click_link = ?, is_enabled = ? WHERE id = ?",
      )
      .bind(
        input.imageUrl,
        json(input.imageCrop),
        input.caption,
        input.clickLink,
        flag(input.isEnabled),
        input.id,
      ),
  );
}

export async function deleteD1MenuBanner(id: string): Promise<void> {
  const database = await getD1Database();
  await mutate(database.prepare("DELETE FROM menu_banners WHERE id = ?").bind(id));
}

export async function reorderD1MenuBanners(orderedIds: string[]): Promise<void> {
  if (!orderedIds.length) return;
  const database = await getD1Database();
  await mutate(
    ...orderedIds.map((id, index) =>
      database
        .prepare("UPDATE menu_banners SET sort_order = ? WHERE id = ?")
        .bind(index, id),
    ),
  );
}

export async function toggleD1MenuBanner(
  id: string,
  enabled: boolean,
): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare("UPDATE menu_banners SET is_enabled = ? WHERE id = ?")
      .bind(flag(enabled), id),
  );
}

export interface D1BranchInput {
  id?: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  googleMapsUrl: string | null;
  openingHours: OpeningHour[];
  sortOrder: number;
  isActive: boolean;
}

export async function createD1Branch(input: D1BranchInput): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare(
        "INSERT INTO branches (id, name, slug, address, phone, whatsapp_phone, google_maps_url, opening_hours, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        input.id ?? crypto.randomUUID(),
        input.name,
        input.slug,
        input.address,
        input.phone,
        input.whatsappPhone,
        input.googleMapsUrl,
        json(input.openingHours),
        input.sortOrder,
        flag(input.isActive),
      ),
  );
}

export async function updateD1Branch(
  input: D1BranchInput & { id: string },
): Promise<void> {
  const database = await getD1Database();
  await mutate(
    database
      .prepare(
        "UPDATE branches SET name = ?, slug = ?, address = ?, phone = ?, whatsapp_phone = ?, google_maps_url = ?, opening_hours = ?, sort_order = ?, is_active = ? WHERE id = ?",
      )
      .bind(
        input.name,
        input.slug,
        input.address,
        input.phone,
        input.whatsappPhone,
        input.googleMapsUrl,
        json(input.openingHours),
        input.sortOrder,
        flag(input.isActive),
        input.id,
      ),
  );
}

export async function deleteD1Branch(id: string): Promise<void> {
  const database = await getD1Database();
  await mutate(database.prepare("DELETE FROM branches WHERE id = ?").bind(id));
}

export interface D1SiteSettingsInput {
  id?: string;
  restaurantName: string;
  email: string | null;
  deliveryFee: number;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string | null;
  heroTitle: string | null;
}

export async function updateD1SiteSettings(
  input: D1SiteSettingsInput,
): Promise<void> {
  const database = await getD1Database();
  const statement = input.id
    ? database
        .prepare(
          "UPDATE site_settings SET restaurant_name = ?, email = ?, delivery_fee = ?, instagram_url = ?, facebook_url = ?, tiktok_url = ?, logo_url = ?, hero_image_url = NULL, hero_image_crop = NULL, hero_title = ? WHERE id = ?",
        )
        .bind(
          input.restaurantName,
          input.email,
          input.deliveryFee,
          input.instagramUrl,
          input.facebookUrl,
          input.tiktokUrl,
          input.logoUrl,
          input.heroTitle,
          input.id,
        )
    : database
        .prepare(
          "INSERT INTO site_settings (id, singleton, restaurant_name, whatsapp_phone, email, delivery_fee, instagram_url, facebook_url, tiktok_url, logo_url, hero_title) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          crypto.randomUUID(),
          input.restaurantName,
          "96181999162",
          input.email,
          input.deliveryFee,
          input.instagramUrl,
          input.facebookUrl,
          input.tiktokUrl,
          input.logoUrl,
          input.heroTitle,
        );
  await mutate(statement);
}
