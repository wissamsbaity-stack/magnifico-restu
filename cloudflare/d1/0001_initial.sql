PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS content_version (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO content_version (id, version) VALUES (1, 1);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  original_key TEXT NOT NULL UNIQUE,
  display_key TEXT,
  thumbnail_key TEXT,
  original_filename TEXT,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  bytes INTEGER NOT NULL CHECK (bytes >= 0),
  checksum_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  image_url TEXT,
  media_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  is_popular INTEGER NOT NULL DEFAULT 0 CHECK (is_popular IN (0, 1)),
  is_best_seller INTEGER NOT NULL DEFAULT 0 CHECK (is_best_seller IN (0, 1)),
  is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
  tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
  display_order INTEGER NOT NULL DEFAULT 0,
  image_crop TEXT CHECK (image_crop IS NULL OR json_valid(image_crop)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS menu_banners (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  media_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  image_crop TEXT CHECK (image_crop IS NULL OR json_valid(image_crop)),
  caption TEXT,
  click_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  whatsapp_phone TEXT,
  google_maps_url TEXT,
  image_url TEXT,
  media_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  image_crop TEXT CHECK (image_crop IS NULL OR json_valid(image_crop)),
  opening_hours TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(opening_hours)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  singleton INTEGER NOT NULL DEFAULT 1 UNIQUE CHECK (singleton = 1),
  restaurant_name TEXT NOT NULL,
  legal_name TEXT,
  tagline TEXT,
  whatsapp_phone TEXT NOT NULL,
  phone_primary TEXT,
  phone_secondary TEXT,
  email TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT,
  opening_hours TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(opening_hours)),
  delivery_fee REAL NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  min_order REAL NOT NULL DEFAULT 0 CHECK (min_order >= 0),
  checkout_method TEXT NOT NULL DEFAULT 'whatsapp',
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  hero_image_crop TEXT CHECK (hero_image_crop IS NULL OR json_valid(hero_image_crop)),
  google_maps_url TEXT,
  site_url TEXT,
  meta_description TEXT,
  hero_title TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Retained for backup fidelity. Production admin authentication will be
-- provided by Cloudflare Access rather than passwords stored in D1.
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Historical order data is preserved even though live checkout remains
-- WhatsApp-only and does not write orders to D1.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  city TEXT,
  street TEXT,
  building TEXT,
  delivery_instructions TEXT,
  items TEXT NOT NULL CHECK (json_valid(items)),
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  delivery_fee REAL NOT NULL CHECK (delivery_fee >= 0),
  total REAL NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  order_type TEXT NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
  order_number INTEGER,
  is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS categories_sort_order_idx
  ON categories(sort_order);
CREATE INDEX IF NOT EXISTS menu_items_category_order_idx
  ON menu_items(category_id, display_order);
CREATE INDEX IF NOT EXISTS menu_items_available_idx
  ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS menu_banners_enabled_order_idx
  ON menu_banners(is_enabled, sort_order);
CREATE INDEX IF NOT EXISTS branches_active_order_idx
  ON branches(is_active, sort_order);
CREATE INDEX IF NOT EXISTS orders_created_at_idx
  ON orders(created_at DESC);

CREATE TRIGGER IF NOT EXISTS categories_touch_updated_at
AFTER UPDATE ON categories
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE categories
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS menu_items_touch_updated_at
AFTER UPDATE ON menu_items
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE menu_items
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS menu_banners_touch_updated_at
AFTER UPDATE ON menu_banners
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE menu_banners
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS branches_touch_updated_at
AFTER UPDATE ON branches
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE branches
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS site_settings_touch_updated_at
AFTER UPDATE ON site_settings
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE site_settings
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;
