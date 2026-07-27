"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Inbox } from "lucide-react";
import { markOrderAsRead } from "@/app/orders/actions";
import { NewOrderCard } from "@/components/orders/OrderCard";
import { OrderHistorySection } from "@/components/orders/OrderHistorySection";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrdersMobileShell } from "@/components/orders/OrdersMobileShell";
import {
  OrdersToastStack,
  type OrdersToastItem,
} from "@/components/orders/OrdersToastStack";
import { useOrderNotificationSound } from "@/components/orders/useOrderNotificationSound";
import { useOrdersRealtime } from "@/components/orders/useOrdersRealtime";
import {
  sortOrdersNewestFirst,
  type StaffOrder,
} from "@/lib/orders/map-order";

interface OrdersDashboardProps {
  restaurantName: string;
  logoUrl: string;
  initialNewOrders: StaffOrder[];
  initialHistoryOrders: StaffOrder[];
  initialHistoryHasMore: boolean;
  initialHistoryTotalCount: number;
}

export function OrdersDashboard({
  restaurantName,
  logoUrl,
  initialNewOrders,
  initialHistoryOrders,
  initialHistoryHasMore,
  initialHistoryTotalCount,
}: OrdersDashboardProps) {
  const [newOrders, setNewOrders] = useState(() =>
    sortOrdersNewestFirst(initialNewOrders)
  );
  const [toasts, setToasts] = useState<OrdersToastItem[]>([]);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());
  const [historyPrepend, setHistoryPrepend] = useState<StaffOrder | null>(
    null
  );
  const { play } = useOrderNotificationSound();
  const enteringTimersRef = useRef<Map<string, number>>(new Map());
  const newOrdersRef = useRef(newOrders);

  newOrdersRef.current = newOrders;

  const initialOrderIds = useMemo(
    () => initialNewOrders.map((order) => order.id),
    [initialNewOrders]
  );

  const markEntering = useCallback((orderId: string) => {
    setEnteringIds((current) => new Set(current).add(orderId));
    const existing = enteringTimersRef.current.get(orderId);
    if (existing) window.clearTimeout(existing);
    const timer = window.setTimeout(() => {
      setEnteringIds((current) => {
        const next = new Set(current);
        next.delete(orderId);
        return next;
      });
      enteringTimersRef.current.delete(orderId);
    }, 240);
    enteringTimersRef.current.set(orderId, timer);
  }, []);

  const pushToast = useCallback((toast: Omit<OrdersToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [{ ...toast, id }, ...current.slice(0, 3)]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const handleRealtimeInsert = useCallback(
    (order: StaffOrder) => {
      setNewOrders((current) => {
        if (current.some((item) => item.id === order.id)) return current;
        return sortOrdersNewestFirst([order, ...current]);
      });
      markEntering(order.id);
      play();
      pushToast({
        title: "🔔 New Order Received",
        message: `Order #${order.orderNumber} has just arrived.`,
      });
    },
    [markEntering, play, pushToast]
  );

  const handleRealtimeMarkRead = useCallback((orderId: string) => {
    setNewOrders((current) => current.filter((order) => order.id !== orderId));
  }, []);

  const handleRealtimeResync = useCallback((orders: StaffOrder[]) => {
    setNewOrders((current) => {
      const merged = [...current];
      for (const order of orders) {
        if (!merged.some((item) => item.id === order.id)) {
          merged.push(order);
        }
      }
      return sortOrdersNewestFirst(merged);
    });
  }, []);

  useOrdersRealtime({
    initialOrderIds,
    onInsert: handleRealtimeInsert,
    onMarkRead: handleRealtimeMarkRead,
    onResync: handleRealtimeResync,
  });

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const handleMarkAsRead = useCallback(
    (orderId: string) => {
      const order = newOrdersRef.current.find((item) => item.id === orderId);
      if (!order) return;

      setNewOrders((current) => current.filter((item) => item.id !== orderId));

      void (async () => {
        const result = await markOrderAsRead(orderId);

        if (!result.success || !result.order) {
          setNewOrders((current) => {
            if (current.some((item) => item.id === orderId)) return current;
            return sortOrdersNewestFirst([order, ...current]);
          });
          pushToast({
            title: "Couldn't update order",
            message: result.error ?? "Failed to mark order as read.",
            tone: "error",
          });
          return;
        }

        setHistoryPrepend(result.order);
      })();
    },
    [pushToast]
  );

  return (
    <OrdersMobileShell className="relative">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-50" />

      <OrdersHeader
        restaurantName={restaurantName}
        logoUrl={logoUrl}
        newOrderCount={newOrders.length}
      />

      <OrdersToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="orders-app-scroll relative">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <section>
            <div className="mb-5">
              <h2 className="font-display text-3xl tracking-wide text-cream">
                New Orders
              </h2>
              <p className="mt-1 text-base text-muted">
                Incoming orders appear instantly — no refresh needed.
              </p>
            </div>

            {newOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-surface-raised/60 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
                  <Inbox className="h-7 w-7 text-muted" />
                </div>
                <p className="font-medium text-cream">All caught up</p>
                <p className="mt-1 text-base text-muted">
                  New orders will appear here with a sound alert.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {newOrders.map((order) => (
                  <NewOrderCard
                    key={order.id}
                    order={order}
                    onMarkAsRead={handleMarkAsRead}
                    isEntering={enteringIds.has(order.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <OrderHistorySection
            initialOrders={initialHistoryOrders}
            initialHasMore={initialHistoryHasMore}
            initialTotalCount={initialHistoryTotalCount}
            prependOrder={historyPrepend}
            onPrependConsumed={() => setHistoryPrepend(null)}
          />
        </main>
      </div>
    </OrdersMobileShell>
  );
}
