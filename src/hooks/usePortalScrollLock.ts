import { useEffect } from "react";

/** Locks page scroll while a body-portal overlay is open (works with orders-app). */
export function usePortalScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollEl = document.querySelector(
      ".orders-app-scroll"
    ) as HTMLElement | null;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      scrollOverflow: scrollEl?.style.overflow ?? "",
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollEl) {
      scrollEl.style.overflow = "hidden";
    }

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      if (scrollEl) {
        scrollEl.style.overflow = prev.scrollOverflow;
      }
    };
  }, [locked]);
}
