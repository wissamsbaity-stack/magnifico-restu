"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "@/lib/motion";
import { usePortalScrollLock } from "@/hooks/usePortalScrollLock";

const OVERLAY_Z_INDEX = 10000;

interface OrderSubmittingOverlayProps {
  open: boolean;
}

export function OrderSubmittingOverlay({ open }: OrderSubmittingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  usePortalScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 flex items-center justify-center bg-brand-ink/80 p-4 backdrop-blur-md"
      style={{ zIndex: OVERLAY_Z_INDEX }}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="order-submitting-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line/10 bg-surface-raised p-8 text-center shadow-[0_24px_64px_-16px_rgb(var(--color-brand-dark)/0.35)]">
        <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/10" />
          <span
            className="relative h-10 w-10 animate-spin rounded-full border-[3px] border-line/15 border-t-accent"
            aria-hidden
          />
        </div>
        <p
          id="order-submitting-title"
          className="font-display text-xl tracking-wide text-cream"
        >
          Sending your order...
        </p>
        <p className="mt-2 text-sm text-muted">
          This usually takes just a moment.
        </p>
      </div>
    </m.div>,
    document.body
  );
}
