import { useLayoutEffect } from "react";

/**
 * Locks body scroll while preserving the exact scroll position (works on iOS).
 *
 * On unlock the position is restored *instantly*. We temporarily disable the
 * global `scroll-behavior: smooth` during the restore — otherwise the browser
 * animates back to the saved position, which looks like the page jumping to the
 * top and then scrolling back down.
 *
 * The vertical scrollbar width is also compensated with padding so the page
 * behind the overlay doesn't shift horizontally when the scrollbar disappears.
 */
export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const { style } = document.body;

    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      paddingRight: style.paddingRight,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prevHtmlOverflow = html.style.overflow;

    html.style.overflow = "hidden";
    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.paddingRight = prev.paddingRight;

      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
  }, [locked]);
}
