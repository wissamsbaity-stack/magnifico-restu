import type { CSSProperties } from "react";

/**
 * Non-destructive crop settings for an uploaded image.
 *
 * The original image is never modified. Instead we store a focal point and a
 * zoom level, then reproduce the exact same framing on the website using CSS
 * (`object-fit: cover` + `object-position` + `transform: scale`). Because the
 * admin editor and the public site use the identical math, the preview is a
 * true WYSIWYG and the crop stays fully re-editable on every reload.
 */
export interface ImageCrop {
  /** Zoom factor, 1 = fit (cover), up to MAX_ZOOM = zoomed in. */
  zoom: number;
  /** Horizontal focal point as a percentage (0 = left, 100 = right). */
  x: number;
  /** Vertical focal point as a percentage (0 = top, 100 = bottom). */
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export const DEFAULT_CROP: ImageCrop = { zoom: 1, x: 50, y: 50 };

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Coerce an unknown object into a valid ImageCrop, or null when invalid. */
export function normalizeCrop(value: unknown): ImageCrop | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const zoom = Number(v.zoom);
  const x = Number(v.x);
  const y = Number(v.y);
  if (![zoom, x, y].every((n) => Number.isFinite(n))) return null;
  return {
    zoom: round(clamp(zoom, MIN_ZOOM, MAX_ZOOM)),
    x: round(clamp(x, 0, 100)),
    y: round(clamp(y, 0, 100)),
  };
}

/** Parse a crop from a DB value (object) or a serialized form field (string). */
export function parseCrop(value: unknown): ImageCrop | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return normalizeCrop(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }
  return normalizeCrop(value);
}

export function isDefaultCrop(crop: ImageCrop | null | undefined): boolean {
  if (!crop) return true;
  return crop.zoom === 1 && crop.x === 50 && crop.y === 50;
}

/** Serialize for storage; returns null when the crop is the default (no-op). */
export function serializeCrop(crop: ImageCrop | null | undefined): string | null {
  if (isDefaultCrop(crop)) return null;
  return JSON.stringify(crop);
}

/**
 * Produce the CSS used to render a cropped image. Used by BOTH the admin
 * editor preview and the public site so they always match exactly.
 */
export function cropToImageStyle(crop?: ImageCrop | null): CSSProperties {
  const c = crop ?? DEFAULT_CROP;
  const position = `${c.x}% ${c.y}%`;
  return {
    objectPosition: position,
    transform: c.zoom !== 1 ? `scale(${c.zoom})` : undefined,
    transformOrigin: position,
  };
}
