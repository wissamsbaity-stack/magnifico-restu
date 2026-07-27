import { isValidLebanonPhone } from "@/lib/utils";
import type { Json } from "@/lib/supabase/types";
import type { OrderType } from "@/types/order";

export interface PlaceOrderItem {
  name: string;
  quantity: number;
  price: number;
  notes: string | null;
}

export interface BuildOrderInsertInput {
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  city: string | null;
  street: string | null;
  building: string | null;
  deliveryInstructions: string | null;
  items: PlaceOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export type OrderInsertPayload = {
  customer_name: string;
  customer_phone: string;
  city: string | null;
  street: string | null;
  building: string | null;
  delivery_instructions: string | null;
  items: Json;
  subtotal: number;
  delivery_fee: number;
  total: number;
  order_type: OrderType;
  is_read: false;
  status: "pending";
};

export type OrderRpcPayload = {
  p_customer_name: string;
  p_customer_phone: string;
  p_city: string | null;
  p_street: string | null;
  p_building: string | null;
  p_delivery_instructions: string | null;
  p_items: Json;
  p_subtotal: number;
  p_delivery_fee: number;
  p_total: number;
  p_order_type: OrderType;
};

export function validateOrderInput(
  input: BuildOrderInsertInput
): string | null {
  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();

  if (!name) {
    return "Name is required.";
  }

  if (!phone || !isValidLebanonPhone(phone)) {
    return "Enter a valid Lebanon mobile number (e.g. 70123456).";
  }

  if (!input.items.length) {
    return "Your cart is empty.";
  }

  for (const item of input.items) {
    if (!item.name.trim()) {
      return "Each cart item must have a name.";
    }
    if (!Number.isFinite(item.quantity) || item.quantity < 1) {
      return "Each cart item must have a valid quantity.";
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      return "Each cart item must have a valid price.";
    }
  }

  if (!Number.isFinite(input.subtotal) || input.subtotal < 0) {
    return "Subtotal is invalid.";
  }

  if (!Number.isFinite(input.deliveryFee) || input.deliveryFee < 0) {
    return "Delivery fee is invalid.";
  }

  if (!Number.isFinite(input.total) || input.total < 0) {
    return "Order total is invalid.";
  }

  if (input.orderType === "delivery") {
    if (!input.city?.trim() || !input.street?.trim() || !input.building?.trim()) {
      return "Delivery address is required.";
    }
  }

  if (input.orderType !== "delivery" && input.orderType !== "pickup") {
    return "Order type is invalid.";
  }

  return null;
}

export function buildOrderInsertPayload(
  input: BuildOrderInsertInput
): OrderInsertPayload {
  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  const isDelivery = input.orderType === "delivery";

  return {
    customer_name: name,
    customer_phone: phone,
    city: isDelivery ? input.city!.trim() : null,
    street: isDelivery ? input.street!.trim() : null,
    building: isDelivery ? input.building!.trim() : null,
    delivery_instructions: input.deliveryInstructions?.trim() || null,
    items: input.items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity,
      price: item.price,
      notes: item.notes?.trim() ? item.notes.trim() : null,
    })) as Json,
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    total: input.total,
    order_type: input.orderType,
    is_read: false,
    status: "pending",
  };
}

export function buildOrderRpcPayload(
  input: BuildOrderInsertInput
): OrderRpcPayload {
  const row = buildOrderInsertPayload(input);

  return {
    p_customer_name: row.customer_name,
    p_customer_phone: row.customer_phone,
    p_city: row.city,
    p_street: row.street,
    p_building: row.building,
    p_delivery_instructions: row.delivery_instructions,
    p_items: row.items,
    p_subtotal: row.subtotal,
    p_delivery_fee: row.delivery_fee,
    p_total: row.total,
    p_order_type: row.order_type,
  };
}
