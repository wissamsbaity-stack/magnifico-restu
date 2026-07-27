"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/staff";
import { fetchUnreadOrders as fetchUnreadOrdersQuery } from "@/lib/orders/queries";
import { mapOrderRow } from "@/lib/orders/map-order";
import { dateInputToRange } from "@/lib/orders/format-order-time";
import { HISTORY_PAGE_SIZE } from "@/lib/orders/constants";
import type { StaffOrder } from "@/lib/orders/map-order";
import type { Database } from "@/lib/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export async function fetchUnreadOrders(): Promise<StaffOrder[]> {
  const { supabase } = await requireStaff();
  return fetchUnreadOrdersQuery(supabase);
}

export async function markOrderAsRead(
  orderId: string
): Promise<{ success: boolean; order?: StaffOrder; error?: string }> {
  const { supabase } = await requireStaff();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("orders")
    .update({ is_read: true })
    .eq("id", orderId)
    .eq("is_read", false)
    .select("*")
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Order not found or already read." };
  }

  revalidatePath("/orders");
  return { success: true, order: mapOrderRow(data as OrderRow) };
}

export async function deleteHistoryOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireStaff();

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("is_read", true);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/orders");
  return { success: true };
}

export async function clearOrderHistory(): Promise<{
  success: boolean;
  error?: string;
}> {
  const { supabase } = await requireStaff();

  const { error } = await supabase.from("orders").delete().eq("is_read", true);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/orders");
  return { success: true };
}

export async function fetchOrderHistory(params: {
  page: number;
  search?: string;
  date?: string;
}): Promise<{
  orders: StaffOrder[];
  hasMore: boolean;
  totalCount: number;
}> {
  const { supabase } = await requireStaff();
  const page = Math.max(0, params.page);
  const from = page * HISTORY_PAGE_SIZE;
  const to = from + HISTORY_PAGE_SIZE - 1;
  const search = params.search?.trim() ?? "";

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("is_read", true)
    .order("created_at", { ascending: false });

  if (search) {
    const numeric = /^\d+$/.test(search);
    if (numeric) {
      query = query.or(
        `order_number.eq.${search},customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    } else {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    }
  }

  if (params.date) {
    const { start, end } = dateInputToRange(params.date);
    query = query.gte("created_at", start).lte("created_at", end);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const orders = (data ?? []).map((row) => mapOrderRow(row as OrderRow));
  const totalCount = count ?? 0;

  return {
    orders,
    hasMore: to + 1 < totalCount,
    totalCount,
  };
}
