"use server";

import { db } from "@/db";
import { orders, users, orderItems, products, payments, shipping, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";
import { createPaymentToken, getTransactionStatus } from "./payment";

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

export async function getOrdersByUser(userId: string) {
  return await db
    .select({
      id: orders.id,
      date: orders.orderDate,
      total: orders.grandTotal,
      status: orders.orderStatus,
      courierCode: shipping.courierCode,
      courierService: shipping.courierService,
      trackingNumber: shipping.trackingNumber,
      shippingStatus: shipping.shippingStatus,
      paymentStatus: payments.paymentStatus,
    })
    .from(orders)
    .leftJoin(shipping, eq(shipping.orderId, orders.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(eq(orders.userId, userId))
    .orderBy(orders.orderDate);
}

export async function getOrderItems(orderId: string) {
  return await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, orderId));
}

export async function getOrderDetail(orderId: string) {
  const order = await db
    .select({
      id: orders.id,
      date: orders.orderDate,
      totalProductPrice: orders.totalProductPrice,
      totalShippingCost: orders.totalShippingCost,
      grandTotal: orders.grandTotal,
      orderStatus: orders.orderStatus,
      courierCode: shipping.courierCode,
      courierService: shipping.courierService,
      trackingNumber: shipping.trackingNumber,
      shippingStatus: shipping.shippingStatus,
      paymentMethod: payments.paymentMethod,
      paymentStatus: payments.paymentStatus,
      paymentProof: payments.paymentProof,
    })
    .from(orders)
    .leftJoin(shipping, eq(shipping.orderId, orders.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order[0]) return null;

  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      productName: products.name,
      imageUrl: productImages.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .where(eq(orderItems.orderId, orderId));

  return { ...order[0], items };
}

export async function updateOrderStatus(id: string, status: string) {
  await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
}

export async function submitPaymentProof(orderId: string, proofUrl: string) {
  await db.update(payments)
    .set({ paymentProof: proofUrl, paymentStatus: "waiting_confirmation" })
    .where(eq(payments.orderId, orderId));
  revalidatePath(`/order-success`);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  await db.update(shipping)
    .set({ trackingNumber, shippingStatus: "shipped" })
    .where(eq(shipping.orderId, orderId));
  await db.update(orders)
    .set({ orderStatus: "shipped" })
    .where(eq(orders.id, orderId));
  revalidatePath(`/admin/orders/${orderId}`);
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

    const paymentMethod = orderData.paymentData.paymentMethod;

    // For COD and bank transfer, no payment gateway token needed
    if (paymentMethod === "cod" || paymentMethod === "bank_transfer") {
      return { success: true, orderId, paymentToken: null, redirectUrl: null };
    }

    // Midtrans
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

export async function syncPaymentStatus(orderId: string) {
  try {
    // Get current payment record
    const paymentRecord = await db
      .select({ paymentMethod: payments.paymentMethod, paymentStatus: payments.paymentStatus })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!paymentRecord[0] || paymentRecord[0].paymentMethod !== "midtrans") return;
    if (paymentRecord[0].paymentStatus === "paid") return; // already settled

    const result = await getTransactionStatus(orderId);
    if (!result.success) return;

    const ts = result.status;
    const fs = result.data?.fraud_status;

    let paymentStatus = "pending";
    if (ts === "capture") paymentStatus = fs === "challenge" ? "challenge" : "paid";
    else if (ts === "settlement") paymentStatus = "paid";
    else if (["cancel", "deny", "expire"].includes(ts)) paymentStatus = "failed";

    if (paymentStatus === paymentRecord[0].paymentStatus) return;

    await db.update(payments)
      .set({
        paymentStatus,
        paymentDate: paymentStatus === "paid" ? new Date().toISOString() : undefined,
      })
      .where(eq(payments.orderId, orderId));

    if (paymentStatus === "paid") {
      await db.update(orders).set({ orderStatus: "processing" }).where(eq(orders.id, orderId));
    } else if (paymentStatus === "failed") {
      await db.update(orders).set({ orderStatus: "cancelled" }).where(eq(orders.id, orderId));
    }

    revalidatePath(`/order-success`);
    revalidatePath(`/admin/orders`);
  } catch (error) {
    console.error("syncPaymentStatus error:", error);
  }
}
