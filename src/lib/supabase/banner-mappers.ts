import type { MenuBanner } from "@/types/banner";
import type { Database } from "@/lib/supabase/types";
import { parseCrop } from "@/lib/image-crop";

type MenuBannerRow = Database["public"]["Tables"]["menu_banners"]["Row"];

export function mapMenuBanner(row: MenuBannerRow): MenuBanner {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imageCrop: parseCrop(row.image_crop),
    caption: row.caption,
    clickLink: row.click_link,
    sortOrder: row.sort_order,
    isEnabled: row.is_enabled,
  };
}
