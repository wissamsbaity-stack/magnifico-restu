-- Move legacy Settings "fallback hero image" into menu_banners so it appears
-- in Admin → Hero Banners and is the single source for the homepage slider.
insert into public.menu_banners (image_url, image_crop, caption, sort_order, is_enabled)
select
  s.hero_image_url,
  s.hero_image_crop,
  null,
  0,
  true
from public.site_settings s
where s.hero_image_url is not null
  and trim(s.hero_image_url) <> ''
  and not exists (
    select 1
    from public.menu_banners b
    where b.image_url = s.hero_image_url
  );

update public.site_settings
set
  hero_image_url = null,
  hero_image_crop = null
where hero_image_url is not null;
