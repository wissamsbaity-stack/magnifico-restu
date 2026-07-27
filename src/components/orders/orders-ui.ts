import { cn } from "@/lib/utils";

export const ordersInputClassName = cn(
  "orders-input w-full rounded-xl border border-white/10 bg-surface-overlay text-base text-cream outline-none placeholder:text-muted focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
);

export const ordersSecondaryButtonClassName = cn(
  "orders-touch-btn inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-base font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-50"
);

export const ordersPrimaryButtonClassName = cn(
  "orders-touch-btn inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
);

export const ordersDangerButtonClassName = cn(
  "orders-touch-btn inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 text-base font-medium text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
);

export const ordersWhatsAppLinkClassName = cn(
  "orders-touch-link inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-base font-semibold text-white"
);
