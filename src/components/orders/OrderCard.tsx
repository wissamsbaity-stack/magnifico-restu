"use client";

import { memo, useState } from "react";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Phone,
  StickyNote,
} from "lucide-react";
import { OrderTypeBadge } from "@/components/orders/OrderTypeBadge";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { buildWhatsAppCustomerUrl } from "@/lib/orders/whatsapp-customer";
import {
  formatDeliveryAddress,
  type StaffOrder,
} from "@/lib/orders/map-order";
import { formatOrderTime } from "@/lib/orders/format-order-time";
import {
  ordersPrimaryButtonClassName,
  ordersSecondaryButtonClassName,
  ordersWhatsAppLinkClassName,
} from "@/components/orders/orders-ui";
import { formatPrice, cn } from "@/lib/utils";

const OrderCardBody = memo(function OrderCardBody({
  order,
  isNew,
}: {
  order: StaffOrder;
  isNew: boolean;
}) {
  const address = formatDeliveryAddress(order);
  const isDelivery = order.orderType === "delivery";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl tracking-wide text-cream">
              #{order.orderNumber || "—"}
            </h3>
            {isNew ? (
              <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/30">
                New
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-base text-muted">
            {formatOrderTime(order.createdAt)}
          </p>
        </div>

        <OrderTypeBadge orderType={order.orderType} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
          <p className="text-xs uppercase tracking-wider text-muted">Customer</p>
          <p className="mt-1 font-medium text-cream">{order.customerName}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-base text-muted">
            <Phone className="h-3.5 w-3.5" />
            {order.customerPhone}
          </p>
        </div>

        {isDelivery && address ? (
          <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
            <p className="text-xs uppercase tracking-wider text-muted">
              Delivery Address
            </p>
            <p className="mt-1 inline-flex items-start gap-1.5 text-base text-cream">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              {address}
            </p>
          </div>
        ) : null}
      </div>

      {order.deliveryInstructions ? (
        <div className="mt-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted">
            <StickyNote className="h-3.5 w-3.5" />
            Order Notes
          </p>
          <p className="mt-1 text-base text-cream">
            {order.deliveryInstructions}
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted">
          Ordered Items
        </p>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-start justify-between gap-3 rounded-xl bg-brand-dark/30 px-3 py-2.5 ring-1 ring-white/5"
            >
              <div className="min-w-0">
                <p className="font-medium text-cream">
                  <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-accent/15 px-1.5 text-xs font-bold text-accent">
                    {item.quantity}x
                  </span>
                  {item.name}
                </p>
                {item.notes ? (
                  <p className="mt-1 pl-8 text-sm text-muted">{item.notes}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-base font-medium text-cream">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-1.5 border-t border-white/5 pt-4 text-base">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {isDelivery ? (
          <div className="flex justify-between text-muted">
            <span>Delivery Fee</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
        ) : null}
        <div className="flex justify-between pt-1 text-base font-semibold text-cream">
          <span>Total</span>
          <span className="text-accent">{formatPrice(order.total)}</span>
        </div>
      </div>
    </>
  );
});

export const NewOrderCard = memo(function NewOrderCard({
  order,
  onMarkAsRead,
  isEntering = false,
}: {
  order: StaffOrder;
  onMarkAsRead: (orderId: string) => void;
  isEntering?: boolean;
}) {
  const [confirmMarkRead, setConfirmMarkRead] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmMarkRead = () => {
    setIsConfirming(true);
    onMarkAsRead(order.id);
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-white/8 bg-surface-raised shadow-card",
        isEntering && "orders-card-enter"
      )}
    >
      <div className="p-5 sm:p-6">
        <OrderCardBody order={order} isNew />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/5 bg-brand-dark/20 p-4 sm:flex-row">
        <a
          href={buildWhatsAppCustomerUrl(order.customerPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className={ordersWhatsAppLinkClassName}
        >
          <WhatsAppIcon size={18} />
          WhatsApp Customer
        </a>

        {confirmMarkRead ? (
          <div className="flex flex-1 flex-col gap-2 rounded-xl bg-accent/10 p-3 ring-1 ring-accent/20 sm:flex-row sm:items-center">
            <p className="flex-1 text-base text-cream">
              Move order #{order.orderNumber} to history?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmMarkRead}
                disabled={isConfirming}
                className={cn(
                  ordersPrimaryButtonClassName,
                  "px-3 py-2 text-sm"
                )}
              >
                {isConfirming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : null}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmMarkRead(false)}
                disabled={isConfirming}
                className="orders-touch-btn rounded-lg px-3 py-2 text-sm text-muted disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmMarkRead(true)}
            className={cn(
              ordersSecondaryButtonClassName,
              "flex-1 px-4 py-3 text-sm"
            )}
          >
            Mark as Read
          </button>
        )}
      </div>
    </article>
  );
});

export const HistoryOrderCard = memo(function HistoryOrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onDelete,
}: {
  order: StaffOrder;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (orderId: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article className="orders-history-item overflow-hidden rounded-2xl border border-white/8 bg-surface-raised shadow-card">
      <button
        type="button"
        onClick={onToggleExpand}
        className="orders-touch-btn flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl tracking-wide text-cream">
              #{order.orderNumber || "—"}
            </span>
            <span className="text-base text-muted">{order.customerName}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {formatOrderTime(order.createdAt)} · {order.customerPhone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-base font-medium text-accent sm:inline">
            {formatPrice(order.total)}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted transition-transform duration-150",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-white/5 px-5 pb-5 pt-4">
          <OrderCardBody order={order} isNew={false} />
          <div className="mt-5 border-t border-white/5 pt-4">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-red-500/10 p-3 ring-1 ring-red-500/20">
                <p className="text-base text-red-200">
                  Delete this order from history?
                </p>
                <button
                  type="button"
                  onClick={() => onDelete(order.id)}
                  className={cn(
                    ordersPrimaryButtonClassName,
                    "bg-red-600 px-3 py-1.5 text-sm"
                  )}
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="orders-touch-btn rounded-lg px-3 py-1.5 text-sm text-muted"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="orders-touch-btn text-base font-medium text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
});
