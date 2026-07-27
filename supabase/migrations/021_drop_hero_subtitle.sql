-- Hero subtitle is no longer used; homepage shows title + CTAs only.
alter table public.site_settings
  drop column if exists hero_subtitle;
