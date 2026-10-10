#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DATABASE_FILES = [
  "menu_items",
  "menu_banners",
  "branches",
  "site_settings",
];

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function parseArguments(argv) {
  const options = {
    backupDirectory: null,
    output: null,
    publicBaseUrl: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--backup") {
      options.backupDirectory = path.resolve(argv[++index]);
    } else if (argument === "--output") {
      options.output = path.resolve(argv[++index]);
    } else if (argument === "--public-base-url") {
      options.publicBaseUrl = argv[++index].replace(/\/+$/u, "");
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.backupDirectory) {
    throw new Error("--backup <directory> is required.");
  }
  if (!options.publicBaseUrl) {
    throw new Error("--public-base-url <https://media.example.com> is required.");
  }
  options.output ??= path.join(options.backupDirectory, "r2-prepared");
  return options;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(filename) {
  return sha256(await readFile(filename));
}

function extensionFor(objectPath, mimeType) {
  const extension = path.extname(objectPath).toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/u.test(extension)) return extension;
  const mimeExtensions = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  return mimeExtensions[mimeType] ?? ".bin";
}

function extractStorageIdentity(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    const parts = url.pathname
      .slice(markerIndex + marker.length)
      .split("/")
      .map(decodeURIComponent);
    if (parts.length < 2) return null;
    return {
      sourceUrl: value,
      bucket: parts[0],
      objectPath: parts.slice(1).join("/"),
    };
  } catch {
    return null;
  }
}

function findStorageUrls(value, results) {
  if (typeof value === "string") {
    const identity = extractStorageIdentity(value);
    if (identity) results.push(identity);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) findStorageUrls(item, results);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) findStorageUrls(item, results);
  }
}

async function writeVariant({
  input,
  outputDirectory,
  key,
  width,
  quality,
}) {
  const filename = path.join(outputDirectory, ...key.split("/"));
  await mkdir(path.dirname(filename), { recursive: true });
  await sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width,
      height: width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5 })
    .toFile(filename);
  const bytes = await readFile(filename);
  return {
    key,
    localPath: path.relative(outputDirectory, filename).replaceAll("\\", "/"),
    contentType: "image/webp",
    cacheControl: CACHE_CONTROL,
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const backupManifest = JSON.parse(
    await readFile(path.join(options.backupDirectory, "manifest.json"), "utf8"),
  );
  const partialOutput = `${options.output}.partial`;
  await rm(partialOutput, { recursive: true, force: true });
  await mkdir(partialOutput, { recursive: true });

  const referencedUrls = [];
  for (const table of DATABASE_FILES) {
    const rows = JSON.parse(
      await readFile(
        path.join(options.backupDirectory, "database", `${table}.json`),
        "utf8",
      ),
    );
    findStorageUrls(rows, referencedUrls);
  }

  const sourceUrlByObject = new Map();
  for (const reference of referencedUrls) {
    const identity = `${reference.bucket}/${reference.objectPath}`;
    const urls = sourceUrlByObject.get(identity) ?? [];
    urls.push(reference.sourceUrl);
    sourceUrlByObject.set(identity, urls);
  }

  const mediaManifest = {
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    publicBaseUrl: options.publicBaseUrl,
    cacheControl: CACHE_CONTROL,
    objects: [],
  };
  const urlMap = {};

  for (const bucket of backupManifest.storageBuckets ?? []) {
    for (const object of bucket.objects ?? []) {
      const source = path.join(
        options.backupDirectory,
        "storage",
        bucket.name,
        ...object.path.split("/"),
      );
      if ((await sha256File(source)) !== object.sha256) {
        throw new Error(`Checksum mismatch: ${bucket.name}/${object.path}`);
      }

      const hash = object.sha256;
      const contentType =
        object.metadata?.mimetype ?? object.metadata?.contentType ?? "application/octet-stream";
      const originalKey = `media/original/${hash}${extensionFor(object.path, contentType)}`;
      const originalFilename = path.join(partialOutput, ...originalKey.split("/"));
      await mkdir(path.dirname(originalFilename), { recursive: true });
      await copyFile(source, originalFilename);

      const original = {
        key: originalKey,
        localPath: originalKey,
        contentType,
        cacheControl: CACHE_CONTROL,
        bytes: object.bytes,
        sha256: hash,
      };
      let display = original;
      let thumbnail = original;

      if (contentType.startsWith("image/") && contentType !== "image/svg+xml") {
        try {
          display = await writeVariant({
            input: source,
            outputDirectory: partialOutput,
            key: `media/display/${hash}.webp`,
            width: 1600,
            quality: 82,
          });
          thumbnail = await writeVariant({
            input: source,
            outputDirectory: partialOutput,
            key: `media/thumbnail/${hash}.webp`,
            width: 480,
            quality: 78,
          });
        } catch (error) {
          process.stderr.write(
            `Could not optimize ${bucket.name}/${object.path}; preserving original: ${error.message}\n`,
          );
        }
      }

      const identity = `${bucket.name}/${object.path}`;
      const sourceUrls = [...new Set(sourceUrlByObject.get(identity) ?? [])];
      const publicUrls = {
        original: `${options.publicBaseUrl}/${original.key}`,
        display: `${options.publicBaseUrl}/${display.key}`,
        thumbnail: `${options.publicBaseUrl}/${thumbnail.key}`,
      };
      for (const sourceUrl of sourceUrls) {
        urlMap[sourceUrl] = publicUrls.display;
      }
      mediaManifest.objects.push({
        source: { bucket: bucket.name, path: object.path, urls: sourceUrls },
        original,
        display,
        thumbnail,
        publicUrls,
      });
    }
  }

  await writeFile(
    path.join(partialOutput, "manifest.json"),
    `${JSON.stringify(mediaManifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(partialOutput, "r2-url-map.json"),
    `${JSON.stringify(urlMap, null, 2)}\n`,
    "utf8",
  );
  try {
    await access(options.output);
    throw new Error(`Refusing to overwrite existing output: ${options.output}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await rename(partialOutput, options.output);
  process.stdout.write(
    `Prepared ${mediaManifest.objects.length} R2 media objects at ${options.output}\n`,
  );
}

await main();
