import { MenuLoadingGrid } from "@/components/menu/MenuLoadingGrid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div data-menu-page className="pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="menu-page-title-band flex items-center justify-center py-5 sm:py-6 lg:py-7">
          <div className="text-center">
            <Skeleton className="mx-auto h-11 w-52 rounded-lg sm:h-12 sm:w-64" />
            <Skeleton className="ml-[calc(50%-4.5rem)] mt-3 h-1 w-16 rounded-full sm:ml-[calc(50%-5rem)]" />
          </div>
        </div>

        <div className="pb-0">
          <div className="overflow-hidden rounded-[1.75rem] bg-surface-raised shadow-float ring-1 ring-line/6">
            <div className="border-b border-line/6 px-4 py-3.5 sm:px-5 sm:py-4">
              <Skeleton className="h-[3.25rem] w-full rounded-full sm:h-14" />
            </div>
            <div className="flex gap-2 overflow-hidden px-4 py-3 sm:px-5 sm:py-3.5">
              <Skeleton className="h-10 w-24 shrink-0 rounded-full sm:h-11" />
              <Skeleton className="h-10 w-20 shrink-0 rounded-full sm:h-11" />
              <Skeleton className="h-10 w-28 shrink-0 rounded-full sm:h-11" />
              <Skeleton className="h-10 w-24 shrink-0 rounded-full sm:h-11" />
            </div>
          </div>
        </div>

        <div className="pt-2 sm:pt-3">
          <MenuLoadingGrid />
        </div>
      </div>
    </div>
  );
}
