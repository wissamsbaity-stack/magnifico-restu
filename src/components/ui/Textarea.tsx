import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelHint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, labelHint, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-cream/80"
          >
            {label}
            {labelHint ? (
              <span className="ml-1.5 text-xs font-normal text-muted">
                {labelHint}
              </span>
            ) : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[100px] w-full resize-y rounded-xl border border-line/12 bg-surface-raised px-4 py-3 text-cream placeholder:text-muted transition-colors focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/20",
            error &&
              "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
