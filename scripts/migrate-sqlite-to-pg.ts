/**
 * Script migrasi data dari SQLite ke PostgreSQL
 * Jalankan: DATABASE_URL=... npx tsx scripts/migrate-sqlite-to-pg.ts
 */

import Database from "better-sqlite3";
import { Pool } from "pg";

const PG_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:HqxtrabPIZku0JBA8g5BFB2ZLPY6bJ580xPIbaF9yOBsyS9AYRXvrrQs4hDGSndb@187.77.147.182:5435/simbiocommerce";

const sqlite = new Database("sqlite.db");
const pool = new Pool({ connectionString: PG_URL });

// Urutan tabel berdasarkan FK dependency (parent dulu)
const TABLES_IN_ORDER = [
  "categories",
  "user",
  "post_categories",
  "products",
  "product_images",
  "stock_history",
  "orders",
  "saved_addresses",
  "order_items",
  "payments",
  "shipping",
  "coupons",
  "posts",
  "reviews",
  "hero_slides",
  "store_settings",
  "shipping_origins",
  "hero_features",
  "promo_banners",
  "countdown_settings",
  "store_info",
  "seo_settings",
  "testimonials",
  "newsletter_subscribers",
  "contact_messages",
  "wishlists",
  "recently_viewed",
  "settings_audit_log",
  "account",
  "session",
  "verificationToken",
];

// Kolom boolean di SQLite disimpan sebagai integer 0/1, perlu konversi ke true/false
const BOOLEAN_COLUMNS: Record<string, string[]> = {
  products: ["is_active"],
  product_images: ["is_primary"],
  hero_slides: ["is_new_tab", "is_active"],
  shipping_origins: ["is_default", "is_active"],
  hero_features: ["is_active"],
  promo_banners: ["is_new_tab", "is_active"],
  countdown_settings: ["is_new_tab", "is_active"],
  seo_settings: ["is_active"],
  testimonials: ["is_active"],
  newsletter_subscribers: ["is_active"],
  saved_addresses: ["is_default"],
};

async function migrateTable(tableName: string) {
  const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all() as any[];
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows — skip`);
    return;
  }

  const boolCols = BOOLEAN_COLUMNS[tableName] ?? [];

  // Convert boolean columns dari 0/1 ke true/false
  const converted = rows.map((row) => {
    const r = { ...row };
    for (const col of boolCols) {
      if (col in r) {
        r[col] = r[col] === 1 || r[col] === true;
      }
    }
    return r;
  });

  const cols = Object.keys(converted[0]);
  const pgClient = await pool.connect();

  try {
    await pgClient.query("BEGIN");

    for (const row of converted) {
      const values = cols.map((c) => (row[c] === undefined ? null : row[c]));
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      const colList = cols.map((c) => `"${c}"`).join(", ");

      await pgClient.query(
        `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
    }

    await pgClient.query("COMMIT");
    console.log(`  ${tableName}: ${converted.length} rows migrated ✓`);
  } catch (err: any) {
    await pgClient.query("ROLLBACK");
    console.error(`  ${tableName}: ERROR — ${err.message}`);
  } finally {
    pgClient.release();
  }
}

async function main() {
  console.log("Migrasi SQLite → PostgreSQL dimulai...\n");

  // Disable FK checks sementara di PostgreSQL
  const client = await pool.connect();
  await client.query("SET session_replication_role = replica");
  client.release();

  for (const table of TABLES_IN_ORDER) {
    await migrateTable(table);
  }

  // Re-enable FK checks
  const client2 = await pool.connect();
  await client2.query("SET session_replication_role = DEFAULT");
  client2.release();

  await pool.end();
  sqlite.close();
  console.log("\nMigrasi selesai!");
}

main().catch(console.error);
