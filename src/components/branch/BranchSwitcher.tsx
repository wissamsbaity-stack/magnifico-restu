"use client";

import { memo } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import {
  useBranchActive,
  useBranchBranches,
} from "@/contexts/BranchContext";
import { openBranchModal } from "@/lib/branch-modal-store";
import { cn } from "@/lib/utils";
import { headerGlassClass } from "@/lib/mobile-header";

type BranchSwitcherVariant = "default" | "mobileHeader" | "drawer";

export const BranchSwitcher = memo(function BranchSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: BranchSwitcherVariant;
}) {
  const { branches } = useBranchBranches();
  const { activeBranch } = useBranchActive();

  if (!activeBranch || branches.length === 0) return null;

  const isMobileHeader = variant === "mobileHeader";

  return (
    <button
      type="button"
      onClick={openBranchModal}
      className={cn(
        "flex min-w-0 items-center",
        isMobileHeader
          ? [
              "h-12 w-full max-w-full gap-2 rounded-full px-3",
              headerGlassClass,
              "border border-brand-pink/55 max-md:shadow-none",
              "md:border-2 md:border-brand-pink/60 md:hover:border-brand-pink/80",
            ]
          : variant === "drawer"
            ? [
                "tap-instant h-12 w-full max-w-full gap-2.5 rounded-full border border-line/10",
                "bg-surface-raised px-4 py-2 shadow-card",
                "text-sm font-semibold transition-transform duration-100 motion-safe:active:scale-[0.98]",
                "hover:border-accent/40",
              ]
            : [
                "tap-instant h-12 max-w-[9rem] gap-1.5 rounded-full px-3.5",
                headerGlassClass,
                "text-sm font-medium hover:border-accent/25 hover:text-accent sm:max-w-[14rem]",
              ],
        className
      )}
      aria-label={`Selected branch: ${activeBranch.name}. Tap to change.`}
      aria-haspopup="dialog"
    >
      <MapPin
        className={cn(
          "shrink-0 text-accent",
          isMobileHeader ? "h-[18px] w-[18px]" : "h-4 w-4"
        )}
        strokeWidth={2.25}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-left text-cream",
          isMobileHeader || variant === "drawer"
            ? "text-[13px] font-semibold tracking-tight sm:text-sm"
            : "text-sm font-medium"
        )}
      >
        {activeBranch.name}
      </span>
      <ChevronDown
        className={cn(
          "shrink-0 text-muted/80",
          isMobileHeader ? "h-4 w-4" : "h-3.5 w-3.5"
        )}
        strokeWidth={2.25}
      />
    </button>
  );
});
