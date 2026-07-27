-- Magnifico: multi-branch system (migration 017)
--
-- All branches share the same menu (categories / menu_items). Each branch has
-- its own contact and location details. The customer picks a branch on first
-- visit (stored client-side); the active branch drives WhatsApp, phone, maps,
-- address, and opening hours across the site.

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  address text,
  phone text,
  whatsapp_phone text,
  google_maps_url text,
  image_url text,
  image_crop jsonb,
  opening_hours jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists branches_sort_order_idx on public.branches (sort_order);

drop trigger if exists branches_updated_at on public.branches;
create trigger branches_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();

alter table public.branches enable row level security;

drop policy if exists "branches public read" on public.branches;
create policy "branches public read" on public.branches
  for select
  using (is_active = true or public.is_admin());

drop policy if exists "branches admin insert" on public.branches;
create policy "branches admin insert" on public.branches
  for insert
  with check (public.is_admin());

drop policy if exists "branches admin update" on public.branches;
create policy "branches admin update" on public.branches
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "branches admin delete" on public.branches;
create policy "branches admin delete" on public.branches
  for delete
  using (public.is_admin());

-- Placeholder Magnifico branches — edit in Admin → Branches after go-live.
insert into public.branches (
  name,
  slug,
  address,
  phone,
  whatsapp_phone,
  google_maps_url,
  opening_hours,
  sort_order,
  is_active
)
values
  (
    'Autostrade Sayed Hadi',
    'sayed-hadi',
    'Autostrade Sayed Hadi, Beirut, Lebanon',
    '81 999 162',
    '96181999162',
    '',
    '[{"days":"Daily","time":"11:00 AM - 1:00 AM"}]'::jsonb,
    0,
    true
  ),
  (
    'Centro Mall',
    'centro-mall',
    'Centro Mall, Lebanon',
    '',
    '96181999162',
    '',
    '[{"days":"Daily","time":"11:00 AM - 11:00 PM"}]'::jsonb,
    1,
    true
  ),
  (
    'Dahye Food Truck',
    'dahye-food-truck',
    'Old Saida Road, facing Hachem Gas Station, Dahye, Lebanon',
    '',
    '96181999162',
    '',
    '[{"days":"Daily","time":"5:30 PM - 12:00 AM"}]'::jsonb,
    2,
    true
  )
on conflict (slug) do nothing;
