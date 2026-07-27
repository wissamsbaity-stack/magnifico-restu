"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import {
  SPLASH_FADE_IN_MS,
  SPLASH_FADE_OUT_MS,
  SPLASH_HOLD_MS,
  SPLASH_LOGO_TIMEOUT_MS,
  SPLASH_STORAGE_KEY,
  notifySplashComplete,
} from "@/lib/splash";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

/**
 * Phases:
 *  - "cover":   plain branded overlay on top of the (already rendered) site.
 *               Shown only while we decide whether the logo will be ready.
 *  - "visible": logo loaded — run the fade-in / glow / dots animations.
 *  - "exit":    fade the whole overlay out, revealing the site.
 *  - "done":    overlay unmounted.
 *
 * Hard rules:
 *  - The website is ALWAYS rendered underneath. This overlay never hides it
 *    via CSS opacity locks, so a stuck/failed splash can never black-screen.
 *  - Any failure (missing/invalid logo, network error, slow connection) simply
 *    skips straight to the fade-out and shows the site.
 */
type SplashPhase = "cover" | "visible" | "exit" | "done";

function hasValidLogo(logo: unknown): logo is string {
  return typeof logo === "string" && logo.trim().length > 0;
}

export function SplashScreen() {
  const settings = useSettings();
  const logo = settings?.branding?.logo;
  const name = settings?.name ?? "";

  const [phase, setPhase] = useState<SplashPhase>("cover");

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const timers: number[] = [];

    const addTimer = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    // Prevent the page underneath from scrolling while the splash is visible,
    // and always restore to the top when the site is revealed.
    const revealSite = () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";
      notifySplashComplete();
    };

    const lockScroll = () => {
      document.documentElement.style.overflow = "hidden";
    };

    lockScroll();

    // Fade the overlay out, then unmount it. Safe to call from any failure path.
    const finish = () => {
      if (cancelled) return;
      setPhase("exit");
      addTimer(() => {
        if (!cancelled) {
          setPhase("done");
          revealSite();
        }
      }, SPLASH_FADE_OUT_MS);
    };

    const cleanup = () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      document.documentElement.style.overflow = "";
    };

    // 1. Only play once per session. Never throw — fall through to showing site.
    let alreadySeen = false;
    try {
      alreadySeen = Boolean(sessionStorage.getItem(SPLASH_STORAGE_KEY));
      if (!alreadySeen) sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      setPhase("done");
      revealSite();
      return cleanup;
    }

    // 2. No usable logo? Don't show a logo-less splash — just reveal the site.
    if (!hasValidLogo(logo)) {
      finish();
      return cleanup;
    }

    // 3. Preload the logo reliably with a raw Image() (no Next optimizer in the
    //    way). Animations only start once the bytes are actually decoded.
    const settle = (ready: boolean) => {
      if (settled || cancelled) return;
      settled = true;
      if (ready) {
        setPhase("visible");
        addTimer(finish, SPLASH_FADE_IN_MS + SPLASH_HOLD_MS);
      } else {
        // Slow / failed / invalid logo → skip the splash entirely.
        finish();
      }
    };

    const img = new window.Image();
    img.onload = () => settle(true);
    img.onerror = () => settle(false);
    img.src = logo;

    // Image was already cached — onload may not fire, so check synchronously.
    if (img.complete && img.naturalWidth > 0) {
      settle(true);
    }

    // 4. Fallback timeout: never wait longer than this for branding assets.
    addTimer(() => settle(false), SPLASH_LOGO_TIMEOUT_MS);

    return () => {
      img.onload = null;
      img.onerror = null;
      cleanup();
    };
  }, [logo]);

  if (phase === "done") return null;

  const showBranding = phase === "visible" || phase === "exit";

  return (
    <div
      className={cn(
        "splash-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface",
        phase === "visible" && "splash-screen--visible",
        phase === "exit" && "splash-screen--exit"
      )}
      aria-hidden="true"
    >
      {showBranding && hasValidLogo(logo) && (
        <>
          <div className="splash-logo-wrap flex items-center justify-center">
            {/* Raw <img>: the source is already decoded (preloaded above), and
                this avoids the Next/Image optimizer pipeline that proved
                unreliable in production. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt={name}
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              decoding="async"
              draggable={false}
              className="splash-logo h-auto w-40 object-contain sm:w-52"
            />
          </div>

          <div className="splash-dots mt-10 flex items-center gap-2.5">
            <span className="splash-dot" />
            <span className="splash-dot" />
            <span className="splash-dot" />
          </div>
        </>
      )}
    </div>
  );
}
