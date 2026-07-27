"use client";

import { MessageCircle, LayoutDashboard } from "lucide-react";
import { m } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CheckoutMethod } from "@/types/checkout";

interface CheckoutMethodSelectorProps {
  value: CheckoutMethod;
  onChange: (value: CheckoutMethod) => void;
}

const OPTIONS: {
  value: CheckoutMethod;
  label: string;
  Icon: typeof MessageCircle;
  description: string;
}[] = [
  {
    value: "whatsapp",
    label: "WhatsApp Ordering",
    Icon: MessageCircle,
    description: "Customers send orders via WhatsApp",
  },
  {
    value: "builtin",
    label: "Built-in Orders",
    Icon: LayoutDashboard,
    description: "Orders go to your Orders Dashboard",
  },
];

const pillSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

export function CheckoutMethodSelector({
  value,
  onChange,
}: CheckoutMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <div
        className="relative grid grid-cols-1 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Checkout method"
      >
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const { Icon } = option;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative z-10 flex min-h-[4.5rem] flex-col items-start justify-center rounded-xl px-4 py-3 text-left transition-colors duration-200",
                selected
                  ? "text-accent-foreground"
                  : "text-muted hover:text-cream"
              )}
            >
              {selected ? (
                <m.span
                  layoutId="admin-checkout-method-pill"
                  className="absolute inset-0 rounded-xl bg-accent shadow-[0_2px_12px_rgb(var(--color-accent)/0.35)]"
                  transition={pillSpring}
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                {option.label}
              </span>
              <span className="relative z-10 mt-1 text-xs opacity-80">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="checkout_method" value={value} />
    </div>
  );
}
