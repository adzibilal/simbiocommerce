import StaticPage from "@/components/StaticPage";
import { getPageContent } from "@/app/actions/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how we handle your data.",
};

export default async function PrivacyPolicyPage() {
  const content = await getPageContent("privacy-policy");
  return <StaticPage title="Privacy Policy" content={content} />;
}
