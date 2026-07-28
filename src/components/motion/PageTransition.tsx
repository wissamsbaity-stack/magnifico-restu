"use client";

/** Instant route updates — no exit/enter wait that delays navigation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
