"use client";

import { useEffect, useRef } from "react";
import { fetchUnreadOrders } from "@/app/orders/actions";
import { createBrowserClient } from "@/lib/supabase/client";
import { mapOrderRow } from "@/lib/orders/map-order";
import type { StaffOrder } from "@/lib/orders/map-order";
import type { Database } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const CHANNEL_NAME = "orders-dashboard";
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

interface UseOrdersRealtimeOptions {
  initialOrderIds: string[];
  onInsert: (order: StaffOrder) => void;
  onMarkRead: (orderId: string) => void;
  onResync: (orders: StaffOrder[]) => void;
}

export function useOrdersRealtime({
  initialOrderIds,
  onInsert,
  onMarkRead,
  onResync,
}: UseOrdersRealtimeOptions) {
  const seenIdsRef = useRef(new Set(initialOrderIds));
  const liveRef = useRef(false);
  const hasConnectedOnceRef = useRef(false);
  const onInsertRef = useRef(onInsert);
  const onMarkReadRef = useRef(onMarkRead);
  const onResyncRef = useRef(onResync);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    seenIdsRef.current = new Set(initialOrderIds);
  }, [initialOrderIds]);

  useEffect(() => {
    onInsertRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    onMarkReadRef.current = onMarkRead;
  }, [onMarkRead]);

  useEffect(() => {
    onResyncRef.current = onResync;
  }, [onResync]);

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) return;

    cancelledRef.current = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const removeChannel = () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (cancelledRef.current) return;
      clearReconnectTimer();
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** attempt,
        RECONNECT_MAX_MS
      );
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectAttemptRef.current += 1;
        void subscribe();
      }, delay);
    };

    const handleInsert = (row: OrderRow) => {
      if (row.is_read) return;
      if (seenIdsRef.current.has(row.id)) return;

      seenIdsRef.current.add(row.id);
      if (!liveRef.current) return;

      onInsertRef.current(mapOrderRow(row));
    };

    const handleUpdate = (row: OrderRow) => {
      if (row.is_read) {
        onMarkReadRef.current(row.id);
      }
    };

    const subscribe = async () => {
      clearReconnectTimer();
      removeChannel();
      liveRef.current = false;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        if (!cancelledRef.current) scheduleReconnect();
        return;
      }

      supabase.realtime.setAuth(session.access_token);

      const channel = supabase
        .channel(CHANNEL_NAME)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => handleInsert(payload.new as OrderRow)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          (payload) => handleUpdate(payload.new as OrderRow)
        )
        .subscribe((status) => {
          if (cancelledRef.current) return;

          if (status === "SUBSCRIBED") {
            const isReconnect = hasConnectedOnceRef.current;
            hasConnectedOnceRef.current = true;
            reconnectAttemptRef.current = 0;
            liveRef.current = true;

            if (isReconnect) {
              void fetchUnreadOrders()
                .then((orders) => {
                  if (cancelledRef.current) return;
                  for (const order of orders) {
                    seenIdsRef.current.add(order.id);
                  }
                  onResyncRef.current(orders);
                })
                .catch(() => {
                  // Keep the live subscription; the next insert will still arrive.
                });
            }
          } else if (
            status === "CLOSED" ||
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            liveRef.current = false;
            scheduleReconnect();
          }
        });

      channelRef.current = channel;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });

    void subscribe();

    return () => {
      cancelledRef.current = true;
      liveRef.current = false;
      clearReconnectTimer();
      removeChannel();
      subscription.unsubscribe();
    };
  }, []);
}
