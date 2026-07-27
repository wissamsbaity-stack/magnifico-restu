"use client";

import { useState } from "react";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";
import { cropToImageStyle, type ImageCrop } from "@/lib/image-crop";
import { cn } from "@/lib/utils";

interface MenuItemImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  variant?: "grid" | "list";
  className?: string;
  crop?: ImageCrop | null;
}

export function MenuItemImage({
  src,
  alt,
  priority = false,
  variant = "grid",
  className,
  crop = null,
}: MenuItemImageProps) {
  const settings = useSettings();
  const fallback = settings.branding.logo;

  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  const usingFallback = currentSrc === fallback;
  const cropStyle = usingFallback ? undefined : cropToImageStyle(crop);
  const hasRealImage = Boolean(src?.trim()) && !usingFallback;

  const isList = variant === "list";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-overlay transition-transform duration-300 ease-out motion-safe:md:group-hover:scale-[1.02]",
        isList
          ? "aspect-square h-[5.5rem] w-full sm:h-[6rem]"
          : hasRealImage
            ? "aspect-square h-[5.5rem] w-full sm:h-[6rem]"
            : "aspect-square h-[5.5rem] w-full sm:h-[6rem]",
        className
      )}
    >
      {!loaded ? (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-overlay to-surface-raised"
          aria-hidden
        />
      ) : null}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        sizes={
          isList
            ? "(max-width: 640px) 38vw, 176px"
            : "(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px"
        }
        style={cropStyle}
        className={cn(
          "transition-[opacity,filter] duration-300 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          usingFallback
            ? "object-contain p-3 opacity-80"
            : "object-cover motion-safe:md:group-hover:brightness-[1.04]"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallback) {
            setCurrentSrc(fallback);
          } else {
            setLoaded(true);
          }
        }}
      />
    </div>
  );
}
