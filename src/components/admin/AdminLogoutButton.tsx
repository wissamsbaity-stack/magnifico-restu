"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/(dashboard)/actions";

export function AdminLogoutButton({ className }: { className?: string }) {
  return (
    <form action={signOut} className={className}>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-white/20 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </form>
  );
}
