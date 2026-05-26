"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCustomers(page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const [result, totalRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, "customer"))
      .limit(perPage)
      .offset(offset),
    db.select({ count: count() }).from(users).where(eq(users.role, "customer")),
  ]);

  return { data: result.map(u => ({ ...u, status: "Active" })), total: totalRows[0].count };
}
