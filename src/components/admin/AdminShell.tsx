"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

export function AdminShell({
  email,
  restaurantName,
  logoUrl,
  children,
}: {
  email: string;
  restaurantName: string;
  logoUrl: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-panel theme-night flex h-dvh max-h-dvh overflow-hidden text-cream">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-brand-dark/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(85vw,18rem)] shrink-0 transform transition-transform duration-200 lg:static lg:z-0 lg:h-full lg:w-64 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar
          email={email}
          restaurantName={restaurantName}
          logoUrl={logoUrl}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-[rgb(var(--color-surface)/0.92)] px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cream transition-colors hover:bg-white/10"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold tracking-wide text-accent">
              Magnifico
            </p>
            <p className="truncate text-xs text-muted">Admin</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
