-- Add a single Restaurant Hero Image setting.
--
-- This replaces the older (already-removed) cover_url / hero_image_url image
-- fields with one purpose-built hero image shown on the homepage. The column
-- is nullable; when empty the site falls back to the restaurant logo.

alter table site_settings
  add column if not exists hero_image_url text;
