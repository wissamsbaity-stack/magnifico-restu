/**
 * Splash screen timing + storage configuration.
 *
 * The splash screen is a non-blocking visual enhancement layered on top of the
 * site. None of these values are allowed to gate website rendering — they only
 * control how long the (optional) overlay stays on screen.
 */

/** sessionStorage key marking that the splash already played this session. */
export const SPLASH_STORAGE_KEY = "magnifico-splash-seen";

/** Dispatched when the splash overlay finishes (or is skipped). */
export const SPLASH_COMPLETE_EVENT = "magnifico:splash-complete";

export function notifySplashComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SPLASH_COMPLETE_EVENT));
}

/** Optimized, eagerly loaded splash artwork. */
export const SPLASH_ARTWORK_AVIF = "/branding/magnifico-splash.avif";
export const SPLASH_ARTWORK_WEBP = "/branding/magnifico-splash.webp";
export const SPLASH_ARTWORK_FALLBACK = "/branding/magnifico-splash.jpg";

/** Prevent a distracting flash when the first screen is already warm. */
export const SPLASH_MIN_VISIBLE_MS = 1700;

/** Stop waiting for first-screen assets after this point. */
export const SPLASH_READY_TIMEOUT_MS = 1800;

/** Fade-out duration of the whole overlay (matches CSS animation). */
export const SPLASH_FADE_OUT_MS = 360;

/**
 * Absolute CSS-only safety net. Even if JavaScript never hydrates or throws,
 * the overlay is force-hidden after this delay so the site is never blocked.
 * Must be greater than the longest possible JS-driven path
 * (LOGO_TIMEOUT + FADE_IN + HOLD + FADE_OUT).
 */
export const SPLASH_FAILSAFE_MS = 2800;
