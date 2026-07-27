"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";
import { OrdersMobileShell } from "@/components/orders/OrdersMobileShell";
import {
  ordersInputClassName,
  ordersPrimaryButtonClassName,
} from "@/components/orders/orders-ui";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

export default function OrdersLoginPage({
  restaurantName,
  logoUrl,
}: {
  restaurantName: string;
  logoUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/orders";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "unauthorized"
      ? "You do not have staff access."
      : errorParam === "auth"
        ? "Authentication failed. Try again."
        : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <OrdersMobileShell>
      <div className="orders-app-scroll relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-60" />
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-raised p-8 shadow-card">
          <div className="mb-8 text-center">
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
            <p className="font-display text-2xl tracking-wide text-accent">
              {restaurantName}
            </p>
            <p className="mt-1 text-base text-muted">Staff Orders Dashboard</p>
            <p className="mt-4 text-base text-muted">
              Sign in to receive live orders. Your session ends when you close
              the browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="orders-login-email"
                className="block text-base font-medium text-cream/80"
              >
                Email
              </label>
              <input
                id="orders-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                className={ordersInputClassName}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="orders-login-password"
                className="block text-base font-medium text-cream/80"
              >
                Password
              </label>
              <input
                id="orders-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={ordersInputClassName}
              />
            </div>

            {error ? <p className="text-base text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                ordersPrimaryButtonClassName,
                "w-full px-5 py-3"
              )}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </OrdersMobileShell>
  );
}
