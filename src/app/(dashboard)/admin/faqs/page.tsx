import PageContentEditor from "@/components/Admin/PageContentEditor";
import { getPageContent } from "@/app/actions/pages";

export default async function FAQsPage() {
  const content = await getPageContent("faqs");
  return (
    <PageContentEditor
      slug="faqs"
      title="FAQ's"
      description="Manage your store's frequently asked questions page content."
      initialContent={content}
      previewUrl="/faqs"
    />
  );
}
