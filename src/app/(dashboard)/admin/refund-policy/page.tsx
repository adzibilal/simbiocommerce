import PageContentEditor from "@/components/Admin/PageContentEditor";
import { getPageContent } from "@/app/actions/pages";

export default async function RefundPolicyPage() {
  const content = await getPageContent("refund-policy");
  return (
    <PageContentEditor
      slug="refund-policy"
      title="Refund Policy"
      description="Manage your store's refund policy page content."
      initialContent={content}
      previewUrl="/refund-policy"
    />
  );
}
