-- Orders dashboard: read tracking, order numbers, pickup support, realtime, delete policy

create sequence if not exists public.order_number_seq start 1001;

alter table public.orders
  add column if not exists order_type text not null default 'delivery'
    check (order_type in ('delivery', 'pickup'));

alter table public.orders
  add column if not exists is_read boolean not null default false;

alter table public.orders
  add column if not exists order_number integer;

alter table public.orders alter column city drop not null;
alter table public.orders alter column street drop not null;
alter table public.orders alter column building drop not null;

create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := nextval('public.order_number_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_assign_number on public.orders;
create trigger orders_assign_number
  before insert on public.orders
  for each row execute function public.assign_order_number();

create index if not exists orders_unread_created_idx
  on public.orders (created_at desc)
  where is_read = false;

create index if not exists orders_read_created_idx
  on public.orders (created_at desc)
  where is_read = true;

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  using (public.is_admin());

alter table public.orders replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;
