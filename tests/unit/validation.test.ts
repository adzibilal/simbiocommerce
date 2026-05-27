import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  submitReviewSchema,
  parseSchema,
} from "@/lib/validation";

const validOrderData = {
  items: [
    {
      productId: "550e8400-e29b-41d4-a716-446655440001",
      quantity: 1,
      unitPrice: 50000,
      weight: 500,
    },
  ],
  shippingData: {
    shippingCost: 15000,
    totalWeight: 500,
  },
  paymentData: {
    paymentMethod: "cod" as const,
    paymentAmount: 65000,
  },
  customerDetails: {
    firstName: "Budi",
    email: "budi@example.com",
    phone: "08123456789",
  },
};

describe("createOrderSchema", () => {
  it("valid — semua field lengkap", () => {
    const result = createOrderSchema.safeParse(validOrderData);
    expect(result.success).toBe(true);
  });

  it("valid — qris diterima sebagai paymentMethod", () => {
    const data = {
      ...validOrderData,
      paymentData: { paymentMethod: "qris" as const, paymentAmount: 65000 },
    };
    const result = createOrderSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("valid — productId legacy non-UUID (migrated data)", () => {
    const data = {
      ...validOrderData,
      items: [{ ...validOrderData.items[0], productId: "1" }],
    };
    const result = createOrderSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("valid — userId optional (guest checkout)", () => {
    const result = createOrderSchema.safeParse(validOrderData);
    expect(result.success).toBe(true);
  });

  it("gagal — items kosong", () => {
    const data = { ...validOrderData, items: [] };
    const result = parseSchema(createOrderSchema, data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Keranjang kosong");
    }
  });

  it("gagal — paymentMethod tidak valid (bitcoin)", () => {
    const data = {
      ...validOrderData,
      paymentData: { paymentMethod: "bitcoin", paymentAmount: 65000 },
    };
    const result = createOrderSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("submitReviewSchema", () => {
  it("gagal — rating di luar 1-5 (rating 6)", () => {
    const result = submitReviewSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440001",
      orderId: "550e8400-e29b-41d4-a716-446655440002",
      customerId: "550e8400-e29b-41d4-a716-446655440003",
      rating: 6,
      comment: "Produk bagus sekali",
    });
    expect(result.success).toBe(false);
  });

  it("gagal — rating di bawah 1 (rating 0)", () => {
    const result = submitReviewSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440001",
      orderId: "550e8400-e29b-41d4-a716-446655440002",
      customerId: "550e8400-e29b-41d4-a716-446655440003",
      rating: 0,
      comment: "Jelek",
    });
    expect(result.success).toBe(false);
  });
});

describe("sanitizeString via createOrderSchema", () => {
  it("strip karakter < dan > dari string input", () => {
    const data = {
      ...validOrderData,
      customerDetails: {
        firstName: "<script>alert(1)</script>",
        email: "budi@example.com",
        phone: "08123456789",
      },
    };
    const result = createOrderSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerDetails.firstName).not.toContain("<");
      expect(result.data.customerDetails.firstName).not.toContain(">");
    }
  });
});

describe("parseSchema helper", () => {
  it("return { success: true, data } jika valid", () => {
    const result = parseSchema(createOrderSchema, validOrderData);
    expect(result.success).toBe(true);
  });

  it("return { success: false, error: string } jika invalid — tidak crash", () => {
    const result = parseSchema(createOrderSchema, { items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});
