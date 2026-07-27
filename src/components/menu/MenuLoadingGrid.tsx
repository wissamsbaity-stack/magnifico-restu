"use client";

import { m } from "@/lib/motion";
import { staggerItemVariants } from "@/lib/motion-presets";
import { MenuCardSkeletonCompact } from "@/components/ui/Skeleton";
import { StaggerGrid } from "@/components/motion/StaggerGrid";

export function MenuLoadingGrid() {
  return (
    <StaggerGrid
      animateOnMount
      className="flex flex-col gap-3 sm:gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <m.div key={i} variants={staggerItemVariants}>
          <MenuCardSkeletonCompact />
        </m.div>
      ))}
    </StaggerGrid>
  );
}
