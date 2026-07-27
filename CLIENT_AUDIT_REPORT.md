# Bob's Burger — Client Project Audit

**Date:** 2026-06-13  
**Benchmark:** Premium restaurant ordering UX (FriesLab-level quality)  
**Scope:** Full site review — branding, content, UX, checkout, WhatsApp, menu performance

---

## Executive summary

Bob's Burger has a strong technical foundation: 130 real POS menu items, WhatsApp checkout, cart persistence, and a cohesive dark premium UI. It is **not yet client-delivery ready**. The largest gaps vs FriesLab-quality sites are **missing food photography (61% placeholders)**, **unverified operational data (hours, delivery fee)**, **menu scroll performance on mobile**, and **checkout trust issues** (cart cleared before WhatsApp send).

**Ship-ready today:** Menu data pipeline, cart, WhatsApp message builder, core page structure.  
**Blockers for launch:** Real hours/fees, product photos, performance pass, checkout confirmation flow.

---

## 1. Missing Bob's Burger branding

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | Broken design tokens | `mustard`, `ketchup` classes used in cart/checkout/contact but undefined in `tailwind.config.ts` — styles silently fail |
| P1 | Generic favicon | `public/favicon.svg` is gold “B”, not Bob's logo |
| P1 | No social preview | Missing Open Graph / Twitter cards in `layout.tsx` |
| P1 | Invalid Facebook URL | `restaurant.ts` has spaces in Facebook path |
| P2 | No local brand assets | All branding depends on remote S3; nothing in `/public` except favicon |
| P2 | Category photos unused | 10 category images in POS JSON never shown — icons used instead |
| P2 | Hero image inconsistency | Report vs `restaurant.ts` reference different burger photos |
| P3 | Dead Unsplash config | `next.config.ts` allows `images.unsplash.com` but unused |

**Done:** Stacked wordmark header, Bebas Neue + DM Sans, orange `#FF5C00` accent, S3 logo in header/footer, About cover image.

---

## 2. Missing real menu content

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | 79 items without photos | 61% show logo placeholder — hurts premium perception |
| P1 | POS typos live on site | e.g. “French Fires”, “icebber”, “seiss” from source data |
| P1 | No combo/modifier flow | Upgrades, Add-Ons, Value Meals are flat items — no “make it a meal” UX |
| P2 | Empty tags array | All 130 items have `tags: []` — search-by-tag non-functional |
| P2 | No item detail pages | No `/menu/[slug]` for deep links or SEO |
| P2 | Search placeholder wrong | Mentions “shakes” — category doesn't exist |
| P3 | No Supabase sync | Static JSON only; admin redirects home |
| P3 | Unused components | `FeaturedSection`, `PopularSection` orphaned |

**Done:** 130 items, 10 categories, real LBP prices, search + category filters, visual burger highlights (items with real photos only — no fake POS flags).

---

## 3. Missing restaurant information

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | Opening hours | Only “Check Instagram for hours” — Footer + Contact |
| P0 | Delivery fee | Hardcoded `0 LL` — not from POS |
| P1 | Minimum order | `siteConfig.minOrder: 0` placeholder |
| P1 | Delivery zone | “Across Lebanon” with no zones, fees, or ETA |
| P1 | Unverified hero stats | “5★” and “30m prep” not sourced from POS/Instagram |
| P2 | Phone `70 033 430` | In POS JSON but not on site |
| P2 | Contact form fake | Shows success without sending — trust risk |
| P2 | No pickup vs delivery | Single flow only |
| P3 | No SEO structured data | Missing JSON-LD, sitemap, robots.txt |

**Done:** Legal name, Aramoun address, coordinates, primary phones, email, Instagram, Maps embed, WhatsApp order number.

---

## 4. Missing images

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | 79 menu placeholders | Same logo repeated — looks unfinished |
| P1 | No blur/LQIP placeholders | Images pop in without skeleton — contributes to scroll jank |
| P1 | Instagram lifestyle photos | Blocked by login wall — not imported |
| P2 | Category imagery | POS category art not used in UI |
| P2 | Remote-only dependency | All images on Omega S3 — latency + single point of failure |
| P3 | OG/share image | None for link previews |

**Done:** `next/image` everywhere, S3 remote patterns, hero `priority` load.

---

## 5. UI weaknesses

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | Duplicate menu cards | Highlights re-render in “All Items” (up to 6 duplicates) |
| P1 | Inconsistent add-to-cart | Home adds directly; menu opens modal |
| P1 | Contact map filters | Heavy grayscale/invert on iframe looks unnatural |
| P2 | No dietary/allergy badges | POS has allergy data — not imported |
| P2 | Icon-only categories | Weaker than photo-led tiles (FriesLab pattern) |
| P2 | Dead/unused components | `CartButton.tsx`, featured/popular sections |
| P3 | Input focus inconsistency | Mix of `accent` vs undefined `mustard` tokens |

**Done:** Dark premium layout, section headings, cart drawer + toast, floating mobile cart, skeleton loading route.

---

## 6. Mobile UX weaknesses

| Priority | Issue | Detail |
|----------|-------|--------|
| P1 | Cart hidden before first add | Header cart is `hidden sm:flex` — must use hamburger |
| P1 | Toast + FAB overlap | Bottom-center toast + bottom-right cart button stack |
| P1 | Sticky chrome eats viewport | Header 72px + category bar ≈ 120px+ on menu |
| P2 | 130-card infinite scroll | No collapse-by-category or virtualization |
| P2 | No safe-area insets | Fixed bottom UI may clash with iOS home indicator |
| P2 | No persistent WhatsApp FAB | Unlike FriesLab-style always-visible order CTA |
| P3 | Suspense underused | Menu data is static client import — skeleton rarely shows |

**Done:** Responsive grids, mobile nav drawer, bottom-sheet add modal, horizontal category tabs.

---

## 7. Checkout weaknesses

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | Cart cleared on WhatsApp open | `clearCart()` before user sends — lost order if they cancel |
| P1 | Delivery fee always 0 | Misleading totals |
| P1 | No order review step | Single button → external app |
| P1 | No minimum order check | Placeholder `minOrder: 0` |
| P2 | Hardcoded WhatsApp display | Checkout copy not from `getRestaurantWhatsAppPhone()` |
| P2 | Summary not sticky on mobile | `sticky top-24` only helps desktop |
| P3 | No order ID / timestamp | Hard to reference in WhatsApp thread |

**Done:** Full delivery form, Lebanon phone validation, order summary, localStorage cart, empty states.

---

## 8. WhatsApp ordering weaknesses

| Priority | Issue | Detail |
|----------|-------|--------|
| P0 | Cart cleared prematurely | See checkout §P0 |
| P1 | No “copy order” fallback | Desktop users without WhatsApp app |
| P1 | No send confirmation UX | No “we'll confirm on WhatsApp” messaging |
| P2 | Inconsistent URL builders | Contact builds `wa.me` inline vs `buildWhatsAppContactUrl()` |
| P2 | No order ID in message | Harder for kitchen to track |
| P2 | Add-ons not structured | Upgrades/combos appear as separate lines only |
| P3 | No order status | Expected for WhatsApp — but FriesLab adds clearer handoff copy |

**Done:** Structured message (customer, address, items, notes, totals), env-configurable number, multiple CTAs site-wide.

---

## FriesLab comparison

| Dimension | Bob's Burger | FriesLab-level target |
|-----------|--------------|----------------------|
| Photography | 39% real shots | Full-menu consistent food photos |
| Menu browse | 130 cards, heavy motion | Fast sections, minimal animation, lazy load |
| Customization | Notes only | Modifiers, combos, upsells |
| Trust | Unverified stats, stub hours | Real hours, fees, reviews |
| Mobile order | Cart after add | Persistent cart bar, clear post-send |
| Checkout | Clears cart on open | Review → send → confirm |

---

## Prioritized improvements (highest → lowest impact)

1. **Fix menu scroll performance** — remove per-card Framer Motion, dedupe renders, optimize images *(implemented in this pass)*
2. **Replace 79 placeholder images** or hide items without photos in grid
3. **Real opening hours + delivery fee + min order**
4. **Don't clear cart until WhatsApp order confirmed**
5. **Fix broken Tailwind tokens** (`mustard`/`ketchup` → map to design system)
6. **Branding assets** — favicon, OG image, fix Facebook URL
7. **Combo/modifier UX** for Upgrades + Value Meals
8. **Remove or verify hero stats** (5★, 30m)
9. **Contact form** — wire backend or remove fake success
10. **SEO** — JSON-LD, sitemap, item pages
11. **Menu virtualization** for very long lists
12. **Instagram lifestyle photography** import

---

## Menu performance audit

See **`MENU_PERFORMANCE_REPORT.md`** for the full technical analysis and fixes applied.

### Root causes of scroll lag (identified)

| Cause | Severity | Location |
|-------|----------|----------|
| Framer Motion `whileInView` on all 130 cards | **Critical** | `MenuItemCard.tsx` |
| Stagger delay `index * 0.05` (up to 6.5s) | **High** | `MenuItemCard.tsx` |
| `whileHover` + `scale-110` on images | **High** | `MenuItemCard.tsx` |
| 130 simultaneous `next/image` decode on scroll | **High** | Menu grid |
| Duplicate highlight cards in main list | **Medium** | `MenuPageClient.tsx` |
| `backdrop-blur-xl` on sticky bars | **Medium** | Header, category tabs |
| Full menu JSON in client bundle | **Medium** | `menu.ts` import |
| No image placeholders / blur | **Medium** | All menu images |
| Re-render all cards on filter change | **Low** | `MenuPageClient.tsx` |

### Fixes applied (this pass)

- Removed per-card Framer Motion; CSS-only hover with `@media (hover: hover)`
- `React.memo` on `MenuItemCard`
- Deduplicated highlights from “All Items” list
- Optimized `sizes`, explicit lazy loading, priority only for first visible row
- Image placeholder skeleton while loading
- Reduced sticky bar blur → solid background
- `content-visibility: auto` on menu cards for off-screen paint skip

---

*Report generated from codebase audit + `CONTENT_EXTRACTION_REPORT.md` + live menu data (`menu-extracted.json`: 130 items, 51 with images).*
