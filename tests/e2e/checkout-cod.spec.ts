import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout happy path — COD
 * Requires: dev server running + seeded DB with at least 1 active product with stock > 0
 */
test.describe("Checkout COD Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart state before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("persist:root");
    });
  });

  test("user dapat checkout dengan COD dan order berhasil dibuat", async ({ page }) => {
    // 1. Buka /shop
    await page.goto("/shop");
    await expect(page).toHaveTitle(/shop|toko/i);

    // 2. Klik produk pertama
    const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
    await firstProduct.click();

    // 3. Tambah ke cart
    const addToCartBtn = page.getByRole("button", { name: /tambah|add to cart/i }).first();
    await addToCartBtn.click();

    // 4. Buka cart sidebar / navigasi ke checkout
    await page.goto("/checkout");

    // 5. Isi billing form
    await page.fill("[name='firstName'], input[placeholder*='nama depan' i], #firstName", "Budi");
    await page.fill("[name='lastName'], input[placeholder*='nama belakang' i], #lastName", "Test");
    await page.fill("[name='email'], input[type='email']", "budi@test.com");
    await page.fill("[name='phone'], input[placeholder*='telepon' i]", "08123456789");
    await page.fill("[name='address'], textarea[placeholder*='alamat' i]", "Jl. Test No. 1, Jakarta");

    // 6. Pilih tujuan pengiriman - pilih provinsi dan kota
    const provinceSelect = page.locator("select").first();
    if (await provinceSelect.isVisible()) {
      await provinceSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      const citySelect = page.locator("select").nth(1);
      if (await citySelect.isVisible()) {
        await citySelect.selectOption({ index: 1 });
      }
    }

    // 7. Tunggu ongkir load dan pilih kurir
    await page.waitForTimeout(2000);
    const firstCourier = page.locator("[data-testid='courier-option'], input[name='courier']").first();
    if (await firstCourier.isVisible()) {
      await firstCourier.click();
    }

    // 8. Pilih COD
    const codOption = page.getByText(/cash on delivery|cod/i).first();
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // 9. Klik "Pesan Sekarang"
    const orderBtn = page.getByRole("button", { name: /pesan sekarang|buat pesanan|checkout/i });
    await orderBtn.click();

    // 10. Konfirmasi modal muncul
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole("button", { name: /konfirmasi|buat pesanan|ya/i }).last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // 11. Redirect ke /order-success
    await page.waitForURL(/order-success/, { timeout: 10000 });

    // 12. Assert halaman tampil "Pesanan Berhasil"
    await expect(page.getByText(/pesanan berhasil|order berhasil|sukses/i).first()).toBeVisible();
  });
});
