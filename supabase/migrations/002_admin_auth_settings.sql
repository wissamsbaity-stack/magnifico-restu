create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  restaurant_name text not null default 'Bob''s Burger',
  legal_name text,
  tagline text,
  whatsapp_phone text not null default '96170583901',
  phone_primary text,
  phone_secondary text,
  email text,
  address_street text,
  address_city text,
  address_state text,
  address_country text default 'Lebanon',
  opening_hours jsonb not null default '[]'::jsonb,
  delivery_fee numeric(12, 2) not null default 0,
  min_order numeric(12, 2) not null default 0,
  instagram_url text,
  facebook_url text,
  logo_url text,
  cover_url text,
  hero_image_url text,
  site_url text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

insert into public.site_settings (
  restaurant_name,
  legal_name,
  tagline,
  whatsapp_phone,
  phone_primary,
  phone_secondary,
  email,
  address_street,
  address_city,
  address_country,
  opening_hours,
  instagram_url,
  logo_url,
  cover_url,
  hero_image_url,
  meta_description
) values (
  'Bob''s Burger',
  'BOB''S BURGER & MORE S.A.R.L',
  'Craft burgers & more — delivered across Lebanon',
  '96170583901',
  '70/012 935',
  '05/807 432',
  'ahmad.kob.1@gmail.com',
  'Near Zarifa Cafe',
  'Aramoun',
  'Lebanon',
  '[{"days":"Daily","time":"Check Instagram for hours"}]'::jsonb,
  'https://www.instagram.com/bobburger.lb',
  'https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/2.jpg',
  'https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/omenu/cover8_2.jpg',
  'https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/57069/SalesItems/ysf03919_2.png',
  'Char-grilled burgers delivered across Lebanon via WhatsApp.'
) on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (public.is_admin());

create policy "Admins can insert site settings"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

create policy "Admins can read all menu items"
  on public.menu_items for select
  using (public.is_admin() or is_available = true);

drop policy if exists "Public can read available menu items" on public.menu_items;

create policy "Public can read available menu items"
  on public.menu_items for select
  using (is_available = true);

create policy "Admins can insert menu items"
  on public.menu_items for insert
  with check (public.is_admin());

create policy "Admins can update menu items"
  on public.menu_items for update
  using (public.is_admin());

create policy "Admins can delete menu items"
  on public.menu_items for delete
  using (public.is_admin());

create policy "Admins can read orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) on conflict (id) do nothing;

create policy "Public read menu images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "Admins upload menu images"
  on storage.objects for insert
  with check (bucket_id = 'menu-images' and public.is_admin());

create policy "Admins update menu images"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_admin());

create policy "Admins delete menu images"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_admin());
