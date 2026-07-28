"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
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
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(mobileOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-panel theme-night fixed inset-0 flex overflow-hidden text-cream">
      {/* Desktop sidebar */}
      <div className="relative hidden h-full w-64 shrink-0 lg:flex">
        <AdminSidebar
          email={email}
          restaurantName={restaurantName}
          logoUrl={logoUrl}
        />
      </div>

      {/* Mobile drawer — only mount when open (avoids full-screen overlay blocking content) */}
      {mounted && mobileOpen
        ? createPortal(
            <div className="admin-panel theme-night fixed inset-0 z-50 text-cream lg:hidden">
              <button
                type="button"
                aria-label="Close menu"
                className="absolute inset-0 bg-brand-dark/70"
                onClick={closeMobile}
              />

              <div
                className="absolute inset-y-0 left-0 flex w-[min(85vw,18rem)] max-w-full flex-col bg-[rgb(var(--color-surface))] shadow-2xl"
                style={{
                  paddingTop: "env(safe-area-inset-top, 0px)",
                  paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
              >
                <div
                  data-scroll-lock-scrollable
                  className="flex h-full min-h-0 w-full flex-col overflow-hidden"
                >
                  <AdminSidebar
                    email={email}
                    restaurantName={restaurantName}
                    logoUrl={logoUrl}
                    onNavigate={closeMobile}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className="z-30 flex shrink-0 items-center gap-3 border-b border-white/8 bg-[rgb(var(--color-surface))] px-4 lg:hidden"
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
            paddingBottom: "0.75rem",
          }}
        >
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-10 lg:py-9"
            style={{
              paddingBottom:
                "max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
