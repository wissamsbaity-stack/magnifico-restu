"use client";

import { memo, useCallback, useState } from "react";
import type { Transition } from "framer-motion";
import { m, useReducedMotion } from "@/lib/motion";
import { Check, Plus } from "lucide-react";
import { MenuItemImage } from "@/components/menu/MenuItemImage";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/contexts/CartContext";
import {
  cardReveal,
  revealStagger,
  staggerItemVariants,
} from "@/lib/motion-presets";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onCustomize?: (item: MenuItem) => void;
  imagePriority?: boolean;
  revealIndex?: number;
  stagger?: boolean;
  /** @deprecated Both variants render the same compact horizontal layout. */
  variant?: "list" | "grid";
}

const cardShellClass =
  "menu-card-optimized menu-magnifico-card menu-list-card group relative overflow-hidden rounded-2xl border-[3px] border-brand-pink/85";

const compactCardClass = cn(
  cardShellClass,
  "flex items-center gap-3 p-3 sm:gap-3.5 sm:p-3.5"
);

function ItemBadges({ item }: { item: MenuItem }) {
  return (
    <>
      {item.isPopular ? <Badge variant="popular">Popular</Badge> : null}
      {item.isBestSeller && !item.isPopular ? (
        <Badge variant="bestSeller">Best Seller</Badge>
      ) : null}
    </>
  );
}

function MenuItemCardComponent({
  item,
  onCustomize,
  imagePriority = false,
  revealIndex = 0,
  stagger = false,
}: MenuItemCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleAdd = useCallback(() => {
    if (onCustomize) {
      onCustomize(item);
      return;
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      notes: "",
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 600);
  }, [addItem, item, onCustomize]);

  const revealProps = prefersReducedMotion
    ? {}
    : stagger
      ? { variants: staggerItemVariants }
      : {
          initial: cardReveal.initial,
          whileInView: cardReveal.whileInView,
          viewport: cardReveal.viewport,
          transition: revealStagger(revealIndex),
        };

  const pulseTransition: Transition | undefined = justAdded
    ? { duration: 0.35, ease: "easeOut" }
    : stagger
      ? undefined
      : revealStagger(revealIndex);

  const addButtonClass = cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all motion-safe:duration-200 sm:h-11 sm:w-11",
    justAdded
      ? "bg-brand-ink text-surface ring-2 ring-brand-yellow/40"
      : "bg-brand-pink text-white shadow-[0_3px_12px_rgb(var(--color-pink)/0.42)] hover:brightness-110 hover:bg-[rgb(var(--color-pink-hover))] motion-safe:hover:ring-2 motion-safe:hover:ring-brand-yellow/25"
  );

  const popularAccent =
    item.isPopular ? (
      <span
        className="absolute inset-x-0 top-0 z-10 h-[2px] rounded-t-2xl bg-gradient-to-r from-brand-yellow via-brand-yellow/55 to-brand-pink/50"
        aria-hidden
      />
    ) : null;

  return (
    <m.article
      {...revealProps}
      animate={
        justAdded && !prefersReducedMotion
          ? { scale: [1, 0.985, 1.01, 1] }
          : undefined
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={pulseTransition}
      className={compactCardClass}
    >
      {popularAccent}

      <div className="w-[5.5rem] shrink-0 self-center sm:w-[6rem]">
        <div className="menu-magnifico-card__media overflow-hidden rounded-[14px] border-2 border-brand-yellow/60">
          <MenuItemImage
            src={item.imageUrl}
            alt={item.name}
            variant="list"
            priority={imagePriority}
            crop={item.imageCrop}
            className="rounded-[13px]"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="min-w-0 flex-1 font-display text-[15px] font-bold uppercase leading-tight tracking-tight text-cream sm:text-base"
            title={item.name}
          >
            {item.name}
          </h3>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <ItemBadges item={item} />
          </div>
        </div>

        {item.description ? (
          <p className="text-[12px] leading-snug text-muted sm:text-[13px] sm:leading-relaxed">
            {item.description}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <p className="font-display text-base font-bold leading-none text-cream sm:text-lg">
            {formatPrice(item.price)}
          </p>

          <m.button
            type="button"
            onClick={handleAdd}
            aria-label={
              onCustomize
                ? `Customize ${item.name}`
                : `Add ${item.name} to cart`
            }
            animate={
              justAdded && !prefersReducedMotion
                ? { scale: [1, 0.9, 1.08, 1] }
                : undefined
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
            className={addButtonClass}
          >
            {justAdded ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
          </m.button>
        </div>
      </div>
    </m.article>
  );
}

export const MenuItemCard = memo(MenuItemCardComponent);
