"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitContact(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    await db.insert(contactMessages).values(data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send message" };
  }
}

export async function getContactMessages() {
  return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
}

export async function markContactRead(id: string) {
  await db.update(contactMessages).set({ status: "read" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/contact-messages");
}

export async function deleteContactMessage(id: string) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/contact-messages");
}
