"use server";

import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const PAGE_KEYS = {
  "privacy-policy": "page_privacy_policy",
  "refund-policy": "page_refund_policy",
  "terms-of-use": "page_terms_of_use",
  faqs: "page_faqs",
} as const;

export type PageSlug = keyof typeof PAGE_KEYS;

export async function getPageContent(slug: PageSlug): Promise<string> {
  try {
    const key = PAGE_KEYS[slug];
    const result = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, key))
      .limit(1);
    return result[0]?.value ?? "";
  } catch {
    return "";
  }
}

export async function savePageContent(
  slug: PageSlug,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = PAGE_KEYS[slug];
    const existing = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(storeSettings)
        .set({ value: content, updatedAt: new Date().toISOString() })
        .where(eq(storeSettings.key, key));
    } else {
      await db.insert(storeSettings).values({
        id: crypto.randomUUID(),
        key,
        value: content,
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
