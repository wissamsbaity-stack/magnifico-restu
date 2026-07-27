import type { Config } from "tailwindcss";

/**
 * WS DIGITAL Restaurant Platform — theme tokens.
 *
 * Colors resolve to CSS variables (defined in globals.css) so an entire
 * restaurant palette can be re-skinned by editing the variables only.
 * The customer site uses the light "day" theme (:root); admin/orders opt
 * into the dark "night" theme via the `.theme-night` scope.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // `ink` = app background role, `cream` = primary foreground text role.
        ink: "rgb(var(--color-bg) / <alpha-value>)",
        cream: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        // Dark hairline color used for borders/dividers on light surfaces.
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
          muted: "rgb(var(--color-accent) / 0.14)",
          foreground: "rgb(var(--color-accent-fg) / <alpha-value>)",
        },
        brand: {
          yellow: "rgb(var(--color-brand-yellow) / <alpha-value>)",
          pink: "rgb(var(--color-pink) / <alpha-value>)",
          "pink-hover": "rgb(var(--color-pink-hover) / <alpha-value>)",
          dark: "rgb(var(--color-brand-dark) / <alpha-value>)",
          green: "rgb(var(--color-brand-green) / <alpha-value>)",
          ink: "rgb(var(--color-ink-solid) / <alpha-value>)",
        },
        "brand-green": "rgb(var(--color-brand-green) / <alpha-value>)",
        whatsapp: "rgb(var(--color-whatsapp) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-bg) / <alpha-value>)",
          raised: "rgb(var(--color-surface) / <alpha-value>)",
          overlay: "rgb(var(--color-surface-2) / <alpha-value>)",
        },
        // Legacy tokens referenced by a few components — mapped to brand hues
        // so they render correctly instead of being undefined.
        mustard: "rgb(var(--color-accent) / <alpha-value>)",
        ketchup: "rgb(var(--color-pink) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ember: "0 0 80px -10px rgb(var(--color-accent) / 0.5)",
        card: "0 4px 22px -4px rgb(var(--color-line) / 0.18), 0 2px 8px rgb(var(--color-line) / 0.08)",
        float: "0 16px 48px -8px rgb(var(--color-line) / 0.22), 0 4px 16px rgb(var(--color-line) / 0.1)",
        lift: "0 10px 32px -6px rgb(var(--color-line) / 0.2), 0 4px 12px rgb(var(--color-line) / 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse 120% 90% at 50% 0%, rgb(var(--color-accent) / 0.16) 0%, rgb(var(--color-accent) / 0.07) 35%, rgb(var(--color-accent) / 0.02) 55%, transparent 80%)",
        "hero-premium":
          "radial-gradient(ellipse 120% 80% at 50% -12%, rgb(var(--color-accent) / 0.18) 0%, rgb(var(--color-accent) / 0.06) 42%, transparent 70%), linear-gradient(180deg, rgb(var(--color-bg)) 0%, rgb(var(--color-surface-2) / 0.35) 50%, rgb(var(--color-bg)) 100%)",
        "page-warm":
          "linear-gradient(180deg, rgb(var(--color-bg)) 0%, rgb(var(--color-surface-2) / 0.22) 50%, rgb(var(--color-bg)) 100%)",
        "section-glow":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(var(--color-accent) / 0.08) 0%, transparent 70%)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
