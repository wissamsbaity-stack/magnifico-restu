"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminBannersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminBannersPage]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <h2 className="text-lg font-semibold text-cream">
        Couldn&apos;t load Hero Banners
      </h2>
      <p className="mt-2 text-sm text-muted">
        Something went wrong while loading banner settings.
      </p>
      {error.message ? (
        <p className="mt-4 break-words rounded-lg border border-red-500/20 bg-ink/50 px-3 py-2 text-left text-xs text-red-300/90">
          {error.message}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
