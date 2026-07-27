"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartCountBadge } from "@/components/cart/CartCountBadge";

export function CartButton() {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cream/5 text-cream transition-colors hover:bg-mustard/20 hover:text-mustard motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-90"
      aria-label={`Open cart, ${itemCount} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      <CartCountBadge
        count={itemCount}
        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ketchup px-1 text-xs font-bold text-cream"
      />
    </button>
  );
}
