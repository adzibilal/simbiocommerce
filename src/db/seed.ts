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

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding:', error);
  }
}

seed();
