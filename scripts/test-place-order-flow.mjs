/**
 * Simulates placeOrder server action against live Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const rpcPayload = {
  p_customer_name: "Place Order Simulation",
  p_customer_phone: "70999888",
  p_city: "Beirut",
  p_street: "Test Street",
  p_building: "Block A",
  p_delivery_instructions: null,
  p_items: [{ name: "Test Burger", quantity: 1, price: 10, notes: null }],
  p_subtotal: 10,
  p_delivery_fee: 2,
  p_total: 12,
  p_order_type: "delivery",
};

const payload = {
  customer_name: rpcPayload.p_customer_name,
  customer_phone: rpcPayload.p_customer_phone,
  city: rpcPayload.p_city,
  street: rpcPayload.p_street,
  building: rpcPayload.p_building,
  delivery_instructions: null,
  items: rpcPayload.p_items,
  subtotal: 10,
  delivery_fee: 2,
  total: 12,
  order_type: "delivery",
  is_read: false,
  status: "pending",
};

const { data, error } = await supabase.rpc("create_public_order", rpcPayload);

if (!error && data) {
  console.log("RPC success:", data);
  process.exit(0);
}

if (error?.code === "PGRST202") {
  console.log("RPC missing, using direct insert fallback…");
  const fallback = await supabase.from("orders").insert(payload);
  if (fallback.error) {
    console.error("Fallback failed:", fallback.error);
    process.exit(1);
  }
  console.log("Fallback insert succeeded");
  process.exit(0);
}

console.error("RPC error:", error);
process.exit(1);
