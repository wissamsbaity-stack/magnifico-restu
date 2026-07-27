"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "@/lib/motion";
import { MenuToolbar } from "@/components/menu/MenuToolbar";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { MenuCategorySectionHeader } from "@/components/menu/MenuCategorySectionHeader";
import { AddToCartModal } from "@/components/menu/AddToCartModal";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { categoryCrossFade } from "@/lib/motion-presets";
import {
  groupMenuItemsByCategory,
  sortMenuItems,
} from "@/lib/menu-order";
import type { Category, MenuItem } from "@/types/menu";

const LIST_CLASS =
  "flex flex-col gap-3 sm:gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-5";

function MenuItemGrid({
  items,
  onCustomize,
  priorityCount = 0,
}: {
  items: MenuItem[];
  onCustomize: (item: MenuItem) => void;
  priorityCount?: number;
}) {
  return (
    <StaggerGrid className={LIST_CLASS}>
      {items.map((item, index) => (
        <MenuItemCard
          key={item.id}
          item={item}
          variant="list"
          stagger
          imagePriority={index < priorityCount}
          onCustomize={onCustomize}
        />
      ))}
    </StaggerGrid>
  );
}

export default function MenuPageClient({
  categories: categoriesProp,
  menuItems: menuItemsProp,
}: {
  categories: Category[];
  menuItems: MenuItem[];
}) {
  const categories = useMemo(() => categoriesProp ?? [], [categoriesProp]);
  const menuItems = useMemo(() => menuItemsProp ?? [], [menuItemsProp]);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const scrollToCategoryTitle = useCallback(() => {
    requestAnimationFrame(() => {
      titleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      scrollToCategoryTitle();
    },
    [scrollToCategoryTitle]
  );

  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const match = categories.find((c) => c.slug === categorySlug);
      if (match) {
        setActiveCategory(match.id);
        scrollToCategoryTitle();
      }
    }
  }, [searchParams, categories, scrollToCategoryTitle]);

  const filteredItems = useMemo(() => {
    let filtered = menuItems.filter((item) => item.isAvailable);

    if (activeCategory !== "all") {
      filtered = filtered.filter((item) => item.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name ?? "").toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q)
      );
    }

    return sortMenuItems(filtered);
  }, [activeCategory, searchQuery, menuItems]);

  const groupedSections = useMemo(
    () =>
      activeCategory === "all"
        ? groupMenuItemsByCategory(filteredItems, categories)
        : [],
    [activeCategory, filteredItems, categories]
  );

  const showGrouped =
    activeCategory === "all" && groupedSections.length > 0;

  const activeCategoryObj =
    activeCategory === "all"
      ? null
      : categories.find((c) => c.id === activeCategory);
  const activeCategoryName =
    activeCategory === "all" ? "All Items" : activeCategoryObj?.name;

  const gridKey = `${activeCategory}-${searchQuery.trim().toLowerCase()}`;

  const hasActiveFilters =
    searchQuery.trim() !== "" || activeCategory !== "all";

  return (
    <div data-menu-page className="pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="menu-page-title-band flex items-center justify-center py-5 sm:py-6 lg:py-7">
          <h1 className="font-display text-center text-4xl font-bold uppercase tracking-tight text-cream sm:text-5xl lg:text-[3.25rem]">
            <span className="section-heading-underline inline-block">Our</span>{" "}
            Menu
          </h1>
        </div>

        <div id="menu-category-nav" className="pb-0">
          <MenuToolbar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResultCount={
              searchQuery.trim() ? filteredItems.length : undefined
            }
          />
        </div>

        <section>
          {!showGrouped ? (
            <div
              ref={titleRef}
              className="scroll-mt-[var(--menu-category-scroll-offset)] pb-3 pt-4 sm:pb-4 sm:pt-5"
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={activeCategoryName ?? "all"}
                  initial={categoryCrossFade.initial}
                  animate={categoryCrossFade.animate}
                  exit={categoryCrossFade.exit}
                  transition={categoryCrossFade.transition}
                >
                  <MenuCategorySectionHeader
                    title={activeCategoryName ?? "All Items"}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          ) : (
            <div ref={titleRef} className="scroll-mt-[var(--menu-category-scroll-offset)]" aria-hidden />
          )}

          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <m.div
                key="empty"
                initial={categoryCrossFade.initial}
                animate={categoryCrossFade.animate}
                exit={categoryCrossFade.exit}
                transition={categoryCrossFade.transition}
                className="rounded-2xl border border-line/10 bg-surface-raised px-6 py-16 text-center shadow-card"
              >
                <p className="font-display text-lg font-semibold text-cream">
                  {hasActiveFilters
                    ? "No dishes match your search"
                    : "Menu is being prepared"}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {hasActiveFilters
                    ? "Try a different category or search term."
                    : "Check back soon — our kitchen is updating the menu."}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      handleCategoryChange("all");
                    }}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-pink px-6 text-sm font-bold text-white shadow-lift transition-all hover:brightness-110 motion-safe:active:scale-[0.97]"
                  >
                    Clear filters
                  </button>
                ) : null}
              </m.div>
            ) : showGrouped ? (
              <m.div
                key={gridKey}
                initial={categoryCrossFade.initial}
                animate={categoryCrossFade.animate}
                exit={categoryCrossFade.exit}
                transition={categoryCrossFade.transition}
                className="space-y-5 pt-4 sm:space-y-6 sm:pt-5"
              >
                {groupedSections.map(({ category, items }, sectionIndex) => (
                  <div key={category.id} className="space-y-3 sm:space-y-3.5">
                    <MenuCategorySectionHeader title={category.name} />
                    <MenuItemGrid
                      items={items}
                      onCustomize={setModalItem}
                      priorityCount={sectionIndex === 0 ? 4 : 0}
                    />
                  </div>
                ))}
              </m.div>
            ) : (
              <m.div
                key={gridKey}
                initial={categoryCrossFade.initial}
                animate={categoryCrossFade.animate}
                exit={categoryCrossFade.exit}
                transition={categoryCrossFade.transition}
              >
                <MenuItemGrid
                  items={filteredItems}
                  onCustomize={setModalItem}
                  priorityCount={4}
                />
              </m.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <AddToCartModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
}
