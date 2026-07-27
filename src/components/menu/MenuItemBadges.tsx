"use client";

import { Badge } from "@/components/ui/Badge";
import type { MenuItem } from "@/types/menu";

export function MenuItemBadges({ item }: { item: MenuItem }) {
  if (!item.isBestSeller && !item.isPopular) return null;

  return (
    <div className="absolute left-1.5 top-1.5 z-10 flex flex-wrap gap-1 sm:left-2 sm:top-2">
      {item.isBestSeller ? <Badge variant="bestSeller">Best Seller</Badge> : null}
      {item.isPopular ? <Badge variant="popular">Popular</Badge> : null}
    </div>
  );
}
