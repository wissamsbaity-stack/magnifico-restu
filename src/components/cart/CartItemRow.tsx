"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getCartLineTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
}

const actionButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-brand-yellow/22 motion-safe:active:scale-90";

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, updateNotes, removeItem } = useCart();
  const lineTotal = getCartLineTotal(item);

  return (
    <div className="cart-drawer-item-bg space-y-3 rounded-2xl border p-4 shadow-card">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-brand-yellow/20">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-cream">{item.name}</h4>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-brand-pink/10 hover:text-brand-pink motion-safe:active:scale-90"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm font-semibold text-brand-pink">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="cart-drawer-stepper-bg flex items-center gap-1 rounded-full border p-1">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className={actionButtonClass}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="inline-flex w-8 items-center justify-center text-sm font-semibold text-cream">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className={actionButtonClass}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm font-semibold text-cream">
          {formatPrice(lineTotal)}
        </p>
      </div>

      <div>
        <label
          htmlFor={`notes-${item.id}`}
          className="mb-1.5 block text-xs font-medium text-muted"
        >
          Item notes
        </label>
        <input
          id={`notes-${item.id}`}
          type="text"
          value={item.notes}
          onChange={(e) => updateNotes(item.id, e.target.value)}
          placeholder="e.g. no onions, extra sauce..."
          className="cart-drawer-field-bg w-full rounded-xl border px-3 py-2 text-sm text-cream placeholder:text-muted/60 transition-colors focus:border-brand-pink/45 focus:outline-none focus:ring-2 focus:ring-brand-pink/15"
        />
      </div>
    </div>
  );
}
