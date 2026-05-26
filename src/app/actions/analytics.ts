"use server";

import { db } from "@/db";
import { orders, orderItems, products, users, payments } from "@/db/schema";
import { eq, gte, lte, sql, desc, and, ne } from "drizzle-orm";

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function startOf(period: "day" | "week" | "month"): string {
  const d = new Date();
  if (period === "day") d.setHours(0, 0, 0, 0);
  else if (period === "week") { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); }
  else { d.setDate(1); d.setHours(0, 0, 0, 0); }
  return d.toISOString();
}

// ─── Sales chart — fetch raw orders and group in JS ──────────────────────────
export async function getSalesChart(period: "7" | "30" | "90" = "30") {
  const days = parseInt(period);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({ date: orders.orderDate, revenue: orders.grandTotal })
    .from(orders)
    .where(and(gte(orders.orderDate, since.toISOString()), ne(orders.orderStatus, "cancelled")));

  // Group by day in JS
  const map = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    const day = r.date!.slice(0, 10);
    const prev = map.get(day) ?? { revenue: 0, count: 0 };
    map.set(day, { revenue: prev.revenue + (r.revenue ?? 0), count: prev.count + 1 });
  }

  return lastNDays(days).map((date) => ({
    date,
    revenue: map.get(date)?.revenue ?? 0,
    count: map.get(date)?.count ?? 0,
  }));
}

// ─── Top products by quantity sold ───────────────────────────────────────────
export async function getTopProductsReport(limit = 10) {
  // Fetch all order items with product names, group in JS
  const rows = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      qty: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId));

  const map = new Map<string, { name: string; totalQty: number; totalRevenue: number }>();
  for (const r of rows) {
    const id = r.productId ?? "";
    const prev = map.get(id) ?? { name: r.name ?? "", totalQty: 0, totalRevenue: 0 };
    map.set(id, {
      name: r.name ?? "",
      totalQty: prev.totalQty + (r.qty ?? 0),
      totalRevenue: prev.totalRevenue + (r.qty ?? 0) * (r.unitPrice ?? 0),
    });
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit);
}

// ─── Revenue summary ─────────────────────────────────────────────────────────
async function revenueQuery(since?: string) {
  const rows = await db
    .select({ grandTotal: orders.grandTotal })
    .from(orders)
    .where(
      since
        ? and(gte(orders.orderDate, since), ne(orders.orderStatus, "cancelled"))
        : ne(orders.orderStatus, "cancelled")
    );
  return {
    revenue: rows.reduce((s, r) => s + (r.grandTotal ?? 0), 0),
    orderCount: rows.length,
  };
}

export async function getRevenueSummary() {
  const [allTime, month, week, today] = await Promise.all([
    revenueQuery(),
    revenueQuery(startOf("month")),
    revenueQuery(startOf("week")),
    revenueQuery(startOf("day")),
  ]);
  return { allTime, month, week, today };
}

// ─── Customer analytics: new vs returning ────────────────────────────────────
export async function getCustomerAnalytics() {
  const [allCustomers, allOrders] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.role, "customer")),
    db.select({ userId: orders.userId, date: orders.orderDate }).from(orders),
  ]);

  // Count orders per user
  const orderCount = new Map<string, number>();
  for (const o of allOrders) {
    if (!o.userId) continue;
    orderCount.set(o.userId, (orderCount.get(o.userId) ?? 0) + 1);
  }

  const total = allCustomers.length;
  const returningCount = allCustomers.filter((c) => (orderCount.get(c.id!) ?? 0) > 1).length;

  // Orders per month (last 6 months) as proxy for activity
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthMap = new Map<string, number>();
  for (const o of allOrders) {
    const m = o.date?.slice(0, 7);
    if (m) monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
  }
  const ordersPerMonthChart = months.map((m) => ({ month: m, orders: monthMap.get(m) ?? 0 }));

  return { total, returning: returningCount, newOnly: total - returningCount, ordersPerMonthChart };
}

// ─── Export orders as CSV ─────────────────────────────────────────────────────
export async function getOrdersForExport(from?: string, to?: string) {
  let condition: any = ne(orders.orderStatus, "cancelled");
  if (from && to) condition = and(ne(orders.orderStatus, "cancelled"), gte(orders.orderDate, from), lte(orders.orderDate, to + "T23:59:59"));
  else if (from) condition = and(ne(orders.orderStatus, "cancelled"), gte(orders.orderDate, from));
  else if (to) condition = and(ne(orders.orderStatus, "cancelled"), lte(orders.orderDate, to + "T23:59:59"));

  return await db
    .select({
      id: orders.id,
      date: orders.orderDate,
      customer: users.name,
      email: users.email,
      status: orders.orderStatus,
      paymentMethod: payments.paymentMethod,
      paymentStatus: payments.paymentStatus,
      totalProductPrice: orders.totalProductPrice,
      shippingCost: orders.totalShippingCost,
      couponDiscount: orders.couponDiscount,
      grandTotal: orders.grandTotal,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(condition)
    .orderBy(desc(orders.orderDate));
}
