"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cropToImageStyle } from "@/lib/image-crop";
import { cn } from "@/lib/utils";
import type { MenuBanner } from "@/types/banner";

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 40;

interface HomeHeroCarouselProps {
  banners: MenuBanner[];
  className?: string;
  /** Show prev/next arrows on desktop hover */
  showArrows?: boolean;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

function BannerSlide({
  banner,
  priority,
  active,
  swipeLockRef,
}: {
  banner: MenuBanner;
  priority: boolean;
  active: boolean;
  swipeLockRef: RefObject<boolean>;
}) {
  const clickLink = banner.clickLink?.trim() || null;
  const caption = banner.caption?.trim() || null;

  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (swipeLockRef.current) {
      event.preventDefault();
    }
  };

  const inner = (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={banner.imageUrl}
          alt={caption ?? "Promotional banner"}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          className="object-cover"
          style={cropToImageStyle(banner.imageCrop)}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 720px"
        />
      </div>
      {caption ? (
        <p className="pointer-events-none absolute bottom-0 left-0 z-10 max-w-[min(100%,22rem)] bg-gradient-to-t from-brand-dark/70 to-transparent px-4 pb-4 pt-10 text-sm font-bold leading-snug text-white sm:px-5 sm:pb-5 sm:text-base">
          {caption}
        </p>
      ) : null}
    </>
  );

  const shellClass = cn(
    "absolute inset-0 transition-opacity duration-300 ease-out",
    active ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none"
  );

  if (clickLink) {
    const interactiveClass = cn(
      shellClass,
      "block cursor-pointer overflow-hidden motion-safe:active:opacity-[0.94]"
    );

    if (isExternalHref(clickLink)) {
      return (
        <a
          href={clickLink}
          target="_blank"
          rel="noopener noreferrer"
          className={interactiveClass}
          onClick={handleClick}
          aria-hidden={!active}
          tabIndex={active ? 0 : -1}
          aria-label={caption ?? "Open banner link"}
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        href={clickLink}
        className={interactiveClass}
        onClick={handleClick}
        aria-hidden={!active}
        tabIndex={active ? 0 : -1}
        aria-label={caption ?? "Open banner link"}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={shellClass} aria-hidden={!active}>
      {inner}
    </div>
  );
}

export function HomeHeroCarousel({
  banners,
  className,
  showArrows = true,
}: HomeHeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const swipeLock = useRef(false);
  const paused = useRef(false);
  const offscreen = useRef(false);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);

  const count = banners.length;
  const firstBanner = banners[0];

  // Preload the first hero image as early as possible (critical LCP).
  useEffect(() => {
    if (!firstBanner?.imageUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = firstBanner.imageUrl;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [firstBanner?.imageUrl]);

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return;
      const normalized = ((next % count) + count) % count;
      setIndex(normalized);
    },
    [count]
  );

  const goNext = useCallback(() => {
    setIndex((current) => {
      if (count <= 1) return current;
      return (current + 1) % count;
    });
  }, [count]);

  const goPrev = useCallback(() => {
    setIndex((current) => {
      if (count <= 1) return current;
      return (current - 1 + count) % count;
    });
  }, [count]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || count <= 1) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        offscreen.current = !entry?.isIntersecting;
      },
      { rootMargin: "80px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;

    const timer = window.setInterval(() => {
      if (paused.current || dragging.current || offscreen.current) return;
      goNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [count, goNext]);

  const lockSwipeNav = () => {
    swipeLock.current = true;
    window.setTimeout(() => {
      swipeLock.current = false;
    }, 320);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    dragStartX.current = event.clientX;
    dragging.current = false;
    paused.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    if (Math.abs(event.clientX - dragStartX.current) > 8) {
      dragging.current = true;
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = event.clientX - dragStartX.current;
    dragStartX.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      lockSwipeNav();
      if (dx < 0) goNext();
      else goPrev();
    }

    window.setTimeout(() => {
      dragging.current = false;
      paused.current = false;
    }, 50);
  };

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("w-full", className)}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        if (!dragging.current) paused.current = false;
      }}
    >
      <div
        className="group relative touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotional banners"
      >
        <div className="hero-float-card">
          <div className="relative aspect-[2/1] w-full max-h-[min(42vw,220px)] sm:max-h-[280px] lg:max-h-none lg:aspect-[4/3] xl:min-h-[18rem]">
            {/* Mount active + neighbors only (first always). Avoids remount churn and
                prevents lazy slides in the viewport from all downloading at once. */}
            {banners.map((banner, i) => {
              const isNeighbor =
                count > 1 &&
                (i === (index + 1) % count || i === (index - 1 + count) % count);
              const shouldRender = i === 0 || i === index || isNeighbor;
              if (!shouldRender) return null;

              return (
                <BannerSlide
                  key={banner.id}
                  banner={banner}
                  priority={i === 0}
                  active={i === index}
                  swipeLockRef={swipeLock}
                />
              );
            })}
          </div>

          {showArrows && count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-dark/55 text-white opacity-0 transition-opacity duration-200 hover:bg-brand-dark/75 group-hover:opacity-100 sm:left-3 sm:flex"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-dark/55 text-white opacity-0 transition-opacity duration-200 hover:bg-brand-dark/75 group-hover:opacity-100 sm:right-3 sm:flex"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div
            className="mt-3.5 flex items-center justify-center gap-2 sm:mt-4"
            role="tablist"
            aria-label="Banner slides"
          >
            {banners.map((banner, i) => {
              const selected = i === index;
              return (
                <button
                  key={banner.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full motion-safe:transition-all motion-safe:duration-300",
                    selected
                      ? "h-2 w-7 bg-brand-pink shadow-[0_0_10px_rgb(var(--color-pink)/0.45)]"
                      : "h-2 w-2 bg-line/20 hover:bg-line/35"
                  )}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
