"use client";

import { m, LayoutGroup } from "@/lib/motion";
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

const pillSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.75,
};

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
    <m.button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      className={cn(
        "relative inline-flex h-[46px] shrink-0 snap-start items-center justify-center rounded-full px-5",
        "text-[13px] font-bold tracking-tight sm:h-11 sm:px-6 sm:text-sm",
        "motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150",
        "motion-safe:active:scale-[0.96]",
        active
          ? "text-white shadow-sm"
          : "bg-ink/[0.06] text-cream/80 ring-1 ring-brand-pink/50 hover:bg-brand-pink/12 hover:text-cream hover:ring-brand-pink/70"
      )}
    >
      {active ? (
        <m.span
          layoutId="menu-category-active"
          className="absolute inset-0 rounded-full bg-brand-pink ring-1 ring-brand-pink/40 shadow-[0_2px_10px_rgb(var(--color-pink)/0.35)]"
          transition={pillSpring}
        />
      ) : null}
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </m.button>
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
    <LayoutGroup id="menu-toolbar">
      <div
        className={cn(
          "menu-toolbar-panel overflow-hidden rounded-[1.75rem] bg-surface-raised shadow-float ring-1 ring-line/6",
          className
        )}
      >
        {/* Search */}
        <div className="border-b border-line/6 px-4 py-2.5 sm:px-5 sm:py-4">
          <MenuSearchBar
            embedded
            value={searchQuery}
            onChange={onSearchChange}
            resultCount={searchResultCount}
          />
        </div>

        {/* Categories */}
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
    </LayoutGroup>
  );
}

/** @deprecated Use MenuToolbar */
export function CategoryTabs(props: MenuToolbarProps) {
  return <MenuToolbar {...props} />;
}
