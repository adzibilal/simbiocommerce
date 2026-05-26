import Contact from "@/components/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import { getStoreInfo } from "@/app/actions/store-info";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/contact", {
    title: "Contact Us | SimbioCommerce",
    description: "Get in touch with our support team.",
  });
}

const ContactPage = async () => {
  const storeInfo = await getStoreInfo();
  return (
    <main>
      <Contact storeInfo={storeInfo ? { email: storeInfo.email, phone: storeInfo.phone, address: storeInfo.address } : null} />
    </main>
  );
};

export default ContactPage;
