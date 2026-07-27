/**
 * Official Magnifico brand colors — finalized palette.
 * CSS variables in globals.css must stay in sync with these values.
 */
export const BRAND_COLORS = {
  yellow: { rgb: "247 178 50", hex: "#F7B232" },
  pink: { rgb: "239 76 100", hex: "#EF4C64" },
  dark: { rgb: "45 45 45", hex: "#2D2D2D" },
  green: { rgb: "130 191 65", hex: "#82BF41" },
  /** Elevated surface tint — derived from yellow, not a fourth brand color */
  cream: { rgb: "255 250 240", hex: "#FFFAF0" },
} as const;

export const BRAND_YELLOW_RGB = BRAND_COLORS.yellow.rgb;
export const BRAND_YELLOW_HEX = BRAND_COLORS.yellow.hex;
export const BRAND_PINK_RGB = BRAND_COLORS.pink.rgb;
export const BRAND_PINK_HEX = BRAND_COLORS.pink.hex;
export const BRAND_DARK_RGB = BRAND_COLORS.dark.rgb;
export const BRAND_DARK_HEX = BRAND_COLORS.dark.hex;
export const BRAND_GREEN_RGB = BRAND_COLORS.green.rgb;
export const BRAND_GREEN_HEX = BRAND_COLORS.green.hex;
