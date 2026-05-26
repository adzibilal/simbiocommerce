import { test, expect } from "@playwright/test";

/**
 * E2E: Guest checkout (tanpa login)
 */
test.describe("Guest Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("persist:root"));
    // Pastikan tidak ada session (tidak login)
    await page.context().clearCookies();
  });

  test("guest dapat checkout tanpa login", async ({ page }) => {
    await page.goto("/shop");
    const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
    await firstProduct.click();
    await page.getByRole("button", { name: /tambah|add to cart/i }).first().click();
    await page.goto("/checkout");

    // Assert: tidak di-redirect ke halaman login (guest boleh checkout)
    await expect(page).not.toHaveURL(/signin|login/);

    // Isi billing
    await page.fill("[name='firstName'], #firstName", "Tamu");
    await page.fill("[name='email'], input[type='email']", "tamu@test.com");
    await page.fill("[name='phone']", "08555666777");
    await page.fill("[name='address'], textarea", "Jl. Tamu No. 99");

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

    // Pilih COD
    const codOption = page.getByText(/cash on delivery|cod/i).first();
    if (await codOption.isVisible()) await codOption.click();

    // Submit
    await page.getByRole("button", { name: /pesan sekarang|buat pesanan/i }).click();
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole("button", { name: /konfirmasi|buat pesanan/i }).last();
    if (await confirmBtn.isVisible()) await confirmBtn.click();

    // Redirect ke /order-success
    await page.waitForURL(/order-success/, { timeout: 10000 });
    await expect(page.getByText(/pesanan berhasil|order berhasil/i).first()).toBeVisible();
  });
});
