import { cn } from "@/lib/utils";

import type { RefObject } from "react";

interface MenuCategorySectionHeaderProps {
  title: string;
  className?: string;
  headerRef?: RefObject<HTMLDivElement | null>;
}

export function MenuCategorySectionHeader({
  title,
  className,
  headerRef,
}: MenuCategorySectionHeaderProps) {
  return (
    <div
      ref={headerRef}
      className={cn(
        "menu-category-header scroll-mt-[var(--menu-category-scroll-offset)] flex w-full items-center justify-center rounded-xl px-4 sm:rounded-2xl sm:px-5",
        className
      )}
    >
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em] text-white sm:text-base">
        {title}
      </h2>
    </div>
  );
}
