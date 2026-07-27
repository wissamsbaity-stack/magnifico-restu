-- Allow anonymous customers to place orders and receive the assigned order number
-- without granting public SELECT on the orders table (RLS blocks INSERT … RETURNING).

create or replace function public.create_public_order(
  p_customer_name text,
  p_customer_phone text,
  p_city text,
  p_street text,
  p_building text,
  p_delivery_instructions text,
  p_items jsonb,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_order_type text
)
returns table (id uuid, order_number integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_order_number integer;
begin
  if p_order_type not in ('delivery', 'pickup') then
    raise exception 'Invalid order_type: %', p_order_type
      using errcode = '22023';
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'customer_name is required'
      using errcode = '23502';
  end if;

  if coalesce(trim(p_customer_phone), '') = '' then
    raise exception 'customer_phone is required'
      using errcode = '23502';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items must be a non-empty array'
      using errcode = '23514';
  end if;

  if p_subtotal is null or p_delivery_fee is null or p_total is null then
    raise exception 'subtotal, delivery_fee, and total are required'
      using errcode = '23502';
  end if;

  if p_order_type = 'delivery' then
    if coalesce(trim(p_city), '') = ''
      or coalesce(trim(p_street), '') = ''
      or coalesce(trim(p_building), '') = ''
    then
      raise exception 'Delivery address (city, street, building) is required'
        using errcode = '23514';
    end if;
  end if;

  insert into public.orders (
    customer_name,
    customer_phone,
    city,
    street,
    building,
    delivery_instructions,
    items,
    subtotal,
    delivery_fee,
    total,
    order_type,
    is_read,
    status
  )
  values (
    trim(p_customer_name),
    trim(p_customer_phone),
    case when p_order_type = 'delivery' then trim(p_city) else null end,
    case when p_order_type = 'delivery' then trim(p_street) else null end,
    case when p_order_type = 'delivery' then trim(p_building) else null end,
    nullif(trim(coalesce(p_delivery_instructions, '')), ''),
    p_items,
    p_subtotal,
    p_delivery_fee,
    p_total,
    p_order_type,
    false,
    'pending'
  )
  returning public.orders.id, public.orders.order_number
  into v_id, v_order_number;

  return query select v_id, v_order_number;
end;
$$;

revoke all on function public.create_public_order(
  text, text, text, text, text, text, jsonb, numeric, numeric, numeric, text
) from public;

grant execute on function public.create_public_order(
  text, text, text, text, text, text, jsonb, numeric, numeric, numeric, text
) to anon, authenticated;

-- Ensure anonymous inserts remain allowed (direct insert fallback).
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);
