import { useLayoutEffect } from "react";
import { acquireScrollLock } from "@/lib/scroll-lock";

/** Locks page scroll while a body-portal overlay is open. */
export function usePortalScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    return acquireScrollLock();
  }, [locked]);
}
