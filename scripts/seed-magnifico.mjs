/**
 * Seed Supabase with the Magnifico Street Food menu + default site settings.
 *
 * Prerequisites:
 *   1. Copy .env.example → .env.local with your NEW Supabase project keys
 *   2. Apply all migrations (001–019) — see supabase/README.md
 *
 * Usage:
 *   npm run seed
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already set
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase credentials.\n" +
      "  1. Copy .env.example to .env.local\n" +
      "  2. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n" +
      "  3. Apply migrations (supabase/README.md) before seeding"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const menuData = JSON.parse(
  readFileSync(join(root, "src/data/magnifico-menu.json"), "utf8")
);

const categories = menuData.categories.map((cat) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  description: cat.description ?? "",
  icon: cat.icon ?? null,
  sort_order: cat.sortOrder,
}));

const menuItems = menuData.menuItems.map((item) => ({
  id: item.id,
  category_id: item.categoryId,
  name: item.name,
  slug: item.slug,
  description: item.description ?? "",
  price: item.price,
  image_url: item.imageUrl || null,
  is_popular: item.isPopular ?? false,
  is_best_seller: item.isBestSeller ?? false,
  is_available: item.isAvailable ?? true,
  tags: item.tags ?? [],
  display_order: item.displayOrder ?? 0,
}));

async function seed() {
  console.log("Clearing existing menu data...");
  const { error: delItems } = await supabase
    .from("menu_items")
    .delete()
    .neq("id", "");
  if (delItems) throw delItems;

  const { error: delCats } = await supabase
    .from("categories")
    .delete()
    .neq("id", "");
  if (delCats) throw delCats;

  console.log(`Inserting ${categories.length} categories...`);
  const { error: catErr } = await supabase.from("categories").insert(categories);
  if (catErr) throw catErr;

  console.log(`Inserting ${menuItems.length} menu items...`);
  const { error: itemErr } = await supabase.from("menu_items").insert(menuItems);
  if (itemErr) throw itemErr;

  console.log("Updating site settings defaults...");
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const settings = {
    restaurant_name: "Magnifico Street Food",
    legal_name: "Magnifico Street Food",
    tagline: "Bold Lebanese street food",
    whatsapp_phone: "96181999162",
    instagram_url: "https://www.instagram.com/magnificostreetfood",
    hero_title: "Bold Lebanese street food",
    hero_subtitle: "Burgers, wraps, taco boxes & more — done magnifico.",
    hero_primary_label: "Order on WhatsApp",
    hero_secondary_label: "Browse the menu",
    hero_secondary_link: "/menu",
    meta_description:
      "Bold Lebanese street food — burgers, wraps, taco boxes and more, ordered via WhatsApp.",
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("site_settings")
      .update(settings)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("site_settings").insert(settings);
    if (error) throw error;
  }

  console.log("Done.");
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Menu items: ${menuItems.length}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
