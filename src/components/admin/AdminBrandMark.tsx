"use client";

import Image from "next/image";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

export function AdminBrandMark({
  restaurantName,
  logoUrl,
  layout = "centered",
}: {
  restaurantName: string;
  logoUrl: string;
  layout?: "centered" | "inline";
}) {
  if (layout === "inline") {
    return (
      <div className="flex items-center gap-3">
        <Image
          src={logoUrl}
          alt={restaurantName}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          className="h-10 w-auto shrink-0 object-contain"
          sizes="120px"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-lg tracking-wide text-accent lg:text-xl">
            {restaurantName}
          </p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex justify-center">
        <Image
          src={logoUrl}
          alt={restaurantName}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          className="h-14 w-auto object-contain"
          sizes="160px"
        />
      </div>
      <p className="font-display text-2xl tracking-wide text-accent sm:text-3xl">
        {restaurantName}
      </p>
      <p className="mt-1 text-sm font-medium text-cream/80">Admin</p>
    </div>
  );
}
