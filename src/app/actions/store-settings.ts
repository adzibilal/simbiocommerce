"use server";

import { db } from "@/db";
import { storeSettings, shippingOrigins, settingsAuditLog, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";
import type {
  PaymentSettings,
  ShippingSettings,
  ShippingOrigin,
  SettingsAuditLog,
  StoreSettingsOverview,
  TestConnectionResult,
} from "@/types/store-settings";
import midtransClient from "midtrans-client";

const PAYMENT_SETTINGS_KEY = "payment_settings";
const SHIPPING_SETTINGS_KEY = "shipping_settings";

async function createAuditLog(data: {
  settingKey: string;
  action: "created" | "updated" | "deleted";
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(settingsAuditLog).values({
      id: crypto.randomUUID(),
      settingKey: data.settingKey,
      action: data.action,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changedBy: data.changedBy,
      changedAt: new Date().toISOString(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  try {
    const result = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, PAYMENT_SETTINGS_KEY))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const decryptedValue = decrypt(result[0].value);
    return JSON.parse(decryptedValue) as PaymentSettings;
  } catch (error) {
    console.error("Failed to get payment settings:", error);
    return null;
  }
}

export async function savePaymentSettings(
  data: PaymentSettings,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptedValue = encrypt(JSON.stringify(data));

    const existing = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, PAYMENT_SETTINGS_KEY))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(storeSettings)
        .set({
          value: encryptedValue,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        })
        .where(eq(storeSettings.key, PAYMENT_SETTINGS_KEY));

      await createAuditLog({
        settingKey: PAYMENT_SETTINGS_KEY,
        action: "updated",
        oldValue: existing[0].value,
        newValue: encryptedValue,
        changedBy: userId,
      });
    } else {
      await db.insert(storeSettings).values({
        id: crypto.randomUUID(),
        key: PAYMENT_SETTINGS_KEY,
        value: encryptedValue,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      });

      await createAuditLog({
        settingKey: PAYMENT_SETTINGS_KEY,
        action: "created",
        newValue: encryptedValue,
        changedBy: userId,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save payment settings:", error);
    return { success: false, error: error.message };
  }
}

export async function testMidtransConnection(
  serverKey: string,
  clientKey: string,
  isProduction: boolean
): Promise<TestConnectionResult> {
  try {
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    const testParameter = {
      transaction_details: {
        order_id: `test-${Date.now()}`,
        gross_amount: 10000,
      },
      customer_details: {
        first_name: "Test",
        email: "test@example.com",
        phone: "08123456789",
      },
    };

    await snap.createTransaction(testParameter);

    return {
      success: true,
      message: "Connection successful! Midtrans credentials are valid.",
    };
  } catch (error: any) {
    console.error("Midtrans connection test failed:", error);
    return {
      success: false,
      message: error.message || "Connection failed. Please check your credentials.",
      details: error,
    };
  }
}

export async function getShippingSettings(): Promise<ShippingSettings | null> {
  try {
    const result = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, SHIPPING_SETTINGS_KEY))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const decryptedValue = decrypt(result[0].value);
    return JSON.parse(decryptedValue) as ShippingSettings;
  } catch (error) {
    console.error("Failed to get shipping settings:", error);
    return null;
  }
}

export async function saveShippingSettings(
  data: ShippingSettings,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptedValue = encrypt(JSON.stringify(data));

    const existing = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, SHIPPING_SETTINGS_KEY))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(storeSettings)
        .set({
          value: encryptedValue,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        })
        .where(eq(storeSettings.key, SHIPPING_SETTINGS_KEY));

      await createAuditLog({
        settingKey: SHIPPING_SETTINGS_KEY,
        action: "updated",
        oldValue: existing[0].value,
        newValue: encryptedValue,
        changedBy: userId,
      });
    } else {
      await db.insert(storeSettings).values({
        id: crypto.randomUUID(),
        key: SHIPPING_SETTINGS_KEY,
        value: encryptedValue,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      });

      await createAuditLog({
        settingKey: SHIPPING_SETTINGS_KEY,
        action: "created",
        newValue: encryptedValue,
        changedBy: userId,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save shipping settings:", error);
    return { success: false, error: error.message };
  }
}

export async function testRajaOngkirConnection(
  apiKey: string
): Promise<TestConnectionResult> {
  try {
    const response = await fetch(
      "https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=jakarta&limit=1",
      {
        headers: {
          key: apiKey,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Connection successful! Raja Ongkir API key is valid.",
        details: data,
      };
    }

    const errData = await response.json().catch(() => ({}));
    return {
      success: false,
      message: errData?.message || `Connection failed (HTTP ${response.status}).`,
      details: errData,
    };
  } catch (error: any) {
    console.error("Raja Ongkir connection test failed:", error);
    return {
      success: false,
      message: error.message || "Connection failed. Please check your API key.",
      details: error,
    };
  }
}

export async function getShippingOrigins(): Promise<ShippingOrigin[]> {
  try {
    const results = await db
      .select()
      .from(shippingOrigins)
      .orderBy(desc(shippingOrigins.isDefault), shippingOrigins.cityName);

    return results as ShippingOrigin[];
  } catch (error) {
    console.error("Failed to get shipping origins:", error);
    return [];
  }
}

export async function addShippingOrigin(
  data: Omit<ShippingOrigin, "id" | "createdAt">,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.isDefault) {
      await db
        .update(shippingOrigins)
        .set({ isDefault: false })
        .where(eq(shippingOrigins.isDefault, true));
    }

    await db.insert(shippingOrigins).values({
      id: crypto.randomUUID(),
      cityId: data.cityId,
      cityName: data.cityName,
      provinceName: data.provinceName,
      isDefault: data.isDefault,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
    });

    await createAuditLog({
      settingKey: "shipping_origins",
      action: "created",
      newValue: JSON.stringify(data),
      changedBy: userId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to add shipping origin:", error);
    return { success: false, error: error.message };
  }
}

export async function updateShippingOrigin(
  id: string,
  data: Partial<Omit<ShippingOrigin, "id" | "createdAt">>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await db
      .select()
      .from(shippingOrigins)
      .where(eq(shippingOrigins.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Origin not found" };
    }

    if (data.isDefault) {
      await db
        .update(shippingOrigins)
        .set({ isDefault: false })
        .where(eq(shippingOrigins.isDefault, true));
    }

    await db
      .update(shippingOrigins)
      .set(data)
      .where(eq(shippingOrigins.id, id));

    await createAuditLog({
      settingKey: "shipping_origins",
      action: "updated",
      oldValue: JSON.stringify(existing[0]),
      newValue: JSON.stringify({ ...existing[0], ...data }),
      changedBy: userId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update shipping origin:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingOrigin(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await db
      .select()
      .from(shippingOrigins)
      .where(eq(shippingOrigins.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Origin not found" };
    }

    await db.delete(shippingOrigins).where(eq(shippingOrigins.id, id));

    await createAuditLog({
      settingKey: "shipping_origins",
      action: "deleted",
      oldValue: JSON.stringify(existing[0]),
      changedBy: userId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete shipping origin:", error);
    return { success: false, error: error.message };
  }
}

export async function setDefaultOrigin(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(shippingOrigins)
      .set({ isDefault: false })
      .where(eq(shippingOrigins.isDefault, true));

    await db
      .update(shippingOrigins)
      .set({ isDefault: true })
      .where(eq(shippingOrigins.id, id));

    await createAuditLog({
      settingKey: "shipping_origins",
      action: "updated",
      newValue: `Set origin ${id} as default`,
      changedBy: userId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to set default origin:", error);
    return { success: false, error: error.message };
  }
}

export async function getSettingsAuditLog(
  settingKey?: string,
  limit: number = 10
): Promise<SettingsAuditLog[]> {
  try {
    let query = db.select().from(settingsAuditLog);

    if (settingKey) {
      query = query.where(eq(settingsAuditLog.settingKey, settingKey)) as any;
    }

    const results = await query
      .orderBy(desc(settingsAuditLog.changedAt))
      .limit(limit);

    return results as SettingsAuditLog[];
  } catch (error) {
    console.error("Failed to get audit log:", error);
    return [];
  }
}

export async function getStoreSettingsOverview(): Promise<StoreSettingsOverview> {
  try {
    const paymentSettings = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, PAYMENT_SETTINGS_KEY))
      .limit(1);

    const shippingSettings = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, SHIPPING_SETTINGS_KEY))
      .limit(1);

    const origins = await db.select().from(shippingOrigins);

    const recentChanges = await getSettingsAuditLog(undefined, 5);

    let paymentData = null;
    if (paymentSettings.length > 0) {
      try {
        const decrypted = decrypt(paymentSettings[0].value);
        paymentData = JSON.parse(decrypted);
      } catch (e) {
        console.error("Failed to decrypt payment settings:", e);
      }
    }

    let shippingData = null;
    if (shippingSettings.length > 0) {
      try {
        const decrypted = decrypt(shippingSettings[0].value);
        shippingData = JSON.parse(decrypted);
      } catch (e) {
        console.error("Failed to decrypt shipping settings:", e);
      }
    }

    return {
      payment: {
        configured: paymentSettings.length > 0,
        isProduction: paymentData?.isProduction || false,
        lastUpdated: paymentSettings[0]?.updatedAt,
        updatedBy: paymentSettings[0]?.updatedBy || undefined,
      },
      shipping: {
        configured: shippingSettings.length > 0,
        accountType: shippingData?.accountType,
        originsCount: origins.length,
        lastUpdated: shippingSettings[0]?.updatedAt,
        updatedBy: shippingSettings[0]?.updatedBy || undefined,
      },
      recentChanges,
    };
  } catch (error) {
    console.error("Failed to get store settings overview:", error);
    return {
      payment: {
        configured: false,
        isProduction: false,
      },
      shipping: {
        configured: false,
        originsCount: 0,
      },
      recentChanges: [],
    };
  }
}

const EMAIL_SETTINGS_KEY = "email_settings";

export interface EmailSettings {
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const result = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, EMAIL_SETTINGS_KEY))
      .limit(1);
    if (result.length === 0) return null;
    const decrypted = decrypt(result[0].value);
    return JSON.parse(decrypted) as EmailSettings;
  } catch {
    return null;
  }
}

export async function saveEmailSettings(
  data: EmailSettings,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptedValue = encrypt(JSON.stringify(data));
    const existing = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, EMAIL_SETTINGS_KEY))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(storeSettings)
        .set({ value: encryptedValue, updatedAt: new Date().toISOString(), updatedBy: userId })
        .where(eq(storeSettings.key, EMAIL_SETTINGS_KEY));
    } else {
      await db.insert(storeSettings).values({
        id: crypto.randomUUID(),
        key: EMAIL_SETTINGS_KEY,
        value: encryptedValue,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      });
    }

    await createAuditLog({ settingKey: EMAIL_SETTINGS_KEY, action: existing.length > 0 ? "updated" : "created", changedBy: userId });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
