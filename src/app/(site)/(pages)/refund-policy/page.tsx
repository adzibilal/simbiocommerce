import StaticPage from "@/components/StaticPage";
import { getPageContent } from "@/app/actions/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Read our refund policy to understand our return and refund process.",
};

export default async function RefundPolicyPage() {
  const content = await getPageContent("refund-policy");
  return <StaticPage title="Refund Policy" content={content} />;
}
