/**
 * Seed Supabase with BurgerHub demo menu data
 *
 * Usage:
 *   node scripts/seed-menu.mjs
 *
 * Requires in .env.local (or environment):
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
    const envPath = join(root, ".env.local");
    const raw = readFileSync(envPath, "utf8");
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
    // .env.local optional if vars are already set
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const menuData = JSON.parse(
  readFileSync(join(root, "src/data/burgerhub-demo-menu.json"), "utf8")
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
  image_url: item.imageUrl,
  is_popular: item.isPopular ?? false,
  is_best_seller: item.isBestSeller ?? item.isFeatured ?? false,
  is_available: item.isAvailable ?? true,
  is_available: item.isAvailable ?? true,
  tags: item.tags ?? [],
}));

async function seed() {
  console.log("Clearing existing menu data...");
  const { error: deleteItemsError } = await supabase
    .from("menu_items")
    .delete()
    .neq("id", "");
  if (deleteItemsError) throw deleteItemsError;

  const { error: deleteCatsError } = await supabase
    .from("categories")
    .delete()
    .neq("id", "");
  if (deleteCatsError) throw deleteCatsError;

  console.log(`Inserting ${categories.length} categories...`);
  const { error: catError } = await supabase.from("categories").insert(categories);
  if (catError) throw catError;

  console.log(`Inserting ${menuItems.length} menu items...`);
  const { error: itemsError } = await supabase.from("menu_items").insert(menuItems);
  if (itemsError) throw itemsError;

  console.log("Done.");
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Menu items: ${menuItems.length}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
