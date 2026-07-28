import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { DM_Sans, Fredoka } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { BranchProvider } from "@/contexts/BranchContext";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { getBranches } from "@/lib/branch-service";
import { buildRootMetadata } from "@/lib/settings/metadata";
import { SPLASH_STORAGE_KEY } from "@/lib/splash";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fredoka = Fredoka({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildRootMetadata(settings);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7B232",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAppShell =
    (await headers()).get("x-magnifico-app-shell") === "1";

  // Admin / Orders: skip cart, branches, splash, and public chrome for faster loads.
  if (isAppShell) {
    return (
      <html
        lang="en"
        className={`${dmSans.variable} ${fredoka.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-svh font-sans brand-environment">
          <MotionProvider>
            <div id="app-root">{children}</div>
          </MotionProvider>
        </body>
      </html>
    );
  }

  const [settings, branches] = await Promise.all([
    getSiteSettings(),
    getBranches(),
  ]);

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fredoka.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh font-sans brand-environment">
        <Script id="splash-preflight" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("${SPLASH_STORAGE_KEY}")){document.documentElement.classList.add("splash-seen");}if("scrollRestoration" in history){history.scrollRestoration="manual";}setTimeout(function(){var d=document.documentElement;if(d.getAttribute("data-splash-lock")==="1"){d.style.overflow="";d.removeAttribute("data-splash-lock");var b=document.body;b.style.overflow="";b.style.position="";b.style.top="";b.style.width="";b.style.paddingRight="";}},3200);}catch(e){}`}
        </Script>
        <MotionProvider>
          <SettingsProvider settings={settings}>
            <BranchProvider branches={branches}>
              <CartProvider>
                <div id="app-root">
                  <SiteChrome>{children}</SiteChrome>
                </div>
              </CartProvider>
            </BranchProvider>
          </SettingsProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
