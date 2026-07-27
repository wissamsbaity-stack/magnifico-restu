/** Fixed homepage hero defaults — CTA labels are not editable from admin. */
export const HERO_DEFAULTS = {
  title: "Bold Lebanese street food",
  primaryLabel: "Order on WhatsApp",
  secondaryLabel: "Browse the menu",
  secondaryLink: "/menu",
} as const;

export const HERO_CTA = {
  primaryLabel: HERO_DEFAULTS.primaryLabel,
  secondaryLabel: HERO_DEFAULTS.secondaryLabel,
} as const;
