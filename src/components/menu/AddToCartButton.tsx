"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m, useReducedMotion } from "@/lib/motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Total time the button stays in its green "Added" state before reverting.
 * Kept within the 1–1.5s premium-feedback window (min 1s).
 */
const SUCCESS_DURATION_MS = 1200;

interface AddToCartButtonProps {
  /** Performs the actual add. Called on every click. */
  onAdd: () => void;
  /**
   * When true, play the green success animation after a click.
   * Set to false when the click instead opens a customization modal
   * (the modal handles its own confirmation).
   */
  confirm?: boolean;
  /**
   * Fired once the success state finishes (only when `confirm` is true).
   * Useful for closing a modal *after* the user has seen the confirmation.
   */
  onConfirmed?: () => void;
  variant?: "outline" | "primary";
  size?: "sm" | "lg";
  fullWidth?: boolean;
  idleIcon?: ReactNode;
  idleLabel?: ReactNode;
  addedLabel?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-9 px-3 text-sm gap-1.5",
  lg: "h-12 px-7 text-base gap-2",
};

const idleVariantClasses = {
  outline:
    "border border-white/20 bg-transparent text-cream hover:border-accent/50 hover:bg-accent-muted focus-visible:ring-accent/50",
  primary:
    "border border-transparent bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent/50",
};

export function AddToCartButton({
  onAdd,
  confirm = true,
  onConfirmed,
  variant = "outline",
  size = "sm",
  fullWidth = false,
  idleIcon,
  idleLabel = "Add to Cart",
  addedLabel = "Added",
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleClick = useCallback(() => {
    onAdd();
    if (!confirm) return;

    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAdded(false);
      timerRef.current = null;
      onConfirmedRef.current?.();
    }, SUCCESS_DURATION_MS);
  }, [onAdd, confirm]);

  const checkSizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <m.button
      type="button"
      onClick={handleClick}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      animate={
        added && !prefersReducedMotion
          ? { scale: [1, 0.92, 1.05, 1] }
          : { scale: 1 }
      }
      transition={
        added
          ? { duration: 0.45, ease: "easeOut", times: [0, 0.3, 0.65, 1] }
          : { duration: 0.18 }
      }
      aria-label={added ? `${addedLabel} to cart` : undefined}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        sizeClasses[size],
        added
          ? "border border-transparent bg-emerald-500 text-white focus-visible:ring-emerald-400/50"
          : idleVariantClasses[variant],
        fullWidth ? "w-full" : "w-fit",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <m.span
            key="added"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "inline-flex items-center",
              size === "lg" ? "gap-2" : "gap-1.5"
            )}
          >
            {addedLabel}
            <m.span
              initial={prefersReducedMotion ? false : { scale: 0, rotate: -35 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 520, damping: 17, delay: 0.04 }
              }
              className="inline-flex"
            >
              <Check className={checkSizeClass} aria-hidden />
            </m.span>
          </m.span>
        ) : (
          <m.span
            key="idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "inline-flex items-center",
              size === "lg" ? "gap-2" : "gap-1.5"
            )}
          >
            {idleIcon}
            {idleLabel}
          </m.span>
        )}
      </AnimatePresence>
    </m.button>
  );
}
