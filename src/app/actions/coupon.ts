"use server";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCoupons() {
  return await db.select().from(coupons);
}

export async function createCoupon(data: { code: string; discount: string; type: string; expiry: string; status?: string; maxUsage?: number }) {
  try {
    await db.insert(coupons).values(data);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: "Coupon code already exists!" };
    }
    return { success: false, error: error.message || "Failed to create coupon" };
  }
}

export async function deleteCoupon(id: string) {
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function updateCoupon(id: string, data: { code: string; discount: string; type: string; expiry: string; status?: string; maxUsage?: number }) {
  try {
    await db.update(coupons).set(data).where(eq(coupons.id, id));
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: "Coupon code already exists!" };
    }
    return { success: false, error: error.message || "Failed to update coupon" };
  }
}
