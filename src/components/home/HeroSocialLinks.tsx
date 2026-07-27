"use client";

import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/BrandIcons";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { memo } from "react";

const SOCIAL_ICON_SIZE = 28;

export const HeroSocialLinks = memo(function HeroSocialLinks({
  className,
  variant = "hero",
}: {
  className?: string;
  /** Edit #3 — footer uses smaller, lighter icons */
  variant?: "hero" | "footer";
}) {
  const settings = useSettings();

  const links = [
    {
      label: "Instagram",
      url: settings.social.instagram,
      Icon: InstagramIcon,
    },
    {
      label: "Facebook",
      url: settings.social.facebook,
      Icon: FacebookIcon,
    },
    {
      label: "TikTok",
      url: settings.social.tiktok,
      Icon: TikTokIcon,
    },
  ].filter((item) => item.url?.trim());

  if (links.length === 0) return null;

  const iconSize = variant === "footer" ? 22 : SOCIAL_ICON_SIZE;

  return (
    <nav
      aria-label="Social media"
      className={cn(
        variant === "footer"
          ? "flex items-center gap-5"
          : "mt-6 flex items-center gap-8 sm:mt-7 sm:gap-9",
        className
      )}
    >
      {links.map(({ label, url, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow us on ${label}`}
          className={cn(
            "tap-instant transition-[opacity,transform,color] duration-100 ease-out",
            variant === "footer"
              ? "text-white/50 motion-safe:hover:text-white motion-safe:active:scale-[0.96]"
              : "text-cream/80 motion-safe:hover:text-accent motion-safe:active:scale-[0.96]"
          )}
        >
          <Icon size={iconSize} />
        </a>
      ))}
    </nav>
  );
});
