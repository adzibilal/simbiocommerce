import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').references(() => categories.id),
  sku: text('sku').unique(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // stored in cents
  weight: integer('weight').notNull(), // grams
  stock: integer('stock').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id),
  imageUrl: text('image_url').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
});

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  password: text('password'), // Added for credentials
  phone: text('phone'),
  address: text('address'),
  provinceId: integer('province_id'),
  cityId: integer('city_id'),
  postalCode: text('postal_code'),
  role: text('role').default('customer'), // Added role column
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  orderDate: text('order_date').$defaultFn(() => new Date().toISOString()),
  totalProductPrice: integer('total_product_price').notNull(),
  totalShippingCost: integer('total_shipping_cost').notNull(),
  grandTotal: integer('grand_total').notNull(),
  orderStatus: text('order_status').default('pending'),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id),
  productId: text('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotalWeight: integer('subtotal_weight').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id).unique(),
  paymentGateway: text('payment_gateway'),
  externalId: text('external_id'),
  checkoutUrl: text('checkout_url'),
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status').default('pending'),
  paymentDate: text('payment_date'),
  paymentAmount: integer('payment_amount'),
});

export const shipping = sqliteTable('shipping', {
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

export const accounts = sqliteTable('account', {
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

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  discount: text('discount').notNull(),
  type: text('type').notNull().default('percentage'),
  expiry: text('expiry').notNull(),
  status: text('status').default('active'),
  maxUsage: integer('max_usage').default(0),
});
