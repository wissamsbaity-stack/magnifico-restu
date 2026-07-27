import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Lebanon local mobile: 8 digits, prefixes 03/70/71/76/78/79/81 */
export function isValidLebanonPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 8) return false;
  return /^(03|70|71|76|78|79|81)/.test(digits);
}

export function formatLebanonPhoneForWhatsApp(localPhone: string): string {
  const digits = localPhone.replace(/\D/g, "");
  return `961${digits}`;
}
