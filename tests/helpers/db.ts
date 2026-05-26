import { newDb } from "pg-mem";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    sku TEXT UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS stock_history (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change INTEGER NOT NULL,
    reason TEXT,
    reference_id TEXT,
    changed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE IF NOT EXISTS "user" (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT,
    password TEXT,
    phone TEXT,
    address TEXT,
    province_id INTEGER,
    city_id INTEGER,
    postal_code TEXT,
    role TEXT DEFAULT 'customer'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    order_date TEXT,
    total_product_price INTEGER NOT NULL,
    total_shipping_cost INTEGER NOT NULL,
    coupon_discount INTEGER NOT NULL DEFAULT 0,
    grand_total INTEGER NOT NULL,
    order_status TEXT DEFAULT 'pending',
    notes TEXT,
    guest_email TEXT,
    guest_name TEXT,
    guest_phone TEXT
  );

  CREATE TABLE IF NOT EXISTS saved_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    province_id INTEGER,
    city_id INTEGER,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    product_id TEXT,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    subtotal_weight INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    payment_gateway TEXT,
    external_id TEXT,
    checkout_url TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_date TEXT,
    payment_amount INTEGER,
    payment_proof TEXT
  );

  CREATE TABLE IF NOT EXISTS shipping (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    destination_province_id INTEGER,
    destination_city_id INTEGER,
    courier_code TEXT,
    courier_service TEXT,
    total_weight INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL,
    tracking_number TEXT,
    shipping_status TEXT DEFAULT 'pending',
    shipping_date TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'percentage',
    expiry TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    max_usage INTEGER DEFAULT 0
  );
`;

/**
 * Strip the `types` key from drizzle query configs before passing to pg-mem.
 * pg-mem does not support custom type parsers but drizzle always includes them.
 */
/**
 * Patch a pg query result to convert object rows → array rows when
 * `rowMode: "array"` was requested but pg-mem returned object rows.
 */
function fixResult(result: any, wasArrayMode: boolean) {
  if (!wasArrayMode || !result || !Array.isArray(result.rows)) return result;
  if (result.rows.length === 0) return result;
  if (Array.isArray(result.rows[0])) return result; // already arrays
  const fieldNames: string[] = result.fields?.map((f: any) => f.name) ?? [];
  const fields: string[] = fieldNames.length > 0 ? fieldNames : Object.keys(result.rows[0]);
  return {
    ...result,
    rows: result.rows.map((row: any) => fields.map((f) => row[f])),
  };
}

/** Normalize a drizzle query config for pg-mem compatibility */
function normalizeQuery(queryOrText: any): { q: any; arrayMode: boolean } {
  if (!queryOrText || typeof queryOrText !== "object") {
    return { q: queryOrText, arrayMode: false };
  }
  const { types: _t, rowMode, ...rest } = queryOrText;
  return { q: rest, arrayMode: rowMode === "array" };
}

function patchClient(client: any) {
  const originalQuery = client.query.bind(client);
  client.query = async (queryOrText: any, values?: any[]) => {
    const { q, arrayMode } = normalizeQuery(queryOrText);
    const result = await originalQuery(q, values);
    return fixResult(result, arrayMode);
  };
  return client;
}

function patchPool(PoolClass: any) {
  return class PatchedPool extends PoolClass {
    async query(queryOrText: any, values?: any[]) {
      const { q, arrayMode } = normalizeQuery(queryOrText);
      const result = await super.query(q, values);
      return fixResult(result, arrayMode);
    }

    connect() {
      return super.connect().then(patchClient);
    }
  };
}

export function createTestDb() {
  const mem = newDb();
  mem.public.none(CREATE_TABLES_SQL);

  const { Pool } = mem.adapters.createPg();
  const PatchedPool = patchPool(Pool);
  const pool = new PatchedPool();

  const db = drizzle(pool as any, { schema });

  return { db };
}
