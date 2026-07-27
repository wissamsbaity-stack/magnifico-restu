import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteSettings } from "@/lib/settings/site-settings";
import OrdersLoginPage from "./OrdersLoginPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.name} Orders Dashboard`,
    robots: { index: false, follow: false },
  };
}

export default async function Page() {
  const settings = await getSiteSettings();

  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <OrdersLoginPage
        restaurantName={settings.name}
        logoUrl={settings.branding.logo}
      />
    </Suspense>
  );
}
