"use client";

import { useCallback, useRef, useState } from "react";
import { Crop, Maximize, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  cropToImageStyle,
  DEFAULT_CROP,
  MAX_ZOOM,
  MIN_ZOOM,
  type ImageCrop,
} from "@/lib/image-crop";

const ZOOM_STEP = 0.1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ImageCropEditorProps {
  imageUrl: string;
  initialCrop: ImageCrop | null;
  /** The aspect ratio the image is actually shown at on the site. */
  primaryRatio: number;
  title?: string;
  onSave: (crop: ImageCrop) => void;
  onClose: () => void;
}

export function ImageCropEditor({
  imageUrl,
  initialCrop,
  primaryRatio,
  title = "Adjust image",
  onSave,
  onClose,
}: ImageCropEditorProps) {
  useBodyScrollLock(true);

  const [crop, setCrop] = useState<ImageCrop>(initialCrop ?? DEFAULT_CROP);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  const setZoom = useCallback((next: number) => {
    setCrop((c) => ({ ...c, zoom: Number(clamp(next, MIN_ZOOM, MAX_ZOOM).toFixed(2)) }));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const frame = frameRef.current;
      if (!frame) return;
      frame.setPointerCapture(e.pointerId);
      dragState.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        baseX: crop.x,
        baseY: crop.y,
      };
    },
    [crop.x, crop.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragState.current;
      const frame = frameRef.current;
      if (!drag || !frame || drag.pointerId !== e.pointerId) return;

      const rect = frame.getBoundingClientRect();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      // Dragging the image right reveals its left side, so the focal X moves
      // toward 0. Divide by zoom so panning is finer when zoomed in.
      const nextX = clamp(drag.baseX - (dx / rect.width) * 100 / crop.zoom, 0, 100);
      const nextY = clamp(drag.baseY - (dy / rect.height) * 100 / crop.zoom, 0, 100);

      setCrop((c) => ({ ...c, x: Number(nextX.toFixed(2)), y: Number(nextY.toFixed(2)) }));
    },
    [crop.zoom]
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
    }
  }, []);

  const imgStyle = cropToImageStyle(crop);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 -z-10 cursor-default"
        onClick={onClose}
      />
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-surface-raised shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Crop className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-cream">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream/60 hover:bg-white/10 hover:text-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Editing frame */}
          <div
            ref={frameRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative mx-auto w-full max-w-sm cursor-grab touch-none select-none overflow-hidden rounded-xl border border-white/10 bg-ink active:cursor-grabbing"
            style={{ aspectRatio: String(primaryRatio) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Crop preview"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={imgStyle}
            />
            {/* Rule-of-thirds guides */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
              <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" />
              <div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Drag the image to reposition it
          </p>

          {/* Zoom controls */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Zoom
              </p>
              <span className="text-xs tabular-nums text-cream/60">
                {crop.zoom.toFixed(1)}×
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(crop.zoom - ZOOM_STEP)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-cream hover:bg-white/10"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={ZOOM_STEP}
                value={crop.zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
                aria-label="Zoom level"
              />
              <button
                type="button"
                onClick={() => setZoom(crop.zoom + ZOOM_STEP)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-cream hover:bg-white/10"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Position helpers */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCrop((c) => ({ ...c, x: 50, y: 50 }))}
            >
              <Maximize className="h-4 w-4" />
              Recenter
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCrop(DEFAULT_CROP)}
            >
              <RotateCcw className="h-4 w-4" />
              Reset all
            </Button>
          </div>

          {/* Live preview — exactly how it appears on the site */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Live preview
            </p>
            <div
              className="relative h-24 overflow-hidden rounded-lg border border-white/10 bg-ink"
              style={{ aspectRatio: String(primaryRatio) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={imgStyle}
              />
            </div>
          </div>
        </div>

        <div
          className="flex gap-3 border-t border-white/10 px-4 py-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={() => onSave(crop)} className="flex-1">
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
