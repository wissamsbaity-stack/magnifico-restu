"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteSettings } from "@/lib/settings/site-settings";

const SettingsContext = createContext<PublicSiteSettings | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: PublicSiteSettings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): PublicSiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
