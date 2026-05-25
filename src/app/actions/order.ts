"use server";

import { db } from "@/db";
import { orders, users, orderItems, products, payments, shipping } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";
import { createPaymentToken } from "./payment";

export async function getOrders() {
  return await db
    .select({
      id: orders.id,
      customer: users.name,
      date: orders.orderDate,
      total: orders.grandTotal,
      status: orders.orderStatus,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id));
}

export async function updateOrderStatus(id: string, status: string) {
  await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
}

export async function createOrder(
  orderData: {
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      weight: number;
    }>;
    shippingData: {
      destinationProvinceId?: number;
      destinationCityId?: number;
      courierCode?: string;
      courierService?: string;
      shippingCost: number;
      totalWeight: number;
    };
    paymentData: {
      paymentMethod: string;
      paymentAmount: number;
    };
    customerDetails: {
      firstName: string;
      lastName?: string;
      email: string;
      phone: string;
    };
    billingAddress?: string;
    shippingAddress?: string;
    notes?: string;
  }
) {
  try {
    // Validasi stock untuk semua produk
    for (const item of orderData.items) {
      const product = await db.select().from(products).where(eq(products.id, item.productId));
      if (!product[0]) {
        return { success: false, error: `Product ${item.productId} not found` };
      }
      if (product[0].stock < item.quantity) {
        return { success: false, error: `Insufficient stock for product ${product[0].name}` };
      }
    }

    // Hitung total
    const totalProductPrice = orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const grandTotal = totalProductPrice + orderData.shippingData.shippingCost;

    // Create order
    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      userId: orderData.userId,
      orderDate: new Date().toISOString(),
      totalProductPrice,
      totalShippingCost: orderData.shippingData.shippingCost,
      grandTotal,
      orderStatus: "pending",
    });

    // Create order items dan update stock
    for (const item of orderData.items) {
      const itemId = crypto.randomUUID();
      await db.insert(orderItems).values({
        id: itemId,
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotalWeight: item.weight * item.quantity,
      });

      // Update stock
      const product = await db.select().from(products).where(eq(products.id, item.productId));
      await db.update(products)
        .set({ stock: product[0].stock - item.quantity })
        .where(eq(products.id, item.productId));
    }

    // Create payment record
    const paymentId = crypto.randomUUID();
    await db.insert(payments).values({
      id: paymentId,
      orderId,
      paymentMethod: orderData.paymentData.paymentMethod,
      paymentAmount: orderData.paymentData.paymentAmount,
      paymentStatus: "pending",
    });

    // Create shipping record
    const shippingId = crypto.randomUUID();
    await db.insert(shipping).values({
      id: shippingId,
      orderId,
      destinationProvinceId: orderData.shippingData.destinationProvinceId,
      destinationCityId: orderData.shippingData.destinationCityId,
      courierCode: orderData.shippingData.courierCode,
      courierService: orderData.shippingData.courierService,
      totalWeight: orderData.shippingData.totalWeight,
      shippingCost: orderData.shippingData.shippingCost,
      shippingStatus: "pending",
    });

    revalidatePath("/admin/orders");
    
    const paymentTokenResult = await createPaymentToken(
      orderId,
      grandTotal,
      orderData.customerDetails
    );
    
    if (!paymentTokenResult.success) {
      return { success: false, error: "Failed to generate payment token" };
    }
    
    return { 
      success: true, 
      orderId,
      paymentToken: paymentTokenResult.token,
      redirectUrl: paymentTokenResult.redirectUrl
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create order" };
  }
}
