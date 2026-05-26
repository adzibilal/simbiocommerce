import StaticPage from "@/components/StaticPage";
import { getPageContent } from "@/app/actions/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read our terms of use to understand the rules and regulations of using our platform.",
};

export default async function TermsOfUsePage() {
  const content = await getPageContent("terms-of-use");
  return <StaticPage title="Terms of Use" content={content} />;
}
