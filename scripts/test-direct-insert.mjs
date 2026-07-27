/**
 * Test direct orders insert (with and without SELECT) using anon key.
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

const payload = {
  customer_name: "Direct Insert Test",
  customer_phone: "70123456",
  city: "Beirut",
  street: "Hamra Street",
  building: "Test Building",
  delivery_instructions: "Direct insert test",
  items: [{ name: "Classic Burger", quantity: 1, price: 12.5, notes: null }],
  subtotal: 12.5,
  delivery_fee: 2,
  total: 14.5,
  order_type: "delivery",
  is_read: false,
  status: "pending",
};

console.log("1) insert + select order_number");
const withSelect = await supabase
  .from("orders")
  .insert(payload)
  .select("order_number")
  .single();
console.log(withSelect.error ?? withSelect.data);

console.log("2) insert only (no select)");
const insertOnly = await supabase.from("orders").insert({
  ...payload,
  customer_name: "Direct Insert Test 2",
});
console.log(insertOnly.error ?? insertOnly.data ?? "ok");
