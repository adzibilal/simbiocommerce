import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPaymentSettings } from "@/app/actions/store-settings";
import crypto from "crypto";

function resolvePaymentStatus(transactionStatus: string, fraudStatus?: string) {
  if (transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "challenge" : "paid";
  }
  if (transactionStatus === "settlement") return "paid";
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "failed";
  if (transactionStatus === "pending") return "pending";
  return "pending";
}

function resolveOrderStatus(paymentStatus: string) {
  if (paymentStatus === "paid") return "processing";
  if (paymentStatus === "failed") return "cancelled";
  return "pending";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

    // Verify signature
    const settings = await getPaymentSettings();
    const serverKey = settings?.serverKey || process.env.MIDTRANS_SERVER_KEY || "";
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const paymentStatus = resolvePaymentStatus(transaction_status, fraud_status);
    const orderStatus = resolveOrderStatus(paymentStatus);

    await db.update(payments)
      .set({
        paymentStatus,
        paymentDate: paymentStatus === "paid" ? new Date().toISOString() : undefined,
      })
      .where(eq(payments.orderId, order_id));

    if (paymentStatus === "paid" || paymentStatus === "failed") {
      await db.update(orders)
        .set({ orderStatus })
        .where(eq(orders.id, order_id));
    }

    return NextResponse.json({ message: "OK" });
  } catch (error: any) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
