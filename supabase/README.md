# Supabase — Magnifico Street Food

This app uses a **dedicated Supabase project** — independent from BurgerHub.
Do not reuse old project URLs, keys, or database credentials.

## Before you connect

The public website runs without Supabase:

- Static menu from `src/data/magnifico-menu.json`
- Static branches from `src/data/branches.ts`
- Static settings from `src/data/restaurant.ts` + `src/config/site.ts`

Admin panel, live menu, image uploads, and branch CRUD require Supabase.

---

## 1. Create a new Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → choose org, name (e.g. `magnifico-street-food`), region, password
3. Wait for the project to finish provisioning

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in from **Project Settings → API**:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (secret — server/seed only) |

Restart the dev server after saving `.env.local`.

## 3. Apply database migrations

Run **all** migrations in order on the **new** empty database.
Do not import or restore BurgerHub data.

### Option A — Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Update `project_id` in `supabase/config.toml` when linking.

### Option B — SQL Editor (manual)

In the Supabase dashboard **SQL Editor**, run each file in
`supabase/migrations/` in numeric order:

| # | File |
|---|------|
| 001 | `001_initial_schema.sql` |
| 002 | `002_admin_auth_settings.sql` |
| 003 | `003_menu_badges.sql` |
| 004 | `004_category_icons.sql` |
| 005 | `005_currency_lbp_to_usd.sql` |
| 006 | `006_hero_image.sql` |
| 007 | `007_menu_item_display_order.sql` |
| 008 | `008_google_maps_url.sql` |
| 009 | `009_image_crop.sql` |
| 010 | `010_menu_banners.sql` |
| 011 | `011_menu_banners_simplify.sql` |
| 012 | `012_tiktok_url.sql` |
| 013 | `013_orders_dashboard.sql` |
| 014 | `014_checkout_method.sql` |
| 015 | `015_site_settings_social_urls.sql` |
| 016 | `016_create_public_order.sql` |
| 017 | `017_branches.sql` |
| 018 | `018_hero_content.sql` |
| 019 | `019_magnifico_site_defaults.sql` |

Migrations **017–019** are Magnifico-specific (branches, hero fields, brand defaults).

## 4. Auth URL configuration

In **Authentication → URL Configuration**:

| Setting | Local dev | Production |
|---------|-----------|------------|
| Site URL | `http://localhost:3000` | `https://your-domain.com` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://your-domain.com/auth/callback` |

## 5. Create the first admin user

1. **Authentication → Users → Add user** (email + password)
2. Confirm email if required by your project settings
3. A `profiles` row is auto-created with `role = 'admin'` (trigger from migration 002)

## 6. Seed the menu

```bash
npm run seed
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Seeds categories and menu
items from `src/data/magnifico-menu.json`. Image URLs are left empty — upload
photos via **Admin → Menu Items**.

## 7. Start the app

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

---

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin/login` | Email/password sign-in |
| `/admin` | Dashboard |
| `/admin/categories` | Menu categories |
| `/admin/menu` | Menu items, prices, images |
| `/admin/banners` | Menu page hero carousel |
| `/admin/branches` | Branch locations & contact |
| `/admin/settings` | Branding, hero, WhatsApp, hours |

## Security model

- **RLS** on all public tables
- Public read: menu, categories, site settings, active branches
- Admin write: `profiles.role` in `('admin', 'staff')` via `is_admin()`
- **Storage** bucket `menu-images` — public read, admin upload (migration 002)
- **Middleware** protects `/admin/*` (except login)

## Regenerate TypeScript types (after schema changes)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/supabase/types.ts
```

## Orders system

Built-in orders are **disabled** in app config (`siteConfig.ordersEnabled = false`).
Migrations 013 and 016 keep the schema intact for future use; `/orders` returns 404.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin login: "Supabase is not configured" | Copy `.env.example` → `.env.local`, add keys, restart dev server |
| `npm run seed` fails | Ensure `SUPABASE_SERVICE_ROLE_KEY` is set; run migrations first |
| Empty menu after connecting | Run `npm run seed` or add items in Admin |
| `branches table missing` | Run migration `017_branches.sql` |
| Image upload fails | Confirm `menu-images` storage bucket exists (migration 002) |
