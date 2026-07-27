"use client";

import { useBranchData } from "@/contexts/BranchContext";
import { useActiveContact } from "@/hooks/useActiveContact";
import { getBranchMapsEmbedUrl } from "@/lib/branch-helpers";

export function ContactMap() {
  const { activeBranch } = useBranchData();
  const { address, restaurantName } = useActiveContact();

  const mapEmbedUrl = activeBranch
    ? getBranchMapsEmbedUrl(activeBranch)
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        address || restaurantName
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-line/10">
      <iframe
        title={`${restaurantName} location`}
        src={mapEmbedUrl}
        className="h-80 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
