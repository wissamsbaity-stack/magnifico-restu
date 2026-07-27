"use client";

import { useEffect, useState } from "react";
import { ViewportPortal } from "@/components/ui/ViewportPortal";
import { Button } from "@/components/ui/Button";

interface OrderConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OrderConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: OrderConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirming(false);
    }
  }, [open]);

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm();
  };

  return (
    <ViewportPortal
      open={open}
      onBackdropClick={isConfirming ? undefined : onCancel}
      ariaLabelledBy="order-confirm-title"
      modalClassName="overflow-y-auto rounded-2xl border border-white/10 bg-surface-overlay p-6 shadow-[0_24px_64px_-16px_rgb(var(--color-brand-dark)/0.75)]"
    >
      <h3
        id="order-confirm-title"
        className="font-display text-2xl tracking-wide text-cream"
      >
        Confirm your order?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Your order will be sent directly to the restaurant.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleConfirm}
          disabled={isConfirming}
          className="w-full sm:w-auto"
        >
          Confirm Order
        </Button>
      </div>
    </ViewportPortal>
  );
}
