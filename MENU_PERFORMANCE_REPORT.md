# Menu Page — Performance Report

**Page:** `/menu` (`MenuPageClient.tsx`, `MenuItemCard.tsx`)  
**Target:** Smooth scroll on mid-range Android (FriesLab-quality feel)  
**Date:** 2026-06-13

---

## Symptoms

- Noticeable lag/stutter when food images enter viewport during scroll
- Frame drops most visible on mobile when browsing full 130-item grid
- Jank increases after filtering back to “All Items” (full re-mount)

---

## Investigation findings

### 1. Large image sizes — **High impact**

- Images served from `s3.eu-central-1.amazonaws.com` at full POS resolution
- `sizes="(max-width: 768px) 100vw, 33vw"` was **too aggressive** on mobile — requested near full viewport width per card in a 2-column grid
- Next.js generates responsive widths but oversized requests still decode large bitmaps on device

**Fix:** Tighten `sizes` to `(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 280px`

### 2. Unoptimized image loading — **High impact**

- No loading priority strategy — all cards treated equally
- No visual placeholder during decode → perceived jank + layout pop-in
- 79 items use identical logo placeholder → browser cache helps but still 130 `<img>` nodes

**Fix:** `priority` only for first 6 highlight cards; `loading="lazy"` + skeleton overlay for rest

### 3. Excessive Framer Motion — **Critical**

```tsx
// Before: every card
whileInView={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}  // card #130 waits 6.5s
whileHover={{ y: -4 }}
```

- 130 `IntersectionObserver` instances via Framer Motion
- Stagger delays keep animation scheduler busy during scroll
- `whileHover` runs layout on every pointer move

**Fix:** Remove Motion from list cards; CSS `transition` + `@media (hover: hover)` only

### 4. Unnecessary re-renders — **Medium**

- `MenuItemCard` not memoized — parent filter changes re-render all 130 cards
- `filterItems` callback recreated but memoized lists depend correctly — cards still all update
- Highlight section duplicates up to 6 items in main grid (double DOM + double images)

**Fix:** `React.memo(MenuItemCard)`; exclude highlight IDs from `allFilteredItems`

### 5. Layout shifts (CLS) — **Low–Medium**

- `aspect-[4/3]` + `fill` provides stable box — good
- `group-hover:scale-110` causes micro-shift on hover (desktop only after fix)
- Image skeleton prevents height shift on load

**Fix:** Skeleton placeholder; hover scale only on `(hover: hover)` devices

### 6. Slow image decoding — **High**

- Main thread blocked when multiple large JPEGs decode simultaneously during fast scroll
- No `content-visibility` — browser paints off-screen cards

**Fix:** `content-visibility: auto` + `contain-intrinsic-size` on card wrapper

### 7. Missing lazy loading optimization — **Medium**

- Next/Image lazy by default but no explicit strategy per section
- Above-fold highlights should load first; rest deferred

**Fix:** `priority={index < 6 && highlighted}` pattern

### 8. Missing placeholders — **Medium**

- Blank image area until decode completes

**Fix:** `MenuItemImage` with pulse skeleton until `onLoad`

### 9. Next.js Image optimization — **Partial**

- `next/image` used correctly ✓
- Remote S3 allowed ✓
- Missing: tuned `deviceSizes` in config for mobile-first widths

**Fix:** Added smaller `imageSizes` in `next.config.ts`

### 10. Heavy CSS effects — **Medium**

- `backdrop-blur-xl` on sticky category bar — GPU cost during scroll
- `shadow-ember` glow on highlighted cards
- Gradient overlay on hover

**Fix:** Sticky bar → `bg-ink/98` no blur; lighter shadows on list cards

---

## Before vs after (expected)

| Metric | Before | After (target) |
|--------|--------|----------------|
| IntersectionObservers | ~130 | 0 on list cards |
| Duplicate DOM nodes | Up to 6 | 0 |
| Hover layout thrash | All cards | Desktop only, CSS |
| Image request width (mobile) | ~100vw | ~45vw |
| Off-screen paint | Full list | Skipped via content-visibility |
| Sticky bar GPU | blur-xl | solid bg |

---

## Files changed

- `src/components/menu/MenuItemCard.tsx` — memo, no Motion, optimized image
- `src/components/menu/MenuItemImage.tsx` — lazy load + skeleton *(new)*
- `src/app/menu/MenuPageClient.tsx` — dedupe, lighter sticky bar
- `src/app/globals.css` — `menu-card-optimized` utility
- `next.config.ts` — image size tuning

---

## Remaining recommendations (not in this pass)

1. **Virtualize** list when >50 visible items (`@tanstack/react-virtual`)
2. **Server-split menu data** — pass categories server-side, stream items by category
3. **Self-host or CDN** menu images with WebP/AVIF variants
4. **Upload missing 79 photos** — biggest perceived perf + quality win
5. **Category lazy-mount** — only render active category DOM

---

## How to verify

1. `npm run dev` on phone via ngrok tunnel
2. Chrome DevTools → Performance → record scroll through full menu
3. Check **Long Tasks** and **Layout/Paint** during scroll — should drop significantly
4. Lighthouse mobile → CLS should stay < 0.1; TBT improved on mid-tier throttling
