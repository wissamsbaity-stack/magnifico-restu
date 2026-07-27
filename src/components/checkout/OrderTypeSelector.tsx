"use client";

import { m, LayoutGroup } from "@/lib/motion";
import { ShoppingBag, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

import type { OrderType } from "@/types/order";

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

const OPTIONS: {
  value: OrderType;
  label: string;
  Icon: typeof Truck;
}[] = [
  { value: "delivery", label: "Delivery", Icon: Truck },
  { value: "pickup", label: "Pickup", Icon: ShoppingBag },
];

const pillSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

function iconClassName(selected: boolean): string {
  return selected ? "text-white" : "text-muted";
}

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <LayoutGroup id="checkout-order-type">
      <div
        className="relative grid grid-cols-2 gap-1 rounded-full border border-line/12 bg-brand-yellow/10 p-1"
        role="radiogroup"
        aria-label="Order type"
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
                "relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-200",
                selected ? "text-white" : "text-muted hover:text-cream"
              )}
            >
              {selected ? (
                <m.span
                  layoutId="checkout-order-type-pill"
                  className="absolute inset-0 rounded-full bg-brand-pink shadow-[0_2px_12px_rgb(var(--color-pink)/0.35)]"
                  transition={pillSpring}
                />
              ) : null}
              <Icon
                className={cn(
                  "relative z-10 h-6 w-6 shrink-0 transition-[color,transform] duration-200",
                  iconClassName(selected),
                  selected && "scale-110"
                )}
                aria-hidden
              />
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
