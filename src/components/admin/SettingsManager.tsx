"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateSiteSettings } from "@/app/admin/(dashboard)/actions";
import type { SiteSettingsRow } from "@/lib/supabase/types";
import { SettingsImageField } from "@/components/admin/SettingsImageField";
import {
  AdminAlert,
  AdminCard,
  AdminSection,
} from "@/components/admin/AdminCard";

export function SettingsManager({
  settings,
}: {
  settings: SiteSettingsRow | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    if (settings?.id) formData.set("id", settings.id);

    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <AdminCard
      as="form"
      action={handleSubmit}
      className="relative w-full max-w-3xl space-y-8 p-4 sm:p-6 lg:p-8"
    >
      <AdminSection
        title="Restaurant"
        description="Name used in the footer, browser tab, and brand moments."
      >
        <Input
          name="restaurant_name"
          label="Restaurant name"
          defaultValue={settings?.restaurant_name ?? ""}
          required
        />
        <Input
          name="email"
          label="Email"
          type="email"
          defaultValue={settings?.email ?? ""}
        />
      </AdminSection>

      <div className="h-px bg-white/8" />

      <AdminSection
        title="Homepage hero"
        description="Headline under the banner slider. Button labels and the menu link are fixed. Add hero photos in Hero Banners."
      >
        <Input
          name="hero_title"
          label="Hero title"
          placeholder="Bold Lebanese street food"
          defaultValue={settings?.hero_title ?? ""}
        />
      </AdminSection>

      <div className="h-px bg-white/8" />

      <AdminSection
        title="Delivery"
        description="Shown in the cart and checkout summary."
      >
        <Input
          name="delivery_fee"
          label="Delivery fee (USD)"
          type="number"
          min={0}
          step="any"
          defaultValue={settings?.delivery_fee ?? 0}
        />
      </AdminSection>

      <div className="h-px bg-white/8" />

      <AdminSection
        title="Social & logo"
        description="Social icons appear in the footer. Logo is used site-wide."
      >
        <Input
          name="instagram_url"
          label="Instagram URL (optional)"
          placeholder="https://instagram.com/..."
          defaultValue={settings?.instagram_url ?? ""}
        />
        <Input
          name="facebook_url"
          label="Facebook URL (optional)"
          placeholder="https://facebook.com/..."
          defaultValue={settings?.facebook_url ?? ""}
        />
        <Input
          name="tiktok_url"
          label="TikTok URL (optional)"
          placeholder="https://tiktok.com/@..."
          defaultValue={settings?.tiktok_url ?? ""}
        />
        <SettingsImageField
          name="logo_url"
          label="Logo image"
          defaultValue={settings?.logo_url ?? ""}
          previewAlt={settings?.restaurant_name ?? "Restaurant logo"}
          preserveTransparency
          helpText="Use a transparent PNG for best results on yellow backgrounds."
        />
      </AdminSection>

      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      {success ? (
        <AdminAlert variant="success">Settings saved successfully.</AdminAlert>
      ) : null}

      <div className="sticky bottom-4 z-10 -mx-1 rounded-2xl border border-white/10 bg-[rgb(var(--color-surface)/0.92)] p-3 shadow-float backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <Button
          type="submit"
          variant="accent"
          isLoading={pending}
          className="min-h-11 w-full sm:w-auto"
        >
          Save settings
        </Button>
      </div>
    </AdminCard>
  );
}
