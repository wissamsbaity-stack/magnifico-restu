"use client";

import { Truck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTypeBadgeProps {
  orderType: "delivery" | "pickup";
  className?: string;
}

export function OrderTypeBadge({ orderType, className }: OrderTypeBadgeProps) {
  const isDelivery = orderType === "delivery";

  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-semibold uppercase tracking-wide",
        isDelivery
          ? "bg-accent/15 text-accent ring-1 ring-accent/25"
          : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25",
        className
      )}
    >
      {isDelivery ? (
        <Truck
          className="h-[18px] w-[18px] shrink-0 fill-accent text-accent stroke-accent stroke-[1.75]"
          aria-hidden
        />
      ) : (
        <ShoppingBag
          className="h-[18px] w-[18px] shrink-0 fill-emerald-500/20 text-emerald-400 stroke-emerald-400 stroke-[1.75]"
          aria-hidden
        />
      )}
      {isDelivery ? "Delivery" : "Pickup"}
    </span>
  );
}
