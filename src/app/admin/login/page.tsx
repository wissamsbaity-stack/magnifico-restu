import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteSettings } from "@/lib/settings/site-settings";
import AdminLoginPage from "./AdminLoginPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.name} Admin Login`,
  };
}

export default async function Page() {
  const settings = await getSiteSettings();

  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <AdminLoginPage
        restaurantName={settings.name}
        logoUrl={settings.branding.logo}
      />
    </Suspense>
  );
}
