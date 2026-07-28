"use client";

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

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <div
      className="relative grid grid-cols-2 gap-1 rounded-full border border-line/12 bg-brand-yellow/10 p-1"
      role="radiogroup"
      aria-label="Order type"
    >
      {/* Sliding pill — CSS only, no layout animation / spring cost */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-pink shadow-[0_2px_12px_rgb(var(--color-pink)/0.35)] transition-transform duration-200 ease-out",
          value === "pickup" && "translate-x-full"
        )}
      />

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
              "relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-150",
              selected ? "text-white" : "text-muted hover:text-cream"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 shrink-0 transition-[color,transform] duration-150",
                selected ? "scale-110 text-white" : "text-muted"
              )}
              aria-hidden
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
