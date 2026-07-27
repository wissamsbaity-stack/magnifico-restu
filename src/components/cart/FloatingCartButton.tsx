"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { m, AnimatePresence, useReducedMotion } from "@/lib/motion";
import { useCart } from "@/contexts/CartContext";

export function FloatingCartButton() {
  const { itemCount, openCart } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const handler = () => {
      setBump(true);
      window.setTimeout(() => setBump(false), 450);
    };
    window.addEventListener("cart:item-added", handler);
    return () => window.removeEventListener("cart:item-added", handler);
  }, []);

  return (
    <AnimatePresence>
      {itemCount > 0 ? (
        <m.button
          type="button"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: bump && !prefersReducedMotion ? [1, 1.08, 1] : 1,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            scale: { duration: 0.35, ease: "easeOut" },
            default: { type: "spring", stiffness: 420, damping: 28 },
          }}
          onClick={openCart}
          className="fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-4px_rgb(var(--color-pink)/0.55),0_0_22px_rgb(var(--color-pink)/0.35)] ring-1 ring-brand-pink/40 motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:right-6"
          style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
          aria-label={`Open cart, ${itemCount} items`}
        >
          <ShoppingBag className="h-4 w-4" />
          Cart ({itemCount})
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
