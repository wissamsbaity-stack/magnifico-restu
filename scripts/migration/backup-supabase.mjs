#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "categories",
  "menu_items",
  "menu_banners",
  "branches",
  "site_settings",
  "profiles",
  "orders",
];

const PAGE_SIZE = 1_000;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");

function parseArguments(argv) {
  const options = {
    envFile: path.join(repositoryRoot, ".env.local"),
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--env-file") {
      options.envFile = path.resolve(argv[++index]);
    } else if (argument === "--output") {
      options.output = path.resolve(argv[++index]);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

async function loadEnvironmentFile(filename) {
  let contents;
  try {
    contents = await readFile(filename, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const line of contents.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(name in process.env)) process.env[name] = value;
  }
}

function timestampForPath() {
  return new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/u, "Z");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function writeJson(filename, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, serialized, "utf8");
  return {
    bytes: Buffer.byteLength(serialized),
    sha256: sha256(serialized),
  };
}

async function exportTable(supabase, table) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Could not export ${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function exportAuthUsers(supabase) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw new Error(`Could not export auth users: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
  }
  return users;
}

async function listStorageObjects(storageBucket, prefix = "") {
  const results = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await storageBucket.list(prefix, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      throw new Error(
        `Could not list storage path ${prefix || "/"}: ${error.message}`,
      );
    }

    for (const entry of data ?? []) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null || entry.metadata === null) {
        results.push(...(await listStorageObjects(storageBucket, objectPath)));
      } else {
        results.push({ ...entry, path: objectPath });
      }
    }

    if (!data || data.length < PAGE_SIZE) break;
  }
  return results;
}

async function exportStorage(supabase, partialDirectory) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Could not list storage buckets: ${error.message}`);

  const bucketManifest = [];
  for (const bucket of buckets ?? []) {
    const storageBucket = supabase.storage.from(bucket.name);
    const objects = await listStorageObjects(storageBucket);
    const exportedObjects = [];

    for (const object of objects) {
      const { data, error: downloadError } = await storageBucket.download(
        object.path,
      );
      if (downloadError) {
        throw new Error(
          `Could not download ${bucket.name}/${object.path}: ${downloadError.message}`,
        );
      }
      const bytes = Buffer.from(await data.arrayBuffer());
      const destination = path.join(
        partialDirectory,
        "storage",
        bucket.name,
        ...object.path.split("/"),
      );
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      exportedObjects.push({
        path: object.path,
        bytes: bytes.length,
        sha256: sha256(bytes),
        metadata: object.metadata,
        createdAt: object.created_at,
        updatedAt: object.updated_at,
      });
    }

    bucketManifest.push({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types,
      objects: exportedObjects,
    });
  }

  return bucketManifest;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  await loadEnvironmentFile(options.envFile);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  const finalDirectory =
    options.output ??
    path.resolve(repositoryRoot, "..", "backups", `supabase-${timestampForPath()}`);
  const partialDirectory = `${finalDirectory}.partial`;
  await rm(partialDirectory, { recursive: true, force: true });
  await mkdir(path.join(partialDirectory, "database"), { recursive: true });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const manifest = {
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    sourceHost: new URL(supabaseUrl).host,
    tables: {},
    authUsers: null,
    storageBuckets: [],
  };

  try {
    for (const table of TABLES) {
      const rows = await exportTable(supabase, table);
      const details = await writeJson(
        path.join(partialDirectory, "database", `${table}.json`),
        rows,
      );
      manifest.tables[table] = { rows: rows.length, ...details };
      process.stdout.write(`Backed up ${table}: ${rows.length} rows\n`);
    }

    const authUsers = await exportAuthUsers(supabase);
    const authDetails = await writeJson(
      path.join(partialDirectory, "database", "auth-users.json"),
      authUsers,
    );
    manifest.authUsers = { users: authUsers.length, ...authDetails };
    process.stdout.write(`Backed up auth users: ${authUsers.length}\n`);

    manifest.storageBuckets = await exportStorage(supabase, partialDirectory);
    const storageObjects = manifest.storageBuckets.reduce(
      (total, bucket) => total + bucket.objects.length,
      0,
    );
    process.stdout.write(`Backed up storage objects: ${storageObjects}\n`);

    await writeJson(path.join(partialDirectory, "manifest.json"), manifest);
    await rename(partialDirectory, finalDirectory);
    process.stdout.write(`Backup completed: ${finalDirectory}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.stderr.write(`Incomplete backup retained at: ${partialDirectory}\n`);
    process.exitCode = 1;
  }
}

await main();
