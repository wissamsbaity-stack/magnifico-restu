"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AdminBrandMark } from "@/components/admin/AdminBrandMark";
import { AdminAlert } from "@/components/admin/AdminCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage({
  restaurantName,
  logoUrl,
}: {
  restaurantName: string;
  logoUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const errorParam = searchParams.get("error");

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "unauthorized"
      ? "You do not have admin access."
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
      email: user.trim(),
      password,
    });

    if (signInError) {
      setError("Invalid user or password.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="admin-panel theme-night flex min-h-screen items-center justify-center px-4 py-10">
      <div className="admin-card w-full max-w-md p-6 sm:p-8">
        <div className="mb-8">
          <AdminBrandMark
            restaurantName={restaurantName}
            logoUrl={logoUrl}
            layout="centered"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="User"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

          <Button
            type="submit"
            variant="accent"
            isLoading={loading}
            className="mt-2 w-full"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
