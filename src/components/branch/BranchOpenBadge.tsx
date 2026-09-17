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
      aria-label={status.open ? "Currently open" : "Currently closed"}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] shadow-[0_1px_0_rgb(255_255_255/0.08)_inset] backdrop-blur-sm",
        status.open
          ? "border-emerald-300/30 bg-emerald-950/40 text-emerald-100"
          : "border-rose-300/25 bg-rose-950/35 text-rose-100",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full ring-2 ring-current/15",
          status.open ? "bg-emerald-300" : "bg-rose-300"
        )}
      />
      {status.open ? "Open" : "Closed"}
    </span>
  );
}
