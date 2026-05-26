import { getOrderDetail, syncPaymentStatus } from "@/app/actions/order";
import { formatCurrency } from "@/lib/currency";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PaymentProofUpload from "@/components/PaymentProofUpload";
import ReviewForm from "@/components/ReviewForm";
import { getOrderReviews } from "@/app/actions/review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; status?: string }>;
}) {
  const { orderId, status } = await searchParams;

  if (!orderId) notFound();

  // Sync with Midtrans in case webhook hasn't fired yet (e.g. localhost)
  await syncPaymentStatus(orderId);

  const [order, session] = await Promise.all([
    getOrderDetail(orderId),
    getServerSession(authOptions),
  ]);
  const customerId = session?.user?.id as string | undefined;

  if (!order) notFound();

  const isDelivered = order.orderStatus === "delivered";
  const reviewedProductIds = (isDelivered && customerId)
    ? (await getOrderReviews(orderId, customerId)).map((r) => r.productId)
    : [];

  const isPending = status === "pending" || order.paymentStatus === "pending";
  const isCoD = order.paymentMethod === "cod";
  const isBankTransfer = order.paymentMethod === "bank_transfer";

  return (
    <section className="bg-gray-2 min-h-screen pt-[240px] sm:pt-[185px] lg:pt-[130px] xl:pt-[200px] pb-20">
      <div className="max-w-[640px] mx-auto px-4">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-1 p-8 text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPending ? "bg-yellow-50" : "bg-green-50"}`}>
            {isPending ? (
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">
            {isPending ? "Pesanan Menunggu Pembayaran" : "Pesanan Berhasil!"}
          </h1>
          <p className="text-dark-4 text-sm">
            {isCoD
              ? "Pesanan kamu sudah kami terima. Bayar saat paket tiba."
              : isBankTransfer
              ? "Silakan transfer ke rekening kami. Pesanan akan diproses setelah pembayaran dikonfirmasi."
              : isPending
              ? "Pembayaran sedang diproses. Kami akan segera mengkonfirmasi pesanan kamu."
              : "Terima kasih! Pesanan kamu sedang kami proses."}
          </p>
        </div>

        {/* Order detail */}
        <div className="bg-white rounded-2xl shadow-1 p-6 mb-6">
          <h2 className="font-semibold text-dark mb-4">Detail Pesanan</h2>

          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-dark-4">Order ID</span>
              <span className="font-medium text-dark font-mono text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-4">Tanggal</span>
              <span className="text-dark">{new Date(order.date!).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-4">Status Pesanan</span>
              <OrderBadge status={order.orderStatus ?? "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-dark-4">Pembayaran</span>
              <span className="text-dark capitalize">{order.paymentMethod?.replace("_", " ")}</span>
            </div>
            {order.courierCode && (
              <div className="flex justify-between">
                <span className="text-dark-4">Kurir</span>
                <span className="text-dark">{order.courierCode.toUpperCase()} — {order.courierService}</span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-dark-4">No. Resi</span>
                <span className="font-mono font-semibold text-dark">{order.trackingNumber}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between gap-4">
                <span className="text-dark-4 shrink-0">Catatan</span>
                <span className="text-dark text-right">{order.notes}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-2 pt-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-2 border border-gray-3 shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName ?? ""} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark truncate">{item.productName}</p>
                  <p className="text-xs text-dark-4">×{item.quantity}</p>
                </div>
                <span className="text-sm text-dark shrink-0">{formatCurrency((item.unitPrice ?? 0) * (item.quantity ?? 1))}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-2 mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-dark-4">
              <span>Subtotal</span>
              <span>{formatCurrency(order.totalProductPrice)}</span>
            </div>
            <div className="flex justify-between text-dark-4">
              <span>Ongkos Kirim</span>
              <span>{formatCurrency(order.totalShippingCost)}</span>
            </div>
            {(order.couponDiscount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon Kupon</span>
                <span>- {formatCurrency(order.couponDiscount ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-dark text-base pt-1 border-t border-gray-2">
              <span>Total</span>
              <span>{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Bank transfer proof upload */}
        {order.paymentMethod === "bank_transfer" && (
          <div className="bg-white rounded-2xl shadow-1 p-6 mb-6">
            <h3 className="font-semibold text-dark mb-1">Upload Bukti Transfer</h3>
            <p className="text-sm text-dark-4 mb-4">
              {order.paymentProof
                ? "Bukti transfer kamu sudah kami terima."
                : "Wajib upload foto bukti transfer agar pesanan segera diproses oleh admin."}
            </p>
            <PaymentProofUpload orderId={order.id} existingProof={order.paymentProof} />
          </div>
        )}

        {/* Tracking info */}
        {order.trackingNumber && order.courierCode && (
          <TrackingInfo courierCode={order.courierCode} trackingNumber={order.trackingNumber} />
        )}

        {/* Review section — only when delivered */}
        {isDelivered && customerId && (
          <div className="bg-white rounded-2xl shadow-1 p-6 mb-6">
            <h3 className="font-semibold text-dark mb-1">Beri Ulasan</h3>
            <p className="text-sm text-dark-4 mb-4">Bagikan pengalamanmu dengan produk yang kamu beli.</p>
            <div className="space-y-6">
              {order.items.map((item, i) => {
                const alreadyReviewed = reviewedProductIds.includes(item.productId ?? null);
                return (
                  <div key={i} className="border-b border-gray-2 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-2 border border-gray-3 shrink-0">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.productName ?? ""} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-2" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-dark">{item.productName}</p>
                    </div>
                    {alreadyReviewed ? (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Ulasan sudah dikirim.
                      </div>
                    ) : (
                      <ReviewForm
                        orderId={orderId}
                        productId={item.productId!}
                        productName={item.productName ?? ""}
                        customerId={customerId}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-account"
            className="flex-1 text-center py-3 px-6 bg-blue text-white font-medium rounded-xl hover:bg-blue-dark transition-colors"
          >
            Lihat Pesanan Saya
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-3 px-6 bg-white border border-gray-3 text-dark font-medium rounded-xl hover:bg-gray-1 transition-colors"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </section>
  );
}

const COURIER_INFO: Record<string, { name: string; url: string; hint: string }> = {
  jne: {
    name: "JNE",
    url: "https://jne.co.id/tracking-package",
    hint: "Buka jne.co.id → Tracking → masukkan nomor resi",
  },
  tiki: {
    name: "TIKI",
    url: "https://www.tiki.id/id/track",
    hint: "Buka tiki.id → Track → masukkan nomor resi",
  },
  pos: {
    name: "Pos Indonesia",
    url: "https://www.posindonesia.co.id/id/tracking",
    hint: "Buka posindonesia.co.id → Tracking → masukkan nomor resi",
  },
  sicepat: {
    name: "SiCepat",
    url: "https://www.sicepat.com/",
    hint: "Buka sicepat.com → Cek Resi → masukkan nomor resi",
  },
  jnt: {
    name: "J&T Express",
    url: "https://jet.co.id/track",
    hint: "Buka jet.co.id → Track → masukkan nomor resi",
  },
  anteraja: {
    name: "AnterAja",
    url: "https://anteraja.id/id/tracking",
    hint: "Buka anteraja.id → Tracking → masukkan nomor resi",
  },
};

function TrackingInfo({ courierCode, trackingNumber }: { courierCode: string; trackingNumber: string }) {
  const courier = COURIER_INFO[courierCode.toLowerCase()];
  return (
    <div className="bg-white rounded-2xl shadow-1 p-6 mb-6 border-l-4 border-blue">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-5 h-5 text-blue shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <div>
          <h3 className="font-semibold text-dark">Cara Cek Resi</h3>
          <p className="text-sm text-dark-4 mt-1">Nomor resi kamu: <span className="font-mono font-bold text-dark">{trackingNumber}</span></p>
        </div>
      </div>

      <ol className="space-y-2 text-sm text-dark mb-4">
        <li className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-blue/10 text-blue flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <span>Salin nomor resi: <span className="font-mono font-semibold">{trackingNumber}</span></span>
        </li>
        <li className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-blue/10 text-blue flex items-center justify-center text-xs font-bold shrink-0">2</span>
          <span>{courier?.hint ?? `Kunjungi website ${courierCode.toUpperCase()} dan masukkan nomor resi`}</span>
        </li>
        <li className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-blue/10 text-blue flex items-center justify-center text-xs font-bold shrink-0">3</span>
          <span>Pantau status pengiriman paket kamu secara real-time</span>
        </li>
      </ol>

      {courier && (
        <a
          href={courier.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors"
        >
          Cek Resi di {courier.name}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

function OrderBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue/10 text-blue",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
