"use server";

import { db } from "@/db";
import { storeInfo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStoreInfo() {
  const result = await db.select().from(storeInfo).limit(1);
  return result[0] || null;
}

export async function saveStoreInfo(data: {
  storeName: string;
  logoUrl: string;
  faviconUrl?: string | null;
  email: string;
  phone: string;
  supportPhone: string;
  address: string;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  appStoreUrl?: string | null;
  googlePlayUrl?: string | null;
  copyrightText: string;
  primaryColor?: string;
}) {
  const existing = await db.select().from(storeInfo).limit(1);

  if (existing.length > 0) {
    await db
      .update(storeInfo)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(storeInfo.id, existing[0].id));
  } else {
    await db.insert(storeInfo).values(data);
  }

  revalidatePath("/admin/store-settings/profile");
  revalidatePath("/", "layout");
}
