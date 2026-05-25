import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { getStoreInfo } from "@/app/actions/store-info";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeInfo = await getStoreInfo();

  return (
    <div className="flex h-screen bg-gray-2 font-euclid-circular-a">
      {/* Sidebar */}
      <Sidebar storeInfo={storeInfo} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-2 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
