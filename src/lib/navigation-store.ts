"use client";

import { useSyncExternalStore } from "react";

let mobileNavOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return mobileNavOpen;
}

export function openMobileNav() {
  if (mobileNavOpen) return;
  mobileNavOpen = true;
  emit();
}

export function closeMobileNav() {
  if (!mobileNavOpen) return;
  mobileNavOpen = false;
  emit();
}

export function useMobileNavOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
