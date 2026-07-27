-- Ensure social URL columns exist on site_settings (safe to re-run).
-- Older databases may predate tiktok_url or be missing renamed columns.

alter table public.site_settings
  add column if not exists instagram_url text;

alter table public.site_settings
  add column if not exists facebook_url text;

alter table public.site_settings
  add column if not exists tiktok_url text;
