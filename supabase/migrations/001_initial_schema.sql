create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_popular boolean not null default false,
  is_best_seller boolean not null default false,
  is_available boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  city text not null,
  street text not null,
  building text not null,
  delivery_instructions text,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null,
  total numeric(10, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_id_idx on public.menu_items(category_id);
create index if not exists menu_items_is_best_seller_idx on public.menu_items(is_best_seller) where is_best_seller = true;
create index if not exists menu_items_is_popular_idx on public.menu_items(is_popular) where is_popular = true;
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

create policy "Public can read categories"
  on public.categories for select
  using (true);

create policy "Public can read available menu items"
  on public.menu_items for select
  using (is_available = true);

create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);
