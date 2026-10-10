#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const source = path.join(repositoryRoot, "src", "data", "magnifico-menu.json");
const output = path.resolve(
  process.argv[2] ?? path.join(repositoryRoot, ".wrangler", "fallback-seed.sql"),
);

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const menu = JSON.parse(await readFile(source, "utf8"));
const statements = ["PRAGMA foreign_keys = ON;"];
for (const category of menu.categories) {
  statements.push(
    `INSERT OR REPLACE INTO categories (id, name, slug, sort_order) VALUES (${sql(category.id)}, ${sql(category.name)}, ${sql(category.slug)}, ${sql(category.sortOrder)});`,
  );
}
for (const item of menu.menuItems) {
  statements.push(
    `INSERT OR REPLACE INTO menu_items (id, category_id, name, slug, description, price, image_url, is_popular, is_best_seller, is_available, display_order) VALUES (${sql(item.id)}, ${sql(item.categoryId)}, ${sql(item.name)}, ${sql(item.slug)}, ${sql(item.description)}, ${sql(item.price)}, ${sql(item.imageUrl || null)}, ${sql(item.isPopular)}, ${sql(item.isBestSeller ?? false)}, ${sql(item.isAvailable)}, ${sql(item.displayOrder ?? 0)});`,
  );
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(`Prepared fallback D1 seed: ${output}\n`);
