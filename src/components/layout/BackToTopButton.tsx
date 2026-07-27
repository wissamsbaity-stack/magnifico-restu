"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "@/lib/motion";
import { useAnyOverlayOpen } from "@/lib/overlay-store";

const SHOW_AFTER_PX = 450;
const HIDE_NEAR_TOP_PX = 80;

const fabButtonClass =
  "inline-flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-[3px] motion-safe:hover:scale-105 motion-safe:active:scale-95";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const overlayOpen = useAnyOverlayOpen();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setVisible((prev) => {
        if (y <= HIDE_NEAR_TOP_PX) return false;
        if (y >= SHOW_AFTER_PX) return true;
        return prev;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  const show = visible && !overlayOpen;

  return (
    <AnimatePresence>
      {show ? (
        <m.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={`${fabButtonClass} bg-brand-ink shadow-[0_8px_24px_-4px_rgb(var(--color-brand-dark)/0.45),0_0_22px_rgb(var(--color-brand-dark)/0.2)] ring-1 ring-brand-dark/20 motion-safe:hover:shadow-[0_12px_28px_-4px_rgb(var(--color-brand-dark)/0.5),0_0_26px_rgb(var(--color-brand-dark)/0.25)]`}
          aria-label="Back to top"
        >
          <ChevronUp
            className="h-6 w-6 shrink-0 text-white"
            strokeWidth={2.5}
            aria-hidden
          />
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
