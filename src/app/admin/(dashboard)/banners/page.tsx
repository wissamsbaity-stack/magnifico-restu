import { AdminHeader } from "@/components/admin/AdminHeader";
import { HeroBannersManager } from "@/components/admin/HeroBannersManager";
import { getAdminMenuBanners } from "@/lib/admin/data";

export const metadata = {
  title: "Hero Banners",
};

export default async function AdminBannersPage() {
  const { banners, schemaReady, error } = await getAdminMenuBanners();

  return (
    <>
      <AdminHeader
        title="Hero Banners"
        description="Add, crop, and reorder photos for the homepage hero slider. Upload as many as you need."
      />
      <HeroBannersManager
        banners={banners}
        schemaReady={schemaReady}
        loadError={error}
      />
    </>
  );
}
