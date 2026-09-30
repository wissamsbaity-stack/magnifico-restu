"use client";

import { useEffect, useState } from "react";
import {
  SPLASH_ARTWORK_AVIF,
  SPLASH_ARTWORK_FALLBACK,
  SPLASH_ARTWORK_WEBP,
  SPLASH_FADE_OUT_MS,
  SPLASH_FAILSAFE_MS,
  SPLASH_MIN_VISIBLE_MS,
  SPLASH_READY_TIMEOUT_MS,
  SPLASH_STORAGE_KEY,
  notifySplashComplete,
} from "@/lib/splash";
import { acquireScrollLock, forceUnlockScroll, setSplashLockFlag } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

/**
 * Phases:
 *  - "visible": full-viewport artwork is visible while the first screen readies.
 *  - "exit":    fade the whole overlay out, revealing the site.
 *  - "done":    overlay unmounted.
 *
 * Scroll is locked via a ref-counted manager so branch/modals can't restore a
 * stale `overflow: hidden` after the splash ends.
 */
type SplashPhase = "visible" | "exit" | "done";

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
  if (typeof document === "undefined") return "visible";
  if (document.documentElement.classList.contains("splash-seen")) return "done";
  try {
    if (sessionStorage.getItem(SPLASH_STORAGE_KEY)) return "done";
  } catch {
    /* ignore */
  }
  return "visible";
}

export function SplashScreen() {
  const [phase, setPhase] = useState<SplashPhase>(readInitialPhase);

  useEffect(() => {
    let cancelled = false;
    let exiting = false;
    let releaseLock: (() => void) | null = null;
    const timers: number[] = [];
    const startedAt = performance.now();
    let removeLoadListener: (() => void) | null = null;
    let removeArtworkListeners: (() => void) | null = null;

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
      if (cancelled || exiting) return;
      exiting = true;
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
      removeLoadListener?.();
      removeLoadListener = null;
      removeArtworkListeners?.();
      removeArtworkListeners = null;
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

    // Absolute JS failsafe: if any readiness signal stalls, unlock + reveal.
    addTimer(() => {
      if (cancelled) return;
      if (!exiting) {
        finish();
        return;
      }
      // Settled but never revealed (stuck exit) — force reveal.
      if (document.documentElement.getAttribute("data-splash-lock") === "1") {
        setPhase("done");
        revealSite();
      }
    }, SPLASH_FAILSAFE_MS);

    const artworkReady = new Promise<void>((resolve) => {
      const image = document.querySelector<HTMLImageElement>(".splash-artwork");
      if (!image || (image.complete && image.naturalWidth > 0)) {
        resolve();
        return;
      }

      const settle = () => resolve();
      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", settle, { once: true });
      removeArtworkListeners = () => {
        image.removeEventListener("load", settle);
        image.removeEventListener("error", settle);
      };
    });

    const pageReady = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }
      const onLoad = () => resolve();
      window.addEventListener("load", onLoad, { once: true });
      removeLoadListener = () => window.removeEventListener("load", onLoad);
    });

    const fontsReady = document.fonts?.ready
      ? document.fonts.ready.then(() => undefined, () => undefined)
      : Promise.resolve();

    const readinessTimeout = new Promise<void>((resolve) => {
      addTimer(resolve, SPLASH_READY_TIMEOUT_MS);
    });

    Promise.race([
      Promise.all([artworkReady, pageReady, fontsReady]).then(() => undefined),
      readinessTimeout,
    ]).then(() => {
      if (cancelled) return;
      const remaining = Math.max(
        0,
        SPLASH_MIN_VISIBLE_MS - (performance.now() - startedAt)
      );
      addTimer(finish, remaining);
    });

    return () => {
      cleanup();
    };
    // phase is only used for the already-done short-circuit on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={cn(
        "splash-screen fixed inset-0 z-[9999] overflow-hidden bg-[#F7B232]",
        phase === "exit" && "splash-screen--exit"
      )}
      role="status"
      aria-label="Loading Magnifico"
    >
      <picture>
        <source srcSet={SPLASH_ARTWORK_AVIF} type="image/avif" />
        <source srcSet={SPLASH_ARTWORK_WEBP} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SPLASH_ARTWORK_FALLBACK}
          alt=""
          width={852}
          height={1846}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="splash-artwork"
        />
      </picture>

      <div className="splash-loading" aria-hidden="true">
        <span className="splash-loading__progress" />
      </div>
    </div>
  );
}
