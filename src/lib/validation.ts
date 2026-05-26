import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

const sanitizeString = (s: string) =>
  s.trim().replace(/[<>]/g, "");

const sanitized = (schema: z.ZodString) =>
  schema.transform(sanitizeString);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: sanitized(z.string().min(2, "Nama minimal 2 karakter").max(100)),
  email: z.string().email("Format email tidak valid").max(255),
  password: z.string().min(6, "Password minimal 6 karakter").max(128),
});

// ─── Checkout / Billing ──────────────────────────────────────────────────────

export const billingSchema = z.object({
  name: sanitized(z.string().min(2, "Nama wajib diisi").max(100)),
  email: z.string().email("Format email tidak valid").max(255),
  phone: sanitized(z.string().min(6, "Nomor HP wajib diisi").max(20).regex(/^[0-9+\-\s()]+$/, "Nomor HP tidak valid")),
  address: sanitized(z.string().min(5, "Alamat wajib diisi").max(500)),
});

export const createOrderSchema = z.object({
  userId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(1000),
    unitPrice: z.number().int().min(0),
    weight: z.number().min(0),
  })).min(1, "Keranjang kosong"),
  shippingData: z.object({
    destinationCityId: z.number().int().optional(),
    destinationProvinceId: z.number().int().optional(),
    courierCode: z.string().max(20).optional(),
    courierService: z.string().max(50).optional(),
    shippingCost: z.number().int().min(0),
    totalWeight: z.number().min(0),
  }),
  paymentData: z.object({
    paymentMethod: z.enum(["midtrans", "bank_transfer", "cod", "qris"]),
    paymentAmount: z.number().int().min(0),
  }),
  customerDetails: z.object({
    firstName: sanitized(z.string().min(1).max(50)),
    lastName: sanitized(z.string().max(50)).optional(),
    email: z.string().email().max(255),
    phone: sanitized(z.string().min(6).max(20)),
  }),
  shippingAddress: sanitized(z.string().max(500)).optional(),
  notes: sanitized(z.string().max(500)).optional(),
  couponDiscount: z.number().int().min(0).optional(),
});

// ─── Profile ─────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: sanitized(z.string().min(2, "Nama minimal 2 karakter").max(100)).optional(),
  phone: sanitized(z.string().max(20).regex(/^[0-9+\-\s()]*$/, "Nomor HP tidak valid")).optional(),
  address: sanitized(z.string().max(500)).optional(),
  postalCode: sanitized(z.string().max(10).regex(/^\d*$/, "Kode pos tidak valid")).optional(),
  image: z.string().url().max(500).optional(),
});

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  firstName: sanitized(z.string().min(1, "Nama depan wajib diisi").max(50)),
  lastName: sanitized(z.string().max(50)),
  email: z.string().email("Format email tidak valid").max(255),
  phone: sanitized(z.string().max(20)).optional(),
  subject: sanitized(z.string().max(200)).optional(),
  message: sanitized(z.string().min(10, "Pesan minimal 10 karakter").max(2000)),
});

// ─── Review ──────────────────────────────────────────────────────────────────

export const submitReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  customerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: sanitized(z.string().min(3, "Ulasan terlalu pendek").max(1000)),
  imageUrl: z.string().url().max(500).optional(),
});

// ─── Helper: parse and return standard error ─────────────────────────────────

export function parseSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.errors[0];
    return { success: false, error: first?.message ?? result.error.message };
  }
  return { success: true, data: result.data };
}
