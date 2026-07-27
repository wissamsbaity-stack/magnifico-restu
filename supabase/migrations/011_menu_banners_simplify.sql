-- Simplify menu_banners: optional caption + optional click link only.
alter table public.menu_banners rename column title to caption;
alter table public.menu_banners rename column cta_link to click_link;
alter table public.menu_banners drop column if exists subtitle;
alter table public.menu_banners drop column if exists cta_text;
