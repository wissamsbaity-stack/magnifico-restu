"use client";

import { memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Radio } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { ordersSecondaryButtonClassName } from "@/components/orders/orders-ui";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

interface OrdersHeaderProps {
  restaurantName: string;
  logoUrl: string;
  newOrderCount: number;
}

export const OrdersHeader = memo(function OrdersHeader({
  restaurantName,
  logoUrl,
  newOrderCount,
}: OrdersHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/orders/login");
    router.refresh();
  }

  return (
    <header className="z-50 shrink-0 border-b border-white/8 bg-ink/95 supports-[backdrop-filter]:bg-ink/90 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={logoUrl}
            alt={restaurantName}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-11 w-auto shrink-0 object-contain"
            sizes="120px"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-xl tracking-wide text-accent sm:text-2xl">
              {restaurantName}
            </p>
            <p className="text-sm text-muted">Orders Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-overlay px-3 py-2 text-sm font-semibold text-cream sm:px-4">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>
              {newOrderCount} New Order{newOrderCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="hidden items-center gap-1.5 text-xs text-emerald-400 sm:inline-flex">
            <Radio className="h-3.5 w-3.5" />
            Live
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              ordersSecondaryButtonClassName,
              "px-3 py-2 text-sm text-muted"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
});
