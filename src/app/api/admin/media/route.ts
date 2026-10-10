import { NextResponse } from "next/server";
import {
  CloudflareAccessAuthError,
  verifyCloudflareAdminHeaders,
} from "@/lib/auth/cloudflare-access";
import { getAdminAuthBackend } from "@/lib/auth/backend";
import { getContentBackend } from "@/lib/content-backend";
import { getD1Database } from "@/lib/cloudflare/database";
import { getMediaBindings } from "@/lib/cloudflare/media";

export const runtime = "nodejs";

const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;
const MAX_VARIANT_BYTES = 5 * 1024 * 1024;
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function extensionFor(type: string): string {
  const extensions: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[type];
  if (!extension) throw new Error(`Unsupported image type: ${type}`);
  return extension;
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function requireImage(formData: FormData, name: string, maxBytes: number): File {
  const value = formData.get(name);
  if (!(value instanceof File) || !value.type.startsWith("image/")) {
    throw new Error(`${name} image is required`);
  }
  if (value.size <= 0 || value.size > maxBytes) {
    throw new Error(`${name} image exceeds the allowed size`);
  }
  return value;
}

export async function POST(request: Request) {
  if (
    getContentBackend() !== "d1" ||
    getAdminAuthBackend() !== "cloudflare-access"
  ) {
    return NextResponse.json({ error: "R2 uploads are not enabled" }, { status: 404 });
  }

  try {
    await verifyCloudflareAdminHeaders(request.headers);
    const formData = await request.formData();
    const original = requireImage(formData, "original", MAX_ORIGINAL_BYTES);
    const display = requireImage(formData, "display", MAX_VARIANT_BYTES);
    const thumbnail = requireImage(formData, "thumbnail", MAX_VARIANT_BYTES);
    const [originalBytes, displayBytes, thumbnailBytes] = await Promise.all([
      original.arrayBuffer(),
      display.arrayBuffer(),
      thumbnail.arrayBuffer(),
    ]);
    const [originalHash, displayHash, thumbnailHash] = await Promise.all([
      sha256(originalBytes),
      sha256(displayBytes),
      sha256(thumbnailBytes),
    ]);
    const originalKey = `media/original/${originalHash}.${extensionFor(original.type)}`;
    const displayKey = `media/display/${displayHash}.${extensionFor(display.type)}`;
    const thumbnailKey = `media/thumbnail/${thumbnailHash}.${extensionFor(thumbnail.type)}`;
    const { bucket, publicBaseUrl } = await getMediaBindings();

    await Promise.all([
      bucket.put(originalKey, originalBytes, {
        httpMetadata: { contentType: original.type, cacheControl: CACHE_CONTROL },
        customMetadata: { originalFilename: original.name },
      }),
      bucket.put(displayKey, displayBytes, {
        httpMetadata: { contentType: display.type, cacheControl: CACHE_CONTROL },
      }),
      bucket.put(thumbnailKey, thumbnailBytes, {
        httpMetadata: { contentType: thumbnail.type, cacheControl: CACHE_CONTROL },
      }),
    ]);

    const database = await getD1Database();
    const assetId = `asset-${originalHash.slice(0, 32)}`;
    await database
      .prepare(
        "INSERT OR IGNORE INTO media_assets (id, original_key, display_key, thumbnail_key, original_filename, mime_type, bytes, checksum_sha256) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        assetId,
        originalKey,
        displayKey,
        thumbnailKey,
        original.name,
        original.type,
        original.size,
        originalHash,
      )
      .run();

    return NextResponse.json({
      ok: true,
      assetId,
      url: `${publicBaseUrl}/${displayKey}`,
      thumbnailUrl: `${publicBaseUrl}/${thumbnailKey}`,
    });
  } catch (error) {
    if (error instanceof CloudflareAccessAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/admin/media]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed" },
      { status: 400 },
    );
  }
}
