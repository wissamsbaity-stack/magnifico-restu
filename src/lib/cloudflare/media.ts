import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getMediaBindings(): Promise<{
  bucket: R2Bucket;
  publicBaseUrl: string;
}> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.MEDIA_BUCKET) {
    throw new Error("Cloudflare R2 binding MEDIA_BUCKET is not configured");
  }
  const publicBaseUrl = env.MEDIA_PUBLIC_BASE_URL?.trim().replace(/\/+$/u, "");
  if (!publicBaseUrl) {
    throw new Error("MEDIA_PUBLIC_BASE_URL is not configured");
  }
  return { bucket: env.MEDIA_BUCKET, publicBaseUrl };
}

