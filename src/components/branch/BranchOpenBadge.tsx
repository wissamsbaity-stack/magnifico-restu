"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getBranchOpenStatus } from "@/lib/branch-helpers";
import type { OpeningHour } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const listeners = new Set<() => void>();
let tickInterval: ReturnType<typeof setInterval> | null = null;
let tick = 0;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (!tickInterval) {
    tickInterval = setInterval(() => {
      tick += 1;
      for (const listener of listeners) listener();
    }, 60_000);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };
}

function getSnapshot() {
  return tick;
}

function getServerSnapshot() {
  return 0;
}

export function BranchOpenBadge({
  hours,
  className,
}: {
  hours: OpeningHour[];
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return null;

  const status = getBranchOpenStatus(hours);
  if (status.unknown) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status.open
          ? "bg-[rgb(214_236_186)] text-[rgb(40_96_18)] ring-1 ring-[rgb(130_191_65)/0.45]"
          : "bg-[rgb(255_220_226)] text-[rgb(168_32_52)] ring-1 ring-brand-pink/40",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status.open ? "bg-[rgb(70_140_30)]" : "bg-[rgb(200_45_70)]"
        )}
      />
      {status.open ? "Open now" : "Closed"}
    </span>
  );
}
