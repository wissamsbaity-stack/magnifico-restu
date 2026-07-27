import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order and send it via WhatsApp.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
