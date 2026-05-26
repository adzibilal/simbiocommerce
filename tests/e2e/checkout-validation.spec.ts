import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout form validation
 */
test.describe("Checkout Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Perlu ada item di cart — tambah dulu lewat direct URL
    await page.goto("/shop");
    const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
    await firstProduct.click();
    await page.getByRole("button", { name: /tambah|add to cart/i }).first().click();
  });

  test("submit tanpa isi form — muncul error validasi billing", async ({ page }) => {
    await page.goto("/checkout");

    // Langsung klik submit tanpa isi apapun
    const orderBtn = page.getByRole("button", { name: /pesan sekarang|buat pesanan|checkout/i });
    await orderBtn.click();

    // Assert: error validasi billing tampil
    await expect(
      page.getByText(/lengkapi data|isi data|nama wajib|email wajib|alamat wajib/i).first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("billing isi tapi tidak pilih shipping — muncul error shipping", async ({ page }) => {
    await page.goto("/checkout");

    // Isi billing lengkap
    await page.fill("[name='firstName'], #firstName", "Budi");
    await page.fill("[name='email'], input[type='email']", "budi@test.com");
    await page.fill("[name='phone']", "08123456789");
    await page.fill("[name='address'], textarea", "Jl. Test No. 1");

    // Tidak pilih shipping
    const orderBtn = page.getByRole("button", { name: /pesan sekarang|buat pesanan/i });
    await orderBtn.click();

    // Assert: error shipping
    await expect(
      page.getByText(/pilih metode pengiriman|ongkos kirim|kurir/i).first()
    ).toBeVisible({ timeout: 3000 });
  });
});
