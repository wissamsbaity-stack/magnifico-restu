/** Scroll to the top instantly without smooth-scroll side effects. */
export function scrollToTopInstant() {
  if (typeof window === "undefined") return;

  const html = document.documentElement;
  const prevHtmlBehavior = html.style.scrollBehavior;
  const prevBodyBehavior = document.body.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";

  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, 0);
  }

  html.scrollTop = 0;
  document.body.scrollTop = 0;

  html.style.scrollBehavior = prevHtmlBehavior;
  document.body.style.scrollBehavior = prevBodyBehavior;
}

/** Smooth scroll to top — starts immediately on tap. */
export function scrollToTopSmooth() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
