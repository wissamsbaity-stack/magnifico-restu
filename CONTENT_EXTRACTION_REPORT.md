# Bob's Burger — Content Extraction Report

Generated: 2026-06-13

## Sources

| Source | URL | Status |
|--------|-----|--------|
| Digital menu (Omega POS) | https://menu.omegasoftware.ca/bobs | **Full menu extracted** |
| Instagram | https://www.instagram.com/bobburger.lb | **Partial** (bio + public metadata) |

---

## Successfully extracted

### Restaurant identity
- **Legal name:** BOB'S BURGER & MORE S.A.R.L
- **Brand name:** Bob's Burger
- **Location:** Near Zarifa Cafe, Aramoun, Lebanon
- **Coordinates:** 33.7903, 35.4877
- **Instagram:** @bobburger.lb (13.1K followers, 423 posts)
- **Facebook:** bobs burger & more sarl
- **Email:** ahmad.kob.1@gmail.com (from POS system)

### Contact numbers (from Instagram + POS)
- 70/012 935
- 05/807 432
- 70 033 430 (POS primary)

### Branding assets (public URLs)
- **Logo:** `https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/2.jpg`
- **Cover:** `https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/cover8_2.jpg`
- **Hero burger photo:** Swiss Mix from live menu (`ysf04056_6.png`)

### Menu data (`src/data/menu-extracted.json`)
- **130 menu items** with real names, descriptions, and LBP prices
- **10 categories:** Sides, Baked Potato, Wraps & Subs, Beef Burgers, Angus Burgers, Chicken Burgers, Upgrades, Beverages, Add-Ons, Value Meals
- **Currency:** LBP (LL) — e.g. 270,000 LL
- **Product images:** ~60% of items have photos on S3; remainder use logo placeholder

### POS flags
- **Popular items in POS:** 0 (none flagged)
- **Featured/New items in POS:** 0 (none flagged)
- Website uses **visual highlights** (burger items with real photos) — no fake `isFeatured`/`isPopular` flags in data

### WhatsApp order number (user-provided)
- **96170583901** (+961 70 583 901) — configured in `.env.local.example`

---

## Requires manual input from you

| Item | Why |
|------|-----|
| **Opening hours** | Instagram says "Check Instagram" — no structured hours in POS or bio |
| **Delivery fee** | Not in menu API — currently set to 0 LL |
| **Minimum order** | Not exposed in extracted data |
| **5★ rating / 30m prep time** | Marketing copy on homepage design — not verified from POS/Instagram |
| **High-res logo file** | Using S3 URL; local SVG/PNG preferred for offline/faster load |
| **Items without images** | ~40 items need photos uploaded or photographed |

---

## Could not access automatically

| Item | Action needed |
|------|---------------|
| Instagram post images | Login wall / rate limits — provide hero photos or approve S3 menu images |
| Instagram Stories/highlights | Not scraped |
| Facebook page content | URL slug only from POS |
| Google Maps exact pin | Using coordinates from POS; verify on map |
| Allergy/nutrition data | Available in POS but not imported yet |

---

## Files generated

- `src/data/menu-extracted.json` — full structured menu for Supabase import
- `src/data/menu.ts` — TypeScript loader from JSON
- `src/data/restaurant.ts` — restaurant constants
- `scripts/parse-menu.ps1` — re-extract from Omega menu
- `scripts/generate-menu-ts.ps1` — regenerate TS (use fixed version or manual menu.ts)

---

## Re-extracting menu (when prices change)

1. Open https://menu.omegasoftware.ca/bobs in browser
2. Run `scripts/parse-menu.ps1` (requires browser CDP extract saved to browser-logs)
3. Or re-run the Angular scope extraction and update `menu-extracted.json`
