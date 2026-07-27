import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "popular" | "bestSeller" | "tag";
  className?: string;
}

const variants = {
  default: "bg-cream/10 text-cream/80",
  popular:
    "gap-1.5 bg-brand-pink/18 text-brand-pink ring-1 ring-brand-pink/45 shadow-[0_2px_8px_rgb(var(--color-pink)/0.2)]",
  bestSeller:
    "gap-1.5 bg-brand-ink/5 text-cream ring-1 ring-brand-pink/40 shadow-sm",
  tag: "bg-surface-overlay text-cream/60",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const showGreenDot = variant === "popular" || variant === "bestSeller";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide",
        variants[variant],
        className
      )}
    >
      {showGreenDot ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-pink shadow-[0_0_0_1px_rgb(var(--color-surface))]"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
