import PageContentEditor from "@/components/Admin/PageContentEditor";
import { getPageContent } from "@/app/actions/pages";

export default async function TermsOfUsePage() {
  const content = await getPageContent("terms-of-use");
  return (
    <PageContentEditor
      slug="terms-of-use"
      title="Terms of Use"
      description="Manage your store's terms of use page content."
      initialContent={content}
      previewUrl="/terms-of-use"
    />
  );
}
