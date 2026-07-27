import type { Metadata } from "next";
import type { PublicSiteSettings } from "@/lib/settings/site-settings";

export function buildRootMetadata(settings: PublicSiteSettings): Metadata {
  const metadataBase = settings.siteUrl
    ? new URL(settings.siteUrl)
    : undefined;

  return {
    metadataBase,
    title: {
      default: settings.name,
      template: `%s | ${settings.name}`,
    },
    description: settings.metaDescription,
    keywords: [
      "street food",
      "lebanese food",
      "burgers",
      "wraps",
      "lebanon",
      "whatsapp order",
    ],
    openGraph: {
      title: settings.name,
      description: settings.metaDescription,
      url: settings.siteUrl,
      siteName: settings.name,
      images: [
        {
          url: settings.branding.logo,
          alt: settings.name,
        },
      ],
    },
    icons: {
      icon: settings.branding.logo,
      apple: settings.branding.logo,
    },
  };
}
