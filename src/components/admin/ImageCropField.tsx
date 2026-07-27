"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Crop, ImageOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadMenuImageClient } from "@/lib/admin/client-menu-image-upload";
import {
  cropToImageStyle,
  serializeCrop,
  type ImageCrop,
} from "@/lib/image-crop";

const ImageCropEditor = dynamic(
  () =>
    import("@/components/admin/ImageCropEditor").then((m) => m.ImageCropEditor),
  { ssr: false }
);

interface ImageCropFieldProps {
  /** Form field name that carries the image URL. */
  name: string;
  /** Form field name that carries the serialized crop JSON. */
  cropName: string;
  label: string;
  defaultUrl?: string;
  defaultCrop?: ImageCrop | null;
  /** Aspect ratio the image is shown at on the site (1 = square, 16/9 = hero). */
  previewRatio?: number;
  helpText?: string;
  /** Called whenever url/crop change (optional, for controlled parents). */
  onChange?: (url: string, crop: ImageCrop | null) => void;
}

export function ImageCropField({
  name,
  cropName,
  label,
  defaultUrl = "",
  defaultCrop = null,
  previewRatio = 1,
  helpText,
  onChange,
}: ImageCropFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl);
  const [crop, setCrop] = useState<ImageCrop | null>(defaultCrop);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  function update(nextUrl: string, nextCrop: ImageCrop | null) {
    setUrl(nextUrl);
    setCrop(nextCrop);
    onChange?.(nextUrl, nextCrop);
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const result = await uploadMenuImageClient(file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update(result.url, null);
      setEditorOpen(true);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-cream/80">{label}</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="relative w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-ink"
          style={{ aspectRatio: String(previewRatio) }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Preview"
              className="absolute inset-0 h-full w-full object-cover"
              style={cropToImageStyle(crop)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-cream/30">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={uploading}
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {url ? "Replace image" : "Upload image"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!url || uploading}
              onClick={() => setEditorOpen(true)}
            >
              <Crop className="h-4 w-4" />
              Adjust &amp; crop
            </Button>
          </div>

          <Input
            name={name}
            value={url}
            onChange={(e) => update(e.target.value, crop)}
            placeholder="Or paste an image URL"
          />

          {helpText ? <p className="text-xs text-muted">{helpText}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </div>

      <input type="hidden" name={cropName} value={serializeCrop(crop) ?? ""} />

      {editorOpen && url ? (
        <ImageCropEditor
          imageUrl={url}
          initialCrop={crop}
          primaryRatio={previewRatio}
          title={`Adjust ${label.toLowerCase()}`}
          onClose={() => setEditorOpen(false)}
          onSave={(next) => {
            update(url, next);
            setEditorOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
