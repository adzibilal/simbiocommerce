"use server";

import { db } from "@/db";
import { orders, users, products } from "@/db/schema";
import { sql, count, sum, eq } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const totalOrdersResult = await db.select({ count: count() }).from(orders);
    const totalOrders = totalOrdersResult[0]?.count || 0;

    const totalSalesResult = await db
      .select({ total: sum(orders.grandTotal) })
      .from(orders)
      .where(eq(orders.orderStatus, "completed"));
    const totalSales = totalSalesResult[0]?.total || 0;

    const totalProductsResult = await db.select({ count: count() }).from(products);
    const totalProducts = totalProductsResult[0]?.count || 0;

    const totalCustomersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "customer"));
    const totalCustomers = totalCustomersResult[0]?.count || 0;

    return {
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getRecentOrders(limit: number = 5) {
  try {
    const recentOrders = await db
      .select({
        id: orders.id,
        orderDate: orders.orderDate,
        grandTotal: orders.grandTotal,
        orderStatus: orders.orderStatus,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(sql`${orders.orderDate} DESC`)
      .limit(limit);

    return {
      success: true,
      orders: recentOrders,
    };
  } catch (error: any) {
    console.error("Failed to fetch recent orders:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getTopProducts(limit: number = 5) {
  try {
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .orderBy(sql`${products.stock} DESC`)
      .limit(limit);

    return {
      success: true,
      products: topProducts,
    };
  } catch (error: any) {
    console.error("Failed to fetch top products:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
