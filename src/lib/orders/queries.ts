import { mapOrderRow, sortOrdersNewestFirst } from "@/lib/orders/map-order";
import type { StaffOrder } from "@/lib/orders/map-order";
import type { Database } from "@/lib/supabase/types";
import type { createServerClient } from "@/lib/supabase/server";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createServerClient>>>;

export async function fetchUnreadOrders(
  supabase: ServerSupabase
): Promise<StaffOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortOrdersNewestFirst(
    (data ?? []).map((row) => mapOrderRow(row as OrderRow))
  );
}
