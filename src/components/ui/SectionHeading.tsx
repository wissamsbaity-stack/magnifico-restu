"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  underline?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  underline = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-pink">
          {eyebrow}
        </p>
      ) : null}
      <div
        className={cn(
          underline && "section-heading-underline",
          align === "center" && underline && "mx-auto w-fit"
        )}
      >
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-cream md:text-4xl lg:text-5xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base text-muted md:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
