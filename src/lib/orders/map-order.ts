import type { Database } from "@/lib/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export interface StaffOrderItem {
  name: string;
  quantity: number;
  price: number;
  notes: string | null;
}

export interface StaffOrder {
  id: string;
  orderNumber: number;
  orderType: "delivery" | "pickup";
  createdAt: string;
  customerName: string;
  customerPhone: string;
  city: string | null;
  street: string | null;
  building: string | null;
  deliveryInstructions: string | null;
  items: StaffOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  isRead: boolean;
}

function parseItems(items: unknown): StaffOrderItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = item as Record<string, unknown>;
    const notes = row.notes;
    return {
      name: String(row.name ?? ""),
      quantity: Number(row.quantity ?? 1),
      price: Number(row.price ?? 0),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    };
  });
}

export function mapOrderRow(row: OrderRow): StaffOrder {
  return {
    id: row.id,
    orderNumber: row.order_number ?? 0,
    orderType: row.order_type === "pickup" ? "pickup" : "delivery",
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    city: row.city,
    street: row.street,
    building: row.building,
    deliveryInstructions: row.delivery_instructions,
    items: parseItems(row.items),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    isRead: row.is_read,
  };
}

export function formatDeliveryAddress(order: StaffOrder): string | null {
  if (order.orderType !== "delivery") return null;
  const parts = [order.street, order.building, order.city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function sortOrdersNewestFirst(orders: StaffOrder[]): StaffOrder[] {
  return [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
