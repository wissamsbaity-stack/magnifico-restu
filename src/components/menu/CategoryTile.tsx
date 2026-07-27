"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Utensils } from "lucide-react";
import { cropToImageStyle, type ImageCrop } from "@/lib/image-crop";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/menu";

interface CategoryTileProps {
  category: Category;
  coverImage?: string | null;
  coverCrop?: ImageCrop | null;
  itemCount?: number;
  className?: string;
}

export function CategoryTile({
  category,
  coverImage,
  coverCrop,
  itemCount,
  className,
}: CategoryTileProps) {
  return (
    <Link
      href={`/menu?category=${category.slug}`}
      className={cn(
        "category-preview-card tap-instant group flex flex-col overflow-hidden rounded-3xl border-[3px] border-brand-yellow/55 bg-surface-raised motion-safe:active:scale-[0.98]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/15">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
            style={cropToImageStyle(coverCrop)}
            sizes="(max-width: 640px) 45vw, 280px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-12 w-12 text-accent" strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-3.5 sm:gap-3 sm:p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-bold uppercase tracking-tight text-cream sm:text-lg lg:text-xl">
            {category.name}
          </h3>
          {itemCount !== undefined ? (
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          ) : null}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white shadow-lift motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-110 sm:h-10 sm:w-10">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
