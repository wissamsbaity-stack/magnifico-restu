"use client";

import { useId, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  embedded?: boolean;
  className?: string;
}

export function MenuSearchBar({
  value,
  onChange,
  resultCount,
  embedded = false,
  className,
}: MenuSearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = value.trim().length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "group flex h-[3.25rem] w-full items-center gap-3 sm:h-14",
          embedded
            ? "px-1 sm:px-0"
            : cn(
                "rounded-full bg-surface-raised px-5 shadow-card ring-1 ring-line/8",
                "transition-[box-shadow,ring-color] duration-200",
                "focus-within:shadow-lift focus-within:ring-2 focus-within:ring-brand-ink/15",
                "sm:px-6"
              )
        )}
      >
        <Search
          className={cn(
            "h-[1.125rem] w-[1.125rem] shrink-0 text-muted transition-colors sm:h-5 sm:w-5",
            "group-focus-within:text-brand-pink"
          )}
          strokeWidth={2.5}
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What are you craving?"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-cream placeholder:font-medium placeholder:text-muted/70 focus:outline-none sm:text-base"
          aria-label="Search menu"
        />
        {hasQuery ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="tap-instant flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-line/8 text-muted transition-colors hover:bg-brand-pink/20 hover:text-brand-pink"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}
      </label>

      {hasQuery && resultCount !== undefined ? (
        <p
          className={cn(
            "mt-2 text-xs font-semibold text-muted",
            embedded ? "px-1" : "px-1"
          )}
          aria-live="polite"
        >
          {resultCount} {resultCount === 1 ? "dish" : "dishes"}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use MenuSearchBar */
export { MenuSearchBar as MenuExpandableSearch };
