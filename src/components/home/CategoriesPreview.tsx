"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryTile } from "@/components/menu/CategoryTile";
import {
  getCategoryCoverMap,
  getCategoryItemCounts,
} from "@/lib/menu-order";
import type { Category, MenuItem } from "@/types/menu";
import { memo, useMemo } from "react";

interface CategoriesPreviewProps {
  categories: Category[];
  menuItems?: MenuItem[];
}

export const CategoriesPreview = memo(function CategoriesPreview({
  categories,
  menuItems = [],
}: CategoriesPreviewProps) {
  const preview = categories.slice(0, 4);
  const coverMap = useMemo(
    () => getCategoryCoverMap(menuItems),
    [menuItems]
  );
  const itemCounts = useMemo(
    () => getCategoryItemCounts(menuItems),
    [menuItems]
  );

  return (
    <section
      id="home-categories"
      className="home-section section-cream-band scroll-mt-[var(--site-header-height)] max-sm:pt-[5.5dvh] max-sm:pb-12 pt-14 pb-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end sm:gap-6">
          <SectionHeading
            eyebrow="Explore"
            title="Explore our categories"
            description="Pick a category and start building your order."
            underline
          />
          <Link
            href="/menu"
            className="tap-instant inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-brand-pink transition-colors hover:text-brand-pink-hover motion-safe:active:scale-[0.97]"
          >
            View full menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-7">
          {preview.map((category) => {
            const cover = coverMap.get(category.id);
            return (
              <CategoryTile
                key={category.id}
                category={category}
                coverImage={cover?.imageUrl}
                coverCrop={cover?.imageCrop}
                itemCount={itemCounts.get(category.id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
});
