"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { BranchOpenBadge } from "@/components/branch/BranchOpenBadge";
import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { useSettings } from "@/contexts/SettingsContext";
import { useActiveContact } from "@/hooks/useActiveContact";
import { HERO_CTA, HERO_DEFAULTS } from "@/lib/settings/hero-defaults";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { memo, useCallback } from "react";
import type { MenuBanner } from "@/types/banner";

function splitTitle(title: string): { lead: string; tail: string } {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return { lead: title, tail: "" };
  const splitAt = words.length - 2;
  return {
    lead: words.slice(0, splitAt).join(" "),
    tail: words.slice(splitAt).join(" "),
  };
}

interface HeroProps {
  banners?: MenuBanner[];
}

export const Hero = memo(function Hero({ banners = [] }: HeroProps) {
  const settings = useSettings();
  const { whatsapp, restaurantName, hours } = useActiveContact();
  const whatsappUrl = buildWhatsAppContactUrl(
    undefined,
    whatsapp,
    restaurantName
  );

  const { title } = settings.hero;
  const { lead, tail } = splitTitle(title);

  const scrollToCategories = useCallback(() => {
    const target = document.getElementById("home-categories");
    if (!target) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <section className="hero-stage relative flex min-h-[100svh] max-w-full flex-col -mt-[var(--site-header-height)] pt-[var(--site-header-height)] max-sm:pb-3 sm:min-h-0 sm:pb-4">
      <div className="hero-ambiance" aria-hidden>
        <span className="hero-wash" />

        {/* Organized diagonal rhythm — same angle, even spacing */}
        <span className="hero-panel hero-panel--1" />
        <span className="hero-panel hero-panel--2" />
        <span className="hero-panel hero-panel--3" />
        <span className="hero-panel hero-panel--4" />
        <span className="hero-panel hero-panel--5" />

        {/* Parallel accent strokes */}
        <span className="hero-stroke hero-stroke--1" />
        <span className="hero-stroke hero-stroke--2" />
        <span className="hero-stroke hero-stroke--3" />

        {/* Balanced corner geometry */}
        <span className="hero-geo hero-geo--tl" />
        <span className="hero-geo hero-geo--tr" />
        <span className="hero-geo hero-geo--bl" />
        <span className="hero-geo hero-geo--br" />

        <span className="hero-orb hero-orb--copy" />
        <span className="hero-orb hero-orb--media" />
        <span className="hero-orb hero-orb--pink" />
        <span className="hero-orb hero-orb--green" />
        <span className="hero-halftone hero-halftone--tl" />
        <span className="hero-halftone hero-halftone--br" />
        <span className="hero-frame hero-frame--tl" />
        <span className="hero-frame hero-frame--br" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <div className="grid w-full min-w-0 flex-1 items-stretch gap-5 py-3 pb-2 max-sm:gap-y-3 sm:items-center sm:gap-10 sm:py-12 sm:pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16 lg:pb-12 xl:gap-20">
          <div className="hero-media relative order-1 mx-auto w-full min-w-0 max-w-full lg:order-2 lg:max-w-none lg:justify-self-end">
            {banners.length > 0 ? (
              <HomeHeroCarousel banners={banners} />
            ) : null}
          </div>

          <div className="relative z-10 order-2 mx-auto flex w-full min-w-0 max-w-full flex-1 flex-col items-center text-center max-sm:px-0 lg:order-1 lg:mx-0 lg:flex-none lg:items-start lg:text-left">
            {/* Mobile: title sits centered between carousel and Open/Closed badge */}
            <div className="flex w-full flex-1 flex-col items-center justify-center max-sm:py-2 lg:flex-none lg:items-start lg:justify-start lg:py-0">
              <h1 className="mx-auto w-full max-w-full text-center font-display text-[clamp(1.75rem,8.2vw,2.75rem)] font-bold uppercase leading-[0.94] tracking-tight text-cream sm:text-[3.75rem] sm:leading-[0.92] lg:mx-0 lg:text-left lg:text-[4.75rem] xl:text-[5.5rem]">
                <span className="block text-center lg:text-left">{lead}</span>
                {tail ? (
                  <span className="mt-1 block text-center text-brand-pink lg:mt-0 lg:text-left">
                    {tail}
                  </span>
                ) : null}
              </h1>
            </div>

            <div className="mt-3 flex shrink-0 items-center justify-center self-center sm:mt-4 lg:self-start lg:justify-start">
              <BranchOpenBadge
                hours={hours}
                className="max-sm:px-3 max-sm:py-1.5 max-sm:text-sm"
              />
            </div>

            <div className="mt-5 flex w-full min-w-0 shrink-0 flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3 lg:justify-start">
              <Link
                href={HERO_DEFAULTS.secondaryLink}
                className="tap-instant group inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-full bg-brand-pink px-5 text-base font-bold text-white shadow-[0_8px_24px_-4px_rgb(var(--color-pink)/0.45),0_0_20px_rgb(var(--color-pink)/0.25)] ring-1 ring-brand-pink/30 transition-all duration-150 ease-out motion-safe:active:scale-[0.97] hover:brightness-110 sm:min-h-[3.375rem] sm:w-auto sm:px-8"
              >
                {HERO_CTA.secondaryLabel}
                <ArrowRight
                  className="h-[18px] w-[18px] shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              {whatsapp ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-instant inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-full bg-surface-raised px-5 text-base font-bold text-cream shadow-card transition-all duration-150 ease-out motion-safe:active:scale-[0.97] hover:shadow-lift sm:min-h-[3.375rem] sm:w-auto sm:px-8"
                >
                  <WhatsAppIcon size={20} className="shrink-0 sm:hidden" />
                  <WhatsAppIcon size={20} className="hidden shrink-0 sm:block" />
                  <span className="truncate">
                    {HERO_CTA.primaryLabel}
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToCategories}
          aria-label="Scroll to explore categories"
          className="tap-instant mx-auto mt-auto flex flex-col items-center gap-1 pb-1 pt-3 motion-safe:active:scale-[0.97] sm:gap-1.5 sm:pb-6 sm:pt-1"
        >
          <span
            className="hero-chevron-bounce text-brand-pink motion-reduce:animate-none"
            aria-hidden
          >
            <ChevronDown
              className="h-5 w-5 sm:h-[26px] sm:w-[26px]"
              strokeWidth={2.25}
            />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-cream/70 sm:text-sm sm:tracking-[0.2em]">
            Discover Categories
          </span>
        </button>
      </div>
    </section>
  );
});
