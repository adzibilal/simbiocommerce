# TODO - Perbaikan E-commerce Simbiocommerce

## Prioritas Tinggi (Harus diperbaiki dulu)

### 1. Hubungkan shop ke database (ganti mock data)
- [x] Update `src/components/Shop/shopData.ts` untuk match Product type baru
- [x] Update `src/components/ShopWithSidebar/index.tsx` untuk fetch produk real
- [x] Update `src/components/ShopDetails/index.tsx` untuk ambil produk dari database
- [x] Buat/gunakan server action untuk get products

### 2. Fix cart-product mismatch (ubah cart slice)
- [x] Update `src/redux/features/cart-slice.ts`:
  - Ubah `id: number` menjadi `id: string` (UUID)
  - Sesuaikan dengan struktur produk database
  - Update semua fungsi yang menggunakan cart
- [x] Update `src/components/Cart/SingleItem.tsx` untuk handle ID string
- [x] Update `src/components/Shop/SingleGridItem.tsx` dan `SingleListItem.tsx`

### 3. Buat createOrder() function
- [x] Tambah fungsi `createOrder()` di `src/app/actions/order.ts`
- [x] Handle: order items, payments, shipping, inventory update
- [x] Validasi stock sebelum create order
- [x] Update stock setelah order berhasil

### 4. Fix security (hash password)
- [x] Install bcrypt atau argon2
- [x] Update `src/app/api/auth/[...nextauth]/route.ts`:
  - [x] Hash password saat register
  - [x] Compare hash saat login
- [x] Buat migration untuk hash password existing

### 5. Connect checkout form ke order creation
- [x] Update `src/components/Checkout/index.tsx`:
  - Tambah form handler
  - Validasi form data
  - Panggil `createOrder()` saat submit
- [x] Tambah loading state dan error handling
- [x] Redirect ke success page setelah order created

## Prioritas Medium

### 6. Implement payment gateway (Midtrans/Xendit)
- [x] Pilih payment gateway (Midtrans untuk Indonesia)
- [x] Setup API keys di .env
- [x] Buat payment integration di `src/app/actions/payment.ts`
- [x] Update checkout untuk handle payment flow
- [x] Handle payment callback/webhook

### 7. Tambah shipping calculation
- [x] Integrasi dengan API shipping (RajaOngkir/JNE)
- [x] Update `src/components/Checkout/ShippingMethod.tsx`
- [x] Hitung biaya berdasarkan berat dan lokasi
- [ ] Cache shipping rates

### 8. Update admin dashboard dengan data real
- [x] Update `src/components/Dashboard/StatCards.tsx`
- [x] Fetch real data: total orders, revenue, customers
- [x] Update recent orders dengan data real
- [x] Update top products dengan data real

## Prioritas Rendah

### 9. Email notifications
- [ ] Setup email service (Nodemailer/Resend)
- [ ] Send order confirmation email
- [ ] Send shipping notification

### 10. Inventory management
- [ ] Low stock alerts
- [ ] Stock history tracking
- [ ] Bulk stock update

### 11. Analytics & reporting
- [ ] Sales reports
- [ ] Customer analytics
- [ ] Product performance

## Testing
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test payment integration
- [ ] Test admin features

## Notes
- Database schema sudah lengkap
- Authentication sudah setup (butuh password hashing)
- UI components sudah ada (butuh koneksi ke data real)
- Target: MVP functional dalam 2-3 hari