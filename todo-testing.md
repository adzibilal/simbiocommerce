# Testing Plan — Simbiocommerce

Stack yang dipilih: **Vitest** (unit) + **Playwright** (E2E)

Alasan:
- Vitest kompatibel dengan Next.js + TypeScript tanpa konfigurasi besar, lebih cepat dari Jest
- Playwright lebih stabil untuk Next.js App Router dibanding Cypress, support multi-browser

---

## 1. Setup (kerjakan duluan)

### 1.1 Vitest

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
npm install -D @vitest/coverage-v8
```

Buat `vitest.config.ts` di root:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",        // server actions pakai node
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
```

Tambah scripts di `package.json`:
```json
"test": "vitest",
"test:coverage": "vitest run --coverage"
```

### 1.2 Playwright

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Buat `playwright.config.ts` di root:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Tambah scripts di `package.json`:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### 1.3 Setup file & test DB

Buat `tests/setup.ts`:
```ts
// Mock environment variables untuk test
process.env.DATABASE_URL = ":memory:";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
```

Buat `tests/helpers/db.ts` — helper untuk init SQLite in-memory DB sebelum tiap test:
```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

export function createTestDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });
  // run migrations / create tables
  return { db, sqlite };
}
```

---

## 2. Unit Test — Server Actions

Lokasi: `tests/unit/`

### 2.1 `createOrder` — prioritas tertinggi

File: `tests/unit/order.test.ts`

**Test cases:**

| # | Nama | Skenario | Expected |
|---|------|----------|----------|
| 1 | `berhasil membuat order` | Data valid, stok cukup | `{ success: true, orderId: string }` |
| 2 | `gagal jika stok tidak cukup` | qty > stock | `{ success: false, error: "Stok ... tidak cukup" }` |
| 3 | `gagal jika produk tidak ditemukan` | productId tidak ada di DB | `{ success: false, error: "Produk tidak ditemukan" }` |
| 4 | `stok terdeduct setelah order` | order qty 2 dari stok 5 | stok jadi 3 di DB |
| 5 | `rollback jika salah satu item gagal` | item ke-2 stok habis | stok item ke-1 tidak berubah |
| 6 | `stockHistory tercatat` | order berhasil | 1 row di stock_history per item |
| 7 | `coupon discount diterapkan` | couponDiscount: 10000 | grandTotal = subtotal + shipping - 10000 |
| 8 | `guest order (tanpa userId)` | userId: undefined | order berhasil, guestEmail tersimpan |
| 9 | `validasi Zod — items kosong` | items: [] | `{ success: false, error: "Keranjang kosong" }` |
| 10 | `validasi Zod — paymentMethod tidak valid` | paymentMethod: "bitcoin" | `{ success: false }` |
| 11 | `race condition — concurrent orders` | 2 order paralel, stok = 1, qty masing-masing 1 | hanya 1 yang berhasil |

### 2.2 `payment` — syncPaymentStatus

File: `tests/unit/payment.test.ts`

**Test cases:**

| # | Nama | Skenario | Expected |
|---|------|----------|----------|
| 1 | `update status ke paid` | Midtrans return capture | orderStatus → "processing", paymentStatus → "paid" |
| 2 | `update status ke pending` | Midtrans return pending | paymentStatus → "pending" |
| 3 | `tidak update jika sudah paid` | order sudah paid | tidak ada perubahan |
| 4 | `handle orderId tidak ditemukan` | orderId tidak ada | tidak throw, return gracefully |

### 2.3 `validateCoupon`

File: `tests/unit/coupon.test.ts`

| # | Nama | Expected |
|---|------|----------|
| 1 | `kupon valid percentage` | diskon = subtotal * persen |
| 2 | `kupon valid fixed` | diskon = nilai fixed |
| 3 | `kupon expired` | `{ valid: false, error: "Kupon sudah expired" }` |
| 4 | `kupon tidak aktif` | `{ valid: false }` |
| 5 | `kupon melebihi max usage` | `{ valid: false }` |

### 2.4 `parseSchema` / validasi

File: `tests/unit/validation.test.ts`

| # | Nama | Expected |
|---|------|----------|
| 1 | `createOrderSchema valid` | `{ success: true }` |
| 2 | `createOrderSchema — qris diterima` | success |
| 3 | `createOrderSchema — userId optional` | success tanpa userId |
| 4 | `sanitizeString — strip HTML tags` | `"<script>"` → `""` |
| 5 | `submitReviewSchema — rating di luar 1-5` | `{ success: false }` |

---

## 3. E2E Test — Checkout Flow

Lokasi: `tests/e2e/`

> Semua E2E test jalankan dengan server dev (`npm run dev`) dan DB seeded.
> Gunakan `tests/e2e/fixtures/` untuk data seed yang konsisten.

### 3.1 Happy path — COD

File: `tests/e2e/checkout-cod.spec.ts`

```
1. Buka /shop
2. Klik produk → tambah ke cart
3. Buka cart → klik Checkout
4. Isi billing: nama, email, phone, alamat
5. Pilih tujuan pengiriman (kota)
6. Tunggu ongkir load → pilih kurir
7. Pilih metode COD
8. Klik "Pesan Sekarang" → konfirmasi modal muncul
9. Klik "Konfirmasi Pesanan"
10. Redirect ke /order-success?orderId=...
11. Assert: halaman tampil "Pesanan Berhasil"
12. Assert: order ID tampil
13. Assert: total benar
```

### 3.2 Happy path — Bank Transfer

File: `tests/e2e/checkout-bank-transfer.spec.ts`

```
1–7. Sama seperti COD
8. Pilih Transfer Bank
9. Klik "Pesan Sekarang" → modal konfirmasi tampil rekening bank
10. Klik "Buat Pesanan"
11. Redirect ke /order-success
12. Assert: PaymentInfoModal trigger button "Lihat Rekening Transfer" tampil
13. Klik button → modal buka, rekening tampil
14. Assert: form upload bukti transfer tampil
```

### 3.3 Happy path — QRIS

File: `tests/e2e/checkout-qris.spec.ts`

```
1–7. Sama seperti COD
8. Pilih QRIS
9. Klik "Pesan Sekarang" → modal konfirmasi QRIS tampil
10. Klik "Buat Pesanan"
11. Redirect ke /order-success
12. Assert: PaymentInfoModal auto-open (gambar QRIS tampil)
13. Tutup modal → button "Lihat QRIS" masih ada
14. Klik button → modal buka lagi
15. Assert: form upload bukti tampil
```

### 3.4 Guest checkout

File: `tests/e2e/checkout-guest.spec.ts`

```
1. Pastikan tidak ada session (logout)
2. Tambah produk ke cart
3. Buka /checkout
4. Assert: banner "Sudah punya akun? Login" tampil (bukan block)
5. Isi form billing lengkap
6. Pilih shipping + payment method
7. Submit → order berhasil
8. Assert: redirect ke /order-success
```

### 3.5 Validasi form

File: `tests/e2e/checkout-validation.spec.ts`

```
1. Buka /checkout dengan cart berisi item
2. Langsung klik submit tanpa isi form
3. Assert: error "Lengkapi data diri terlebih dahulu" tampil
4. Isi billing tapi tidak pilih shipping
5. Assert: error "Pilih metode pengiriman"
6. Isi semua tapi tidak pilih payment method
7. Assert: error "Pilih metode pembayaran"
```

### 3.6 Stok habis

File: `tests/e2e/checkout-out-of-stock.spec.ts`

```
1. Set stok produk ke 0 via admin atau langsung DB
2. Tambah produk ke cart
3. Submit checkout
4. Assert: error "Stok ... tidak cukup" tampil di halaman
5. Assert: tidak ada order baru di DB
```

---

## 4. Prioritas Pengerjaan

| Urutan | Item | Alasan |
|--------|------|--------|
| 1 | Setup Vitest + test DB helper | Blocker semua unit test |
| 2 | `createOrder` unit tests (cases 1–8) | Logic paling kritis, paling sering berubah |
| 3 | `parseSchema` / validation tests | Cepat ditulis, coverage tinggi |
| 4 | Setup Playwright + seeding fixture | Blocker semua E2E |
| 5 | E2E COD happy path | Jalur paling umum |
| 6 | E2E Bank Transfer + QRIS | |
| 7 | Race condition test (case 11) | Paling tricky, butuh concurrent setup |
| 8 | Sisanya (coupon, payment sync, E2E edge cases) | |

---

## 5. Catatan Implementasi

- **Jangan mock DB** di unit test — gunakan SQLite in-memory. Lesson learned dari incident Q4: mock DB menyembunyikan bug migrasi.
- **Isolasi tiap test** — buat fresh DB per `describe` block, bukan per file.
- **E2E pakai data seed terpisah** — jangan pakai data production/dev DB.
- Server actions yang memanggil API eksternal (RajaOngkir, Midtrans, Resend) **boleh di-mock** di unit test karena bukan logic internal.
- Tambah `tests/` ke `.gitignore`? **Tidak** — test harus masuk repo.
