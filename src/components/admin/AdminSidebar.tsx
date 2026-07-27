"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  UtensilsCrossed,
  Settings,
  LogOut,
  ExternalLink,
  Images,
  MapPin,
} from "lucide-react";
import { AdminBrandMark } from "@/components/admin/AdminBrandMark";
import { signOut } from "@/app/admin/(dashboard)/actions";
import { cn } from "@/lib/utils";

const links: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
  { href: "/admin/banners", label: "Hero Banners", icon: Images },
  { href: "/admin/branches", label: "Branches", icon: MapPin },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  email,
  restaurantName,
  logoUrl,
  onNavigate,
}: {
  email: string;
  restaurantName: string;
  logoUrl: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Warm RSC payloads + manager chunks so the next click feels instant.
  useEffect(() => {
    for (const { href } of links) {
      router.prefetch(href);
    }
    void import("@/components/admin/CategoriesManager");
    void import("@/components/admin/MenuItemsManager");
    void import("@/components/admin/HeroBannersManager");
    void import("@/components/admin/BranchesManager");
    void import("@/components/admin/SettingsManager");
  }, [router]);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-r border-white/8 bg-[rgb(var(--color-surface))] lg:w-64",
        isPending && "opacity-95"
      )}
      aria-busy={isPending || undefined}
    >
      <div className="shrink-0 border-b border-white/8 px-5 py-5 lg:py-6">
        <AdminBrandMark
          restaurantName={restaurantName}
          logoUrl={logoUrl}
          layout="inline"
        />
        <p className="mt-3 truncate text-xs text-muted">{email}</p>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Admin"
      >
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return;
                }
                event.preventDefault();
                onNavigate?.();
                if (active) return;
                startTransition(() => {
                  router.push(href);
                });
              }}
              data-active={active ? "true" : "false"}
              className={cn(
                "admin-nav-link",
                active && "pointer-events-none",
                isPending && !active && "opacity-70"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-white/8 p-3">
        <Link
          href="/"
          target="_blank"
          prefetch={false}
          onClick={onNavigate}
          data-active="false"
          className="admin-nav-link"
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          View site
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="admin-nav-link w-full text-brand-pink hover:bg-brand-pink/10"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
