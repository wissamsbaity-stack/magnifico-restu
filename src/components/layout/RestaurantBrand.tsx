"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, type MouseEvent } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";
import {
  desktopHeaderLogoPillClass,
  mobileHeaderLogoPillClass,
} from "@/lib/mobile-header";
import { scrollToTopInstant } from "@/lib/scroll";

interface RestaurantBrandProps {
  size?: "sm" | "md" | "header-mobile" | "drawer";
  presentation?: "default" | "mobile-pill" | "desktop-pill";
  showName?: boolean;
  className?: string;
  asLink?: boolean;
}

export function RestaurantBrand({
  size = "md",
  presentation = "default",
  showName = false,
  className,
  asLink = true,
}: RestaurantBrandProps) {
  const settings = useSettings();
  const pathname = usePathname();

  const logoClass =
    size === "sm"
      ? "h-8 w-auto"
      : size === "header-mobile"
        ? "h-[2.75rem] w-auto max-h-full max-w-[3.25rem] object-contain object-center"
        : size === "drawer"
          ? "h-14 w-auto max-w-[min(15rem,78vw)] object-contain object-left sm:h-16 sm:max-w-[min(16rem,72vw)]"
          : presentation === "desktop-pill"
            ? "h-9 w-auto max-w-full object-contain object-center"
            : "h-11 w-auto";
  const textClass =
    size === "sm" ? "font-display text-base" : "font-display text-lg";

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;
      event.preventDefault();
      scrollToTopInstant();
    },
    [pathname]
  );

  const logoImageClass = cn(
    "shrink-0 bg-transparent object-contain",
    presentation === "mobile-pill" || presentation === "desktop-pill"
      ? "object-center"
      : "object-left",
    logoClass
  );

  const logo =
    size === "drawer" ? (
      <div className="flex h-14 shrink-0 items-center overflow-hidden sm:h-16">
        <Image
          src={settings.branding.logo}
          alt={settings.name}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority={false}
          className={cn(
            logoImageClass,
            "origin-left scale-[1.55] motion-safe:transition-transform sm:scale-[1.5]"
          )}
        />
      </div>
    ) : (
      <Image
        src={settings.branding.logo}
        alt={settings.name}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={false}
        className={logoImageClass}
      />
    );

  const content = (
    <>
      {logo}
      {showName ? (
        <span
          className={cn(
            "font-bold leading-tight tracking-wide text-cream",
            textClass
          )}
        >
          {settings.name}
        </span>
      ) : null}
    </>
  );

  if (!asLink) {
    return (
      <div className={cn("flex items-center gap-3", className)}>{content}</div>
    );
  }

  const linkClassName = cn(
    presentation === "mobile-pill"
      ? mobileHeaderLogoPillClass
      : presentation === "desktop-pill"
        ? desktopHeaderLogoPillClass
        : "group flex items-center gap-3",
    className
  );

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={linkClassName}
      aria-label={
        pathname === "/"
          ? `${settings.name}, scroll to top`
          : `${settings.name}, go to homepage`
      }
    >
      {presentation === "mobile-pill" || presentation === "desktop-pill"
        ? logo
        : content}
    </Link>
  );
}
