"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { BranchSelectModal } from "@/components/branch/BranchSelectModal";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isOrders = pathname.startsWith("/orders");

  if (isAdmin || isOrders) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
      >
        Skip to main content
      </a>
      <SplashScreen />
      <Header />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <FloatingCartButton />
      <FloatingWhatsAppButton />
      <BranchSelectModal />
      <MobileNavDrawer />
    </>
  );
}
