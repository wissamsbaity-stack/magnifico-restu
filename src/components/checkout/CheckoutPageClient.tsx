"use client";

import { useState } from "react";
import { Store, Truck } from "lucide-react";
import { AnimatePresence, m } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { BranchSwitcher } from "@/components/branch/BranchSwitcher";
import { useBranchData } from "@/contexts/BranchContext";
import type { OrderType } from "@/types/order";
import { cn } from "@/lib/utils";

const COPY = {
  delivery: {
    cardTitle: "Delivery Details",
    cardDescription: "Enter your delivery information below.",
  },
  pickup: {
    cardTitle: "Pickup Details",
    cardDescription: "Enter your contact information for pickup.",
  },
} as const;

const textFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const },
};

function FadingText({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2";
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div key={text} {...textFade}>
        <Tag className={className}>{text}</Tag>
      </m.div>
    </AnimatePresence>
  );
}

export function CheckoutPageClient() {
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const { activeBranch } = useBranchData();
  const copy = COPY[orderType];
  const isDelivery = orderType === "delivery";

  return (
    <div className="pb-20">
      <section className="pt-6 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Almost there"
            title="Checkout"
            align="center"
            underline
            className="space-y-3"
          />
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        {activeBranch ? (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-line/10 bg-surface-raised p-4">
            <p className="text-sm text-muted">Ordering from</p>
            <BranchSwitcher className="max-w-[16rem]" />
          </div>
        ) : null}
        <div className="rounded-2xl border border-line/10 bg-surface-raised p-6 shadow-card lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow/25 ring-1 ring-brand-yellow/30">
              <AnimatePresence mode="wait" initial={false}>
                <m.div key={orderType} {...textFade}>
                  {isDelivery ? (
                    <Truck className="h-5 w-5 text-brand-pink" aria-hidden />
                  ) : (
                    <Store className="h-5 w-5 text-brand-pink" aria-hidden />
                  )}
                </m.div>
              </AnimatePresence>
            </div>
            <div className="min-w-0">
              <FadingText
                as="h2"
                text={copy.cardTitle}
                className="text-lg font-semibold text-cream"
              />
              <FadingText
                text={copy.cardDescription}
                className={cn("text-sm text-muted")}
              />
            </div>
          </div>
          <CheckoutForm
            orderType={orderType}
            onOrderTypeChange={setOrderType}
          />
        </div>
      </div>
    </div>
  );
}
