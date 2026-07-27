-- Optional direct Google Maps link for the restaurant (mobile nav Location button).
alter table site_settings
  add column if not exists google_maps_url text;
