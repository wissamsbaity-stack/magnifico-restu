import { AdminHeader } from "@/components/admin/AdminHeader";
import { BranchesManager } from "@/components/admin/BranchesManager";
import { getAllBranches } from "@/lib/branch-service";

export const metadata = {
  title: "Branches",
};

export default async function AdminBranchesPage() {
  const branches = await getAllBranches();

  return (
    <>
      <AdminHeader
        title="Branches"
        description="Manage your branches. Customers pick a branch and it drives WhatsApp, contact, maps and hours across the site."
      />
      <BranchesManager branches={branches} />
    </>
  );
}
