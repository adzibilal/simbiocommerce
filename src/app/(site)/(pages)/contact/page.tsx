import Contact from "@/components/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/contact", {
    title: "Contact Us | SimbioCommerce",
    description: "Get in touch with our support team.",
  });
}

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
