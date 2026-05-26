import { pgTable, text, integer, boolean, timestamp, unique, primaryKey } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url'),
});

export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').references(() => categories.id),
  sku: text('sku').unique(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // stored in IDR (rupiah)
  weight: integer('weight').notNull(), // grams
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const stockHistory = pgTable('stock_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  change: integer('change').notNull(),
  reason: text('reason'), // 'order', 'manual_update', 'bulk_update'
  referenceId: text('reference_id'), // orderId jika dari order
  changedAt: text('changed_at').$defaultFn(() => new Date().toISOString()),
});

export const productImages = pgTable('product_images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').default(false),
});

export const users = pgTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  phone: text('phone'),
  address: text('address'),
  provinceId: integer('province_id'),
  cityId: integer('city_id'),
  postalCode: text('postal_code'),
  role: text('role').default('customer'),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  orderDate: text('order_date').$defaultFn(() => new Date().toISOString()),
  totalProductPrice: integer('total_product_price').notNull(),
  totalShippingCost: integer('total_shipping_cost').notNull(),
  couponDiscount: integer('coupon_discount').notNull().default(0),
  grandTotal: integer('grand_total').notNull(),
  orderStatus: text('order_status').default('pending'),
  notes: text('notes'),
  guestEmail: text('guest_email'),
  guestName: text('guest_name'),
  guestPhone: text('guest_phone'),
});

export const savedAddresses = pgTable('saved_addresses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  provinceId: integer('province_id'),
  cityId: integer('city_id'),
  postalCode: text('postal_code'),
  isDefault: boolean('is_default').default(false),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id),
  productId: text('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotalWeight: integer('subtotal_weight').notNull(),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id).unique(),
  paymentGateway: text('payment_gateway'),
  externalId: text('external_id'),
  checkoutUrl: text('checkout_url'),
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status').default('pending'),
  paymentDate: text('payment_date'),
  paymentAmount: integer('payment_amount'),
  paymentProof: text('payment_proof'),
});

export const shipping = pgTable('shipping', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id).unique(),
  destinationProvinceId: integer('destination_province_id'),
  destinationCityId: integer('destination_city_id'),
  courierCode: text('courier_code'),
  courierService: text('courier_service'),
  totalWeight: integer('total_weight').notNull(),
  shippingCost: integer('shipping_cost').notNull(),
  trackingNumber: text('tracking_number'),
  shippingStatus: text('shipping_status').default('pending'),
  shippingDate: text('shipping_date'),
});

export const accounts = pgTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  discount: text('discount').notNull(),
  type: text('type').notNull().default('percentage'),
  expiry: text('expiry').notNull(),
  status: text('status').default('active'),
  maxUsage: integer('max_usage').default(0),
});

export const postCategories = pgTable('post_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  featuredImage: text('featured_image'),
  categoryId: text('category_id').references(() => postCategories.id),
  authorId: text('author_id').references(() => users.id),
  status: text('status').default('draft'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id),
  orderId: text('order_id').references(() => orders.id),
  customerId: text('customer_id').references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  imageUrl: text('image_url'),
  date: text('date').$defaultFn(() => new Date().toISOString()),
  status: text('status').default('pending'),
});

export const heroSlides = pgTable('hero_slides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  imageUrl: text('image_url').notNull(),
  link: text('link').notNull(),
  linkType: text('link_type').notNull().default('custom'),
  productId: text('product_id').references(() => products.id),
  isNewTab: boolean('is_new_tab').default(false),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
  updatedBy: text('updated_by').references(() => users.id),
});

export const shippingOrigins = pgTable('shipping_origins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cityId: integer('city_id').notNull(),
  cityName: text('city_name').notNull(),
  provinceName: text('province_name').notNull(),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const heroFeatures = pgTable('hero_features', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  imageUrl: text('image_url').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const promoBanners = pgTable('promo_banners', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description'),
  buttonText: text('button_text').notNull(),
  buttonLink: text('button_link').notNull().default('#'),
  imageUrl: text('image_url'),
  bgColor: text('bg_color').notNull().default('#F5F5F7'),
  buttonColor: text('button_color').notNull().default('blue'),
  layout: text('layout').notNull().default('big'),
  linkType: text('link_type').notNull().default('custom'),
  productId: text('product_id').references(() => products.id),
  isNewTab: boolean('is_new_tab').default(false),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const countdownSettings = pgTable('countdown_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  label: text('label').notNull().default("Don't Miss!!"),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  buttonText: text('button_text').notNull().default('Check it Out!'),
  buttonLink: text('button_link').notNull().default('#'),
  endDate: text('end_date').notNull(),
  bgColor: text('bg_color').notNull().default('#D0E9F3'),
  buttonColor: text('button_color').notNull().default('blue'),
  linkType: text('link_type').notNull().default('custom'),
  productId: text('product_id').references(() => products.id),
  isNewTab: boolean('is_new_tab').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const storeInfo = pgTable('store_info', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeName: text('store_name').notNull().default('SimbioStore'),
  logoUrl: text('logo_url').notNull().default('/images/logo/logo.svg'),
  faviconUrl: text('favicon_url'),
  email: text('email').notNull().default('support@example.com'),
  phone: text('phone').notNull().default('(+099) 532-786-9843'),
  supportPhone: text('support_phone').notNull().default('(+965) 7492-3477'),
  address: text('address').notNull().default('685 Market Street, Las Vegas, LA 95820, United States.'),
  facebookUrl: text('facebook_url'),
  twitterUrl: text('twitter_url'),
  instagramUrl: text('instagram_url'),
  linkedinUrl: text('linkedin_url'),
  appStoreUrl: text('app_store_url'),
  googlePlayUrl: text('google_play_url'),
  copyrightText: text('copyright_text').notNull().default('All rights reserved by SimbioStore.'),
  primaryColor: text('primary_color').notNull().default('#3C50E0'),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const seoSettings = pgTable('seo_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageRoute: text('page_route').notNull().unique(),
  pageTitle: text('page_title').notNull(),
  metaTitle: text('meta_title').notNull(),
  metaDescription: text('meta_description').notNull(),
  keywords: text('keywords'),
  ogImage: text('og_image'),
  isActive: boolean('is_active').default(true),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  review: text('review').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  authorImg: text('author_img').notNull(),
  rating: integer('rating').notNull().default(5),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').default(true),
  subscribedAt: text('subscribed_at').$defaultFn(() => new Date().toISOString()),
  unsubscribedAt: text('unsubscribed_at'),
});

export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').default('unread'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const wishlists = pgTable('wishlists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  uniq: unique().on(t.userId, t.productId),
}));

export const recentlyViewed = pgTable('recently_viewed', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  viewedAt: text('viewed_at').$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  uniq: unique().on(t.userId, t.productId),
}));

export const settingsAuditLog = pgTable('settings_audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  settingKey: text('setting_key').notNull(),
  action: text('action').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedBy: text('changed_by').references(() => users.id),
  changedAt: text('changed_at').$defaultFn(() => new Date().toISOString()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});
