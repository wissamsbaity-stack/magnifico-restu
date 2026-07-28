"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/menu";
import { MenuSearchBar } from "@/components/menu/MenuExpandableSearch";

interface MenuToolbarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResultCount?: number;
  className?: string;
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      className={cn(
        "relative inline-flex h-[46px] shrink-0 snap-start items-center justify-center rounded-full px-5",
        "text-[13px] font-bold tracking-tight sm:h-11 sm:px-6 sm:text-sm",
        "transition-[color,background-color,box-shadow,transform] duration-150",
        "motion-safe:active:scale-[0.96]",
        active
          ? "bg-brand-pink text-white shadow-sm ring-1 ring-brand-pink/40"
          : "bg-ink/[0.06] text-cream/80 ring-1 ring-brand-pink/50 hover:bg-brand-pink/12 hover:text-cream hover:ring-brand-pink/70"
      )}
    >
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </button>
  );
}

/**
 * Unified menu header: one cream panel with search + category chips.
 * Designed as a single floating ordering control — not separate widgets.
 */
export function MenuToolbar({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  searchResultCount,
  className,
}: MenuToolbarProps) {
  return (
    <div
      className={cn(
        "menu-toolbar-panel overflow-hidden rounded-[1.75rem] bg-surface-raised shadow-float ring-1 ring-line/6",
        className
      )}
    >
      <div className="border-b border-line/6 px-4 py-2.5 sm:px-5 sm:py-4">
        <MenuSearchBar
          embedded
          value={searchQuery}
          onChange={onSearchChange}
          resultCount={searchResultCount}
        />
      </div>

      <div className="relative bg-ink/[0.03]">
        <div className="overflow-x-auto py-2.5 scrollbar-none sm:py-3">
          <div
            className="flex w-max min-w-full snap-x snap-mandatory gap-3.5 px-5 sm:gap-4 sm:px-6"
            role="tablist"
            aria-label="Menu categories"
          >
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => onCategoryChange("all")}
              label="All Items"
            />
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
                label={category.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use MenuToolbar */
export function CategoryTabs(props: MenuToolbarProps) {
  return <MenuToolbar {...props} />;
}
