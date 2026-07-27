"use client";

import Link from "next/link";
import { memo } from "react";
import { Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { useActiveContact } from "@/hooks/useActiveContact";

export const OrderCTA = memo(function OrderCTA() {
  const { whatsapp, restaurantName } = useActiveContact();
  const whatsappUrl = buildWhatsAppContactUrl(
    undefined,
    whatsapp,
    restaurantName
  );

  return (
    <section className="home-section pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-surface-raised p-8 md:p-12">
          <div
            className="pointer-events-none absolute inset-0 bg-section-glow"
            aria-hidden
          />

          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-cream md:text-4xl">
                Hungry? Order in 3 taps.
              </h2>
              <p className="text-muted">
                Build your cart and send your order via WhatsApp.
              </p>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Truck className="h-5 w-5 text-brand-pink" />
                  Fast delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <WhatsAppIcon size={20} className="text-brand-pink" />
                  WhatsApp ordering
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="whatsapp" size="lg" className="w-full">
                  <WhatsAppIcon size={20} />
                  Order on WhatsApp
                </Button>
              </a>
              <Link href="/menu" className="flex-1">
                <Button variant="primary" size="lg" className="w-full">
                  Browse Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
