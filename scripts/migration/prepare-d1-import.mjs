#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const TABLES = {
  categories: [
    "id",
    "name",
    "slug",
    "description",
    "icon",
    "sort_order",
    "created_at",
    "updated_at",
  ],
  menu_items: [
    "id",
    "category_id",
    "name",
    "slug",
    "description",
    "price",
    "image_url",
    "is_popular",
    "is_best_seller",
    "is_available",
    "tags",
    "display_order",
    "image_crop",
    "created_at",
    "updated_at",
  ],
  menu_banners: [
    "id",
    "image_url",
    "image_crop",
    "caption",
    "click_link",
    "sort_order",
    "is_enabled",
    "created_at",
    "updated_at",
  ],
  branches: [
    "id",
    "name",
    "slug",
    "address",
    "phone",
    "whatsapp_phone",
    "google_maps_url",
    "image_url",
    "image_crop",
    "opening_hours",
    "sort_order",
    "is_active",
    "created_at",
    "updated_at",
  ],
  site_settings: [
    "id",
    "singleton",
    "restaurant_name",
    "legal_name",
    "tagline",
    "whatsapp_phone",
    "phone_primary",
    "phone_secondary",
    "email",
    "address_street",
    "address_city",
    "address_state",
    "address_country",
    "opening_hours",
    "delivery_fee",
    "min_order",
    "checkout_method",
    "instagram_url",
    "facebook_url",
    "tiktok_url",
    "logo_url",
    "hero_image_url",
    "hero_image_crop",
    "google_maps_url",
    "site_url",
    "meta_description",
    "hero_title",
    "created_at",
    "updated_at",
  ],
  profiles: [
    "id",
    "email",
    "full_name",
    "role",
    "created_at",
    "updated_at",
  ],
  orders: [
    "id",
    "customer_name",
    "customer_phone",
    "city",
    "street",
    "building",
    "delivery_instructions",
    "items",
    "subtotal",
    "delivery_fee",
    "total",
    "status",
    "order_type",
    "order_number",
    "is_read",
    "created_at",
    "updated_at",
  ],
};

const JSON_COLUMNS = new Set([
  "menu_items.tags",
  "menu_items.image_crop",
  "menu_banners.image_crop",
  "branches.image_crop",
  "branches.opening_hours",
  "site_settings.opening_hours",
  "site_settings.hero_image_crop",
  "orders.items",
]);

const BOOLEAN_COLUMNS = new Set([
  "menu_items.is_popular",
  "menu_items.is_best_seller",
  "menu_items.is_available",
  "menu_banners.is_enabled",
  "branches.is_active",
  "site_settings.singleton",
  "orders.is_read",
]);

const MEDIA_COLUMNS = new Set([
  "menu_items.image_url",
  "menu_banners.image_url",
  "branches.image_url",
  "site_settings.logo_url",
  "site_settings.hero_image_url",
]);

function parseArguments(argv) {
  const options = {
    backupDirectory: null,
    output: null,
    urlMap: null,
    allowUnmappedMedia: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--backup") {
      options.backupDirectory = path.resolve(argv[++index]);
    } else if (argument === "--output") {
      options.output = path.resolve(argv[++index]);
    } else if (argument === "--url-map") {
      options.urlMap = path.resolve(argv[++index]);
    } else if (argument === "--allow-unmapped-media") {
      options.allowUnmappedMedia = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.backupDirectory) {
    throw new Error("--backup <directory> is required.");
  }
  options.output ??= path.join(options.backupDirectory, "d1-import.sql");
  return options;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Invalid number: ${value}`);
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function isSupabaseMediaUrl(value) {
  if (typeof value !== "string" || !value) return false;
  try {
    return new URL(value).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function transformValue({
  table,
  column,
  value,
  urlMap,
  allowUnmappedMedia,
}) {
  const qualifiedColumn = `${table}.${column}`;
  if (JSON_COLUMNS.has(qualifiedColumn) && value !== null && value !== undefined) {
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  if (BOOLEAN_COLUMNS.has(qualifiedColumn)) return Boolean(value);
  if (MEDIA_COLUMNS.has(qualifiedColumn) && value) {
    const replacement = urlMap[value];
    if (replacement) return replacement;
    if (isSupabaseMediaUrl(value) && !allowUnmappedMedia) {
      throw new Error(
        `No R2 URL mapping exists for ${qualifiedColumn}: ${value}`,
      );
    }
  }
  return value;
}

async function readVerifiedTable(backupDirectory, manifest, table) {
  const filename = path.join(backupDirectory, "database", `${table}.json`);
  const contents = await readFile(filename, "utf8");
  const expected = manifest.tables?.[table];
  if (!expected) throw new Error(`Manifest is missing table ${table}.`);
  if (sha256(contents) !== expected.sha256) {
    throw new Error(`Checksum mismatch for ${table}.json.`);
  }
  const rows = JSON.parse(contents);
  if (!Array.isArray(rows) || rows.length !== expected.rows) {
    throw new Error(`Row count mismatch for ${table}.json.`);
  }
  return rows;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const manifest = JSON.parse(
    await readFile(path.join(options.backupDirectory, "manifest.json"), "utf8"),
  );
  const urlMap = options.urlMap
    ? JSON.parse(await readFile(options.urlMap, "utf8"))
    : {};

  const statements = [
    "-- Generated from a checksum-verified Supabase backup.",
    "PRAGMA foreign_keys = ON;",
  ];

  for (const [table, columns] of Object.entries(TABLES)) {
    const rows = await readVerifiedTable(options.backupDirectory, manifest, table);
    for (const row of rows) {
      const values = columns.map((column) =>
        sqlValue(
          transformValue({
            table,
            column,
            value: row[column],
            urlMap,
            allowUnmappedMedia: options.allowUnmappedMedia,
          }),
        ),
      );
      statements.push(
        `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`,
      );
    }
  }

  statements.push(
    "UPDATE content_version SET version = version + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = 1;",
  );
  await writeFile(options.output, `${statements.join("\n")}\n`, "utf8");
  process.stdout.write(`Prepared D1 import: ${options.output}\n`);
}

await main();
