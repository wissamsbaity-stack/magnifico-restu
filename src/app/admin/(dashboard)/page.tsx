import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminStats } from "@/lib/admin/data";
import {
  FolderOpen,
  UtensilsCrossed,
  Settings,
  Images,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Categories",
      value: stats.categories,
      href: "/admin/categories",
      icon: FolderOpen,
      hint: "Organize the menu",
    },
    {
      label: "Menu items",
      value: stats.menuItems,
      href: "/admin/menu",
      icon: UtensilsCrossed,
      hint: "Prices & availability",
    },
    {
      label: "Hero banners",
      value: stats.banners,
      href: "/admin/banners",
      icon: Images,
      hint: "Homepage slider",
    },
    {
      label: "Branches",
      value: stats.branches,
      href: "/admin/branches",
      icon: MapPin,
      hint: "Locations & hours",
    },
    {
      label: "Settings",
      value: null,
      href: "/admin/settings",
      icon: Settings,
      hint: "Brand & contact",
    },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Manage Magnifico menu, branches, banners, and site settings."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon, hint }) => (
          <Link
            key={label}
            href={href}
            prefetch
            className="admin-card group relative flex flex-col p-5 transition-[border-color,transform] duration-150 hover:border-accent/35 motion-safe:hover:-translate-y-0.5 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/20">
                <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-accent" />
            </div>
            {value !== null ? (
              <p className="font-display text-3xl font-bold tracking-tight text-cream">
                {value}
              </p>
            ) : (
              <p className="font-display text-xl font-semibold text-cream">
                Configure
              </p>
            )}
            <p className="mt-1 text-sm font-semibold text-cream/90">{label}</p>
            <p className="mt-0.5 text-xs text-muted">{hint}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
