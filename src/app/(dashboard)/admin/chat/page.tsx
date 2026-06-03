import AdminChatDashboard from "@/components/Dashboard/AdminChatDashboard";

export const metadata = { title: "Live Chat | Admin" };

export default function AdminChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Live Chat</h1>
          <p className="text-xs text-body mt-1">
            Hubungi pelanggan Anda secara real-time untuk memberikan dukungan instan.
          </p>
        </div>
      </div>
      <AdminChatDashboard />
    </div>
  );
}
