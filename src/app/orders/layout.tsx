import type { Viewport } from "next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import "./orders.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Orders dashboard is disabled (WhatsApp-only). Files kept for later use.
  if (!siteConfig.ordersEnabled) notFound();
  return children;
}
