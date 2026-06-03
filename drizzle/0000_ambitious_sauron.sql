CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_url" text,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"sender_id" text,
	"sender_type" text NOT NULL,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"is_ai_reply" boolean DEFAULT false NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "chat_session_settings" (
	"customer_id" text PRIMARY KEY NOT NULL,
	"ai_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread',
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "countdown_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text DEFAULT 'Don''t Miss!!' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"button_text" text DEFAULT 'Check it Out!' NOT NULL,
	"button_link" text DEFAULT '#' NOT NULL,
	"end_date" text NOT NULL,
	"bg_color" text DEFAULT '#D0E9F3' NOT NULL,
	"button_color" text DEFAULT 'blue' NOT NULL,
	"link_type" text DEFAULT 'custom' NOT NULL,
	"product_id" text,
	"is_new_tab" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount" text NOT NULL,
	"type" text DEFAULT 'percentage' NOT NULL,
	"expiry" text NOT NULL,
	"status" text DEFAULT 'active',
	"max_usage" integer DEFAULT 0,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hero_features" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"link" text NOT NULL,
	"link_type" text DEFAULT 'custom' NOT NULL,
	"product_id" text,
	"is_new_tab" boolean DEFAULT false,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"subscribed_at" text,
	"unsubscribed_at" text,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"product_id" text,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"subtotal_weight" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"order_date" text,
	"total_product_price" integer NOT NULL,
	"total_shipping_cost" integer NOT NULL,
	"coupon_discount" integer DEFAULT 0 NOT NULL,
	"grand_total" integer NOT NULL,
	"order_status" text DEFAULT 'pending',
	"notes" text,
	"guest_email" text,
	"guest_name" text,
	"guest_phone" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"payment_gateway" text,
	"external_id" text,
	"checkout_url" text,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"payment_date" text,
	"payment_amount" integer,
	"payment_proof" text,
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "post_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"featured_image" text,
	"category_id" text,
	"author_id" text,
	"status" text DEFAULT 'draft',
	"meta_title" text,
	"meta_description" text,
	"created_at" text,
	"updated_at" text,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"image_url" text NOT NULL,
	"is_primary" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"sku" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"weight" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "promo_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text,
	"button_text" text NOT NULL,
	"button_link" text DEFAULT '#' NOT NULL,
	"image_url" text,
	"bg_color" text DEFAULT '#F5F5F7' NOT NULL,
	"button_color" text DEFAULT 'blue' NOT NULL,
	"layout" text DEFAULT 'big' NOT NULL,
	"link_type" text DEFAULT 'custom' NOT NULL,
	"product_id" text,
	"is_new_tab" boolean DEFAULT false,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "recently_viewed" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"viewed_at" text,
	CONSTRAINT "recently_viewed_user_id_product_id_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"order_id" text,
	"customer_id" text,
	"rating" integer NOT NULL,
	"comment" text,
	"image_url" text,
	"date" text,
	"status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "saved_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"recipient_name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"province_id" integer,
	"city_id" integer,
	"postal_code" text,
	"is_default" boolean DEFAULT false,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "seo_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"page_route" text NOT NULL,
	"page_title" text NOT NULL,
	"meta_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"keywords" text,
	"og_image" text,
	"is_active" boolean DEFAULT true,
	"updated_at" text,
	CONSTRAINT "seo_settings_page_route_unique" UNIQUE("page_route")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"action" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by" text,
	"changed_at" text,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "shipping" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"destination_province_id" integer,
	"destination_city_id" integer,
	"courier_code" text,
	"courier_service" text,
	"total_weight" integer NOT NULL,
	"shipping_cost" integer NOT NULL,
	"tracking_number" text,
	"shipping_status" text DEFAULT 'pending',
	"shipping_date" text,
	CONSTRAINT "shipping_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "shipping_origins" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"city_name" text NOT NULL,
	"province_name" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" text
);
--> statement-breakpoint
CREATE TABLE "stock_history" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"previous_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"change" integer NOT NULL,
	"reason" text,
	"reference_id" text,
	"changed_at" text
);
--> statement-breakpoint
CREATE TABLE "store_info" (
	"id" text PRIMARY KEY NOT NULL,
	"store_name" text DEFAULT 'SimbioStore' NOT NULL,
	"logo_url" text DEFAULT '/images/logo/logo.svg' NOT NULL,
	"favicon_url" text,
	"email" text DEFAULT 'support@example.com' NOT NULL,
	"phone" text DEFAULT '(+099) 532-786-9843' NOT NULL,
	"support_phone" text DEFAULT '(+965) 7492-3477' NOT NULL,
	"address" text DEFAULT '685 Market Street, Las Vegas, LA 95820, United States.' NOT NULL,
	"facebook_url" text,
	"twitter_url" text,
	"instagram_url" text,
	"linkedin_url" text,
	"app_store_url" text,
	"google_play_url" text,
	"copyright_text" text DEFAULT 'All rights reserved by SimbioStore.' NOT NULL,
	"primary_color" text DEFAULT '#3C50E0' NOT NULL,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" text,
	"updated_by" text,
	CONSTRAINT "store_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"review" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"author_img" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"phone" text,
	"address" text,
	"province_id" integer,
	"city_id" integer,
	"postal_code" text,
	"role" text DEFAULT 'customer'
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" text,
	CONSTRAINT "wishlists_user_id_product_id_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_session_settings" ADD CONSTRAINT "chat_session_settings_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countdown_settings" ADD CONSTRAINT "countdown_settings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_post_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_banners" ADD CONSTRAINT "promo_banners_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_addresses" ADD CONSTRAINT "saved_addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings_audit_log" ADD CONSTRAINT "settings_audit_log_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping" ADD CONSTRAINT "shipping_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;