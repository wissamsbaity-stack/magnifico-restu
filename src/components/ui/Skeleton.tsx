import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-line/[0.06]",
        "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-line/[0.08] before:to-transparent before:content-['']",
        "motion-reduce:before:animate-none",
        className
      )}
    />
  );
}

export function MenuCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "menu-card-optimized overflow-hidden rounded-xl border border-line/10 bg-surface-raised",
        className
      )}
    >
      <Skeleton className="aspect-[5/4] w-full rounded-none sm:aspect-[4/3]" />
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    </div>
  );
}

export function MenuCardSkeletonCompact() {
  return (
    <div className="flex items-stretch gap-3 overflow-hidden rounded-2xl border border-line/10 bg-surface-raised p-3 sm:gap-3.5 sm:p-3.5">
      <Skeleton className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-[14px] sm:h-[6rem] sm:w-[6rem]" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="mt-2 h-5 w-14" />
      </div>
    </div>
  );
}
