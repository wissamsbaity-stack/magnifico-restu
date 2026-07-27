import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getAdminCategories } from "@/lib/admin/data";

export const metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        title="Categories"
        description="Organize your menu into categories."
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
