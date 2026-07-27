"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RestaurantBrand } from "@/components/layout/RestaurantBrand";
import { BranchSwitcher } from "@/components/branch/BranchSwitcher";
import { MobileMenuButton } from "@/components/layout/MobileNavDrawer";
import { desktopHeaderBarClass } from "@/lib/mobile-header";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          /* Fixed on mobile avoids iOS sticky+overflow vibration; sticky on md+ */
          "fixed inset-x-0 top-0 z-50 w-full md:sticky",
          "max-md:px-[18px] max-md:pb-[var(--mobile-header-padding-bottom)] max-md:pt-[var(--mobile-header-padding-top)]",
          isHome
            ? "bg-transparent"
            : desktopHeaderBarClass
        )}
      >
        {/* Mobile: matched side slots keep equal gaps around the branch */}
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2.5 md:hidden">
          <div className="flex w-14 shrink-0 justify-start">
            <RestaurantBrand size="header-mobile" presentation="mobile-pill" />
          </div>

          <div className="flex min-w-0 flex-1 justify-center">
            <BranchSwitcher
              variant="mobileHeader"
              className="w-full max-w-[13rem]"
            />
          </div>

          <div className="flex w-14 shrink-0 justify-end">
            <MobileMenuButton />
          </div>
        </div>

        {/* Desktop: 3-column grid — nav stays viewport-centered */}
        <div className="relative mx-auto hidden h-[var(--site-header-height)] w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 md:grid lg:px-8">
          <div className="flex min-w-0 justify-self-start">
            <RestaurantBrand presentation="desktop-pill" />
          </div>

          <nav className="flex items-center justify-center justify-self-center gap-2 lg:gap-3">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap-instant relative rounded-full px-4 py-2 text-[15px] font-bold transition-colors duration-150",
                    active
                      ? "text-brand-pink"
                      : "text-cream/75 hover:text-cream"
                  )}
                >
                  {link.label}
                  {active ? (
                    <span
                      className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-brand-pink"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end justify-self-end gap-2">
            <BranchSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile spacer — same yellow as the page so no cream/foreign strip shows */}
      <div
        className="h-[var(--site-header-height)] bg-[#f7b232] md:hidden"
        aria-hidden
      />
    </>
  );
}
