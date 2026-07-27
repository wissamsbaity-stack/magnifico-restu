/**
 * Smoke-test built-in order insertion against Supabase.
 *
 * Usage:
 *   node scripts/test-place-order.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
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
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars are already exported
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const payload = {
  p_customer_name: "Test Customer",
  p_customer_phone: "70123456",
  p_city: "Beirut",
  p_street: "Hamra Street",
  p_building: "Test Building",
  p_delivery_instructions: "Automated test order",
  p_items: [
    {
      name: "Classic Burger",
      quantity: 1,
      price: 12.5,
      notes: null,
    },
  ],
  p_subtotal: 12.5,
  p_delivery_fee: 2,
  p_total: 14.5,
  p_order_type: "delivery",
};

console.log("Inserting test order via create_public_order…");
console.log("Table: orders");
console.log("Payload:", payload);

const { data, error } = await supabase.rpc("create_public_order", payload);

if (error) {
  console.error("Supabase error:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
  process.exit(1);
}

console.log("Success:", data);
