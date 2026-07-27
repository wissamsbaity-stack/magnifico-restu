-- Hero CTA button labels and menu link are fixed in the app; no longer editable from admin.
alter table public.site_settings
  drop column if exists hero_primary_label,
  drop column if exists hero_secondary_label,
  drop column if exists hero_secondary_link;
