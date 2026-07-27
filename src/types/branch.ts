import type { OpeningHour } from "@/lib/supabase/types";

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp: string;
  googleMapsUrl: string;
  hours: OpeningHour[];
  sortOrder: number;
  isActive: boolean;
}
