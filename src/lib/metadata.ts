import type { Metadata } from "next";
import { getSeoByRoute } from "@/app/actions/seo-settings";

export async function generatePageMetadata(
  route: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  const seo = await getSeoByRoute(route);

  if (!seo || !seo.isActive) {
    return { title: fallback.title, description: fallback.description };
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords ?? undefined,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}
