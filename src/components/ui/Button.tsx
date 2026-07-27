import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "whatsapp"
    | "pink"
    | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants = {
  primary:
    "bg-brand-dark text-white hover:brightness-110 focus-visible:ring-brand-yellow/40",
  secondary:
    "bg-surface-raised text-cream ring-1 ring-line/10 hover:bg-surface-overlay",
  outline:
    "border border-line/20 bg-transparent text-cream hover:border-accent/50 hover:bg-white/5",
  ghost: "bg-transparent text-cream hover:bg-white/5",
  danger: "bg-red-500/15 text-red-300 hover:bg-red-500/25",
  whatsapp: "bg-whatsapp text-white hover:brightness-110",
  pink: "bg-brand-pink text-white hover:brightness-110 hover:bg-[rgb(var(--color-pink-hover))] focus-visible:ring-brand-pink/60",
  accent:
    "bg-accent text-accent-foreground hover:brightness-105 focus-visible:ring-accent/50",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

const motionClass =
  "tap-instant motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out motion-safe:active:scale-[0.96]";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg))] disabled:pointer-events-none disabled:opacity-50",
          isLoading && "motion-safe:cursor-wait",
          motionClass,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="relative h-4 w-4 motion-safe:animate-spin"
            aria-hidden
          >
            <span className="absolute inset-0 rounded-full border-2 border-current/25" />
            <span className="absolute inset-0 rounded-full border-2 border-current border-t-transparent" />
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
