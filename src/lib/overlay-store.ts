"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

/**
 * Tiny global store that tracks how many "blocking" overlays are currently
 * open (cart drawer, product modal, mobile navigation, etc.).
 *
 * Lives at module scope so any component can read it (via `useAnyOverlayOpen`)
 * or register itself (via `useOverlayLock`) without provider plumbing.
 */
let openCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return openCount;
}

/** Registers an overlay as open while `active` is true; auto-releases on cleanup. */
export function useOverlayLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    openCount += 1;
    emit();
    return () => {
      openCount = Math.max(0, openCount - 1);
      emit();
    };
  }, [active]);
}

/** Reactive: true when at least one blocking overlay is open. */
export function useAnyOverlayOpen() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => 0
  ) > 0;
}
