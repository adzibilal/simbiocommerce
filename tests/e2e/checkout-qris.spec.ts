import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout happy path — QRIS
 * Requires: dev server + seeded DB + QRIS image configured in store settings
 */
test.describe("Checkout QRIS Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("persist:root"));
  });

  test("user dapat checkout dengan QRIS dan modal QRIS auto-open", async ({ page }) => {
    await page.goto("/shop");
    const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
    await firstProduct.click();
    await page.getByRole("button", { name: /tambah|add to cart/i }).first().click();
    await page.goto("/checkout");

    // Isi billing
    await page.fill("[name='firstName'], #firstName", "Andi");
    await page.fill("[name='email'], input[type='email']", "andi@test.com");
    await page.fill("[name='phone']", "08111222333");
    await page.fill("[name='address'], textarea", "Jl. Merdeka No. 10");

    const provinceSelect = page.locator("select").first();
    if (await provinceSelect.isVisible()) {
      await provinceSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      const citySelect = page.locator("select").nth(1);
      if (await citySelect.isVisible()) await citySelect.selectOption({ index: 1 });
    }
    await page.waitForTimeout(2000);
    const firstCourier = page.locator("input[name='courier']").first();
    if (await firstCourier.isVisible()) await firstCourier.click();

    // Pilih QRIS
    const qrisOption = page.getByText(/qris/i).first();
    if (await qrisOption.isVisible()) await qrisOption.click();

    // Submit + konfirmasi
    await page.getByRole("button", { name: /pesan sekarang|buat pesanan/i }).click();
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole("button", { name: /konfirmasi|buat pesanan/i }).last();
    if (await confirmBtn.isVisible()) await confirmBtn.click();

    // Redirect ke /order-success
    await page.waitForURL(/order-success/, { timeout: 10000 });

    // Assert: modal QRIS auto-open (gambar QRIS tampil atau teks "Bayar dengan QRIS")
    await expect(page.getByText(/bayar dengan qris/i).first()).toBeVisible({ timeout: 3000 });

    // Tutup modal
    await page.getByRole("button", { name: /tutup/i }).click();

    // Assert: button "Lihat QRIS" masih ada
    await expect(page.getByRole("button", { name: /lihat qris/i })).toBeVisible();
  });
});
