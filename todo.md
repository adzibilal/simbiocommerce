# TODO - Simbiocommerce Development

## ✅ Sudah Selesai
- Product catalog terhubung ke database
- Cart dengan Redux + persist (localStorage)
- Checkout flow lengkap (billing, shipping, payment method)
- Order creation dengan stock deduction
- Midtrans payment gateway (Snap)
- Bank Transfer + COD payment method
- Payment proof upload (ImageKit)
- RajaOngkir shipping cost calculation
- Tracking number management
- Admin dashboard 39+ halaman
- Order management (status, resi, detail)
- Product reviews dengan moderasi (approve/reject)
- Rating display di product card & shop detail
- Review form di order-success (setelah delivered)
- Testimonials dari real product reviews
- Wishlist, recently viewed
- Search bar dengan autocomplete dropdown
- Blog / CMS system
- Static pages (FAQ, Privacy, Terms, Refund)
- Hero slider, promo banners, countdown, hero features
- Newsletter subscribers
- SEO settings per halaman
- Store settings (warna, logo, kontak, sosmed)
- Auth (email/password bcrypt + Google OAuth)
- Customer profile & order history
- Image upload via ImageKit (crop support)
- Dynamic theming (primary color dari store settings)
- Email notifications via Resend (order confirmation, status update, admin notif, payment proof)
- Coupon discount tersimpan di order & tampil di detail + email
- Balas pesan contact form dari admin (reply ke email pengirim)
- Transaction safety: createOrder atomic + rollback + race condition stock
- Input validation & sanitasi dengan Zod (createOrder, updateProfile, register, contact, review)
- Analytics: grafik penjualan 30 hari, produk terlaris, revenue summary, customer new vs returning, export CSV

---

## 🔴 Prioritas Tinggi



---

## 🟡 Prioritas Medium


### Inventory Management
- [ ] Alert low stock (notifikasi admin jika stok < threshold)
- [ ] Riwayat perubahan stok (audit trail)
- [ ] Bulk update stok dari admin

### Pagination Admin
- [ ] Pagination di halaman admin/products
- [ ] Pagination di halaman admin/orders
- [ ] Pagination di halaman admin/customers
- [ ] Pagination di halaman admin/reviews

### Checkout Improvements
- [ ] Guest checkout (tanpa harus login)
- [ ] Simpan multiple shipping address per user
- [ ] Tampilkan notes order di detail order customer

### Return / Refund Management
- [ ] Flow pengajuan retur dari customer
- [ ] Admin bisa approve/reject retur
- [ ] Update status order ke "returned"

---

## 🟢 Prioritas Rendah / Nice to Have

### Product Enhancements
- [ ] Product variants (ukuran, warna, dll)
- [ ] Product bundling / paket hemat
- [ ] Pre-order / backorder support
- [ ] Product recommendations (related by category/tag)
- [ ] Social share button di halaman produk

### Shipping
- [ ] Cache shipping rates (jangan hit API tiap kali)
- [ ] Fallback jika RajaOngkir API down
- [ ] Estimasi tiba hari di checkout

### Customer Loyalty
- [ ] Poin reward setiap pembelian
- [ ] Redeem poin sebagai diskon
- [ ] Tier customer (regular, silver, gold)

### Operational
- [ ] Bulk export orders ke CSV/Excel
- [ ] Manajemen role admin (super admin, operator, dll)
- [ ] Activity log admin (siapa ubah apa)
- [ ] Notifikasi WhatsApp (Fonnte/WA gateway)

### Performance
- [ ] Database indexes untuk query umum (userId, productId, orderId)
- [ ] Pagination / virtual scroll untuk list panjang di frontend
- [ ] Rate limiting pada API endpoints publik

### Testing
- [ ] Setup testing (Jest / Vitest)
- [ ] Unit test untuk server actions kritis (createOrder, payment)
- [ ] E2E test checkout flow (Playwright/Cypress)

---

## 📝 Technical Debt
- Hapus PayPal option dari UI atau implementasi (saat ini hanya placeholder)
- Ganti SQLite ke PostgreSQL jika traffic mulai besar
- Tambah `updatedAt` field ke tabel orders dan payments
- Review error messages agar tidak leak info sensitif ke client
- Debug logs `[order]` dan `[email]` di email.ts / order.ts perlu dihapus sebelum production
