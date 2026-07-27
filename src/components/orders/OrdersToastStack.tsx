"use client";

import { memo, useCallback, useState } from "react";
import { X } from "lucide-react";

export interface OrdersToastItem {
  id: string;
  title: string;
  message: string;
  tone?: "default" | "error";
}

interface OrdersToastStackProps {
  toasts: OrdersToastItem[];
  onDismiss: (id: string) => void;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: OrdersToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => onDismiss(toast.id), 160);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-2xl border bg-surface-overlay shadow-card ${
        toast.tone === "error"
          ? "border-red-500/35"
          : "border-accent/30"
      } ${isExiting ? "orders-toast-exit" : "orders-toast-enter"}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
            toast.tone === "error"
              ? "bg-red-500"
              : "orders-live-dot bg-red-500"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-cream">{toast.title}</p>
          <p className="mt-0.5 text-base text-muted">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="orders-touch-btn rounded-lg p-1 text-muted"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const OrdersToastStack = memo(function OrdersToastStack({
  toasts,
  onDismiss,
}: OrdersToastStackProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(100%,22rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
});
