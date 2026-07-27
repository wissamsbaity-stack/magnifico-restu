import { createBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/supabase/mappers";

export const MAX_MENU_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const BUCKET = "menu-images";

export type MenuImageUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export type ImageUploadOptions = {
  /** Keep PNG/WebP alpha and store as PNG instead of flattening to JPEG. */
  preserveTransparency?: boolean;
};

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try a different file."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not compress this image.")),
      type,
      quality
    );
  });
}

async function encodeCanvasJpeg(
  canvas: HTMLCanvasElement,
  maxBytes: number
): Promise<Blob> {
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);

  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (blob.size <= maxBytes) return blob;

  let scale = 0.85;
  const source = canvas;
  while (scale >= 0.35) {
    const resized = document.createElement("canvas");
    resized.width = Math.max(1, Math.round(source.width * scale));
    resized.height = Math.max(1, Math.round(source.height * scale));
    const ctx = resized.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(source, 0, 0, resized.width, resized.height);

    quality = 0.8;
    blob = await canvasToBlob(resized, "image/jpeg", quality);
    while (blob.size > maxBytes && quality > 0.45) {
      quality -= 0.1;
      blob = await canvasToBlob(resized, "image/jpeg", quality);
    }
    if (blob.size <= maxBytes) return blob;
    scale -= 0.15;
  }

  throw new Error(
    `Image is too large (${formatMegabytes(blob.size)}). Please use an image under 5 MB.`
  );
}

async function encodeCanvasPng(
  canvas: HTMLCanvasElement,
  maxBytes: number
): Promise<Blob> {
  let blob = await canvasToBlob(canvas, "image/png");
  if (blob.size <= maxBytes) return blob;

  let scale = 0.85;
  const source = canvas;
  while (scale >= 0.35) {
    const resized = document.createElement("canvas");
    resized.width = Math.max(1, Math.round(source.width * scale));
    resized.height = Math.max(1, Math.round(source.height * scale));
    const ctx = resized.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(source, 0, 0, resized.width, resized.height);
    blob = await canvasToBlob(resized, "image/png");
    if (blob.size <= maxBytes) return blob;
    scale -= 0.15;
  }

  throw new Error(
    `Image is too large (${formatMegabytes(blob.size)}). Please use a smaller PNG under 5 MB.`
  );
}

function drawToCanvas(img: HTMLImageElement, maxDim: number) {
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image.");

  return { canvas, ctx, width, height };
}

export async function compressMenuImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_MENU_IMAGE_BYTES * 4) {
    throw new Error(
      `This image is too large (${formatMegabytes(file.size)}). Please choose a file under 5 MB, or use a smaller photo.`
    );
  }

  const img = await loadImage(file);
  const { canvas, ctx } = drawToCanvas(img, MAX_DIMENSION);

  // Flatten PNG transparency onto white for menu photos saved as JPEG.
  if (file.type === "image/png") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return encodeCanvasJpeg(canvas, MAX_MENU_IMAGE_BYTES);
}

export async function compressLogoImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a PNG, WebP, or JPEG image.");
  }

  if (file.size > MAX_MENU_IMAGE_BYTES * 4) {
    throw new Error(
      `This image is too large (${formatMegabytes(file.size)}). Please choose a file under 5 MB.`
    );
  }

  const img = await loadImage(file);
  const { canvas, ctx } = drawToCanvas(img, MAX_DIMENSION);

  // Canvas stays transparent — never flatten logo PNGs to a white JPEG.
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return encodeCanvasPng(canvas, MAX_MENU_IMAGE_BYTES);
}

export async function uploadMenuImageClient(
  file: File,
  options: ImageUploadOptions = {}
): Promise<MenuImageUploadResult> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: "You must be signed in as an admin to upload images.",
    };
  }

  const preserveTransparency = options.preserveTransparency ?? false;

  let blob: Blob;
  try {
    blob = preserveTransparency
      ? await compressLogoImage(file)
      : await compressMenuImage(file);
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not process this image.",
    };
  }

  if (blob.size > MAX_MENU_IMAGE_BYTES) {
    return {
      ok: false,
      error: `Image is too large (${formatMegabytes(blob.size)}). Maximum size is 5 MB.`,
    };
  }

  const baseName = slugify(
    file.name.replace(/\.[^.]+$/, "") ||
      (preserveTransparency ? "logo" : "menu-item")
  );
  const ext = preserveTransparency ? "png" : "jpg";
  const contentType = preserveTransparency ? "image/png" : "image/jpeg";
  const path = `${Date.now()}-${baseName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    const message = uploadError.message.toLowerCase();
    if (message.includes("payload") || message.includes("too large")) {
      return {
        ok: false,
        error: "Image is too large. Please use a photo under 5 MB.",
      };
    }
    if (message.includes("row-level security") || message.includes("policy")) {
      return {
        ok: false,
        error: "You do not have permission to upload images. Sign in as an admin.",
      };
    }
    return { ok: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { ok: true, url: publicUrl };
}

export function uploadLogoImageClient(file: File) {
  return uploadMenuImageClient(file, { preserveTransparency: true });
}
