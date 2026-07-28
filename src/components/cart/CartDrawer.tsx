"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "@/lib/motion";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/Button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { overlayFade } from "@/lib/motion-presets";
import { useOverlayLock } from "@/lib/overlay-store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn, formatPrice } from "@/lib/utils";

/** Same spring as AddToCartModal — proven stable on iPhone Safari. */
const sheetSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.9,
};

const drawerSpring = {
  type: "tween" as const,
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

/**
 * Cart UI mirrors AddToCartModal:
 * - fixed inset-0 shell (no transform on the root)
 * - mobile: bottom sheet (dvh + safe-area footer)
 * - desktop: right-side drawer
 */
export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  } = useCart();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useOverlayLock(isOpen);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <m.button
            type="button"
            aria-label="Close cart"
            key="cart-backdrop"
            initial={overlayFade.initial}
            animate={overlayFade.animate}
            exit={overlayFade.exit}
            transition={overlayFade.transition}
            onClick={closeCart}
            className="absolute inset-0 bg-brand-dark/55"
          />

          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex",
              isMobile ? "items-end" : "items-stretch justify-end"
            )}
          >
            <m.aside
              key="cart-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Your cart"
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={isMobile ? sheetSpring : drawerSpring}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "pointer-events-auto cart-drawer-bg flex w-full flex-col overflow-hidden border border-cream/15 shadow-2xl",
                isMobile
                  ? "h-[90dvh] max-h-[92dvh] rounded-t-3xl"
                  : "h-full max-w-md border-l border-brand-yellow/20"
              )}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-brand-yellow/20 bg-brand-yellow/8 px-5 py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-dark shadow-sm ring-1 ring-brand-yellow/50">
                    <ShoppingBag
                      className="h-[18px] w-[18px] text-white"
                      strokeWidth={2.25}
                    />
                  </span>
                  <h2 className="truncate text-lg font-semibold text-cream">
                    Your Cart
                    {itemCount > 0 ? (
                      <span className="ml-2 text-sm font-normal text-muted">
                        ({itemCount} {itemCount === 1 ? "item" : "items"})
                      </span>
                    ) : null}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-brand-yellow/18 hover:text-cream motion-safe:active:scale-90"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                data-scroll-lock-scrollable
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
              >
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow/22 ring-1 ring-brand-yellow/30">
                      <ShoppingBag className="h-8 w-8 text-brand-pink/65" />
                    </div>
                    <p className="font-medium text-cream">Your cart is empty</p>
                    <p className="mt-1 text-sm text-muted">
                      Browse our menu and add your favorites
                    </p>
                    <Link href="/menu" onClick={closeCart} className="mt-6">
                      <Button variant="pink">View Menu</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 ? (
                <div className="shrink-0 border-t border-brand-yellow/20 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Delivery</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-yellow/20 pt-2 text-base font-semibold text-cream">
                      <span>Total</span>
                      <span className="text-brand-pink">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                  <Link href="/checkout" onClick={closeCart}>
                    <Button variant="pink" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              ) : null}
            </m.aside>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
