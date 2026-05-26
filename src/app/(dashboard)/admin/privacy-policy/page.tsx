import PageContentEditor from "@/components/Admin/PageContentEditor";
import { getPageContent } from "@/app/actions/pages";

export default async function PrivacyPolicyPage() {
  const content = await getPageContent("privacy-policy");
  return (
    <PageContentEditor
      slug="privacy-policy"
      title="Privacy Policy"
      description="Manage your store's privacy policy page content."
      initialContent={content}
      previewUrl="/privacy-policy"
    />
  );
}
