"use server";

import { db } from "@/db";
import { orders, users, products } from "@/db/schema";
import { sql, count, sum, eq, gte, lte, and } from "drizzle-orm";

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

export async function getOmsetBreakdown(startDate?: string, endDate?: string) {
  try {
    let startISO: string;
    let endISO: string;

    const now = new Date();

    if (startDate) {
      startISO = new Date(startDate + "T00:00:00").toISOString();
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      startISO = startOfMonth.toISOString();
    }

    if (endDate) {
      endISO = new Date(endDate + "T23:59:59.999").toISOString();
    } else {
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      endISO = endOfToday.toISOString();
    }

    const todayOrders = await db
      .select({
        id: orders.id,
        grandTotal: orders.grandTotal,
        orderStatus: orders.orderStatus,
      })
      .from(orders)
      .where(and(gte(orders.orderDate, startISO), lte(orders.orderDate, endISO)));

    const breakdown = {
      pending: { revenue: 0, count: 0 },
      processing: { revenue: 0, count: 0 },
      shipped: { revenue: 0, count: 0 },
      delivered: { revenue: 0, count: 0 },
      cancelled: { revenue: 0, count: 0 },
    };

    let totalRevenue = 0;
    let totalCount = 0;

    for (const order of todayOrders) {
      const status = (order.orderStatus || "pending") as keyof typeof breakdown;
      if (breakdown[status]) {
        breakdown[status].revenue += order.grandTotal || 0;
        breakdown[status].count += 1;

        if (status !== "cancelled") {
          totalRevenue += order.grandTotal || 0;
          totalCount += 1;
        }
      }
    }

    return {
      success: true,
      stats: {
        total: { revenue: totalRevenue, count: totalCount },
        breakdown,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch omset breakdown:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
