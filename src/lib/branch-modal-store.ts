"use client";

import { useSyncExternalStore } from "react";

let branchModalOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return branchModalOpen;
}

export function openBranchModal() {
  if (branchModalOpen) return;
  branchModalOpen = true;
  emit();
}

export function closeBranchModal() {
  if (!branchModalOpen) return;
  branchModalOpen = false;
  emit();
}

export function useBranchModalOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
