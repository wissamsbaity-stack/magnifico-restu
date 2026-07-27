"use client";

import { memo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, MapPin, X } from "lucide-react";
import {
  useBranchActive,
  useBranchBranches,
  useBranchHasSelected,
} from "@/contexts/BranchContext";
import { closeBranchModal, useBranchModalOpen } from "@/lib/branch-modal-store";
import { useSettings } from "@/contexts/SettingsContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useOverlayLock } from "@/lib/overlay-store";
import { BranchOpenBadge } from "@/components/branch/BranchOpenBadge";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

import type { Branch } from "@/types/branch";

const MODAL_Z = 10000;

const BranchOption = memo(function BranchOption({
  branch,
  isActive,
  onSelect,
}: {
  branch: Branch;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(branch.id)}
      className={cn(
        "tap-instant group relative flex w-full items-center gap-3 rounded-2xl border bg-surface-raised p-4 pr-12 text-left shadow-card transition-[border-color,transform] duration-100 hover:border-accent hover:shadow-float motion-safe:active:scale-[0.99] sm:gap-4 sm:p-5 sm:pr-14",
        isActive ? "border-accent" : "border-line/10"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent sm:h-12 sm:w-12">
        <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold leading-snug text-cream sm:text-base">
          {branch.name}
        </h3>
        <div className="mt-1.5">
          <BranchOpenBadge hours={branch.hours} />
        </div>
      </div>
      <div
        className={cn(
          "absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors sm:right-5",
          isActive
            ? "bg-accent text-accent-foreground"
            : "bg-transparent text-transparent group-hover:bg-accent-muted group-hover:text-accent"
        )}
      >
        <Check className="h-4 w-4" />
      </div>
    </button>
  );
});

export const BranchSelectModal = memo(function BranchSelectModal() {
  const { branches } = useBranchBranches();
  const { activeBranch, setBranch } = useBranchActive();
  const { hasSelected } = useBranchHasSelected();
  const isModalOpen = useBranchModalOpen();
  const settings = useSettings();

  useOverlayLock(isModalOpen);
  useBodyScrollLock(isModalOpen);

  useEffect(() => {
    if (!isModalOpen || !hasSelected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBranchModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, hasSelected]);

  if (!isModalOpen || typeof document === "undefined") return null;

  const handleBackdropClick = () => {
    if (hasSelected) closeBranchModal();
  };

  return createPortal(
    <div
      className="branch-modal-root fixed inset-0 isolate overflow-hidden"
      style={{ zIndex: MODAL_Z }}
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Close branch selector"
        className="branch-modal-backdrop absolute inset-0 h-full w-full cursor-default bg-brand-ink/55"
        onClick={handleBackdropClick}
        tabIndex={-1}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select a branch"
          className="branch-modal-panel pointer-events-auto relative flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line/15 bg-surface-raised shadow-[0_24px_80px_-20px_rgb(var(--color-line)/0.45)]"
        >
          <div className="overflow-y-auto overscroll-contain px-4 py-8 sm:px-6 sm:py-10">
            {hasSelected ? (
              <button
                type="button"
                onClick={closeBranchModal}
                className="tap-instant absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line/10 bg-surface-raised text-cream shadow-card transition-transform duration-100 motion-safe:active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}

            <div className="mb-8 flex flex-col items-center text-center">
              {settings.branding.logo ? (
                <Image
                  src={settings.branding.logo}
                  alt={settings.name}
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="mb-5 h-auto w-36 object-contain sm:w-44"
                  sizes="(max-width: 640px) 144px, 176px"
                />
              ) : null}
              <h2 className="font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl">
                Choose your branch
              </h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Select your nearest location.
              </p>
            </div>

            <div className="space-y-3">
              {branches.map((branch) => (
                <BranchOption
                  key={branch.id}
                  branch={branch}
                  isActive={activeBranch?.id === branch.id && hasSelected}
                  onSelect={setBranch}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});
