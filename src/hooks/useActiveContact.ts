"use client";

import { useMemo } from "react";
import { useBranchActive } from "@/contexts/BranchContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getBranchMapsUrl } from "@/lib/branch-helpers";
import type { OpeningHour } from "@/lib/supabase/types";

export interface ActiveContact {
  /** Active branch name, or null when no branch is selected. */
  branchName: string | null;
  restaurantName: string;
  whatsapp: string;
  phone: string;
  address: string;
  hours: OpeningHour[];
  mapsUrl: string;
}

/**
 * Resolves contact details from the active branch only.
 * Location, hours, phone, and WhatsApp are managed in Branches — not Settings.
 */
export function useActiveContact(): ActiveContact {
  const settings = useSettings();
  const { activeBranch } = useBranchActive();

  return useMemo(() => {
    if (activeBranch) {
      return {
        branchName: activeBranch.name,
        restaurantName: settings.name,
        whatsapp: activeBranch.whatsapp,
        phone: activeBranch.phone,
        address: activeBranch.address,
        hours: activeBranch.hours,
        mapsUrl: getBranchMapsUrl(activeBranch),
      };
    }

    return {
      branchName: null,
      restaurantName: settings.name,
      whatsapp: "",
      phone: "",
      address: "",
      hours: [],
      mapsUrl: "https://www.google.com/maps",
    };
  }, [activeBranch, settings.name]);
}
