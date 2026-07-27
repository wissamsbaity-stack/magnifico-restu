import { AdminHeader } from "@/components/admin/AdminHeader";
import { MenuItemsManager } from "@/components/admin/MenuItemsManager";
import { getAdminCategories, getAdminMenuItems } from "@/lib/admin/data";

export const metadata = {
  title: "Menu Items",
};

export default async function AdminMenuPage() {
  const [items, categories] = await Promise.all([
    getAdminMenuItems(),
    getAdminCategories(),
  ]);

  return (
    <>
      <AdminHeader
        title="Menu items"
        description="Manage prices, images, availability, and product badges."
      />
      <MenuItemsManager items={items} categories={categories} />
    </>
  );
}
