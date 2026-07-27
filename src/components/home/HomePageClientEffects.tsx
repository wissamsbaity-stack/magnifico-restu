"use client";

import { useLayoutEffect } from "react";
import { scrollToTopInstant } from "@/lib/scroll";

/** Homepage scroll polish: open at top + pause ambient CSS while scrolling. */
export function HomePageClientEffects() {
  useLayoutEffect(() => {
    scrollToTopInstant();

    const handlePageShow = () => {
      scrollToTopInstant();
    };

    let scrollTimer = 0;
    const handleScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 120);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, []);

  return null;
}
