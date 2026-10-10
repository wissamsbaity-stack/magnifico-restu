"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireAdminIdentity } from "@/lib/auth/admin";
import { getAdminAuthBackend } from "@/lib/auth/backend";
import { cloudflareAccessLogoutUrl } from "@/lib/auth/cloudflare-access";
import { getContentBackend } from "@/lib/content-backend";
import {
  createD1Branch,
  createD1Category,
  createD1MenuBanner,
  createD1MenuItem,
  deleteD1Branch,
  deleteD1Category,
  deleteD1MenuBanner,
  deleteD1MenuItem,
  reorderD1MenuBanners,
  reorderD1MenuItems,
  toggleD1MenuBanner,
  updateD1Branch,
  updateD1Category,
  updateD1MenuBanner,
  updateD1MenuItem,
  updateD1SiteSettings,
} from "@/lib/cloudflare/admin-mutations";
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

async function runD1(operation: () => Promise<void>): Promise<ActionResult | null> {
  if (getContentBackend() !== "d1") return null;
  await requireAdminIdentity();
  try {
    await operation();
    return { ok: true };
  } catch (error) {
    console.error("[admin D1 mutation]", error);
    return fail(error instanceof Error ? error.message : "D1 operation failed");
  }
}

export async function signOut(): Promise<void> {
  if (getAdminAuthBackend() === "cloudflare-access") {
    redirect(cloudflareAccessLogoutUrl());
  }
  const supabase = await createServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return fail("Category name is required");

  const slug = slugify(name);
  const id = `cat-${slug}`;
  const d1Result = await runD1(() =>
    createD1Category({ id, name, slug, sortOrder }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await insertRow(supabase, "categories", {
      id,
      name,
      slug,
      sort_order: sortOrder,
    });
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!id || !name) return fail("Category id and name are required");

  const slug = slugify(name);
  const d1Result = await runD1(() =>
    updateD1Category({ id, name, slug, sortOrder }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await updateRow(
      supabase,
      "categories",
      { name, slug, sort_order: sortOrder },
      "id",
      id,
    );
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const d1Result = await runD1(() => deleteD1Category(id));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  if (!name || !categoryId) return fail("Name and category are required");
  if (!price || price < 0) return fail("Valid price is required");

  const slug = `${slugify(name)}-${Date.now()}`;
  const id = `item-${Date.now()}`;
  const imageCrop = parseCrop(readCrop(formData, "image_crop"));
  const isPopular = formData.get("is_popular") === "on";
  const isBestSeller = formData.get("is_best_seller") === "on";
  const isAvailable = formData.get("is_available") !== "off";
  const d1Result = await runD1(() =>
    createD1MenuItem({
      id,
      name,
      slug,
      categoryId,
      description: description || null,
      price,
      imageUrl,
      imageCrop,
      isPopular,
      isBestSeller,
      isAvailable,
    }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { data: lastRows } = await supabase
      .from("menu_items")
      .select("display_order")
      .eq("category_id", categoryId)
      .order("display_order", { ascending: false })
      .limit(1);
    const lastInCategory = lastRows?.[0] as
      | { display_order: number }
      | undefined;
    const displayOrder = (lastInCategory?.display_order ?? -1) + 1;
    const { error } = await insertRow(supabase, "menu_items", {
      id,
      name,
      slug,
      category_id: categoryId,
      description: description || null,
      price,
      image_url: imageUrl,
      image_crop: imageCrop as Json | null,
      display_order: displayOrder,
      is_popular: isPopular,
      is_best_seller: isBestSeller,
      is_available: isAvailable,
    });
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  if (!id || !name || !categoryId) return fail("Missing required fields");

  const imageCrop = parseCrop(readCrop(formData, "image_crop"));
  const isPopular = formData.get("is_popular") === "on";
  const isBestSeller = formData.get("is_best_seller") === "on";
  const isAvailable = formData.get("is_available") === "on";
  const d1Result = await runD1(() =>
    updateD1MenuItem({
      id,
      name,
      categoryId,
      description: description || null,
      price,
      imageUrl,
      imageCrop,
      isPopular,
      isBestSeller,
      isAvailable,
    }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (d1Result) {
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  }

  const { supabase } = await requireAdmin();

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
    image_crop: imageCrop as Json | null,
    is_popular: isPopular,
    is_best_seller: isBestSeller,
    is_available: isAvailable,
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
  const d1Result = await runD1(() => deleteD1MenuItem(id));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function reorderMenuItems(
  categoryId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  if (!categoryId || !orderedIds.length) return { ok: true };

  const d1Result = await runD1(() => reorderD1MenuItems(orderedIds));
  if (d1Result && !d1Result.ok) return d1Result;
  if (d1Result) {
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  }

  const { supabase } = await requireAdmin();

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
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (!imageUrl) return fail("Banner image is required");

  const imageCrop = parseCrop(readCrop(formData, "image_crop"));
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const clickLink = String(formData.get("click_link") ?? "").trim() || null;
  const isEnabled = formData.get("is_enabled") === "on";
  const d1Result = await runD1(() =>
    createD1MenuBanner({
      imageUrl,
      imageCrop,
      caption,
      clickLink,
      isEnabled,
    }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { count } = await supabase
      .from("menu_banners")
      .select("id", { count: "exact", head: true });

    const { error } = await insertRow(supabase, "menu_banners", {
      image_url: imageUrl,
      image_crop: imageCrop as Json | null,
      caption,
      click_link: clickLink,
      sort_order: count ?? 0,
      is_enabled: isEnabled,
    });
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuBanner(
  formData: FormData
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (!id || !imageUrl) return fail("Banner id and image are required");

  const imageCrop = parseCrop(readCrop(formData, "image_crop"));
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const clickLink = String(formData.get("click_link") ?? "").trim() || null;
  const isEnabled = formData.get("is_enabled") === "on";
  const d1Result = await runD1(() =>
    updateD1MenuBanner({
      id,
      imageUrl,
      imageCrop,
      caption,
      clickLink,
      isEnabled,
    }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await updateRow(
      supabase,
      "menu_banners",
      {
        image_url: imageUrl,
        image_crop: imageCrop as Json | null,
        caption,
        click_link: clickLink,
        is_enabled: isEnabled,
      },
      "id",
      id,
    );
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteMenuBanner(id: string): Promise<ActionResult> {
  const d1Result = await runD1(() => deleteD1MenuBanner(id));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("menu_banners").delete().eq("id", id);
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function reorderMenuBanners(
  orderedIds: string[]
): Promise<ActionResult> {
  if (!orderedIds.length) return { ok: true };

  const d1Result = await runD1(() => reorderD1MenuBanners(orderedIds));
  if (d1Result && !d1Result.ok) return d1Result;
  if (d1Result) {
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  }

  const { supabase } = await requireAdmin();

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
  const d1Result = await runD1(() => toggleD1MenuBanner(id, enabled));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await updateRow(
      supabase,
      "menu_banners",
      { is_enabled: enabled },
      "id",
      id,
    );
    if (error) return fail(error.message);
  }
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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return fail("Branch name is required");
  const branch = {
    name,
    slug: slugify(name),
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsappPhone:
      String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
    googleMapsUrl:
      String(formData.get("google_maps_url") ?? "").trim() || null,
    openingHours: parseOpeningHours(formData),
    sortOrder: Number(formData.get("sort_order") ?? 0),
    isActive: formData.get("is_active") !== "off",
  };
  const d1Result = await runD1(() => createD1Branch(branch));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await insertRow(supabase, "branches", {
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      phone: branch.phone,
      whatsapp_phone: branch.whatsappPhone,
      google_maps_url: branch.googleMapsUrl,
      opening_hours: branch.openingHours,
      sort_order: branch.sortOrder,
      is_active: branch.isActive,
    });
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function updateBranch(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return fail("Branch id and name are required");
  const branch = {
    id,
    name,
    slug: slugify(name),
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsappPhone:
      String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
    googleMapsUrl:
      String(formData.get("google_maps_url") ?? "").trim() || null,
    openingHours: parseOpeningHours(formData),
    sortOrder: Number(formData.get("sort_order") ?? 0),
    isActive: formData.get("is_active") === "on",
  };
  const d1Result = await runD1(() => updateD1Branch(branch));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await updateRow(
      supabase,
      "branches",
      {
        name: branch.name,
        slug: branch.slug,
        address: branch.address,
        phone: branch.phone,
        whatsapp_phone: branch.whatsappPhone,
        google_maps_url: branch.googleMapsUrl,
        opening_hours: branch.openingHours,
        sort_order: branch.sortOrder,
        is_active: branch.isActive,
      },
      "id",
      id,
    );
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function deleteBranch(id: string): Promise<ActionResult> {
  const d1Result = await runD1(() => deleteD1Branch(id));
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/branches");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function updateSiteSettings(
  formData: FormData
): Promise<ActionResult> {
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

  const d1Result = await runD1(() =>
    updateD1SiteSettings({
      id: settingsId || undefined,
      restaurantName: payload.restaurant_name,
      email: payload.email,
      deliveryFee: payload.delivery_fee,
      instagramUrl: payload.instagram_url,
      facebookUrl: payload.facebook_url,
      tiktokUrl: payload.tiktok_url,
      logoUrl: payload.logo_url,
      heroTitle: payload.hero_title,
    }),
  );
  if (d1Result && !d1Result.ok) return d1Result;
  if (!d1Result) {
    const { supabase } = await requireAdmin();

    const { error } = settingsId
      ? await updateRow(supabase, "site_settings", payload, "id", settingsId)
      : await insertRow(supabase, "site_settings", {
          ...payload,
          whatsapp_phone: "96181999162",
        });
    if (error) return fail(error.message);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/menu");
  revalidatePath("/contact");
  revalidatePath("/checkout");
  return { ok: true };
}
