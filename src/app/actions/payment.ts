"use server";

import midtransClient from "midtrans-client";
import { getPaymentSettings } from "./store-settings";

async function getSnapClient() {
  const dbSettings = await getPaymentSettings();
  
  if (dbSettings) {
    return new midtransClient.Snap({
      isProduction: dbSettings.isProduction,
      serverKey: dbSettings.serverKey,
      clientKey: dbSettings.clientKey,
    });
  }
  
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  });
}

export async function createPaymentToken(orderId: string, amount: number, customerDetails: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
}) {
  try {
    const snap = await getSnapClient();
    
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName || "",
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    
    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error: any) {
    console.error("Failed to create payment token:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment token",
    };
  }
}

export async function getTransactionStatus(orderId: string) {
  try {
    const snap = await getSnapClient();
    const statusResponse = await snap.transaction.status(orderId);
    
    return {
      success: true,
      status: statusResponse.transaction_status,
      fraudStatus: statusResponse.fraud_status,
      data: statusResponse,
    };
  } catch (error: any) {
    console.error("Failed to get transaction status:", error);
    return {
      success: false,
      error: error.message || "Failed to get transaction status",
    };
  }
}
