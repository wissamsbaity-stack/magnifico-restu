import { formatLebanonPhoneForWhatsApp } from "@/lib/utils";

export function buildWhatsAppCustomerUrl(phone: string): string {
  return `https://wa.me/${formatLebanonPhoneForWhatsApp(phone)}`;
}
