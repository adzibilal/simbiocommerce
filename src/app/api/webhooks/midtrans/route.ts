import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      transaction_time,
      gross_amount,
    } = body;

    console.log("Midtrans notification:", body);

    let paymentStatus = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        paymentStatus = "paid";
      }
    } else if (transaction_status === "settlement") {
      paymentStatus = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "failed";
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
    }

    await db
      .update(orders)
      .set({
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order_id));

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
