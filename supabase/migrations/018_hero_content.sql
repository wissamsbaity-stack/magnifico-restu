-- Magnifico: admin-editable homepage hero (migration 018)
--
-- Title, subtitle, and hero button labels become editable from Admin → Settings.
-- Hero background image uses hero_image_url + hero_image_crop (migrations 006/009).
-- All columns are nullable — the app falls back to HERO_DEFAULTS when empty.

alter table public.site_settings
  add column if not exists hero_title text,
  add column if not exists hero_subtitle text,
  add column if not exists hero_primary_label text,
  add column if not exists hero_secondary_label text,
  add column if not exists hero_secondary_link text;
