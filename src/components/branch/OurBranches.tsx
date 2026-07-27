"use client";

import { memo } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BranchCard } from "@/components/branch/BranchCard";
import { useBranchActive, useBranchBranches, useBranchHasSelected } from "@/contexts/BranchContext";

export const OurBranches = memo(function OurBranches({
  eyebrow = "Find us",
  title = "Our Branches",
  description = "Choose your nearest branch.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const { branches } = useBranchBranches();
  const { activeBranch, setBranch } = useBranchActive();
  const { hasSelected } = useBranchHasSelected();

  if (branches.length === 0) return null;

  return (
    <section className="home-section border-t border-line/10 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          underline
          className="mb-8 sm:mb-10"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              isActive={hasSelected && activeBranch?.id === branch.id}
              onSelect={setBranch}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
