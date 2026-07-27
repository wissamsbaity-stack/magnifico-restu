import { cn } from "@/lib/utils";

/**
 * Shared frosted warm-cream glass for header controls.
 * Mobile: solid fill, no blur/shadow (iOS scroll vibration).
 */
export const headerGlassClass = cn(
  "border border-white/28 bg-header-glass",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "transition-transform duration-100 ease-out motion-safe:active:scale-[0.96]",
  "md:backdrop-blur-[18px] md:backdrop-saturate-150 md:shadow-header-glass"
);

/** @deprecated Use headerGlassClass */
export const mobileHeaderGlassClass = headerGlassClass;

export const mobileHeaderPillClass = cn(
  "flex h-12 items-center justify-center rounded-full",
  headerGlassClass,
  "border border-brand-pink/55 max-md:shadow-none",
  "md:border-2 md:border-brand-pink/60 md:hover:border-brand-pink/80"
);

export const mobileHeaderLogoPillClass = cn(
  mobileHeaderPillClass,
  "h-12 w-14 shrink-0 overflow-hidden px-0.5"
);

export const mobileHeaderIconButtonClass = cn(
  mobileHeaderPillClass,
  "w-12 shrink-0"
);

export const desktopHeaderLogoPillClass = cn(
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full px-1.5",
  headerGlassClass,
  "border-2 border-brand-pink/60 hover:border-brand-pink/80"
);

export const desktopHeaderNavLinkClass = cn(
  "tap-instant rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-100 ease-out",
  headerGlassClass,
  "motion-safe:hover:scale-[1.02]"
);

export const desktopHeaderBarClass = cn(
  "md:border-b md:border-white/28 md:bg-header-glass",
  "md:backdrop-blur-[18px] md:backdrop-saturate-150 md:shadow-header-glass"
);
