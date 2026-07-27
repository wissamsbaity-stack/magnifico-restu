"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalScrollLock } from "@/hooks/usePortalScrollLock";
import { cn } from "@/lib/utils";

const BACKDROP_Z_INDEX = 9998;
const MODAL_Z_INDEX = 9999;

const backdropStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: BACKDROP_Z_INDEX,
  margin: 0,
  padding: 0,
  border: "none",
};

const modalShellStyle = {
  position: "fixed" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: MODAL_Z_INDEX,
  maxHeight: "calc(100dvh - 2rem)",
  width: "min(calc(100% - 2rem), 28rem)",
};

interface ViewportPortalProps {
  open: boolean;
  onBackdropClick?: () => void;
  backdropClassName?: string;
  modalClassName?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

export function ViewportPortal({
  open,
  onBackdropClick,
  backdropClassName,
  modalClassName,
  ariaLabelledBy,
  children,
}: ViewportPortalProps) {
  const [mounted, setMounted] = useState(false);

  usePortalScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onBackdropClick}
        className={cn("cursor-default bg-brand-ink/70 backdrop-blur-sm", backdropClassName)}
        style={backdropStyle}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={modalClassName}
        style={modalShellStyle}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
