import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { SiteSettingsRow, OpeningHour } from "@/lib/supabase/types";
import { restaurantInfo } from "@/data/restaurant";
import { siteConfig } from "@/config/site";
import { HERO_DEFAULTS } from "@/lib/settings/hero-defaults";
import type { CheckoutMethod } from "@/types/checkout";

export { HERO_DEFAULTS, HERO_CTA } from "@/lib/settings/hero-defaults";

export interface PublicSiteSettings {
  name: string;
  legalName: string;
  tagline: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  whatsapp: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  hours: OpeningHour[];
  deliveryFee: number;
  minOrder: number;
  checkoutMethod: CheckoutMethod;
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  branding: {
    logo: string;
  };
  hero: {
    title: string;
  };
  metaDescription: string;
  siteUrl: string;
  googleMapsUrl: string;
}

function fromStatic(): PublicSiteSettings {
  return {
    name: restaurantInfo.name,
    legalName: restaurantInfo.legalName,
    tagline: restaurantInfo.tagline,
    phone: restaurantInfo.phone,
    phoneSecondary: restaurantInfo.phoneSecondary,
    email: restaurantInfo.email,
    whatsapp: restaurantInfo.whatsapp,
    address: { ...restaurantInfo.address, state: restaurantInfo.address.state },
    hours: [...restaurantInfo.hours],
    deliveryFee: siteConfig.deliveryFee,
    minOrder: siteConfig.minOrder,
    checkoutMethod: "whatsapp",
    social: {
      instagram: restaurantInfo.social.instagram,
      facebook: restaurantInfo.social.facebook,
      tiktok: "",
    },
    branding: {
      logo: restaurantInfo.branding.logo,
    },
    hero: {
      title: HERO_DEFAULTS.title,
    },
    metaDescription: siteConfig.description,
    siteUrl: siteConfig.url,
    googleMapsUrl: "",
  };
}

function mapRow(row: SiteSettingsRow): PublicSiteSettings {
  return {
    name: row.restaurant_name,
    legalName: row.legal_name ?? restaurantInfo.legalName,
    tagline: row.tagline ?? "",
    phone: row.phone_primary ?? "",
    phoneSecondary: row.phone_secondary ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp_phone,
    address: {
      street: row.address_street ?? "",
      city: row.address_city ?? "",
      state: row.address_state ?? "",
      country: row.address_country ?? "Lebanon",
    },
    hours: (row.opening_hours as OpeningHour[]) ?? [],
    deliveryFee: Number(row.delivery_fee),
    minOrder: Number(row.min_order),
    checkoutMethod:
      row.checkout_method === "builtin" ? "builtin" : "whatsapp",
    social: {
      instagram: row.instagram_url ?? "",
      facebook: row.facebook_url ?? "",
      tiktok: row.tiktok_url ?? "",
    },
    branding: {
      logo: row.logo_url ?? restaurantInfo.branding.logo,
    },
    hero: {
      title: row.hero_title?.trim() || HERO_DEFAULTS.title,
    },
    metaDescription: row.meta_description ?? siteConfig.description,
    siteUrl: row.site_url ?? siteConfig.url,
    googleMapsUrl: row.google_maps_url ?? "",
  };
}

const fetchSiteSettingsRow = cache(async (): Promise<SiteSettingsRow | null> => {
  const supabase = await createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
});

export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  const row = await fetchSiteSettingsRow();
  if (!row) return fromStatic();
  return mapRow(row);
});

export const getSiteSettingsRow = cache(async (): Promise<SiteSettingsRow | null> => {
  return fetchSiteSettingsRow();
});
