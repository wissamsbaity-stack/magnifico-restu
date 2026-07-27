-- Menu page hero banners (carousel slides).
create table if not exists public.menu_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_crop jsonb,
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menu_banners_updated_at
  before update on public.menu_banners
  for each row execute function public.set_updated_at();

alter table public.menu_banners enable row level security;

create policy "Public can read enabled menu banners"
  on public.menu_banners for select
  using (is_enabled = true);

create policy "Admins can read all menu banners"
  on public.menu_banners for select
  using (public.is_admin());

create policy "Admins can insert menu banners"
  on public.menu_banners for insert
  with check (public.is_admin());

create policy "Admins can update menu banners"
  on public.menu_banners for update
  using (public.is_admin());

create policy "Admins can delete menu banners"
  on public.menu_banners for delete
  using (public.is_admin());
