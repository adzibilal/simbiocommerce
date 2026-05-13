"use server";

import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
