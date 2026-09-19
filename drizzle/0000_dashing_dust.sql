CREATE TABLE "booking_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" varchar(64) NOT NULL,
	"business_service_id" varchar(64) NOT NULL,
	"service_name" varchar(150) NOT NULL,
	"price_charged" numeric(10, 2) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"worker_id" varchar(64),
	"worker_name" varchar(150),
	"scheduled_start" varchar(50),
	"scheduled_end" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"reference_number" varchar(50) NOT NULL,
	"customer_id" varchar(64) NOT NULL,
	"customer_name" varchar(150) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"business_id" varchar(64) NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"business_logo" text,
	"business_category" varchar(100),
	"status" varchar(30) DEFAULT 'confirmed' NOT NULL,
	"payment_status" varchar(30) DEFAULT 'paid' NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"payment_method_display" varchar(100),
	"total_amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2) NOT NULL,
	"scheduled_date" varchar(30) NOT NULL,
	"scheduled_start_time" varchar(20) NOT NULL,
	"scheduled_end_time" varchar(20) NOT NULL,
	"total_duration_minutes" integer NOT NULL,
	"special_instructions" text,
	"notes" text,
	"refund_status" varchar(30),
	"refund_estimated_date" varchar(50),
	"refund_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "business_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"category" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"checked" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"label" varchar(100),
	"is_cover" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" varchar(20) NOT NULL,
	"close_time" varchar(20) NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_reviews" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"booking_id" varchar(64),
	"service_id" varchar(64),
	"service_name" varchar(150),
	"customer_id" varchar(64),
	"customer_name" varchar(150) NOT NULL,
	"customer_avatar" text,
	"rating" integer NOT NULL,
	"review_text" text NOT NULL,
	"media" jsonb DEFAULT '[]'::jsonb,
	"time_ago" varchar(50),
	"response_deadline" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_services" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"service_category_id" varchar(64),
	"category_name" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"photo_url" text,
	"thumbnail_url" text,
	"gallery_photos" jsonb DEFAULT '[]'::jsonb,
	"base_price" numeric(10, 2) NOT NULL,
	"pricing_type" varchar(20) DEFAULT 'fixed',
	"hourly_rate" numeric(10, 2),
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"assigned_workers_count" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64),
	"business_name" varchar(255) NOT NULL,
	"legal_entity_name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"street_address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"website" text,
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"subscription_plan" varchar(50) DEFAULT 'Starter',
	"sales_tax_rate" numeric(5, 2) DEFAULT '8.87',
	"currency" varchar(10) DEFAULT 'USD',
	"automatic_invoicing" boolean DEFAULT true,
	"avatar_char" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_saved_cards" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"customer_id" varchar(64) NOT NULL,
	"cardholder_name" varchar(150) NOT NULL,
	"brand" varchar(20) NOT NULL,
	"last4" varchar(4) NOT NULL,
	"exp_month" varchar(2) NOT NULL,
	"exp_year" varchar(4) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"billing_address" jsonb,
	"gateway_token" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holiday_closures" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"name" varchar(150) NOT NULL,
	"date" varchar(30) NOT NULL,
	"full_day_closure" boolean DEFAULT true,
	"enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "kyc_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"legal_entity_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"risk_tier" varchar(20) DEFAULT 'Low' NOT NULL,
	"ein_raw" varchar(20),
	"ein_masked" varchar(20),
	"tin_match_status" varchar(50) DEFAULT 'Not Started',
	"beneficial_owner_name" varchar(150),
	"beneficial_owner_dob" varchar(30),
	"beneficial_owner_ssn_last4" varchar(4),
	"bank_account_holder" varchar(150),
	"bank_routing_number" varchar(50),
	"bank_account_number_masked" varchar(50),
	"bank_verified" boolean DEFAULT false,
	"sanctions_status" varchar(50) DEFAULT 'Not Started',
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" varchar(150),
	"rejection_reason" text,
	"rejection_count" integer DEFAULT 0,
	"rejection_history" jsonb DEFAULT '[]'::jsonb,
	"signature" text,
	"signature_date" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_verifications_business_id_unique" UNIQUE("business_id")
);
--> statement-breakpoint
CREATE TABLE "marketplace_transactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"booking_id" varchar(64),
	"business_id" varchar(64) NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"customer_name" varchar(150),
	"customer_email" varchar(255),
	"service_name" varchar(150),
	"type" varchar(50) NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"platform_commission" numeric(10, 2) NOT NULL,
	"w9_withholding_rate" numeric(5, 2) DEFAULT '0',
	"w9_withholding_amount" numeric(10, 2) DEFAULT '0',
	"business_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"payment_status" varchar(30) DEFAULT 'paid',
	"withdrawal_status" varchar(30) DEFAULT 'none',
	"payment_gateway" varchar(50) DEFAULT 'NMI Gateway',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nmi_payment_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"nmi_gateway_id" varchar(100),
	"onboarding_status" varchar(30) DEFAULT 'NOT_STARTED' NOT NULL,
	"company_name" varchar(255),
	"federal_tax_id" varchar(50),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(255),
	"bank_routing_number" varchar(50),
	"bank_account_number" varchar(50),
	"account_type" varchar(20) DEFAULT 'checking',
	"account_holder_type" varchar(20) DEFAULT 'business',
	"created_at" timestamp with time zone DEFAULT now(),
	"activated_at" timestamp with time zone,
	CONSTRAINT "nmi_payment_accounts_business_id_unique" UNIQUE("business_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"business_id" varchar(64),
	"message" text NOT NULL,
	"type" varchar(20) DEFAULT 'info' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"action_required" varchar(50),
	"timestamp" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" varchar(64) NOT NULL,
	"author_name" varchar(150) NOT NULL,
	"response_text" text NOT NULL,
	"responded_time_ago" varchar(50),
	"responded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_responses_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"photo_url" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"role" varchar(32) NOT NULL,
	"role_label" varchar(64) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100),
	"phone" varchar(50),
	"nickname" varchar(100),
	"full_name" varchar(150) NOT NULL,
	"referral_code" varchar(50),
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"timezone" varchar(50) DEFAULT 'America/New_York',
	"avatar_initials" varchar(10),
	"department" varchar(100),
	"primary_service_category" varchar(100),
	"years_of_experience" varchar(20),
	"member_since" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "w9_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" varchar(64) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"business_name_or_disregarded" varchar(255),
	"federal_tax_classification" varchar(100) NOT NULL,
	"llc_tax_classification" varchar(50),
	"street_address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"tin_type" varchar(10) NOT NULL,
	"tin_masked" varchar(20) NOT NULL,
	"tin_verified" boolean DEFAULT false,
	"cert_correct_tin" boolean DEFAULT true,
	"cert_no_backup_withholding" boolean DEFAULT true,
	"cert_us_person" boolean DEFAULT true,
	"cert_fatca_correct" boolean DEFAULT false,
	"signature_name" varchar(150) NOT NULL,
	"agreed_perjury" boolean DEFAULT true,
	"status" varchar(20) DEFAULT 'submitted' NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now(),
	"signer_ip" varchar(50),
	"pdf_generated_url" text,
	CONSTRAINT "w9_records_business_id_unique" UNIQUE("business_id")
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"type" varchar(30) DEFAULT 'business' NOT NULL,
	"business_id" varchar(64),
	"business_name" varchar(255) NOT NULL,
	"requested_by_user_id" varchar(64) NOT NULL,
	"requested_by_user_name" varchar(150) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"masked_bank_account" varchar(50) NOT NULL,
	"bank_account_holder" varchar(150) NOT NULL,
	"status" varchar(30) DEFAULT 'Pending' NOT NULL,
	"request_date" varchar(50) NOT NULL,
	"processed_date" varchar(50),
	"rejection_reason" text
);
--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_business_service_id_business_services_id_fk" FOREIGN KEY ("business_service_id") REFERENCES "public"."business_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_amenities" ADD CONSTRAINT "business_amenities_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_gallery" ADD CONSTRAINT "business_gallery_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_saved_cards" ADD CONSTRAINT "customer_saved_cards_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_closures" ADD CONSTRAINT "holiday_closures_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_transactions" ADD CONSTRAINT "marketplace_transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nmi_payment_accounts" ADD CONSTRAINT "nmi_payment_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_business_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."business_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "w9_records" ADD CONSTRAINT "w9_records_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;