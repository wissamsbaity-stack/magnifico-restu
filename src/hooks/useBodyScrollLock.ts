import { useLayoutEffect } from "react";
import { acquireScrollLock } from "@/lib/scroll-lock";

/**
 * Locks page scroll while `locked` is true (iOS-safe, ref-counted).
 * Safe to use from many overlays at once — unlock only happens when the
 * last consumer releases.
 */
export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    return acquireScrollLock();
  }, [locked]);
}
