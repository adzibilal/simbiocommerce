import { db } from "../src/db";
import { storeInfo, seoSettings } from "../src/db/schema";

async function seed() {
  console.log("Seeding store info and SEO settings...\n");

  const existingStore = await db.select().from(storeInfo).limit(1);
  if (existingStore.length === 0) {
    await db.insert(storeInfo).values({
      storeName: "SimbioCommerce",
      logoUrl: "/images/logo/logo.svg",
      faviconUrl: null,
      email: "support@simbiocommerce.com",
      phone: "(+099) 532-786-9843",
      supportPhone: "(+965) 7492-3477",
      address: "685 Market Street, Las Vegas, LA 95820, United States.",
      facebookUrl: "https://facebook.com/simbiocommerce",
      twitterUrl: "https://twitter.com/simbiocommerce",
      instagramUrl: "https://instagram.com/simbiocommerce",
      linkedinUrl: "https://linkedin.com/company/simbiocommerce",
      appStoreUrl: "#",
      googlePlayUrl: "#",
      copyrightText: "All rights reserved by SimbioCommerce.",
    });
    console.log("Store info seeded.");
  } else {
    console.log("Store info already exists, skipping.");
  }

  const existingSeo = await db.select().from(seoSettings);
  if (existingSeo.length === 0) {
    await db.insert(seoSettings).values([
      {
        pageRoute: "/",
        pageTitle: "Home",
        metaTitle: "SimbioCommerce - Best Online Shop",
        metaDescription: "Shop the latest products at SimbioCommerce. Free shipping on orders over Rp 200.000. Secure payments and 24/7 support.",
        keywords: "ecommerce, online shop, electronics, fashion, accessories",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/shop",
        pageTitle: "Shop",
        metaTitle: "Shop All Products - SimbioCommerce",
        metaDescription: "Browse our wide selection of products. Find the best deals on electronics, fashion, accessories and more.",
        keywords: "shop, products, buy online, deals",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/cart",
        pageTitle: "Cart",
        metaTitle: "Shopping Cart - SimbioCommerce",
        metaDescription: "Review your shopping cart and proceed to checkout.",
        keywords: "cart, checkout, shopping",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/checkout",
        pageTitle: "Checkout",
        metaTitle: "Checkout - SimbioCommerce",
        metaDescription: "Complete your order securely. Multiple payment methods available.",
        keywords: "checkout, payment, order",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/contact",
        pageTitle: "Contact",
        metaTitle: "Contact Us - SimbioCommerce",
        metaDescription: "Get in touch with SimbioCommerce. We are here to help you 24/7.",
        keywords: "contact, support, help, customer service",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/blogs",
        pageTitle: "Blog",
        metaTitle: "Blog - SimbioCommerce",
        metaDescription: "Read the latest news, tips, and guides from SimbioCommerce.",
        keywords: "blog, news, tips, guides",
        ogImage: null,
        isActive: true,
      },
      {
        pageRoute: "/wishlist",
        pageTitle: "Wishlist",
        metaTitle: "My Wishlist - SimbioCommerce",
        metaDescription: "View and manage your saved items.",
        keywords: "wishlist, saved items, favorites",
        ogImage: null,
        isActive: true,
      },
    ]);
    console.log("SEO settings seeded (7 pages).");
  } else {
    console.log("SEO settings already exist, skipping.");
  }

  console.log("\nDone!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
