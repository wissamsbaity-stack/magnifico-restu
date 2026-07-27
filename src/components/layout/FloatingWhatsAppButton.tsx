"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { useAnyOverlayOpen } from "@/lib/overlay-store";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { useActiveContact } from "@/hooks/useActiveContact";

/** Pages where the quick-contact WhatsApp button is offered. */
const WHATSAPP_VISIBLE_ON = new Set(["/menu", "/contact"]);

const FAB_STACK_BOTTOM = "max(1.5rem, env(safe-area-inset-bottom, 0px))";

const fabButtonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95";

function FloatingWhatsAppButtonInner() {
  const { whatsapp, restaurantName } = useActiveContact();
  const overlayOpen = useAnyOverlayOpen();
  const whatsappUrl = buildWhatsAppContactUrl(undefined, whatsapp, restaurantName);

  if (overlayOpen || !whatsapp) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${fabButtonClass} bg-whatsapp text-white shadow-[0_8px_24px_-4px_rgba(37,211,102,0.55),0_0_22px_rgba(37,211,102,0.35)] ring-1 ring-whatsapp/40`}
      aria-label="Contact us on WhatsApp"
    >
      <WhatsAppIcon size={20} />
    </a>
  );
}

function FloatingActionStack() {
  const pathname = usePathname();
  const showWhatsApp = WHATSAPP_VISIBLE_ON.has(pathname);
  const showBackToTop = pathname === "/menu";

  if (!showWhatsApp && !showBackToTop) return null;

  return (
    <div
      className="fixed left-4 z-40 flex flex-col-reverse items-center gap-3.5 sm:left-6"
      style={{ bottom: FAB_STACK_BOTTOM }}
    >
      {showWhatsApp ? <FloatingWhatsAppButtonInner /> : null}
      {showBackToTop ? <BackToTopButton /> : null}
    </div>
  );
}

export function FloatingWhatsAppButton() {
  return <FloatingActionStack />;
}
