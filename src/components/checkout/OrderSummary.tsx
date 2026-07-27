"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { OrderType } from "@/types/order";
import { getCartLineTotal } from "@/lib/cart";
import { cn, formatPrice } from "@/lib/utils";

interface OrderSummaryProps {
  orderType?: OrderType;
}

export function OrderSummary({ orderType = "delivery" }: OrderSummaryProps) {
  const { items, subtotal, deliveryFee } = useCart();
  const [expanded, setExpanded] = useState(false);

  const isDelivery = orderType === "delivery";
  const appliedDeliveryFee = isDelivery ? deliveryFee : 0;
  const total = subtotal + appliedDeliveryFee;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="cart-drawer-item-bg rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cream">Order Summary</h3>
          <p className="mt-1 text-lg font-semibold text-brand-pink">
            Total: {formatPrice(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-brand-yellow/15 hover:text-cream"
          aria-expanded={expanded}
        >
          {expanded ? "Hide Items" : "View Items"}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 border-t border-brand-yellow/20 pt-4">
          <ul className="space-y-3">
            {items.map((item) => {
              const lineTotal = getCartLineTotal(item);
              return (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium text-cream">
                        {item.name}{" "}
                        <span className="text-cream/50">×{item.quantity}</span>
                      </p>
                      <p className="shrink-0 text-sm font-medium text-cream">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>
                    <p className="text-xs text-cream/40">
                      {formatPrice(item.price)} each
                    </p>
                    {item.notes ? (
                      <p className="mt-0.5 text-xs text-cream/40">
                        Note: {item.notes}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-2 border-t border-brand-yellow/20 pt-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {isDelivery ? (
              <div className="flex justify-between text-muted">
                <span>Delivery Fee</span>
                <span>{formatPrice(appliedDeliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-brand-yellow/20 pt-2 font-semibold text-cream">
              <span>Total</span>
              <span className="text-brand-pink">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
