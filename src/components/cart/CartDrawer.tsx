"use client";

import Link from "next/link";
import { AnimatePresence, m } from "@/lib/motion";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/Button";
import { drawerSpring, overlayFade } from "@/lib/motion-presets";
import { useOverlayLock } from "@/lib/overlay-store";
import { formatPrice } from "@/lib/utils";

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

  useOverlayLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <m.button
            type="button"
            aria-label="Close cart"
            key="cart-backdrop"
            initial={overlayFade.initial}
            animate={overlayFade.animate}
            exit={overlayFade.exit}
            transition={overlayFade.transition}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-brand-dark/55 backdrop-blur-sm"
          />
          <m.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={drawerSpring}
            className="cart-drawer-bg fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-brand-yellow/20 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-yellow/20 bg-brand-yellow/8 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-brand-dark shadow-sm ring-1 ring-brand-yellow/50">
                  <ShoppingBag
                    className="h-[18px] w-[18px] text-white"
                    strokeWidth={2.25}
                  />
                </span>
                <h2 className="text-lg font-semibold text-cream">
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

            <div className="flex-1 overflow-y-auto px-5 py-4">
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
                <m.div layout className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItemRow key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </m.div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-brand-yellow/20 px-5 py-5">
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
                    <span className="text-brand-pink">{formatPrice(total)}</span>
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
        </>
      ) : null}
    </AnimatePresence>
  );
}
