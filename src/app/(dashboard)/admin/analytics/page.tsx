import { getSalesChart, getTopProductsReport, getRevenueSummary, getCustomerAnalytics } from "@/app/actions/analytics";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Analytics | Admin" };

export default async function AnalyticsPage() {
  const [salesChart, topProducts, revenue, customers] = await Promise.all([
    getSalesChart("30"),
    getTopProductsReport(10),
    getRevenueSummary(),
    getCustomerAnalytics(),
  ]);

  return (
    <AnalyticsClient
      salesChart={salesChart}
      topProducts={topProducts}
      revenue={revenue}
      customers={customers}
    />
  );
}
