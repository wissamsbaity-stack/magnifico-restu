"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/supabase/mappers";
import { parseCrop } from "@/lib/image-crop";
import type { Database, Json, OpeningHour } from "@/lib/supabase/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Read a serialized crop from a form field; returns a JSON object or null. */
function readCrop(formData: FormData, field: string): Json | null {
  return (parseCrop(String(formData.get(field) ?? "")) ?? null) as Json | null;
}

type Tables = Database["public"]["Tables"];
type SupabaseFrom = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

function insertRow<T extends keyof Tables>(
  supabase: SupabaseFrom,
  table: T,
  row: Tables[T]["Insert"]
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table).insert(row);
}

function updateRow<T extends keyof Tables>(
  supabase: SupabaseFrom,
  table: T,
  row: Tables[T]["Update"],
  column: string,
  value: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table).update(row).eq(column, value);
}

function fail(message: string): ActionResult {
  return { ok: false, error: message };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return fail("Category name is required");

  const slug = slugify(name);
  const id = `cat-${slug}`;
  const { error } = await insertRow(supabase, "categories", {
    id,
    name,
    slug,
    sort_order: sortOrder,
  });

  if (error) return fail(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!id || !name) return fail("Category id and name are required");

  const { error } = await updateRow(
    supabase,
    "categories",
    {
      name,
      slug: slugify(name),
      sort_order: sortOrder,
    },
    "id",
    id
  );

  if (error) return fail(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  if (!name || !categoryId) return fail("Name and category are required");
  if (!price || price < 0) return fail("Valid price is required");

  const slug = `${slugify(name)}-${Date.now()}`;
  const id = `item-${Date.now()}`;

  const { data: lastRows } = await supabase
    .from("menu_items")
    .select("display_order")
    .eq("category_id", categoryId)
    .order("display_order", { ascending: false })
    .limit(1);

  const lastInCategory = lastRows?.[0] as { display_order: number } | undefined;
  const displayOrder = (lastInCategory?.display_order ?? -1) + 1;

  const { error } = await insertRow(supabase, "menu_items", {
    id,
    name,
    slug,
    category_id: categoryId,
    description: description || null,
    price,
    image_url: imageUrl,
    image_crop: readCrop(formData, "image_crop"),
    display_order: displayOrder,
    is_popular: formData.get("is_popular") === "on",
    is_best_seller: formData.get("is_best_seller") === "on",
    is_available: formData.get("is_available") !== "off",
  });

  if (error) return fail(error.message);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  if (!id || !name || !categoryId) return fail("Missing required fields");

  const { data: existingRows } = await supabase
    .from("menu_items")
    .select("category_id")
    .eq("id", id)
    .limit(1);

  const existing = existingRows?.[0] as { category_id: string } | undefined;

  const patch: Tables["menu_items"]["Update"] = {
    name,
    category_id: categoryId,
    description: description || null,
    price,
    image_url: imageUrl,
    image_crop: readCrop(formData, "image_crop"),
    is_popular: formData.get("is_popular") === "on",
    is_best_seller: formData.get("is_best_seller") === "on",
    is_available: formData.get("is_available") === "on",
  };

  if (existing && existing.category_id !== categoryId) {
    const { data: lastRows } = await supabase
      .from("menu_items")
      .select("display_order")
      .eq("category_id", categoryId)
      .order("display_order", { ascending: false })
      .limit(1);

    const lastInCategory = lastRows?.[0] as { display_order: number } | undefined;
    patch.display_order = (lastInCategory?.display_order ?? -1) + 1;
  }

  const { error } = await updateRow(
    supabase,
    "menu_items",
    patch,
    "id",
    id
  );

  if (error) return fail(error.message);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function reorderMenuItems(
  categoryId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!categoryId || !orderedIds.length) return { ok: true };

  const updates = orderedIds.map((id, index) =>
    updateRow(
      supabase,
      "menu_items",
      { display_order: index },
      "id",
      id
    )
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return fail(failed.error.message);

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function createMenuBanner(
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (!imageUrl) return fail("Banner image is required");

  const { count } = await supabase
    .from("menu_banners")
    .select("id", { count: "exact", head: true });

  const { error } = await insertRow(supabase, "menu_banners", {
    image_url: imageUrl,
    image_crop: readCrop(formData, "image_crop"),
    caption: String(formData.get("caption") ?? "").trim() || null,
    click_link: String(formData.get("click_link") ?? "").trim() || null,
    sort_order: count ?? 0,
    is_enabled: formData.get("is_enabled") === "on",
  });

  if (error) return fail(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuBanner(
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (!id || !imageUrl) return fail("Banner id and image are required");

  const { error } = await updateRow(
    supabase,
    "menu_banners",
    {
      image_url: imageUrl,
      image_crop: readCrop(formData, "image_crop"),
      caption: String(formData.get("caption") ?? "").trim() || null,
      click_link: String(formData.get("click_link") ?? "").trim() || null,
      is_enabled: formData.get("is_enabled") === "on",
    },
    "id",
    id
  );

  if (error) return fail(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteMenuBanner(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("menu_banners").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function reorderMenuBanners(
  orderedIds: string[]
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!orderedIds.length) return { ok: true };

  const updates = orderedIds.map((id, index) =>
    updateRow(supabase, "menu_banners", { sort_order: index }, "id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return fail(failed.error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleMenuBanner(
  id: string,
  enabled: boolean
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await updateRow(
    supabase,
    "menu_banners",
    { is_enabled: enabled },
    "id",
    id
  );
  if (error) return fail(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

function parseOpeningHours(formData: FormData): OpeningHour[] {
  try {
    return JSON.parse(
      String(formData.get("opening_hours") ?? "[]")
    ) as OpeningHour[];
  } catch {
    return [];
  }
}

export async function createBranch(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return fail("Branch name is required");

  const { error } = await insertRow(supabase, "branches", {
    name,
    slug: slugify(name),
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp_phone:
      String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
    google_maps_url: String(formData.get("google_maps_url") ?? "").trim() || null,
    opening_hours: parseOpeningHours(formData),
    sort_order: Number(formData.get("sort_order") ?? 0),
    is_active: formData.get("is_active") !== "off",
  });

  if (error) return fail(error.message);
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function updateBranch(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return fail("Branch id and name are required");

  const { error } = await updateRow(
    supabase,
    "branches",
    {
      name,
      slug: slugify(name),
      address: String(formData.get("address") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      whatsapp_phone:
        String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
      google_maps_url:
        String(formData.get("google_maps_url") ?? "").trim() || null,
      opening_hours: parseOpeningHours(formData),
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "on",
    },
    "id",
    id
  );

  if (error) return fail(error.message);
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function deleteBranch(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("branches").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function updateSiteSettings(
  formData: FormData
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const settingsId = String(formData.get("id") ?? "");
  const restaurantName = String(formData.get("restaurant_name") ?? "").trim();
  if (!restaurantName) return fail("Restaurant name is required");

  const payload = {
    restaurant_name: restaurantName,
    email: String(formData.get("email") ?? "").trim() || null,
    delivery_fee: Number(formData.get("delivery_fee") ?? 0),
    instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
    facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
    tiktok_url: String(formData.get("tiktok_url") ?? "").trim() || null,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    // Hero photos live in Hero Banners — clear legacy fallback image.
    hero_image_url: null,
    hero_image_crop: null,
    hero_title: String(formData.get("hero_title") ?? "").trim() || null,
  };

  const { error } = settingsId
    ? await updateRow(supabase, "site_settings", payload, "id", settingsId)
    : await insertRow(supabase, "site_settings", {
        ...payload,
        whatsapp_phone: "96181999162",
      });
  if (error) return fail(error.message);

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/menu");
  revalidatePath("/contact");
  revalidatePath("/checkout");
  return { ok: true };
}
