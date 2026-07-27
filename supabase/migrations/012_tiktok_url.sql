-- Optional TikTok profile URL for homepage social links.
alter table public.site_settings
  add column if not exists tiktok_url text;
