"use server";

import { createServerClient } from "@/lib/supabase/server";
import {
  buildOrderInsertPayload,
  buildOrderRpcPayload,
  validateOrderInput,
  type PlaceOrderItem,
} from "@/lib/orders/build-order-insert";
import {
  buildSupabaseErrorDebug,
  formatSupabaseErrorMessage,
  logSupabaseError,
  type SupabaseErrorDebug,
} from "@/lib/orders/supabase-error";
import type { OrderType } from "@/types/order";

export type { PlaceOrderItem } from "@/lib/orders/build-order-insert";

export interface PlaceOrderInput {
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

export interface PlaceOrderResult {
  success: boolean;
  orderNumber?: number;
  error?: string;
  debug?: SupabaseErrorDebug;
}

const ORDERS_TABLE = "orders" as const;

export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const supabase = await createServerClient();
  if (!supabase) {
    return { success: false, error: "Ordering is temporarily unavailable." };
  }

  const validationError = validateOrderInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const payload = buildOrderInsertPayload(input);
  const rpcPayload = buildOrderRpcPayload(input);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data, error } = await client.rpc("create_public_order", rpcPayload);

  if (!error && data) {
    const row = Array.isArray(data) ? data[0] : data;
    const orderNumber =
      row && typeof row === "object" && "order_number" in row
        ? Number((row as { order_number: number }).order_number)
        : undefined;

    return {
      success: true,
      orderNumber: Number.isFinite(orderNumber) ? orderNumber : undefined,
    };
  }

  if (error?.code === "PGRST202") {
    const fallback = await client.from(ORDERS_TABLE).insert(payload);

    if (!fallback.error) {
      return { success: true };
    }

    const debug = buildSupabaseErrorDebug(
      ORDERS_TABLE,
      payload as unknown as Record<string, unknown>,
      fallback.error
    );
    logSupabaseError("placeOrder", debug);

    return {
      success: false,
      error: formatSupabaseErrorMessage(fallback.error),
      debug,
    };
  }

  if (error) {
    const debug = buildSupabaseErrorDebug(
      ORDERS_TABLE,
      rpcPayload as unknown as Record<string, unknown>,
      error
    );
    logSupabaseError("placeOrder", debug);

    return {
      success: false,
      error: formatSupabaseErrorMessage(error),
      debug,
    };
  }

  return {
    success: false,
    error: "Order was submitted but no confirmation was returned.",
    debug: {
      table: ORDERS_TABLE,
      payload: rpcPayload as unknown as Record<string, unknown>,
      code: null,
      message: "RPC returned no data and no error.",
      details: null,
      hint: "Apply migration 016_create_public_order.sql if this persists.",
    },
  };
}
