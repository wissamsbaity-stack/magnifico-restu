"use client";

import { m, useReducedMotion } from "@/lib/motion";
import {
  staggerContainerVariants,
} from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  /** When true, children animate on mount (e.g. loading skeletons). Default: whileInView */
  animateOnMount?: boolean;
}

export function StaggerGrid({
  children,
  className,
  animateOnMount = false,
}: StaggerGridProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = animateOnMount
    ? {
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.06, margin: "0px 0px -40px 0px" },
      };

  return (
    <m.div
      variants={staggerContainerVariants}
      {...motionProps}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}
