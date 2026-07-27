import type { FormHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AdminCardDivProps = {
  as?: "div" | "section";
} & HTMLAttributes<HTMLDivElement>;

type AdminCardFormProps = {
  as: "form";
} & FormHTMLAttributes<HTMLFormElement>;

export function AdminCard(props: AdminCardDivProps | AdminCardFormProps) {
  const { className, children, as = "div", ...rest } = props;
  const classes = cn("admin-card", className);

  if (as === "form") {
    return (
      <form
        className={classes}
        {...(rest as FormHTMLAttributes<HTMLFormElement>)}
      >
        {children}
      </form>
    );
  }

  const Tag = as;
  return (
    <Tag
      className={classes}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </Tag>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-cream">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminAlert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        variant === "error" &&
          "border-red-500/25 bg-red-500/10 text-red-300",
        variant === "success" &&
          "border-[rgb(var(--color-brand-green)/0.35)] bg-[rgb(var(--color-brand-green)/0.12)] text-[rgb(var(--color-brand-green))]",
        variant === "info" &&
          "border-accent/25 bg-accent/10 text-accent"
      )}
    >
      {children}
    </p>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-12 text-center">
      <p className="font-medium text-cream/80">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
