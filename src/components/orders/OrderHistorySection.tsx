"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Search, Calendar, Trash2, Loader2 } from "lucide-react";
import { HistoryOrderCard } from "@/components/orders/OrderCard";
import { OrdersConfirmDialog } from "@/components/orders/OrdersConfirmDialog";
import {
  ordersDangerButtonClassName,
  ordersInputClassName,
  ordersSecondaryButtonClassName,
} from "@/components/orders/orders-ui";
import {
  clearOrderHistory,
  deleteHistoryOrder,
  fetchOrderHistory,
} from "@/app/orders/actions";
import { HISTORY_PAGE_SIZE } from "@/lib/orders/constants";
import type { StaffOrder } from "@/lib/orders/map-order";
import { sortOrdersNewestFirst } from "@/lib/orders/map-order";
import { cn } from "@/lib/utils";

interface OrderHistorySectionProps {
  initialOrders: StaffOrder[];
  initialHasMore: boolean;
  initialTotalCount: number;
  prependOrder?: StaffOrder | null;
  onPrependConsumed?: () => void;
}

const HistoryOrderListItem = memo(function HistoryOrderListItem({
  order,
  isExpanded,
  onToggleExpand,
  onDelete,
}: {
  order: StaffOrder;
  isExpanded: boolean;
  onToggleExpand: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}) {
  return (
    <HistoryOrderCard
      order={order}
      isExpanded={isExpanded}
      onToggleExpand={() => onToggleExpand(order.id)}
      onDelete={onDelete}
    />
  );
});

export const OrderHistorySection = memo(function OrderHistorySection({
  initialOrders,
  initialHasMore,
  initialTotalCount,
  prependOrder,
  onPrependConsumed,
}: OrderHistorySectionProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const skipInitialSearchRef = useRef(true);

  const reloadHistory = useCallback(
    (nextPage: number, nextSearch: string, nextDate: string) => {
      startTransition(async () => {
        try {
          const result = await fetchOrderHistory({
            page: nextPage,
            search: nextSearch,
            date: nextDate || undefined,
          });
          setOrders(result.orders);
          setHasMore(result.hasMore);
          setTotalCount(result.totalCount);
          setPage(nextPage);
          setExpandedId(null);
        } catch {
          // Keep existing list on failure.
        }
      });
    },
    []
  );

  useEffect(() => {
    if (skipInitialSearchRef.current) {
      skipInitialSearchRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      reloadHistory(0, search, dateFilter);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, dateFilter, reloadHistory]);

  useEffect(() => {
    if (!prependOrder) return;
    if (search || dateFilter) {
      onPrependConsumed?.();
      return;
    }
    setOrders((current) => {
      if (current.some((item) => item.id === prependOrder.id)) return current;
      return sortOrdersNewestFirst([prependOrder, ...current]).slice(
        0,
        (page + 1) * HISTORY_PAGE_SIZE
      );
    });
    setTotalCount((count) => count + 1);
    onPrependConsumed?.();
  }, [prependOrder, search, dateFilter, page, onPrependConsumed]);

  const handleToggleExpand = useCallback((orderId: string) => {
    setExpandedId((current) => (current === orderId ? null : orderId));
  }, []);

  const handleDelete = useCallback(
    (orderId: string) => {
      startTransition(async () => {
        const result = await deleteHistoryOrder(orderId);
        if (result.success) {
          setOrders((current) =>
            current.filter((order) => order.id !== orderId)
          );
          setTotalCount((count) => Math.max(0, count - 1));
          setExpandedId((current) => (current === orderId ? null : current));
        }
      });
    },
    [startTransition]
  );

  async function handleLoadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await fetchOrderHistory({
        page: nextPage,
        search,
        date: dateFilter || undefined,
      });
      setOrders((current) => {
        const merged = [...current];
        for (const order of result.orders) {
          if (!merged.some((item) => item.id === order.id)) {
            merged.push(order);
          }
        }
        return merged;
      });
      setHasMore(result.hasMore);
      setPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleClearHistory() {
    startTransition(async () => {
      const result = await clearOrderHistory();
      if (result.success) {
        setOrders([]);
        setHasMore(false);
        setTotalCount(0);
        setPage(0);
        setExpandedId(null);
        setShowClearConfirm(false);
      }
    });
  }

  return (
    <section className="mt-10 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-wide text-cream">
            Order History
          </h2>
          <p className="mt-1 text-base text-muted">
            {totalCount} archived order{totalCount === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          disabled={totalCount === 0 || isPending}
          className={cn(
            ordersDangerButtonClassName,
            "self-start px-4 py-2.5 text-sm"
          )}
        >
          <Trash2 className="h-4 w-4" />
          Clear Entire History
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, or phone…"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(ordersInputClassName, "py-3 pl-10 pr-4")}
          />
        </label>

        <label className="relative block min-w-0 sm:w-48">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={cn(ordersInputClassName, "py-3 pl-10 pr-3")}
          />
        </label>
      </div>

      <div className="relative mt-5 space-y-3">
        {isPending && orders.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-overlay px-3 py-1 text-sm text-muted ring-1 ring-white/10">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating…
            </span>
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-surface-raised/50 px-6 py-12 text-center">
            <p className="text-base text-muted">
              {search || dateFilter
                ? "No orders match your search."
                : "No archived orders yet."}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <HistoryOrderListItem
              key={order.id}
              order={order}
              isExpanded={expandedId === order.id}
              onToggleExpand={handleToggleExpand}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {hasMore ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={cn(
              ordersSecondaryButtonClassName,
              "px-5 py-2.5 text-sm"
            )}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      ) : null}

      <OrdersConfirmDialog
        open={showClearConfirm}
        title="Clear entire history?"
        description="This permanently deletes all archived orders. New orders will not be affected."
        confirmLabel="Clear History"
        tone="danger"
        isLoading={isPending}
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </section>
  );
});

export type { OrderHistorySectionProps };
