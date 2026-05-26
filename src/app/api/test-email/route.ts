import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getEmailSettings } from "@/app/actions/store-settings";
import { getStoreInfo } from "@/app/actions/store-info";

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();
    const settings = await getEmailSettings();
    if (!settings?.resendApiKey) {
      return NextResponse.json({ success: false, error: "API key belum dikonfigurasi" });
    }

    const storeInfo = await getStoreInfo();
    const storeName = storeInfo?.storeName ?? "Toko";
    const resend = new Resend(settings.resendApiKey);

    await resend.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to,
      subject: `Test Email — ${storeName}`,
      html: `<div style="font-family:sans-serif;padding:32px;background:#f4f6fb;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#3C50E0;">✅ Email berfungsi!</h2><p style="color:#374151;">Konfigurasi Resend untuk <strong>${storeName}</strong> berhasil. Email notifikasi akan dikirim otomatis ke customer dan admin.</p></div></div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
