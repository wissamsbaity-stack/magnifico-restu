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

/**
 * Max time we wait for the logo image to be ready before giving up.
 * If the logo isn't ready within this window the splash is skipped entirely
 * and the website is shown immediately. Keeps slow networks from blocking.
 */
export const SPLASH_LOGO_TIMEOUT_MS = 1000;

/** Logo fade-in + slight scale-up duration (matches CSS animation). */
export const SPLASH_FADE_IN_MS = 400;

/** Hold at full visibility once the logo has faded in. */
export const SPLASH_HOLD_MS = 700;

/** Fade-out duration of the whole overlay (matches CSS animation). */
export const SPLASH_FADE_OUT_MS = 400;

/**
 * Absolute CSS-only safety net. Even if JavaScript never hydrates or throws,
 * the overlay is force-hidden after this delay so the site is never blocked.
 * Must be greater than the longest possible JS-driven path
 * (LOGO_TIMEOUT + FADE_IN + HOLD + FADE_OUT).
 */
export const SPLASH_FAILSAFE_MS = 2800;
