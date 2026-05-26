"use server";

import { db } from "@/db";
import { orders, users, orderItems as orderItemsTable, products, payments, shipping, productImages } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import * as crypto from "crypto";
import { createPaymentToken, getTransactionStatus } from "./payment";
import { sendOrderConfirmation, sendNewOrderNotification, sendOrderStatusUpdate, sendPaymentProofNotification } from "@/lib/email";
import { getStoreInfo } from "./store-info";
import { parseSchema, createOrderSchema } from "@/lib/validation";

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
      id: orderItemsTable.id,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(orderItemsTable)
    .leftJoin(products, eq(products.id, orderItemsTable.productId))
    .where(eq(orderItemsTable.orderId, orderId));
}

export async function getOrderDetail(orderId: string) {
  const order = await db
    .select({
      id: orders.id,
      date: orders.orderDate,
      totalProductPrice: orders.totalProductPrice,
      totalShippingCost: orders.totalShippingCost,
      couponDiscount: orders.couponDiscount,
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
      productId: orderItemsTable.productId,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      productName: products.name,
      imageUrl: productImages.imageUrl,
    })
    .from(orderItemsTable)
    .leftJoin(products, eq(products.id, orderItemsTable.productId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order[0], items };
}

export async function updateOrderStatus(id: string, status: string) {
  await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  // Notify customer
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const orderUser = await db
      .select({ email: users.email, name: users.name })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(eq(orders.id, id))
      .limit(1);
    const shippingRow = await db.select({ trackingNumber: shipping.trackingNumber, courierCode: shipping.courierCode }).from(shipping).where(eq(shipping.orderId, id)).limit(1);
    if (orderUser[0]?.email) {
      sendOrderStatusUpdate({
        to: orderUser[0].email,
        customerName: orderUser[0].name ?? "Customer",
        orderId: id,
        newStatus: status,
        trackingNumber: shippingRow[0]?.trackingNumber,
        courierCode: shippingRow[0]?.courierCode,
        orderUrl: `${baseUrl}/order-success?orderId=${id}`,
      }).catch(console.error);
    }
  } catch {}
}

export async function submitPaymentProof(orderId: string, proofUrl: string) {
  await db.update(payments)
    .set({ paymentProof: proofUrl, paymentStatus: "waiting_confirmation" })
    .where(eq(payments.orderId, orderId));
  revalidatePath(`/order-success`);
  revalidatePath(`/admin/orders/${orderId}`);

  // Notify admin
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const storeData = await getStoreInfo();
    if (storeData?.email) {
      const orderRow = await db
        .select({ grandTotal: orders.grandTotal })
        .from(orders).where(eq(orders.id, orderId)).limit(1);
      const orderUser = await db
        .select({ name: users.name })
        .from(orders)
        .leftJoin(users, eq(users.id, orders.userId))
        .where(eq(orders.id, orderId)).limit(1);
      sendPaymentProofNotification({
        adminEmail: storeData.email,
        orderId,
        customerName: orderUser[0]?.name ?? "Customer",
        grandTotal: orderRow[0]?.grandTotal ?? 0,
        adminOrderUrl: `${baseUrl}/admin/orders/${orderId}`,
      }).catch(console.error);
    }
  } catch {}
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

  // Notify customer of shipment
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const orderUser = await db
      .select({ email: users.email, name: users.name })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(eq(orders.id, orderId))
      .limit(1);
    const courierRow = await db.select({ courierCode: shipping.courierCode }).from(shipping).where(eq(shipping.orderId, orderId)).limit(1);
    if (orderUser[0]?.email) {
      sendOrderStatusUpdate({
        to: orderUser[0].email,
        customerName: orderUser[0].name ?? "Customer",
        orderId,
        newStatus: "shipped",
        trackingNumber,
        courierCode: courierRow[0]?.courierCode,
        orderUrl: `${baseUrl}/order-success?orderId=${orderId}`,
      }).catch(console.error);
    }
  } catch {}
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
    couponDiscount?: number;
  }
) {
  const validation = parseSchema(createOrderSchema, orderData);
  if (!validation.success) return { success: false, error: validation.error };

  try {
    // Hitung total di luar transaksi (tidak butuh lock)
    const totalProductPrice = orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const couponDiscount = orderData.couponDiscount ?? 0;
    const grandTotal = totalProductPrice + orderData.shippingData.shippingCost - couponDiscount;
    const orderId = crypto.randomUUID();

    // Semua operasi DB dalam satu transaksi — auto rollback jika ada yang gagal
    db.transaction((tx) => {
      // Validasi & deduct stock secara atomik untuk mencegah race condition
      for (const item of orderData.items) {
        const product = tx.select({ id: products.id, name: products.name, stock: products.stock })
          .from(products)
          .where(eq(products.id, item.productId))
          .get();

        if (!product) throw new Error(`Produk tidak ditemukan`);
        if (product.stock < item.quantity) {
          throw new Error(`Stok ${product.name} tidak cukup (tersisa ${product.stock})`);
        }

        // Atomic decrement: hanya berhasil jika stock masih >= quantity saat update
        tx.update(products)
          .set({ stock: sql`stock - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
          .run();

        // Verifikasi update berhasil (guard tambahan)
        const updated = tx.select({ stock: products.stock }).from(products).where(eq(products.id, item.productId)).get();
        if (!updated || updated.stock < 0) throw new Error(`Stok ${product.name} habis`);
      }

      // Insert order
      tx.insert(orders).values({
        id: orderId,
        userId: orderData.userId,
        orderDate: new Date().toISOString(),
        totalProductPrice,
        totalShippingCost: orderData.shippingData.shippingCost,
        couponDiscount,
        grandTotal,
        orderStatus: "pending",
      }).run();

      // Insert order items
      for (const item of orderData.items) {
        tx.insert(orderItemsTable).values({
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotalWeight: item.weight * item.quantity,
        }).run();
      }

      // Insert payment record
      tx.insert(payments).values({
        id: crypto.randomUUID(),
        orderId,
        paymentMethod: orderData.paymentData.paymentMethod,
        paymentAmount: orderData.paymentData.paymentAmount,
        paymentStatus: "pending",
      }).run();

      // Insert shipping record
      tx.insert(shipping).values({
        id: crypto.randomUUID(),
        orderId,
        destinationProvinceId: orderData.shippingData.destinationProvinceId,
        destinationCityId: orderData.shippingData.destinationCityId,
        courierCode: orderData.shippingData.courierCode,
        courierService: orderData.shippingData.courierService,
        totalWeight: orderData.shippingData.totalWeight,
        shippingCost: orderData.shippingData.shippingCost,
        shippingStatus: "pending",
      }).run();
    });

    revalidatePath("/admin/orders");

    const paymentMethod = orderData.paymentData.paymentMethod;

    // Send emails after response using after() to ensure they complete
    const emailOrderId = orderId;
    const emailCustomer = orderData.customerDetails;
    const emailShipping = orderData.shippingData;
    after(async () => {
      try {
        console.log("[order] sending emails for order", emailOrderId);
        const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const storeData = await getStoreInfo();
        const emailItems = await db
          .select({ name: products.name, quantity: orderItemsTable.quantity, unitPrice: orderItemsTable.unitPrice })
          .from(orderItemsTable)
          .leftJoin(products, eq(products.id, orderItemsTable.productId))
          .where(eq(orderItemsTable.orderId, emailOrderId));

        await sendOrderConfirmation({
          to: emailCustomer.email,
          customerName: `${emailCustomer.firstName} ${emailCustomer.lastName ?? ""}`.trim(),
          orderId: emailOrderId,
          items: emailItems.map((i) => ({ name: i.name ?? "", qty: i.quantity, price: i.unitPrice })),
          subtotal: totalProductPrice,
          shippingCost: emailShipping.shippingCost,
          couponDiscount,
          grandTotal,
          paymentMethod,
          courierCode: emailShipping.courierCode,
          courierService: emailShipping.courierService,
          orderUrl: `${baseUrl}/order-success?orderId=${emailOrderId}`,
        });

        if (storeData?.email) {
          await sendNewOrderNotification({
            adminEmail: storeData.email,
            orderId: emailOrderId,
            customerName: `${emailCustomer.firstName} ${emailCustomer.lastName ?? ""}`.trim(),
            grandTotal,
            paymentMethod,
            adminOrderUrl: `${baseUrl}/admin/orders/${emailOrderId}`,
          });
        }
      } catch (err) {
        console.error("[order] email error:", err);
      }
    });

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
