import StaticPage from "@/components/StaticPage";
import { getPageContent } from "@/app/actions/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ's",
  description: "Frequently asked questions about our store, orders, and services.",
};

export default async function FAQsPage() {
  const content = await getPageContent("faqs");
  return <StaticPage title="FAQ's" content={content} />;
}
