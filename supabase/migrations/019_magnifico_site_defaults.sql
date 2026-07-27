-- Magnifico: replace legacy platform seed defaults with Magnifico Street Food.
--
-- Migration 002 inserts a generic restaurant-platform singleton row. This
-- migration rewrites that row for Magnifico on a fresh Supabase project.
-- Safe to re-run: only updates the singleton settings row.

update public.site_settings
set
  restaurant_name = 'Magnifico Street Food',
  legal_name = 'Magnifico Street Food',
  tagline = 'Bold Lebanese street food',
  whatsapp_phone = '96181999162',
  phone_primary = '81 999 162',
  phone_secondary = null,
  email = 'hello@magnificostreetfood.com',
  address_street = 'Autostrade Sayed Hadi',
  address_city = 'Beirut',
  address_state = 'Lebanon',
  address_country = 'Lebanon',
  opening_hours = '[{"days":"Daily","time":"11:00 AM - 1:00 AM"}]'::jsonb,
  delivery_fee = 0,
  min_order = 0,
  checkout_method = 'whatsapp',
  instagram_url = 'https://www.instagram.com/magnificostreetfood',
  facebook_url = null,
  tiktok_url = null,
  logo_url = null,
  hero_image_url = null,
  hero_image_crop = null,
  google_maps_url = null,
  site_url = null,
  meta_description = 'Bold Lebanese street food — burgers, wraps, taco boxes and more, ordered via WhatsApp.',
  hero_title = 'Bold Lebanese street food',
  hero_subtitle = 'Burgers, wraps, taco boxes & more — done magnifico.',
  hero_primary_label = 'Order on WhatsApp',
  hero_secondary_label = 'Browse the menu',
  hero_secondary_link = '/menu'
where singleton = true;
