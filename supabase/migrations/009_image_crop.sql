-- Non-destructive crop settings for uploaded images.
-- Stores { zoom, x, y } as JSON; null means "no crop / show full image".
alter table menu_items
  add column if not exists image_crop jsonb;

alter table site_settings
  add column if not exists hero_image_crop jsonb;
