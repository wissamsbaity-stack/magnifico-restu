#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function writeJson(filename, value) {
  const contents = `${JSON.stringify(value, null, 2)}\n`;
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, contents, "utf8");
  return {
    rows: Array.isArray(value) ? value.length : undefined,
    bytes: Buffer.byteLength(contents),
    sha256: sha256(contents),
  };
}

async function main() {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "magnifico-migration-smoke-"),
  );
  const backupDirectory = path.join(temporaryRoot, "backup");
  const sourceUrl =
    "https://example.supabase.co/storage/v1/object/public/menu-images/items/test.png";

  try {
    const now = "2026-10-10T00:00:00.000Z";
    const tables = {
      categories: [
        {
          id: "cat-test",
          name: "Test",
          slug: "test",
          description: null,
          icon: null,
          sort_order: 0,
          created_at: now,
          updated_at: now,
        },
      ],
      menu_items: [
        {
          id: "item-test",
          category_id: "cat-test",
          name: "Test Item",
          slug: "test-item",
          description: "Migration smoke test",
          price: 1.5,
          image_url: sourceUrl,
          is_popular: false,
          is_best_seller: true,
          is_available: true,
          tags: [],
          display_order: 0,
          image_crop: null,
          created_at: now,
          updated_at: now,
        },
      ],
      menu_banners: [],
      branches: [],
      site_settings: [],
      profiles: [],
      orders: [],
    };

    const manifest = {
      formatVersion: 1,
      createdAt: now,
      sourceHost: "example.supabase.co",
      tables: {},
      authUsers: { users: 0 },
      storageBuckets: [],
    };
    for (const [table, rows] of Object.entries(tables)) {
      manifest.tables[table] = await writeJson(
        path.join(backupDirectory, "database", `${table}.json`),
        rows,
      );
    }

    const storageFile = path.join(
      backupDirectory,
      "storage",
      "menu-images",
      "items",
      "test.png",
    );
    await mkdir(path.dirname(storageFile), { recursive: true });
    await copyFile(path.join(repositoryRoot, "public", "logo.png"), storageFile);
    const storageBytes = await readFile(storageFile);
    manifest.storageBuckets.push({
      id: "menu-images",
      name: "menu-images",
      public: true,
      objects: [
        {
          path: "items/test.png",
          bytes: storageBytes.length,
          sha256: sha256(storageBytes),
          metadata: { mimetype: "image/png" },
        },
      ],
    });
    await writeJson(path.join(backupDirectory, "manifest.json"), manifest);

    execFileSync(
      process.execPath,
      [
        path.join(scriptDirectory, "prepare-r2-media.mjs"),
        "--backup",
        backupDirectory,
        "--public-base-url",
        "https://media.magnificostreetfood.com",
      ],
      { stdio: "inherit" },
    );

    const preparedDirectory = path.join(backupDirectory, "r2-prepared");
    const mediaManifest = JSON.parse(
      await readFile(path.join(preparedDirectory, "manifest.json"), "utf8"),
    );
    assert.equal(mediaManifest.objects.length, 1);
    assert.equal(mediaManifest.objects[0].display.contentType, "image/webp");
    assert.equal(mediaManifest.objects[0].thumbnail.contentType, "image/webp");

    const urlMapFile = path.join(preparedDirectory, "r2-url-map.json");
    const urlMap = JSON.parse(await readFile(urlMapFile, "utf8"));
    assert.match(urlMap[sourceUrl], /^https:\/\/media\.magnificostreetfood\.com\//u);

    const d1Import = path.join(backupDirectory, "d1-import.sql");
    execFileSync(
      process.execPath,
      [
        path.join(scriptDirectory, "prepare-d1-import.mjs"),
        "--backup",
        backupDirectory,
        "--url-map",
        urlMapFile,
        "--output",
        d1Import,
      ],
      { stdio: "inherit" },
    );
    const sql = await readFile(d1Import, "utf8");
    assert.doesNotMatch(sql, /supabase\.co/u);
    assert.match(sql, /media\.magnificostreetfood\.com/u);
    assert.match(sql, /INSERT OR REPLACE INTO menu_items/u);

    const { DatabaseSync } = await import("node:sqlite");
    const database = new DatabaseSync(":memory:");
    try {
      database.exec(
        await readFile(
          path.join(repositoryRoot, "cloudflare", "d1", "0001_initial.sql"),
          "utf8",
        ),
      );
      database.exec(sql);
      const imported = database
        .prepare("SELECT name, image_url FROM menu_items WHERE id = ?")
        .get("item-test");
      assert.equal(imported.name, "Test Item");
      assert.match(imported.image_url, /media\.magnificostreetfood\.com/u);
    } finally {
      database.close();
    }

    process.stdout.write("Migration smoke test passed.\n");
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

await main();
