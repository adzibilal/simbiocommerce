"use server";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNewsletterSubscribers() {
  return await db.select().from(newsletterSubscribers);
}

export async function subscribeNewsletter(email: string) {
  try {
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));

    if (existing.length > 0) {
      if (existing[0].isActive) {
        return { success: false, error: "This email is already subscribed." };
      }
      await db
        .update(newsletterSubscribers)
        .set({ isActive: true, unsubscribedAt: null, subscribedAt: new Date().toISOString() })
        .where(eq(newsletterSubscribers.email, email));
      revalidatePath("/admin/newsletters");
      return { success: true };
    }

    await db.insert(newsletterSubscribers).values({ email });
    revalidatePath("/admin/newsletters");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to subscribe." };
  }
}

export async function toggleSubscriberStatus(id: string, isActive: boolean) {
  await db
    .update(newsletterSubscribers)
    .set({
      isActive,
      unsubscribedAt: isActive ? null : new Date().toISOString(),
    })
    .where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletters");
}

export async function deleteSubscriber(id: string) {
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletters");
}
