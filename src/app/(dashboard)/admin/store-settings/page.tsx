import { getStoreSettingsOverview, getEmailSettings } from "@/app/actions/store-settings";
import SettingsCard from "@/components/Admin/SettingsCard";
import AuditLogTable from "@/components/Admin/AuditLogTable";

export default async function StoreSettingsPage() {
  const [overview, emailSettings] = await Promise.all([
    getStoreSettingsOverview(),
    getEmailSettings(),
  ]);

  const paymentStatus = overview.payment.configured
    ? overview.payment.isProduction
      ? "active"
      : "inactive"
    : "not-configured";

  const shippingStatus = overview.shipping.configured ? "active" : "not-configured";

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Store Settings</h1>
        <p className="text-custom-sm text-body">
          Manage payment gateway and shipping courier configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SettingsCard
          title="Payment Settings"
          description="Midtrans Payment Gateway"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          }
          href="/admin/store-settings/payment"
          status={paymentStatus}
          lastUpdated={overview.payment.lastUpdated}
          stats={[
            {
              label: "Environment",
              value: overview.payment.isProduction ? "Production" : "Sandbox",
            },
          ]}
        />

        <SettingsCard
          title="Courier Settings"
          description="Raja Ongkir Shipping Integration"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          }
          href="/admin/store-settings/courier"
          status={shippingStatus}
          lastUpdated={overview.shipping.lastUpdated}
          stats={[
            {
              label: "Origins",
              value: overview.shipping.originsCount,
            },
            {
              label: "Account Type",
              value: overview.shipping.accountType || "N/A",
            },
          ]}
        />
      </div>

        <SettingsCard
          title="Email Settings"
          description="Resend Email Notifications"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          }
          href="/admin/store-settings/email"
          status={emailSettings?.enabled ? "active" : emailSettings ? "inactive" : "not-configured"}
          stats={[
            { label: "Status", value: emailSettings?.enabled ? "Aktif" : emailSettings ? "Dinonaktifkan" : "Belum dikonfigurasi" },
          ]}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark">Recent Changes</h2>
        </div>
        <AuditLogTable logs={overview.recentChanges} />
      </div>
    </div>
  );
}
