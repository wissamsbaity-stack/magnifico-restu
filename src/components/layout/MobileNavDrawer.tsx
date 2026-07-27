"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu as MenuIcon,
  MessageCircle,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
import { createPortal } from "react-dom";
import { BranchSwitcher } from "@/components/branch/BranchSwitcher";
import { mobileHeaderIconButtonClass } from "@/lib/mobile-header";
import {
  closeMobileNav,
  openMobileNav,
  useMobileNavOpen,
} from "@/lib/navigation-store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useOverlayLock } from "@/lib/overlay-store";
import { cn } from "@/lib/utils";

const mobileNavItems: {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "menu", label: "Menu", icon: UtensilsCrossed, href: "/menu" },
  { id: "contact", label: "Contact", icon: MessageCircle, href: "/contact" },
];

const MobileNavLink = memo(function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-[58px] items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold leading-none",
        "tap-instant transition-[background-color,color,box-shadow,transform] duration-150",
        "motion-safe:active:scale-[0.98]",
        active
          ? "bg-surface-raised text-cream shadow-card ring-1 ring-brand-yellow/30"
          : "text-cream/80 hover:bg-surface-raised/55 hover:text-cream"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors duration-150",
          active ? "text-brand-pink" : "text-cream/55 group-hover:text-brand-pink/80"
        )}
        strokeWidth={2.25}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </Link>
  );
});

export const MobileNavDrawer = memo(function MobileNavDrawer() {
  const open = useMobileNavOpen();
  const pathname = usePathname();

  useOverlayLock(open);
  useBodyScrollLock(open);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={closeMobileNav}
        className="fixed inset-0 z-[60] bg-brand-ink/55 md:hidden"
      />
      <nav
        className="fixed inset-0 z-[70] flex h-dvh flex-col bg-ink md:hidden"
        style={{
          paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="shrink-0 px-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1" onClick={closeMobileNav}>
              <BranchSwitcher variant="drawer" className="w-full max-w-full" />
            </div>
            <button
              type="button"
              onClick={closeMobileNav}
              className={cn(mobileHeaderIconButtonClass, "shrink-0")}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-2 pt-1">
          <div className="flex flex-col gap-1.5">
            {mobileNavItems.map((item) => (
              <MobileNavLink
                key={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
                onNavigate={closeMobileNav}
              />
            ))}
          </div>
        </div>
      </nav>
    </>,
    document.body
  );
});

export const MobileMenuButton = memo(function MobileMenuButton() {
  return (
    <button
      type="button"
      onClick={openMobileNav}
      className={mobileHeaderIconButtonClass}
      aria-label="Open menu"
    >
      <MenuIcon className="h-5 w-5" strokeWidth={2.25} />
    </button>
  );
});
