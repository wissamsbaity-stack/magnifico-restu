drop index if exists public.menu_items_is_featured_idx;

alter table public.menu_items
  drop column if exists is_featured;

alter table public.menu_items
  add column if not exists is_best_seller boolean not null default false;

create index if not exists menu_items_is_best_seller_idx
  on public.menu_items(is_best_seller)
  where is_best_seller = true;
