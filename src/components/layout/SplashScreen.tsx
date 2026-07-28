"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import {
  SPLASH_FADE_IN_MS,
  SPLASH_FADE_OUT_MS,
  SPLASH_FAILSAFE_MS,
  SPLASH_HOLD_MS,
  SPLASH_LOGO_TIMEOUT_MS,
  SPLASH_STORAGE_KEY,
  notifySplashComplete,
} from "@/lib/splash";
import { acquireScrollLock, forceUnlockScroll, setSplashLockFlag } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import { LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/branding/logo";

/**
 * Phases:
 *  - "cover":   plain branded overlay on top of the (already rendered) site.
 *  - "visible": logo loaded — run the fade-in / glow / dots animations.
 *  - "exit":    fade the whole overlay out, revealing the site.
 *  - "done":    overlay unmounted.
 *
 * Scroll is locked via a ref-counted manager so branch/modals can't restore a
 * stale `overflow: hidden` after the splash ends.
 */
type SplashPhase = "cover" | "visible" | "exit" | "done";

function hasValidLogo(logo: unknown): logo is string {
  return typeof logo === "string" && logo.trim().length > 0;
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("splash-seen");
  }
}

function readInitialPhase(): SplashPhase {
  if (typeof document === "undefined") return "cover";
  if (document.documentElement.classList.contains("splash-seen")) return "done";
  try {
    if (sessionStorage.getItem(SPLASH_STORAGE_KEY)) return "done";
  } catch {
    /* ignore */
  }
  return "cover";
}

export function SplashScreen() {
  const settings = useSettings();
  const logo = settings?.branding?.logo;
  const name = settings?.name ?? "";

  const [phase, setPhase] = useState<SplashPhase>(readInitialPhase);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    let releaseLock: (() => void) | null = null;
    const timers: number[] = [];

    const addTimer = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const revealSite = () => {
      markSplashSeen();
      setSplashLockFlag(false);
      releaseLock?.();
      releaseLock = null;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";
      notifySplashComplete();
    };

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
      setSplashLockFlag(false);
      releaseLock?.();
      releaseLock = null;
    };

    let alreadySeen = false;
    try {
      alreadySeen = Boolean(sessionStorage.getItem(SPLASH_STORAGE_KEY));
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen || phase === "done") {
      setPhase("done");
      setSplashLockFlag(false);
      forceUnlockScroll();
      notifySplashComplete();
      return cleanup;
    }

    releaseLock = acquireScrollLock();
    setSplashLockFlag(true);

    // Absolute JS failsafe: if anything stalls, unlock + reveal.
    addTimer(() => {
      if (cancelled) return;
      if (!settled) {
        settled = true;
        finish();
        return;
      }
      // Settled but never revealed (stuck exit) — force reveal.
      if (document.documentElement.getAttribute("data-splash-lock") === "1") {
        setPhase("done");
        revealSite();
      }
    }, SPLASH_FAILSAFE_MS);

    if (!hasValidLogo(logo)) {
      settled = true;
      finish();
      return cleanup;
    }

    const settle = (ready: boolean) => {
      if (settled || cancelled) return;
      settled = true;
      if (ready) {
        setPhase("visible");
        addTimer(finish, SPLASH_FADE_IN_MS + SPLASH_HOLD_MS);
      } else {
        finish();
      }
    };

    const img = new window.Image();
    img.onload = () => settle(true);
    img.onerror = () => settle(false);
    img.src = logo;

    if (img.complete && img.naturalWidth > 0) {
      settle(true);
    }

    addTimer(() => settle(false), SPLASH_LOGO_TIMEOUT_MS);

    return () => {
      img.onload = null;
      img.onerror = null;
      cleanup();
    };
    // phase is only used for the already-done short-circuit on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
