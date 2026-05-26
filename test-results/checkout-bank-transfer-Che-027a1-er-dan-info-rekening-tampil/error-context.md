# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-bank-transfer.spec.ts >> Checkout Bank Transfer Happy Path >> user dapat checkout dengan Bank Transfer dan info rekening tampil
- Location: tests/e2e/checkout-bank-transfer.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid=\'product-card\'], .product-card, .single-item').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - banner [ref=e12]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - link "Simbio Commerce" [ref=e16] [cursor=pointer]:
          - /url: /
          - img "Simbio Commerce" [ref=e17]
        - generic [ref=e21]:
          - textbox "I am shopping for..." [ref=e22]
          - button "Search" [ref=e23] [cursor=pointer]:
            - img [ref=e24]
      - generic [ref=e28]:
        - button "0 cart Rp 0" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]:
            - img [ref=e31]
            - generic [ref=e36]: "0"
          - generic [ref=e37]:
            - generic [ref=e38]: cart
            - paragraph [ref=e39]: Rp 0
        - link "account Sign In" [ref=e40] [cursor=pointer]:
          - /url: /signin
          - img [ref=e41]
          - generic [ref=e44]:
            - generic [ref=e45]: account
            - paragraph [ref=e46]: Sign In
    - generic [ref=e49]:
      - navigation [ref=e51]:
        - list [ref=e52]:
          - listitem [ref=e53]:
            - link "Popular" [ref=e54] [cursor=pointer]:
              - /url: /
          - listitem [ref=e55]:
            - link "Shop" [ref=e56] [cursor=pointer]:
              - /url: /shop
          - listitem [ref=e57]:
            - link "Contact" [ref=e58] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=e59]:
            - link "Blogs" [ref=e60] [cursor=pointer]:
              - /url: /blogs
      - list [ref=e62]:
        - listitem [ref=e63]:
          - button "Recently Viewed" [ref=e64] [cursor=pointer]:
            - img [ref=e65]
            - text: Recently Viewed
        - listitem [ref=e68]:
          - link "Wishlist" [ref=e69] [cursor=pointer]:
            - /url: /wishlist
            - img [ref=e70]
            - text: Wishlist
  - main [ref=e72]:
    - generic [ref=e74]:
      - generic [ref=e75]:
        - heading "Shop" [level=1] [ref=e76]
        - paragraph [ref=e77]: 6 produk ditemukan
      - generic [ref=e78]:
        - generic [ref=e79]:
          - img [ref=e80]
          - textbox "Cari produk..." [ref=e83]
        - combobox [ref=e85] [cursor=pointer]:
          - option "Terbaru" [selected]
          - 'option "Harga: Rendah ke Tinggi"'
          - 'option "Harga: Tinggi ke Rendah"'
          - option "Nama A–Z"
      - generic [ref=e86]:
        - button "Semua" [ref=e87] [cursor=pointer]
        - button "Electronics" [ref=e88] [cursor=pointer]
        - button "sssdwe" [ref=e89] [cursor=pointer]
        - button "Food" [ref=e90] [cursor=pointer]
      - generic [ref=e91]:
        - generic [ref=e92]:
          - link "Paket Pempek Kecil Campur Previous image Next image Image 1 Image 2 Add to cart Add to wishlist" [ref=e93] [cursor=pointer]:
            - /url: /shop-details/paket-pempek-kecil-campur
            - img "Paket Pempek Kecil Campur" [ref=e94]
            - button "Previous image" [ref=e95]:
              - img [ref=e96]
            - button "Next image" [ref=e98]:
              - img [ref=e99]
            - generic [ref=e101]:
              - button "Image 1" [ref=e102]
              - button "Image 2" [ref=e103]
            - generic [ref=e104]:
              - button "Add to cart" [ref=e105]:
                - img [ref=e106]
                - text: Add to cart
              - button "Add to wishlist" [ref=e108]:
                - img [ref=e109]
          - generic [ref=e111]:
            - heading "Paket Pempek Kecil Campur" [level=3] [ref=e112]:
              - link "Paket Pempek Kecil Campur" [ref=e113] [cursor=pointer]:
                - /url: /shop-details/paket-pempek-kecil-campur
            - generic [ref=e114]:
              - img [ref=e115]
              - generic [ref=e117]: "4.5"
            - generic [ref=e119]: Rp 75.000
        - generic [ref=e120]:
          - link "Paket Pempek Kapal Selam Add to cart Add to wishlist" [ref=e121] [cursor=pointer]:
            - /url: /shop-details/paket-pempek-kapal-selam
            - img "Paket Pempek Kapal Selam" [ref=e122]
            - generic [ref=e123]:
              - button "Add to cart" [ref=e124]:
                - img [ref=e125]
                - text: Add to cart
              - button "Add to wishlist" [ref=e127]:
                - img [ref=e128]
          - generic [ref=e130]:
            - heading "Paket Pempek Kapal Selam" [level=3] [ref=e131]:
              - link "Paket Pempek Kapal Selam" [ref=e132] [cursor=pointer]:
                - /url: /shop-details/paket-pempek-kapal-selam
            - generic [ref=e134]: Rp 75.000
        - generic [ref=e135]:
          - link "Paket Pempek Lenjer Add to cart Add to wishlist" [ref=e136] [cursor=pointer]:
            - /url: /shop-details/paket-pempek-lenjer
            - img "Paket Pempek Lenjer" [ref=e137]
            - generic [ref=e138]:
              - button "Add to cart" [ref=e139]:
                - img [ref=e140]
                - text: Add to cart
              - button "Add to wishlist" [ref=e142]:
                - img [ref=e143]
          - generic [ref=e145]:
            - heading "Paket Pempek Lenjer" [level=3] [ref=e146]:
              - link "Paket Pempek Lenjer" [ref=e147] [cursor=pointer]:
                - /url: /shop-details/paket-pempek-lenjer
            - generic [ref=e149]: Rp 75.000
        - generic [ref=e150]:
          - link "Paket Pempek Panggang Add to cart Add to wishlist" [ref=e151] [cursor=pointer]:
            - /url: /shop-details/paket-pempek-panggang
            - img "Paket Pempek Panggang" [ref=e152]
            - generic [ref=e153]:
              - button "Add to cart" [ref=e154]:
                - img [ref=e155]
                - text: Add to cart
              - button "Add to wishlist" [ref=e157]:
                - img [ref=e158]
          - generic [ref=e160]:
            - heading "Paket Pempek Panggang" [level=3] [ref=e161]:
              - link "Paket Pempek Panggang" [ref=e162] [cursor=pointer]:
                - /url: /shop-details/paket-pempek-panggang
            - generic [ref=e164]: Rp 85.000
        - generic [ref=e165]:
          - link "Paket Tekwan Add to cart Add to wishlist" [ref=e166] [cursor=pointer]:
            - /url: /shop-details/paket-tekwan
            - img "Paket Tekwan" [ref=e167]
            - generic [ref=e168]:
              - button "Add to cart" [ref=e169]:
                - img [ref=e170]
                - text: Add to cart
              - button "Add to wishlist" [ref=e172]:
                - img [ref=e173]
          - generic [ref=e175]:
            - heading "Paket Tekwan" [level=3] [ref=e176]:
              - link "Paket Tekwan" [ref=e177] [cursor=pointer]:
                - /url: /shop-details/paket-tekwan
            - generic [ref=e179]: Rp 65.000
        - generic [ref=e180]:
          - link "Paket Lenggggang Add to cart Add to wishlist" [ref=e181] [cursor=pointer]:
            - /url: /shop-details/paket-lenggggang
            - img "Paket Lenggggang" [ref=e182]
            - generic [ref=e183]:
              - button "Add to cart" [ref=e184]:
                - img [ref=e185]
                - text: Add to cart
              - button "Add to wishlist" [ref=e187]:
                - img [ref=e188]
          - generic [ref=e190]:
            - heading "Paket Lenggggang" [level=3] [ref=e191]:
              - link "Paket Lenggggang" [ref=e192] [cursor=pointer]:
                - /url: /shop-details/paket-lenggggang
            - generic [ref=e193]:
              - img [ref=e194]
              - generic [ref=e196]: "5"
            - generic [ref=e198]: Rp 80.000
  - generic [ref=e201]:
    - generic [ref=e202]:
      - heading "Cart View" [level=2] [ref=e203]
      - button "button for close modal" [ref=e204] [cursor=pointer]:
        - img [ref=e205]
    - generic [ref=e210]:
      - img [ref=e212]
      - paragraph [ref=e217]: Your cart is empty!
      - link "Continue Shopping" [ref=e218] [cursor=pointer]:
        - /url: /shop
    - generic [ref=e219]:
      - generic [ref=e220]:
        - paragraph [ref=e221]: "Subtotal:"
        - paragraph [ref=e222]: Rp 0
      - generic [ref=e223]:
        - link "View Cart" [ref=e224] [cursor=pointer]:
          - /url: /cart
        - link "Checkout" [ref=e225] [cursor=pointer]:
          - /url: /checkout
  - contentinfo [ref=e226]:
    - generic [ref=e228]:
      - generic [ref=e229]:
        - heading "Help & Support" [level=2] [ref=e230]
        - list [ref=e231]:
          - listitem [ref=e232]:
            - img [ref=e234]
            - text: 685 Market Street, Las Vegas, LA 95820, United States.
          - listitem [ref=e236]:
            - link "(+099) 532-786-9843" [ref=e237] [cursor=pointer]:
              - /url: "#"
              - img [ref=e238]
              - text: (+099) 532-786-9843
          - listitem [ref=e242]:
            - link "support@simbiocommerce.com" [ref=e243] [cursor=pointer]:
              - /url: "#"
              - img [ref=e244]
              - text: support@simbiocommerce.com
        - generic [ref=e246]:
          - link "Facebook Social Link" [ref=e247] [cursor=pointer]:
            - /url: https://facebook.com/simbiocommerce
            - img [ref=e248]
          - link "Twitter Social Link" [ref=e251] [cursor=pointer]:
            - /url: https://twitter.com/simbiocommerce
            - img [ref=e252]
          - link "Instagram Social Link" [ref=e254] [cursor=pointer]:
            - /url: https://instagram.com/simbiocommerce
            - img [ref=e255]
          - link "Linkedin Social Link" [ref=e260] [cursor=pointer]:
            - /url: https://linkedin.com/company/simbiocommerce
            - img [ref=e261]
      - generic [ref=e264]:
        - heading "Account" [level=2] [ref=e265]
        - list [ref=e266]:
          - listitem [ref=e267]:
            - link "My Account" [ref=e268] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e269]:
            - link "Login / Register" [ref=e270] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e271]:
            - link "Cart" [ref=e272] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e273]:
            - link "Wishlist" [ref=e274] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e275]:
            - link "Shop" [ref=e276] [cursor=pointer]:
              - /url: /shop
      - generic [ref=e277]:
        - heading "Quick Link" [level=2] [ref=e278]
        - list [ref=e279]:
          - listitem [ref=e280]:
            - link "Privacy Policy" [ref=e281] [cursor=pointer]:
              - /url: /privacy-policy
          - listitem [ref=e282]:
            - link "Refund Policy" [ref=e283] [cursor=pointer]:
              - /url: /refund-policy
          - listitem [ref=e284]:
            - link "Terms of Use" [ref=e285] [cursor=pointer]:
              - /url: /terms-of-use
          - listitem [ref=e286]:
            - link "FAQ’s" [ref=e287] [cursor=pointer]:
              - /url: /faqs
          - listitem [ref=e288]:
            - link "Contact" [ref=e289] [cursor=pointer]:
              - /url: /contact
    - paragraph [ref=e292]: © 2026. All rights reserved by Simbio Commerce.
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * E2E: Checkout happy path — Bank Transfer
  5  |  * Requires: dev server running + seeded DB + bank accounts configured in store settings
  6  |  */
  7  | test.describe("Checkout Bank Transfer Happy Path", () => {
  8  |   test.beforeEach(async ({ page }) => {
  9  |     await page.goto("/");
  10 |     await page.evaluate(() => localStorage.removeItem("persist:root"));
  11 |   });
  12 | 
  13 |   test("user dapat checkout dengan Bank Transfer dan info rekening tampil", async ({ page }) => {
  14 |     // Tambah item ke cart via direct navigation
  15 |     await page.goto("/shop");
  16 |     const firstProduct = page.locator("[data-testid='product-card'], .product-card, .single-item").first();
> 17 |     await firstProduct.click();
     |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |     await page.getByRole("button", { name: /tambah|add to cart/i }).first().click();
  19 |     await page.goto("/checkout");
  20 | 
  21 |     // Isi billing
  22 |     await page.fill("[name='firstName'], #firstName", "Siti");
  23 |     await page.fill("[name='email'], input[type='email']", "siti@test.com");
  24 |     await page.fill("[name='phone']", "08987654321");
  25 |     await page.fill("[name='address'], textarea", "Jl. Mawar No. 5");
  26 | 
  27 |     // Pilih tujuan + kurir
  28 |     const provinceSelect = page.locator("select").first();
  29 |     if (await provinceSelect.isVisible()) {
  30 |       await provinceSelect.selectOption({ index: 1 });
  31 |       await page.waitForTimeout(500);
  32 |       const citySelect = page.locator("select").nth(1);
  33 |       if (await citySelect.isVisible()) await citySelect.selectOption({ index: 1 });
  34 |     }
  35 |     await page.waitForTimeout(2000);
  36 |     const firstCourier = page.locator("input[name='courier']").first();
  37 |     if (await firstCourier.isVisible()) await firstCourier.click();
  38 | 
  39 |     // Pilih Bank Transfer
  40 |     const bankTransferOption = page.getByText(/bank transfer|transfer bank/i).first();
  41 |     if (await bankTransferOption.isVisible()) await bankTransferOption.click();
  42 | 
  43 |     // Submit dan konfirmasi
  44 |     await page.getByRole("button", { name: /pesan sekarang|buat pesanan/i }).click();
  45 |     await page.waitForTimeout(500);
  46 |     const confirmBtn = page.getByRole("button", { name: /konfirmasi|buat pesanan/i }).last();
  47 |     if (await confirmBtn.isVisible()) await confirmBtn.click();
  48 | 
  49 |     // Redirect ke /order-success
  50 |     await page.waitForURL(/order-success/, { timeout: 10000 });
  51 | 
  52 |     // Assert: halaman sukses tampil
  53 |     await expect(page.getByText(/pesanan berhasil|order berhasil/i).first()).toBeVisible();
  54 | 
  55 |     // Assert: button "Lihat Rekening Transfer" tampil
  56 |     await expect(page.getByRole("button", { name: /lihat rekening transfer/i })).toBeVisible();
  57 |   });
  58 | });
  59 | 
```