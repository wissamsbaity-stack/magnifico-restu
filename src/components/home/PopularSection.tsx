"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { MenuItem } from "@/types/menu";
import { memo } from "react";

interface PopularSectionProps {
  items: MenuItem[];
}

export const PopularSection = memo(function PopularSection({
  items,
}: PopularSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="home-section py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end sm:gap-6">
          <SectionHeading
            eyebrow="Trending Now"
            title="Popular Right Now"
            description="Customer favorites — order what everyone loves."
            underline
          />
          <Link
            href="/menu"
            className="tap-instant inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-brand-pink transition-colors hover:text-brand-pink-hover motion-safe:active:scale-[0.97]"
          >
            View full menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4">
          {items.slice(0, 4).map((item, index) => (
            <MenuItemCard
              key={item.id}
              item={item}
              variant="list"
              imagePriority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
