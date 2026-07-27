"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface OrdersMobileShellProps {
  children: React.ReactNode;
  className?: string;
}

export function OrdersMobileShell({
  children,
  className,
}: OrdersMobileShellProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("orders-app");

    const viewport = window.visualViewport;
    const syncViewport = () => {
      if (!viewport) return;
      html.style.setProperty("--orders-vv-height", `${viewport.height}px`);
      html.style.setProperty("--orders-vv-offset", `${viewport.offsetTop}px`);
    };

    syncViewport();
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);

    return () => {
      html.classList.remove("orders-app");
      html.style.removeProperty("--orders-vv-height");
      html.style.removeProperty("--orders-vv-offset");
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
    };
  }, []);

  return <div className={cn("orders-app-shell bg-ink", className)}>{children}</div>;
}
