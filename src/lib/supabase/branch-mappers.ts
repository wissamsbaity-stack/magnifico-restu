import type { Branch } from "@/types/branch";
import type { BranchRow, OpeningHour } from "@/lib/supabase/types";

export function mapBranch(row: BranchRow): Branch {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp_phone ?? "",
    googleMapsUrl: row.google_maps_url ?? "",
    hours: (row.opening_hours as OpeningHour[]) ?? [],
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active,
  };
}
