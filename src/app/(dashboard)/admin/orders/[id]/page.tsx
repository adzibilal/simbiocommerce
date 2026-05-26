import { getOrderDetail } from "@/app/actions/order";
import { formatCurrency } from "@/lib/currency";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OrderStatusUpdater from "./OrderStatusUpdater";
import TrackingNumberInput from "./TrackingNumberInput";
import PaymentProofViewer from "./PaymentProofViewer";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) notFound();

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue/10 text-blue",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green/10 text-green",
    cancelled: "bg-red/10 text-red",
  };

  const paymentColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green/10 text-green",
    failed: "bg-red/10 text-red",
    expired: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-body hover:text-blue duration-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Order Detail</h1>
          <p className="text-custom-sm text-body font-mono">{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — items + totals */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
            <div className="px-6 py-4 border-b border-gray-2">
              <h2 className="font-semibold text-dark">Items</h2>
            </div>
            <div className="divide-y divide-gray-2">
              {order.items.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-2 border border-gray-3 shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName ?? ""} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">{item.productName}</p>
                    <p className="text-xs text-body">×{item.quantity} @ {formatCurrency(item.unitPrice ?? 0)}</p>
                  </div>
                  <p className="font-medium text-dark text-sm shrink-0">
                    {formatCurrency((item.unitPrice ?? 0) * (item.quantity ?? 1))}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-2 space-y-2">
              <div className="flex justify-between text-sm text-body">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalProductPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-body">
                <span>Ongkos Kirim</span>
                <span>{formatCurrency(order.totalShippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-dark text-base pt-2 border-t border-gray-2">
                <span>Grand Total</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
            <div className="px-6 py-4 border-b border-gray-2">
              <h2 className="font-semibold text-dark">Pengiriman</h2>
            </div>
            <div className="px-6 py-4 space-y-4 text-sm">
              <Row label="Kurir" value={order.courierCode ? `${order.courierCode.toUpperCase()} — ${order.courierService}` : "-"} />
              <Row label="Status Pengiriman" value={
                <Badge text={order.shippingStatus ?? "pending"} color={statusColor[order.shippingStatus ?? "pending"] ?? "bg-gray-100 text-gray-600"} />
              } />
              <div>
                <p className="text-body mb-2">Nomor Resi</p>
                <TrackingNumberInput orderId={order.id} current={order.trackingNumber ?? null} />
              </div>
            </div>
          </div>
        </div>

        {/* Right — status + payment */}
        <div className="space-y-6">

          {/* Order status updater */}
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
            <div className="px-6 py-4 border-b border-gray-2">
              <h2 className="font-semibold text-dark">Status Pesanan</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[order.orderStatus ?? "pending"] ?? "bg-gray-100 text-gray-600"}`}>
                  {order.orderStatus ?? "pending"}
                </span>
              </div>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.orderStatus ?? "pending"} />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
            <div className="px-6 py-4 border-b border-gray-2">
              <h2 className="font-semibold text-dark">Pembayaran</h2>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <Row label="Metode" value={<span className="capitalize">{order.paymentMethod?.replace("_", " ") ?? "-"}</span>} />
              <Row label="Status" value={
                <Badge
                  text={order.paymentStatus ?? "pending"}
                  color={paymentColor[order.paymentStatus ?? "pending"] ?? "bg-gray-100 text-gray-600"}
                />
              } />
              <Row label="Total Bayar" value={formatCurrency(order.grandTotal)} />
              {order.paymentProof && (
                <div>
                  <p className="text-body mb-2">Bukti Transfer</p>
                  <PaymentProofViewer src={order.paymentProof} />
                </div>
              )}
            </div>
          </div>

          {/* Order info */}
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
            <div className="px-6 py-4 border-b border-gray-2">
              <h2 className="font-semibold text-dark">Info Pesanan</h2>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <Row label="Tanggal" value={new Date(order.date!).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
              <Row label="Order ID" value={<span className="font-mono text-xs break-all">{order.id}</span>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-body shrink-0">{label}</span>
      <span className="text-dark text-right">{value}</span>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${color}`}>{text}</span>
  );
}
