import { db } from './index';
import {
  categories,
  users,
  heroSlides,
  heroFeatures,
  promoBanners,
  countdownSettings,
  testimonials,
  storeInfo,
  storeSettings,
} from './schema';

async function seed() {
  try {
    // Seed category
    try {
      await db.insert(categories).values([
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Food & Beverage', slug: 'food-beverage' },
      ]);
      console.log('Categories seeded');
    } catch (e) {
      console.log('Categories might already exist');
    }

    // Seed user
    try {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: 'Admin',
        email: 'admin@simbiospace.com',
        password: 'password',
        role: 'admin',
      });
      console.log('User seeded');
    } catch (e) {
      console.log('User might already exist');
    }

    // Seed store info
    try {
      await db.insert(storeInfo).values({
        storeName: 'SimbioCommerce',
        logoUrl: '/images/logo/logo.svg',
        email: 'support@simbiocommerce.com',
        phone: '(+099) 532-786-9843',
        supportPhone: '(+965) 7492-3477',
        address: '685 Market Street, Las Vegas, LA 95820, United States.',
        copyrightText: 'All rights reserved by SimbioCommerce.',
        primaryColor: '#3C50E0',
      });
      console.log('Store info seeded');
    } catch (e) {
      console.log('Store info might already exist');
    }

    // Seed hero slides
    try {
      await db.insert(heroSlides).values([
        {
          imageUrl: '/images/hero/hero-bg-01.jpg',
          link: '/shop-with-sidebar',
          linkType: 'custom',
          order: 1,
          isActive: true,
        },
        {
          imageUrl: '/images/hero/hero-bg-02.jpg',
          link: '/shop-with-sidebar',
          linkType: 'custom',
          order: 2,
          isActive: true,
        },
      ]);
      console.log('Hero slides seeded');
    } catch (e) {
      console.log('Hero slides might already exist');
    }

    // Seed hero features
    try {
      await db.insert(heroFeatures).values([
        {
          imageUrl: '/images/icons/icon-01.svg',
          title: 'Free Delivery',
          description: 'For all orders over Rp 100.000',
          order: 1,
          isActive: true,
        },
        {
          imageUrl: '/images/icons/icon-02.svg',
          title: 'Secure Payment',
          description: '100% secure transactions',
          order: 2,
          isActive: true,
        },
        {
          imageUrl: '/images/icons/icon-03.svg',
          title: 'Money Back Guarantee',
          description: 'Within 30 days of purchase',
          order: 3,
          isActive: true,
        },
        {
          imageUrl: '/images/icons/icon-04.svg',
          title: '24/7 Support',
          description: 'Friendly customer support',
          order: 4,
          isActive: true,
        },
      ]);
      console.log('Hero features seeded');
    } catch (e) {
      console.log('Hero features might already exist');
    }

    // Seed promo banners
    try {
      await db.insert(promoBanners).values([
        {
          title: 'New Collection',
          subtitle: 'Up to 50% Off',
          description: 'Shop the latest trends and save big on our new arrivals.',
          buttonText: 'Shop Now',
          buttonLink: '/shop-with-sidebar',
          bgColor: '#F5F5F7',
          buttonColor: 'blue',
          layout: 'big',
          order: 1,
          isActive: true,
        },
        {
          title: 'Best Electronics',
          subtitle: 'Starting from Rp 199.000',
          description: 'Top-rated gadgets at unbeatable prices.',
          buttonText: 'Explore',
          buttonLink: '/shop-with-sidebar',
          bgColor: '#EEF2FF',
          buttonColor: 'blue',
          layout: 'small',
          order: 2,
          isActive: true,
        },
        {
          title: 'Fashion Week',
          subtitle: 'Buy 2 Get 1 Free',
          description: 'Refresh your wardrobe with our latest styles.',
          buttonText: 'Shop Now',
          buttonLink: '/shop-with-sidebar',
          bgColor: '#FFF7ED',
          buttonColor: 'blue',
          layout: 'small',
          order: 3,
          isActive: true,
        },
      ]);
      console.log('Promo banners seeded');
    } catch (e) {
      console.log('Promo banners might already exist');
    }

    // Seed countdown
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      await db.insert(countdownSettings).values({
        label: "Don't Miss!!",
        title: 'Deal of the Week',
        description: 'Limited time offer — grab the best products before they are gone!',
        buttonText: 'Shop Now',
        buttonLink: '/shop-with-sidebar',
        endDate: endDate.toISOString(),
        bgColor: '#D0E9F3',
        buttonColor: 'blue',
        isActive: true,
      });
      console.log('Countdown seeded');
    } catch (e) {
      console.log('Countdown might already exist');
    }

    // Seed testimonials
    try {
      await db.insert(testimonials).values([
        {
          review: 'Amazing products and super fast delivery! I always shop here for the best deals.',
          authorName: 'Sarah Johnson',
          authorRole: 'Regular Customer',
          authorImg: '/images/users/user-01.png',
          rating: 5,
          order: 1,
          isActive: true,
        },
        {
          review: 'Great quality and the customer support team was very helpful when I had questions.',
          authorName: 'Michael Chen',
          authorRole: 'Verified Buyer',
          authorImg: '/images/users/user-02.png',
          rating: 5,
          order: 2,
          isActive: true,
        },
        {
          review: 'Best online store I have used. Prices are competitive and packaging is excellent.',
          authorName: 'Rina Kartika',
          authorRole: 'Loyal Customer',
          authorImg: '/images/users/user-03.png',
          rating: 4,
          order: 3,
          isActive: true,
        },
        {
          review: 'Easy checkout process and my orders always arrive on time. Highly recommended!',
          authorName: 'Budi Santoso',
          authorRole: 'Verified Buyer',
          authorImg: '/images/users/user-04.png',
          rating: 5,
          order: 4,
          isActive: true,
        },
      ]);
      console.log('Testimonials seeded');
    } catch (e) {
      console.log('Testimonials might already exist');
    }

    // Seed static pages
    try {
      const pages = [
        {
          key: 'page_privacy_policy',
          value: `# Privacy Policy

*Last updated: May 2026*

Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our store.

## 1. Information We Collect

We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes:

- Name, email address, and password
- Billing and shipping address
- Payment information (processed securely via our payment gateway)
- Phone number
- Order history and preferences

## 2. How We Use Your Information

We use the information we collect to:

- Process and fulfill your orders
- Send order confirmations and shipping updates
- Provide customer support
- Improve our products and services
- Send promotional communications (only with your consent)

## 3. Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and servicing you, as long as those parties agree to keep this information confidential.

## 4. Data Security

We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All payment transactions are processed through secure, encrypted connections.

## 5. Cookies

Our website uses cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect some functionality.

## 6. Your Rights

You have the right to:

- Access the personal information we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Opt out of marketing communications at any time

## 7. Contact Us

If you have any questions about this Privacy Policy, please contact us at our support email.`,
        },
        {
          key: 'page_refund_policy',
          value: `# Refund Policy

*Last updated: May 2026*

We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, we are here to help.

## 1. Returns

You have **14 days** from the date you received your item to initiate a return. To be eligible for a return:

- The item must be unused and in the same condition that you received it
- The item must be in its original packaging
- You must have the receipt or proof of purchase

## 2. Non-Returnable Items

The following items cannot be returned:

- Perishable goods
- Digital downloads or software
- Items marked as final sale
- Personalized or custom-made items

## 3. Refund Process

Once your return is received and inspected, we will notify you of the status of your refund. If approved:

- **Bank Transfer / Virtual Account**: Refund will be processed within **3–5 business days**
- **Credit Card**: Refund will appear on your statement within **5–10 business days**
- **E-Wallet**: Refund will be processed within **1–3 business days**

## 4. Exchanges

We only replace items if they are defective or damaged. If you need to exchange an item, contact our customer support team.

## 5. Shipping Costs

Shipping costs for returns are the responsibility of the customer unless the return is due to our error (wrong item sent, damaged goods, etc.).

## 6. Contact Us

For return requests, please contact our customer support team with your order number and reason for return.`,
        },
        {
          key: 'page_terms_of_use',
          value: `# Terms of Use

*Last updated: May 2026*

Welcome to our store. By accessing and using this website, you accept and agree to be bound by these Terms of Use.

## 1. Acceptance of Terms

By using our website, you confirm that you are at least 18 years of age, have read and understood these terms, and agree to be bound by them.

## 2. Use of the Website

You may use this website for lawful purposes only. You agree not to:

- Use the site in any way that violates applicable laws or regulations
- Transmit any unsolicited or unauthorized advertising material
- Attempt to gain unauthorized access to any part of the website
- Interfere with or disrupt the integrity or performance of the website

## 3. Product Information

We strive to display product information as accurately as possible. However, we do not warrant that product descriptions, prices, or other content is accurate, complete, or error-free. We reserve the right to correct any errors and update information at any time.

## 4. Pricing and Payment

All prices are listed in Indonesian Rupiah (IDR) and are subject to change without notice. We reserve the right to refuse or cancel orders at our discretion, including cases where pricing errors occur.

## 5. Intellectual Property

All content on this website, including text, graphics, logos, and images, is the property of our store and protected by applicable copyright and trademark laws.

## 6. Limitation of Liability

To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or products purchased through it.

## 7. Changes to Terms

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website constitutes acceptance of the modified terms.

## 8. Contact

If you have questions about these Terms of Use, please contact our support team.`,
        },
        {
          key: 'page_faqs',
          value: `# Frequently Asked Questions

## Orders & Shipping

**How do I place an order?**
Browse our products, add items to your cart, and proceed to checkout. You will need to create an account or log in to complete your purchase.

**How long does shipping take?**
Shipping times depend on your location and the courier service selected at checkout. Estimated delivery times are shown during checkout.

**Can I track my order?**
Yes! Once your order has been shipped, you will receive a tracking number via email. You can also view your order status in your account dashboard.

**Do you ship internationally?**
Currently, we only ship within Indonesia. We are working on expanding to international shipping in the future.

## Payments

**What payment methods do you accept?**
We accept bank transfers, major e-wallets, credit/debit cards via Midtrans, and Cash on Delivery (CoD) for eligible areas.

**Is it safe to pay on your website?**
Yes. All transactions are processed through secure, encrypted payment gateways. We do not store your payment details on our servers.

**When will my payment be confirmed?**
Bank transfer payments are confirmed within 1–2 business hours after verification. Online payment methods (e-wallet, credit card) are confirmed instantly.

## Returns & Refunds

**How do I return an item?**
Contact our customer support team within 14 days of receiving your order with your order number and reason for return. We will guide you through the process.

**How long does a refund take?**
Refunds are processed within 3–7 business days after we receive and inspect the returned item.

**What if I received a wrong or damaged item?**
We sincerely apologize! Please contact us immediately with photos of the item and your order details. We will arrange a replacement or full refund at no cost to you.

## Account

**Do I need an account to shop?**
Yes, you need to create an account to place an order. This allows us to track your orders and provide better support.

**How do I reset my password?**
Click "Forgot Password" on the login page and enter your email address. You will receive a password reset link within a few minutes.

**How do I update my personal information?**
Log in to your account and go to "My Account" to update your name, address, or contact details.`,
        },
      ];

      for (const page of pages) {
        const existing = await db
          .select()
          .from(storeSettings)
          .where({ key: page.key } as any)
          .limit(1)
          .catch(() => []);
        if (existing.length === 0) {
          await db.insert(storeSettings).values({
            id: crypto.randomUUID(),
            key: page.key,
            value: page.value,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      console.log('Static pages seeded');
    } catch (e) {
      console.log('Static pages seed error:', e);
    }

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding:', error);
  }
}

seed();
