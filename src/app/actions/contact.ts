"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseSchema, contactSchema } from "@/lib/validation";

export async function submitContact(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const validation = parseSchema(contactSchema, data);
  if (!validation.success) return { success: false, error: validation.error };

  try {
    await db.insert(contactMessages).values(validation.data);
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

export async function replyContactMessage(id: string, replyText: string) {
  const msg = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!msg[0]) return { success: false, error: "Message not found" };

  const { sendContactReply } = await import("@/lib/email");
  const result = await sendContactReply({
    to: msg[0].email,
    customerName: `${msg[0].firstName} ${msg[0].lastName ?? ""}`.trim(),
    originalMessage: msg[0].message,
    replyText,
  });

  if (!result.success) return { success: false, error: result.error };

  await db.update(contactMessages).set({ status: "replied" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/contact-messages");
  return { success: true };
}
