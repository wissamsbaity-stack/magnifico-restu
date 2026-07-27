alter table public.categories
  add column if not exists icon text;

update public.categories
set icon = 'cookie'
where slug = 'appetizers' and icon is null;

update public.categories
set icon = 'beef'
where slug = 'beef-burgers' and icon is null;

update public.categories
set icon = 'flame'
where slug = 'chicken-burgers' and icon is null;

update public.categories
set icon = 'droplet'
where slug = 'dips' and icon is null;

update public.categories
set icon = 'cup-soda'
where slug = 'beverages' and icon is null;
