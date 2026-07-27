-- Checkout method: whatsapp (default) or builtin

alter table public.site_settings
  add column if not exists checkout_method text not null default 'whatsapp'
    check (checkout_method in ('whatsapp', 'builtin'));
