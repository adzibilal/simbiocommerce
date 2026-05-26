"use server";

import { db } from "@/db";
import { savedAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSavedAddresses(userId: string) {
  return await db
    .select()
    .from(savedAddresses)
    .where(eq(savedAddresses.userId, userId))
    .orderBy(savedAddresses.isDefault, savedAddresses.createdAt);
}

export async function saveSavedAddress(
  userId: string,
  data: {
    label: string;
    recipientName: string;
    phone: string;
    address: string;
    provinceId?: number;
    cityId?: number;
    postalCode?: string;
    isDefault?: boolean;
  }
) {
  if (data.isDefault) {
    await db.update(savedAddresses)
      .set({ isDefault: false })
      .where(eq(savedAddresses.userId, userId));
  }

  await db.insert(savedAddresses).values({
    userId,
    label: data.label.trim(),
    recipientName: data.recipientName.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    provinceId: data.provinceId ?? null,
    cityId: data.cityId ?? null,
    postalCode: data.postalCode ?? null,
    isDefault: data.isDefault ?? false,
  });

  revalidatePath("/my-account");
  return { success: true };
}

export async function deleteSavedAddress(id: string, userId: string) {
  await db.delete(savedAddresses).where(
    and(eq(savedAddresses.id, id), eq(savedAddresses.userId, userId))
  );
  revalidatePath("/my-account");
  return { success: true };
}

export async function setDefaultAddress(id: string, userId: string) {
  await db.update(savedAddresses).set({ isDefault: false }).where(eq(savedAddresses.userId, userId));
  await db.update(savedAddresses).set({ isDefault: true }).where(
    and(eq(savedAddresses.id, id), eq(savedAddresses.userId, userId))
  );
  revalidatePath("/my-account");
  return { success: true };
}
