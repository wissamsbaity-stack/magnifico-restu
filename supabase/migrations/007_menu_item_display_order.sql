-- Optional per-item display order within a category (lower = first).
alter table menu_items
  add column if not exists display_order integer not null default 0;
