import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { getSiteSettingsRow } from "@/lib/settings/site-settings";

export const metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsRow();

  return (
    <>
      <AdminHeader
        title="Website settings"
        description="Restaurant name, homepage hero copy, delivery fee, email, social links, and logo. Branch details are managed under Branches. Hero photos are managed under Hero Banners."
      />
      <SettingsManager settings={settings} />
    </>
  );
}
