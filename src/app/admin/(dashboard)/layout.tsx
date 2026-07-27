import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/lib/settings/site-settings";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ profile }, settings] = await Promise.all([
    requireAdmin(),
    getSiteSettings(),
  ]);

  return (
    <AdminShell
      email={profile.email}
      restaurantName={settings.name}
      logoUrl={settings.branding.logo}
    >
      {children}
    </AdminShell>
  );
}
