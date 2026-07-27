"use client";

import { usePathname } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "@/lib/motion";
import { pageEnter } from "@/lib/motion-presets";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isHome = pathname === "/";

  if (prefersReducedMotion || isHome) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={pageEnter.initial}
        animate={pageEnter.animate}
        exit={pageEnter.exit}
        transition={pageEnter.transition}
        className="motion-safe:will-change-[opacity,transform]"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
