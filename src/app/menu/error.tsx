"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MenuPage]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-cream sm:text-2xl">
        Couldn&apos;t load the menu
      </h1>
      <p className="mt-3 text-sm text-muted">
        Something went wrong while fetching menu data. Please try again.
      </p>
      {error.message ? (
        <p className="mt-4 max-w-full break-words rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-left text-xs text-red-300/90">
          {error.message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
