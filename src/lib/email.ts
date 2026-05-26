import { Resend } from "resend";
import { getEmailSettings } from "@/app/actions/store-settings";
import { getStoreInfo } from "@/app/actions/store-info";
import { formatCurrency } from "./currency";

async function getResend() {
  const settings = await getEmailSettings();
  if (!settings) {
    console.log("[email] getEmailSettings returned null — email settings not configured");
    return null;
  }
  if (!settings.enabled) {
    console.log("[email] email notifications disabled in settings");
    return null;
  }
  if (!settings.resendApiKey) {
    console.log("[email] resendApiKey missing");
    return null;
  }
  return { resend: new Resend(settings.resendApiKey), settings };
}

function baseTemplate(storeName: string, content: string) {
  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
        <tr><td style="background:#3C50E0;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${storeName}</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          ${content}
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Email ini dikirim otomatis oleh sistem ${storeName}. Mohon tidak membalas email ini.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderItemsTable(items: { name: string; qty: number; price: number }[]) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0;color:#374151;font-size:14px;">${i.name}</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:center;">×${i.qty}</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;">${formatCurrency(i.price * i.qty)}</td>
    </tr>`).join("");
  return `<table width="100%" style="border-collapse:collapse;">${rows}</table>`;
}

// --- Order Confirmation ---
export async function sendOrderConfirmation(data: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  couponDiscount?: number;
  grandTotal: number;
  paymentMethod: string;
  courierCode?: string;
  courierService?: string;
  orderUrl: string;
}) {
  const client = await getResend();
  if (!client) {
    console.log("[email] sendOrderConfirmation: getResend() returned null, skipping");
    return;
  }
  const { resend, settings } = client;
  const storeInfo = await getStoreInfo();
  const storeName = storeInfo?.storeName ?? "Toko";
  console.log("[email] sending order confirmation to:", data.to, "from:", settings.fromEmail);

  const paymentLabel = data.paymentMethod === "cod" ? "Bayar di Tempat (COD)"
    : data.paymentMethod === "bank_transfer" ? "Transfer Bank"
    : "Midtrans";

  const content = `
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 8px;">Pesanan Diterima! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Halo <strong>${data.customerName}</strong>, pesanan kamu sudah kami terima.</p>

    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Order ID</p>
      <p style="margin:0;font-family:monospace;font-size:14px;color:#374151;">${data.orderId}</p>
    </div>

    <h3 style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;">Detail Pesanan</h3>
    ${orderItemsTable(data.items)}

    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
    <table width="100%"><tbody>
      <tr><td style="color:#6b7280;font-size:14px;">Subtotal</td><td style="text-align:right;color:#374151;font-size:14px;">${formatCurrency(data.subtotal)}</td></tr>
      <tr><td style="color:#6b7280;font-size:14px;">Ongkos Kirim${data.courierCode ? ` (${data.courierCode.toUpperCase()} ${data.courierService})` : ""}</td><td style="text-align:right;color:#374151;font-size:14px;">${formatCurrency(data.shippingCost)}</td></tr>
      ${(data.couponDiscount ?? 0) > 0 ? `<tr><td style="color:#16a34a;font-size:14px;">Diskon Kupon</td><td style="text-align:right;color:#16a34a;font-size:14px;">- ${formatCurrency(data.couponDiscount!)}</td></tr>` : ""}
      <tr><td style="color:#1f2937;font-size:15px;font-weight:700;padding-top:8px;">Total</td><td style="text-align:right;color:#1f2937;font-size:15px;font-weight:700;padding-top:8px;">${formatCurrency(data.grandTotal)}</td></tr>
    </tbody></table>

    <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#1d4ed8;"><strong>Metode Pembayaran:</strong> ${paymentLabel}</p>
      ${data.paymentMethod === "bank_transfer" ? `<p style="margin:8px 0 0;font-size:13px;color:#1d4ed8;">Silakan upload bukti transfer di halaman detail pesanan kamu.</p>` : ""}
    </div>

    <a href="${data.orderUrl}" style="display:inline-block;background:#3C50E0;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Lihat Detail Pesanan</a>
  `;

  const { error } = await resend.emails.send({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: data.to,
    subject: `Pesanan #${data.orderId.slice(0, 8).toUpperCase()} Diterima — ${storeName}`,
    html: baseTemplate(storeName, content),
  });
  if (error) console.error("[email] sendOrderConfirmation error:", error);
}

// --- Order Status Update ---
export async function sendOrderStatusUpdate(data: {
  to: string;
  customerName: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string | null;
  courierCode?: string | null;
  orderUrl: string;
}) {
  const client = await getResend();
  if (!client) return;
  const { resend, settings } = client;
  const storeInfo = await getStoreInfo();
  const storeName = storeInfo?.storeName ?? "Toko";

  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    processing: { label: "Diproses", color: "#2563eb", desc: "Pesanan kamu sedang kami proses dan siapkan." },
    shipped: { label: "Dikirim", color: "#7c3aed", desc: "Pesanan kamu sudah dikirim oleh kurir." },
    delivered: { label: "Terkirim", color: "#16a34a", desc: "Pesanan kamu telah berhasil diterima. Jangan lupa kasih ulasan ya!" },
    cancelled: { label: "Dibatalkan", color: "#dc2626", desc: "Pesanan kamu telah dibatalkan. Hubungi kami jika ada pertanyaan." },
  };
  const status = statusMap[data.newStatus] ?? { label: data.newStatus, color: "#6b7280", desc: "Status pesanan kamu telah diperbarui." };

  const trackingHtml = data.trackingNumber && data.courierCode ? `
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;">Nomor Resi</p>
      <p style="margin:0;font-family:monospace;font-size:16px;font-weight:700;color:#374151;">${data.trackingNumber}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Kurir: ${data.courierCode.toUpperCase()}</p>
    </div>` : "";

  const content = `
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 8px;">Update Status Pesanan</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Halo <strong>${data.customerName}</strong>,</p>

    <div style="border-left:4px solid ${status.color};padding:12px 16px;background:#f9fafb;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:${status.color};">${status.label}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${status.desc}</p>
    </div>

    <p style="font-size:14px;color:#6b7280;">Order ID: <span style="font-family:monospace;color:#374151;">${data.orderId}</span></p>
    ${trackingHtml}
    <a href="${data.orderUrl}" style="display:inline-block;background:#3C50E0;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px;">Lihat Detail Pesanan</a>
  `;

  await resend.emails.send({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: data.to,
    subject: `Pesanan #${data.orderId.slice(0, 8).toUpperCase()} — ${status.label}`,
    html: baseTemplate(storeName, content),
  });
}

// --- New Order Notification to Admin ---
export async function sendNewOrderNotification(data: {
  adminEmail: string;
  orderId: string;
  customerName: string;
  grandTotal: number;
  paymentMethod: string;
  adminOrderUrl: string;
}) {
  const client = await getResend();
  if (!client) return;
  const { resend, settings } = client;
  const storeInfo = await getStoreInfo();
  const storeName = storeInfo?.storeName ?? "Toko";

  const content = `
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 8px;">🛒 Pesanan Baru Masuk!</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Ada pesanan baru yang perlu diproses.</p>

    <table width="100%"><tbody>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Order ID</td><td style="font-family:monospace;font-size:13px;color:#374151;">${data.orderId}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Customer</td><td style="color:#374151;font-size:14px;">${data.customerName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Total</td><td style="color:#374151;font-size:14px;font-weight:700;">${formatCurrency(data.grandTotal)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Pembayaran</td><td style="color:#374151;font-size:14px;">${data.paymentMethod}</td></tr>
    </tbody></table>

    <a href="${data.adminOrderUrl}" style="display:inline-block;background:#3C50E0;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;">Lihat Pesanan di Admin</a>
  `;

  await resend.emails.send({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: data.adminEmail,
    subject: `[${storeName}] Pesanan Baru — ${formatCurrency(data.grandTotal)}`,
    html: baseTemplate(storeName, content),
  });
}

// --- Contact Reply ---
export async function sendContactReply(data: {
  to: string;
  customerName: string;
  originalMessage: string;
  replyText: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = await getResend();
  if (!client) return { success: false, error: "Email not configured" };
  const { resend, settings } = client;
  const storeInfo = await getStoreInfo();
  const storeName = storeInfo?.storeName ?? "Toko";

  const content = `
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 8px;">Balasan dari ${storeName}</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Halo <strong>${data.customerName}</strong>, berikut adalah balasan atas pesan yang kamu kirimkan.</p>

    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Pesan kamu</p>
      <p style="margin:0;font-size:14px;color:#6b7280;font-style:italic;">"${data.originalMessage}"</p>
    </div>

    <div style="border-left:4px solid #3C50E0;padding:12px 16px;background:#eff6ff;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#3C50E0;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Balasan</p>
      <p style="margin:0;font-size:14px;color:#1f2937;white-space:pre-line;">${data.replyText}</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: data.to,
    subject: `Balasan dari ${storeName}`,
    html: baseTemplate(storeName, content),
  });

  if (error) {
    console.error("[email] sendContactReply error:", error);
    return { success: false, error: String(error) };
  }
  return { success: true };
}

// --- Payment Proof Uploaded ---
export async function sendPaymentProofNotification(data: {
  adminEmail: string;
  orderId: string;
  customerName: string;
  grandTotal: number;
  adminOrderUrl: string;
}) {
  const client = await getResend();
  if (!client) return;
  const { resend, settings } = client;
  const storeInfo = await getStoreInfo();
  const storeName = storeInfo?.storeName ?? "Toko";

  const content = `
    <h2 style="color:#1f2937;font-size:20px;margin:0 0 8px;">📎 Bukti Transfer Diterima</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Customer <strong>${data.customerName}</strong> sudah upload bukti transfer untuk pesanan berikut:</p>

    <table width="100%"><tbody>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Order ID</td><td style="font-family:monospace;font-size:13px;color:#374151;">${data.orderId}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Total</td><td style="color:#374151;font-size:14px;font-weight:700;">${formatCurrency(data.grandTotal)}</td></tr>
    </tbody></table>

    <a href="${data.adminOrderUrl}" style="display:inline-block;background:#3C50E0;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;">Verifikasi Pembayaran</a>
  `;

  await resend.emails.send({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: data.adminEmail,
    subject: `[${storeName}] Bukti Transfer — Order #${data.orderId.slice(0, 8).toUpperCase()}`,
    html: baseTemplate(storeName, content),
  });
}
