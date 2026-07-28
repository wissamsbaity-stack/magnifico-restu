/**
 * Reference-counted page scroll lock.
 *
 * Multiple overlays (splash, modals, drawers) can request a lock; scroll is
 * only restored when the last lock is released.
 *
 * On iOS Safari, we intentionally avoid `position: fixed` on <body> — that
 * pattern breaks `position: fixed` overlays (gaps above/below, yellow bleed).
 */

type LockSnapshot = {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  bodyPaddingRight: string;
  bodyTouchAction: string;
  scrollY: number;
  usedFixedBody: boolean;
};

let lockCount = 0;
let snapshot: LockSnapshot | null = null;
let touchMoveBlocker: ((event: TouchEvent) => void) | null = null;

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(ad|hone|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isScrollableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("[data-scroll-lock-scrollable]"));
}

function applyLock() {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  const body = document.body;
  const ios = isIOS();

  snapshot = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    bodyTouchAction: body.style.touchAction,
    scrollY: window.scrollY,
    usedFixedBody: !ios,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  if (ios) {
    // Overflow-only lock — keeps fixed overlays viewport-correct on iOS.
    body.style.touchAction = "none";
    touchMoveBlocker = (event: TouchEvent) => {
      if (isScrollableTarget(event.target)) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", touchMoveBlocker, {
      passive: false,
    });
  } else {
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    body.style.position = "fixed";
    body.style.top = `-${snapshot.scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  html.setAttribute("data-scroll-locked", "1");
}

function releaseLock() {
  if (typeof document === "undefined" || !snapshot) return;

  const html = document.documentElement;
  const body = document.body;
  const saved = snapshot;
  snapshot = null;

  if (touchMoveBlocker) {
    document.removeEventListener("touchmove", touchMoveBlocker);
    touchMoveBlocker = null;
  }

  html.style.overflow = saved.htmlOverflow;
  body.style.overflow = saved.bodyOverflow;
  body.style.position = saved.bodyPosition;
  body.style.top = saved.bodyTop;
  body.style.width = saved.bodyWidth;
  body.style.paddingRight = saved.bodyPaddingRight;
  body.style.touchAction = saved.bodyTouchAction;
  html.removeAttribute("data-scroll-locked");

  if (saved.usedFixedBody) {
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, saved.scrollY);
    html.style.scrollBehavior = prevBehavior;
  }
}

/** Acquire a scroll lock. Returns a disposer that must be called once. */
export function acquireScrollLock(): () => void {
  if (typeof document === "undefined") return () => {};

  lockCount += 1;
  if (lockCount === 1) {
    applyLock();
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      releaseLock();
    }
  };
}

/** Hard-clear any leftover inline scroll locks (splash failsafe / recovery). */
export function forceUnlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = 0;
  snapshot = null;
  if (touchMoveBlocker) {
    document.removeEventListener("touchmove", touchMoveBlocker);
    touchMoveBlocker = null;
  }
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = "";
  html.style.scrollBehavior = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";
  body.style.paddingRight = "";
  body.style.touchAction = "";
  html.removeAttribute("data-scroll-locked");
}

/** Mark document while a splash-owned lock is active (for CSS/JS failsafes). */
export function setSplashLockFlag(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.documentElement.setAttribute("data-splash-lock", "1");
  } else {
    document.documentElement.removeAttribute("data-splash-lock");
  }
}
