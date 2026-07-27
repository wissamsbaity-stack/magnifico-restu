import type { PublicSiteSettings } from "@/lib/settings/site-settings";

export function formatFullAddress(
  address: PublicSiteSettings["address"]
): string {
  return [
    address.street,
    address.city,
    address.state,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function instagramHandleFromUrl(url: string): string {
  if (!url.trim()) return "";
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : url;
}

export function mapsEmbedUrlFromAddress(
  address: PublicSiteSettings["address"]
): string {
  const query = encodeURIComponent(formatFullAddress(address));
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/** Opens Google Maps — uses admin link when set, otherwise address search. */
export function getGoogleMapsUrl(settings: {
  googleMapsUrl?: string;
  address: PublicSiteSettings["address"];
}): string {
  const custom = settings.googleMapsUrl?.trim();
  if (custom) return custom;

  const query = encodeURIComponent(formatFullAddress(settings.address));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
