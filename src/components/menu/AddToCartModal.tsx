"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "@/lib/motion";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { Textarea } from "@/components/ui/Textarea";
import { useCart } from "@/contexts/CartContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useOverlayLock } from "@/lib/overlay-store";
import { useIsMobile } from "@/hooks/useIsMobile";
import { modalSpring, overlayFade } from "@/lib/motion-presets";
import { cn, formatPrice } from "@/lib/utils";
import { cropToImageStyle } from "@/lib/image-crop";
import type { MenuItem } from "@/types/menu";

interface AddToCartModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const sheetSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.9,
};

const quantityButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full text-sm text-white/90 hover:bg-white/15 motion-safe:active:scale-90";

const quantityPillClass =
  "flex flex-1 items-center justify-center rounded-full bg-brand-pink px-3 py-2 shadow-[0_2px_10px_rgb(var(--color-pink)/0.35)]";

function CollapsibleDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 72;

  if (!text.trim()) return null;

  return (
    <div className="mt-1.5">
      <p
        className={cn(
          "text-sm leading-snug text-cream/50",
          !expanded && isLong && "line-clamp-2"
        )}
      >
        {text}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-accent hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      ) : null}
    </div>
  );
}

export function AddToCartModal({ item, onClose }: AddToCartModalProps) {
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  useBodyScrollLock(Boolean(item));
  useOverlayLock(Boolean(item));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (item) {
      setNotes("");
      setQuantity(1);
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  const handleAdd = () => {
    if (!item) return;

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      notes,
      quantity,
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {item ? (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <m.button
            type="button"
            aria-label="Close modal"
            key="add-to-cart-backdrop"
            initial={overlayFade.initial}
            animate={overlayFade.animate}
            exit={overlayFade.exit}
            transition={overlayFade.transition}
            onClick={onClose}
            className="absolute inset-0 bg-brand-ink/75"
          />

          <div
            className={cn(
              "absolute inset-0 flex pointer-events-none",
              isMobile ? "items-end" : "items-center justify-center p-4 sm:p-6"
            )}
          >
            <m.div
              key={`add-to-cart-panel-${item.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-to-cart-title"
              initial={
                isMobile
                  ? { y: "100%" }
                  : { opacity: 0, y: 28, scale: 0.97 }
              }
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={
                isMobile
                  ? { y: "100%", opacity: 1, scale: 1 }
                  : { opacity: 0, y: 20, scale: 0.97 }
              }
              transition={isMobile ? sheetSpring : modalSpring}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "pointer-events-auto add-to-cart-panel-bg flex w-full flex-col overflow-hidden border border-cream/15 shadow-2xl",
                isMobile
                  ? "h-[85dvh] max-h-[88dvh] rounded-t-3xl"
                  : "max-h-[90dvh] max-w-lg rounded-3xl"
              )}
            >
              <div
                className={cn(
                  "relative shrink-0 overflow-hidden",
                  "max-sm:h-[28dvh] max-sm:max-h-[30%]",
                  "sm:aspect-video sm:max-h-[220px]"
                )}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  style={cropToImageStyle(item.imageCrop)}
                  sizes="(max-width: 640px) 100vw, 512px"
                  priority
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink/50 text-white backdrop-blur-sm transition-colors hover:bg-brand-ink/70 motion-safe:active:scale-90 sm:right-4 sm:top-4"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="shrink-0 px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3">
                <h3
                  id="add-to-cart-title"
                  className="text-lg font-bold leading-tight text-cream sm:text-xl"
                >
                  {item.name}
                </h3>
                <p className="mt-1 text-base font-semibold text-cream sm:text-lg">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 sm:px-6 sm:pb-3"
              >
                <CollapsibleDescription
                  key={item.id}
                  text={item.description}
                />

                <Textarea
                  label="Special instructions"
                  placeholder="No pickles, extra sauce..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="add-to-cart-field-bg mt-3 min-h-[4.5rem] resize-none border-2 border-green-600 py-2.5 focus:border-green-600 focus:ring-green-600/25 sm:mt-4"
                />
              </div>

              <div
                className="shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4"
              >
                <div className="mb-3 flex items-stretch gap-3 sm:mb-3">
                  <div className={quantityPillClass}>
                    <span className="text-sm font-semibold text-white">
                      Quantity
                    </span>
                  </div>
                  <div className={quantityPillClass}>
                    <div className="flex items-center gap-0.5 rounded-full bg-white/15 px-0.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={quantityButtonClass}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.125rem] text-center text-sm font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className={quantityButtonClass}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <AddToCartButton
                  onAdd={handleAdd}
                  onConfirmed={onClose}
                  variant="primary"
                  size="lg"
                  fullWidth
                  idleLabel={`Add to Cart — ${formatPrice(item.price * quantity)}`}
                  addedLabel="Added"
                />
              </div>
            </m.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
