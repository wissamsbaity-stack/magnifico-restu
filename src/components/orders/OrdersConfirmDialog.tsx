"use client";

import { ViewportPortal } from "@/components/ui/ViewportPortal";
import { cn } from "@/lib/utils";
import {
  ordersDangerButtonClassName,
  ordersPrimaryButtonClassName,
  ordersSecondaryButtonClassName,
} from "@/components/orders/orders-ui";

interface OrdersConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OrdersConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: OrdersConfirmDialogProps) {
  return (
    <ViewportPortal
      open={open}
      onBackdropClick={onCancel}
      ariaLabelledBy="orders-confirm-title"
      modalClassName="overflow-y-auto rounded-2xl border border-white/10 bg-surface-overlay p-6 shadow-card"
    >
      <h3
        id="orders-confirm-title"
        className="font-display text-2xl tracking-wide text-cream"
      >
        {title}
      </h3>
      <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(ordersSecondaryButtonClassName, "px-4 py-2.5 text-sm")}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            tone === "danger"
              ? cn(ordersDangerButtonClassName, "border-0 bg-red-600 text-white")
              : ordersPrimaryButtonClassName,
            "px-4 py-2.5 text-sm"
          )}
        >
          {isLoading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </ViewportPortal>
  );
}
