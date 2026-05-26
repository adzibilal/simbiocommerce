import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout happy path — Bank Transfer
 * Requires: dev server running + seeded DB + bank accounts configured in store settings
 */
test.describe("Checkout Bank Transfer Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("persist:root"));
  });

  test("user dapat checkout dengan Bank Transfer dan info rekening tampil", async ({ page }) => {
    // Tambah item ke cart via direct navigation
    await page.goto("/shop");
    const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
    await firstProduct.click();
    await page.getByRole("button", { name: /tambah|add to cart/i }).first().click();
    await page.goto("/checkout");

    // Isi billing
    await page.fill("[name='firstName'], #firstName", "Siti");
    await page.fill("[name='email'], input[type='email']", "siti@test.com");
    await page.fill("[name='phone']", "08987654321");
    await page.fill("[name='address'], textarea", "Jl. Mawar No. 5");

    // Pilih tujuan + kurir
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

    // Pilih Bank Transfer
    const bankTransferOption = page.getByText(/bank transfer|transfer bank/i).first();
    if (await bankTransferOption.isVisible()) await bankTransferOption.click();

    // Submit dan konfirmasi
    await page.getByRole("button", { name: /pesan sekarang|buat pesanan/i }).click();
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole("button", { name: /konfirmasi|buat pesanan/i }).last();
    if (await confirmBtn.isVisible()) await confirmBtn.click();

    // Redirect ke /order-success
    await page.waitForURL(/order-success/, { timeout: 10000 });

    // Assert: halaman sukses tampil
    await expect(page.getByText(/pesanan berhasil|order berhasil/i).first()).toBeVisible();

    // Assert: button "Lihat Rekening Transfer" tampil
    await expect(page.getByRole("button", { name: /lihat rekening transfer/i })).toBeVisible();
  });
});
