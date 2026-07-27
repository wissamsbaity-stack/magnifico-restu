-- Convert existing prices from Lebanese Pound (LBP) to US Dollar (USD).
--
-- Historical data stored large LBP values (e.g. 125000). The whole app now
-- works in USD, so convert at a fixed rate of 15000 LBP = 1 USD, rounded to
-- the nearest dollar with a $1 minimum.
--
-- The `WHERE ... >= 1000` guards make this migration idempotent-ish: USD prices
-- are small (< ~1000), so re-running will not re-divide already-converted rows.

update menu_items
set price = greatest(1, round(price / 15000.0))
where price >= 1000;

update site_settings
set delivery_fee = round(delivery_fee / 15000.0)
where delivery_fee >= 1000;

update site_settings
set min_order = round(min_order / 15000.0)
where min_order >= 1000;
