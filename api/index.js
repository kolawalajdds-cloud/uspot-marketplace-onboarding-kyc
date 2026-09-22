var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";

// server/routes/users.ts
import { Router } from "express";

// server/db/index.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// server/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookingItems: () => bookingItems,
  bookings: () => bookings,
  businessAmenities: () => businessAmenities,
  businessGallery: () => businessGallery,
  businessHours: () => businessHours,
  businessReviews: () => businessReviews,
  businessServices: () => businessServices,
  businesses: () => businesses,
  customerSavedCards: () => customerSavedCards,
  holidayClosures: () => holidayClosures,
  kycVerifications: () => kycVerifications,
  marketplaceTransactions: () => marketplaceTransactions,
  nmiPaymentAccounts: () => nmiPaymentAccounts,
  notifications: () => notifications,
  reviewResponses: () => reviewResponses,
  serviceCategories: () => serviceCategories,
  users: () => users,
  w9Records: () => w9Records,
  withdrawalRequests: () => withdrawalRequests
});
import {
  pgTable,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  serial
} from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  role: varchar("role", { length: 32 }).notNull(),
  // 'super_admin' | 'business' | 'customer' | 'specialist'
  roleLabel: varchar("role_label", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique(),
  phone: varchar("phone", { length: 50 }),
  nickname: varchar("nickname", { length: 100 }),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  referralCode: varchar("referral_code", { length: 50 }),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  timezone: varchar("timezone", { length: 50 }).default("America/New_York"),
  avatarInitials: varchar("avatar_initials", { length: 10 }),
  department: varchar("department", { length: 100 }),
  primaryServiceCategory: varchar("primary_service_category", { length: 100 }),
  yearsOfExperience: varchar("years_of_experience", { length: 20 }),
  memberSince: varchar("member_since", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var businesses = pgTable("businesses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  legalEntityName: varchar("legal_entity_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  streetAddress: text("street_address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  status: varchar("status", { length: 50 }).default("Draft").notNull(),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("Starter"),
  salesTaxRate: numeric("sales_tax_rate", { precision: 5, scale: 2 }).default("8.87"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  automaticInvoicing: boolean("automatic_invoicing").default(true),
  avatarChar: varchar("avatar_char", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  // 0 = Sunday, 1 = Monday ... 6 = Saturday
  openTime: varchar("open_time", { length: 20 }).notNull(),
  closeTime: varchar("close_time", { length: 20 }).notNull(),
  isClosed: boolean("is_closed").default(false).notNull()
});
var businessAmenities = pgTable("business_amenities", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  checked: boolean("checked").default(true).notNull()
});
var businessGallery = pgTable("business_gallery", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  label: varchar("label", { length: 100 }),
  isCover: boolean("is_cover").default(false),
  sortOrder: integer("sort_order").default(0)
});
var holidayClosures = pgTable("holiday_closures", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  date: varchar("date", { length: 30 }).notNull(),
  fullDayClosure: boolean("full_day_closure").default(true),
  enabled: boolean("enabled").default(true)
});
var kycVerifications = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull().unique(),
  legalEntityType: varchar("legal_entity_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("Draft").notNull(),
  riskTier: varchar("risk_tier", { length: 20 }).default("Low").notNull(),
  einRaw: varchar("ein_raw", { length: 20 }),
  einMasked: varchar("ein_masked", { length: 20 }),
  tinMatchStatus: varchar("tin_match_status", { length: 50 }).default("Not Started"),
  beneficialOwnerName: varchar("beneficial_owner_name", { length: 150 }),
  beneficialOwnerDob: varchar("beneficial_owner_dob", { length: 30 }),
  beneficialOwnerSsnLast4: varchar("beneficial_owner_ssn_last4", { length: 4 }),
  bankAccountHolder: varchar("bank_account_holder", { length: 150 }),
  bankRoutingNumber: varchar("bank_routing_number", { length: 50 }),
  bankAccountNumberMasked: varchar("bank_account_number_masked", { length: 50 }),
  bankVerified: boolean("bank_verified").default(false),
  sanctionsStatus: varchar("sanctions_status", { length: 50 }).default("Not Started"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: varchar("reviewed_by", { length: 150 }),
  rejectionReason: text("rejection_reason"),
  rejectionCount: integer("rejection_count").default(0),
  rejectionHistory: jsonb("rejection_history").default([]),
  signature: text("signature"),
  signatureDate: varchar("signature_date", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var w9Records = pgTable("w9_records", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull().unique(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  businessNameOrDisregarded: varchar("business_name_or_disregarded", { length: 255 }),
  federalTaxClassification: varchar("federal_tax_classification", { length: 100 }).notNull(),
  llcTaxClassification: varchar("llc_tax_classification", { length: 50 }),
  streetAddress: text("street_address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  tinType: varchar("tin_type", { length: 10 }).notNull(),
  // 'EIN' | 'SSN'
  tinMasked: varchar("tin_masked", { length: 20 }).notNull(),
  tinVerified: boolean("tin_verified").default(false),
  certCorrectTin: boolean("cert_correct_tin").default(true),
  certNoBackupWithholding: boolean("cert_no_backup_withholding").default(true),
  certUsPerson: boolean("cert_us_person").default(true),
  certFatcaCorrect: boolean("cert_fatca_correct").default(false),
  signatureName: varchar("signature_name", { length: 150 }).notNull(),
  agreedPerjury: boolean("agreed_perjury").default(true),
  status: varchar("status", { length: 20 }).default("submitted").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }).defaultNow(),
  signerIp: varchar("signer_ip", { length: 50 }),
  pdfGeneratedUrl: text("pdf_generated_url")
});
var nmiPaymentAccounts = pgTable("nmi_payment_accounts", {
  id: serial("id").primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull().unique(),
  nmiGatewayId: varchar("nmi_gateway_id", { length: 100 }),
  onboardingStatus: varchar("onboarding_status", { length: 30 }).default("NOT_STARTED").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  federalTaxId: varchar("federal_tax_id", { length: 50 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  bankRoutingNumber: varchar("bank_routing_number", { length: 50 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  accountType: varchar("account_type", { length: 20 }).default("checking"),
  accountHolderType: varchar("account_holder_type", { length: 20 }).default("business"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  activatedAt: timestamp("activated_at", { withTimezone: true })
});
var serviceCategories = pgTable("service_categories", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  status: varchar("status", { length: 20 }).default("active").notNull()
});
var businessServices = pgTable("business_services", {
  id: varchar("id", { length: 64 }).primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  serviceCategoryId: varchar("service_category_id", { length: 64 }),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  thumbnailUrl: text("thumbnail_url"),
  galleryPhotos: jsonb("gallery_photos").default([]),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  pricingType: varchar("pricing_type", { length: 20 }).default("fixed"),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  durationMinutes: integer("duration_minutes").default(45).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  assignedWorkersCount: integer("assigned_workers_count").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var customerSavedCards = pgTable("customer_saved_cards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  customerId: varchar("customer_id", { length: 64 }).notNull(),
  cardholderName: varchar("cardholder_name", { length: 150 }).notNull(),
  brand: varchar("brand", { length: 20 }).notNull(),
  // 'mastercard' | 'visa' | 'amex' | 'discover'
  last4: varchar("last4", { length: 4 }).notNull(),
  expMonth: varchar("exp_month", { length: 2 }).notNull(),
  expYear: varchar("exp_year", { length: 4 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  billingAddress: jsonb("billing_address"),
  gatewayToken: varchar("gateway_token", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var bookings = pgTable("bookings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  referenceNumber: varchar("reference_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id", { length: 64 }).notNull(),
  customerName: varchar("customer_name", { length: 150 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessLogo: text("business_logo"),
  businessCategory: varchar("business_category", { length: 100 }),
  status: varchar("status", { length: 30 }).default("confirmed").notNull(),
  // 'pending' | 'confirmed' | 'visited' | 'cancelled' | 'noshow'
  paymentStatus: varchar("payment_status", { length: 30 }).default("paid").notNull(),
  // 'unpaid' | 'paid' | 'refunded' | 'failed'
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
  // 'credit_card' | 'cash'
  paymentMethodDisplay: varchar("payment_method_display", { length: 100 }),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: varchar("scheduled_date", { length: 30 }).notNull(),
  scheduledStartTime: varchar("scheduled_start_time", { length: 20 }).notNull(),
  scheduledEndTime: varchar("scheduled_end_time", { length: 20 }).notNull(),
  totalDurationMinutes: integer("total_duration_minutes").notNull(),
  specialInstructions: text("special_instructions"),
  notes: text("notes"),
  refundStatus: varchar("refund_status", { length: 30 }),
  refundEstimatedDate: varchar("refund_estimated_date", { length: 50 }),
  refundId: varchar("refund_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var bookingItems = pgTable("booking_items", {
  id: serial("id").primaryKey(),
  bookingId: varchar("booking_id", { length: 64 }).references(() => bookings.id, { onDelete: "cascade" }).notNull(),
  businessServiceId: varchar("business_service_id", { length: 64 }).notNull(),
  serviceName: varchar("service_name", { length: 150 }).notNull(),
  priceCharged: numeric("price_charged", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  workerId: varchar("worker_id", { length: 64 }),
  workerName: varchar("worker_name", { length: 150 }),
  scheduledStart: varchar("scheduled_start", { length: 50 }),
  scheduledEnd: varchar("scheduled_end", { length: 50 })
});
var businessReviews = pgTable("business_reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  bookingId: varchar("booking_id", { length: 64 }),
  serviceId: varchar("service_id", { length: 64 }),
  serviceName: varchar("service_name", { length: 150 }),
  customerId: varchar("customer_id", { length: 64 }),
  customerName: varchar("customer_name", { length: 150 }).notNull(),
  customerAvatar: text("customer_avatar"),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  media: jsonb("media").default([]),
  timeAgo: varchar("time_ago", { length: 50 }),
  responseDeadline: text("response_deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var reviewResponses = pgTable("review_responses", {
  id: serial("id").primaryKey(),
  reviewId: varchar("review_id", { length: 64 }).references(() => businessReviews.id, { onDelete: "cascade" }).notNull().unique(),
  authorName: varchar("author_name", { length: 150 }).notNull(),
  responseText: text("response_text").notNull(),
  respondedTimeAgo: varchar("responded_time_ago", { length: 50 }),
  respondedAt: timestamp("responded_at", { withTimezone: true }).defaultNow().notNull()
});
var marketplaceTransactions = pgTable("marketplace_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 64 }),
  businessId: varchar("business_id", { length: 64 }).references(() => businesses.id).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  customerName: varchar("customer_name", { length: 150 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  serviceName: varchar("service_name", { length: 150 }),
  type: varchar("type", { length: 50 }).notNull(),
  grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  platformCommission: numeric("platform_commission", { precision: 10, scale: 2 }).notNull(),
  w9WithholdingRate: numeric("w9_withholding_rate", { precision: 5, scale: 2 }).default("0"),
  w9WithholdingAmount: numeric("w9_withholding_amount", { precision: 10, scale: 2 }).default("0"),
  businessAmount: numeric("business_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentStatus: varchar("payment_status", { length: 30 }).default("paid"),
  withdrawalStatus: varchar("withdrawal_status", { length: 30 }).default("none"),
  paymentGateway: varchar("payment_gateway", { length: 50 }).default("NMI Gateway"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: varchar("type", { length: 30 }).default("business").notNull(),
  businessId: varchar("business_id", { length: 64 }),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  requestedByUserId: varchar("requested_by_user_id", { length: 64 }).notNull(),
  requestedByUserName: varchar("requested_by_user_name", { length: 150 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  maskedBankAccount: varchar("masked_bank_account", { length: 50 }).notNull(),
  bankAccountHolder: varchar("bank_account_holder", { length: 150 }).notNull(),
  status: varchar("status", { length: 30 }).default("Pending").notNull(),
  requestDate: varchar("request_date", { length: 50 }).notNull(),
  processedDate: varchar("processed_date", { length: 50 }),
  rejectionReason: text("rejection_reason")
});
var notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  businessId: varchar("business_id", { length: 64 }),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).default("info").notNull(),
  read: boolean("read").default(false).notNull(),
  actionRequired: varchar("action_required", { length: 50 }),
  timestamp: varchar("timestamp", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// server/db/index.ts
import dotenv from "dotenv";
dotenv.config();
var connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
  console.warn("\u26A0\uFE0F WARNING: Valid DATABASE_URL not detected in .env. Please update .env with your Neon connection string.");
}
var pool = new Pool({
  connectionString: connectionString || void 0,
  ssl: connectionString && connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : void 0
});
var db = drizzle(pool, { schema: schema_exports });

// server/routes/users.ts
import { eq } from "drizzle-orm";
var router = Router();
router.get("/", async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, username, identifier, role } = req.body;
    const term = (identifier || email || username || "").trim().toLowerCase();
    const allUsers = await db.select().from(users);
    let user = term ? allUsers.find(
      (u) => u.email?.toLowerCase() === term || u.username?.toLowerCase() === term || u.id.toLowerCase() === term
    ) : null;
    if (!user && role) {
      user = allUsers.find((u) => u.role.toLowerCase() === role.toLowerCase());
    }
    if (!user) {
      return res.status(404).json({ error: "No user found with the provided credentials. Please check your email or register." });
    }
    const allBusinesses = await db.select().from(businesses);
    const userBiz = allBusinesses.find(
      (b) => b.userId && b.userId === user.id || b.email && b.email.toLowerCase() === user.email.toLowerCase()
    );
    res.json({
      success: true,
      user,
      business: userBiz || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db.update(users).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, req.params.id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/register", async (req, res) => {
  try {
    const {
      accountType,
      // 'personal' | 'business'
      email,
      password,
      firstName,
      lastName,
      phone,
      jobTitle,
      nickname,
      username: providedUsername,
      marketingOptIn
    } = req.body;
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: "Email, First Name, and Last Name are required." });
    }
    const trimmedEmail = email.trim().toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.email, trimmedEmail));
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists. Please login instead." });
    }
    const isBusiness = accountType === "business";
    const role = isBusiness ? "business" : "customer";
    const roleLabel = isBusiness ? "Business Entity" : "Customer";
    const newUserId = `user-${role}-${Date.now()}`;
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullName = `${cleanFirstName} ${cleanLastName}`;
    const initials = ((cleanFirstName[0] || "U") + (cleanLastName[0] || "")).toUpperCase();
    const username = providedUsername?.trim() || trimmedEmail.split("@")[0] + "_" + Math.floor(100 + Math.random() * 900);
    const finalNickname = nickname?.trim() || cleanFirstName;
    const [newUser] = await db.insert(users).values({
      id: newUserId,
      role,
      roleLabel,
      status: "active",
      email: trimmedEmail,
      username,
      phone: phone?.trim() || null,
      nickname: finalNickname,
      fullName,
      referralCode: `REF-${Math.floor(1e3 + Math.random() * 9e3)}`,
      emailVerified: true,
      phoneVerified: Boolean(phone),
      timezone: "America/New_York",
      avatarInitials: initials,
      department: jobTitle?.trim() || (isBusiness ? "Business Operations" : "Marketplace Customer"),
      memberSince: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }).returning();
    let createdBusiness = null;
    if (isBusiness) {
      const businessId = `biz-${Date.now()}`;
      let domainName = trimmedEmail.split("@")[1]?.split(".")[0] || "";
      if (["gmail", "yahoo", "outlook", "hotmail", "icloud", "proton"].includes(domainName.toLowerCase())) {
        domainName = "";
      }
      const businessName = domainName ? domainName.charAt(0).toUpperCase() + domainName.slice(1) + " Services" : `${fullName}'s Business`;
      const [newBiz] = await db.insert(businesses).values({
        id: businessId,
        userId: newUser.id,
        businessName,
        legalEntityName: `${businessName} LLC`,
        category: "Coworking & Creative Hub",
        description: `Professional spaces, reservations, and merchant operations by ${fullName}.`,
        streetAddress: "100 Market St, Suite 400",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        phone: phone?.trim() || "+1 (555) 019-2834",
        email: trimmedEmail,
        status: "Draft",
        subscriptionPlan: "Starter",
        salesTaxRate: "8.87",
        currency: "USD",
        automaticInvoicing: true,
        avatarChar: businessName[0]?.toUpperCase() || "B"
      }).returning();
      for (let day = 0; day <= 6; day++) {
        await db.insert(businessHours).values({
          businessId,
          dayOfWeek: day,
          openTime: "08:00",
          closeTime: "19:00",
          isClosed: day === 0
          // Closed Sunday
        });
      }
      await db.insert(businessAmenities).values([
        {
          businessId,
          category: "General & Comfort",
          name: "High-Speed Wi-Fi",
          description: "1Gbps enterprise connection",
          checked: true
        },
        {
          businessId,
          category: "General & Comfort",
          name: "Restrooms",
          description: "Clean restrooms on premises",
          checked: true
        },
        {
          businessId,
          category: "Tech & Workspace",
          name: "Power Outlets",
          description: "Power outlets readily available at all spots",
          checked: true
        }
      ]);
      await db.insert(kycVerifications).values({
        businessId,
        legalEntityType: "Limited Liability Company (LLC)",
        status: "Draft",
        riskTier: "Low",
        sanctionsStatus: "Not Started",
        tinMatchStatus: "Not Started"
      });
      createdBusiness = newBiz;
    }
    res.status(201).json({
      success: true,
      user: newUser,
      business: createdBusiness
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || "Failed to register account" });
  }
});
router.post("/", async (req, res) => {
  try {
    const {
      id,
      role,
      roleLabel,
      status,
      email,
      username,
      phone,
      nickname,
      fullName,
      referralCode,
      emailVerified,
      phoneVerified,
      timezone,
      avatarInitials,
      department,
      primaryServiceCategory,
      yearsOfExperience,
      memberSince
    } = req.body;
    const trimmedEmail = (email || "").trim().toLowerCase();
    const newId = id || `user-${role || "customer"}-${Date.now()}`;
    const [created] = await db.insert(users).values({
      id: newId,
      role: role || "customer",
      roleLabel: roleLabel || (role === "business" ? "Business" : "Customer"),
      status: status || "active",
      email: trimmedEmail,
      username: username || trimmedEmail.split("@")[0] + "_" + Math.floor(100 + Math.random() * 900),
      phone: phone || null,
      nickname: nickname || fullName?.split(" ")[0] || null,
      fullName: fullName || trimmedEmail.split("@")[0],
      referralCode: referralCode || `REF-${Math.floor(1e3 + Math.random() * 9e3)}`,
      emailVerified: emailVerified ?? true,
      phoneVerified: phoneVerified ?? true,
      timezone: timezone || "America/New_York",
      avatarInitials: avatarInitials || (fullName ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U"),
      department: department || (role === "business" ? "Vendor Merchant" : "Customer"),
      primaryServiceCategory: primaryServiceCategory || null,
      yearsOfExperience: yearsOfExperience ? String(yearsOfExperience) : null,
      memberSince: memberSince || (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var users_default = router;

// server/routes/businesses.ts
import { Router as Router2 } from "express";
import { eq as eq2 } from "drizzle-orm";
var router2 = Router2();
async function getCompleteBusiness(businessId) {
  const [biz] = await db.select().from(businesses).where(eq2(businesses.id, businessId));
  if (!biz) return null;
  const hours = await db.select().from(businessHours).where(eq2(businessHours.businessId, businessId));
  const amenities = await db.select().from(businessAmenities).where(eq2(businessAmenities.businessId, businessId));
  const gallery = await db.select().from(businessGallery).where(eq2(businessGallery.businessId, businessId));
  const holidays = await db.select().from(holidayClosures).where(eq2(holidayClosures.businessId, businessId));
  const [kyc] = await db.select().from(kycVerifications).where(eq2(kycVerifications.businessId, businessId));
  const [w9] = await db.select().from(w9Records).where(eq2(w9Records.businessId, businessId));
  const [nmi] = await db.select().from(nmiPaymentAccounts).where(eq2(nmiPaymentAccounts.businessId, businessId));
  return {
    id: biz.id,
    userId: biz.userId,
    status: biz.status,
    coreDetails: {
      businessName: biz.businessName,
      legalEntityName: biz.legalEntityName,
      category: biz.category,
      description: biz.description || "",
      streetAddress: biz.streetAddress,
      city: biz.city,
      state: biz.state,
      zipCode: biz.zipCode
    },
    operatingHours: hours.map((h) => ({
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][h.dayOfWeek] || "Monday",
      isOpen: !h.isClosed,
      openTime: h.openTime,
      closeTime: h.closeTime
    })),
    imageGallery: gallery.map((g) => ({
      id: String(g.id),
      label: g.label || "Gallery Photo",
      color: "from-slate-700 to-slate-900",
      isCover: !!g.isCover,
      url: g.url
    })),
    amenities: [
      {
        category: "General & Comfort",
        items: amenities.filter((a) => a.category === "General & Comfort").map((a) => ({ id: String(a.id), name: a.name, description: a.description || "", checked: a.checked }))
      },
      {
        category: "Tech & Workspace",
        items: amenities.filter((a) => a.category === "Tech & Workspace").map((a) => ({ id: String(a.id), name: a.name, description: a.description || "", checked: a.checked }))
      },
      {
        category: "Accessibility",
        items: amenities.filter((a) => a.category === "Accessibility").map((a) => ({ id: String(a.id), name: a.name, description: a.description || "", checked: a.checked }))
      }
    ],
    holidaysRules: {
      holidayClosures: holidays.map((h) => ({
        id: String(h.id),
        name: h.name,
        date: h.date,
        fullDayClosure: h.fullDayClosure,
        enabled: h.enabled
      })),
      businessRules: {
        maxCapacity: 25,
        petFriendly: true,
        ageRequirement: "18+",
        byobAllowed: false
      }
    },
    feesTax: {
      businessTaxId: kyc?.einMasked || "XX-XXXXXXX",
      salesTaxRate: Number(biz.salesTaxRate || 8.87),
      taxExempt: false,
      currency: biz.currency || "USD",
      automaticInvoicing: biz.automaticInvoicing ?? true,
      serviceFees: []
    },
    verification: kyc ? {
      status: kyc.status,
      legalEntityType: kyc.legalEntityType,
      riskTier: kyc.riskTier,
      einVerification: {
        einEntered: kyc.einMasked || "",
        tinMasked: kyc.einMasked || "",
        tinMatchStatus: kyc.tinMatchStatus,
        verifiedAt: kyc.reviewedAt ? new Date(kyc.reviewedAt).toISOString() : null
      },
      entityRegistration: {
        documentUploaded: true,
        stateRegistryStatus: "Active/Good Standing"
      },
      beneficialOwner: {
        fullName: kyc.beneficialOwnerName || "",
        dateOfBirth: kyc.beneficialOwnerDob || "",
        ssnLast4: kyc.beneficialOwnerSsnLast4 || "",
        govIdUploaded: true,
        selfieUploaded: true
      },
      sanctionsScreening: {
        status: kyc.sanctionsStatus
      },
      bankAccount: {
        accountHolderName: kyc.bankAccountHolder || "",
        routingNumber: kyc.bankRoutingNumber || "",
        accountNumberMasked: kyc.bankAccountNumberMasked || "",
        verificationMethod: "Instant",
        verified: kyc.bankVerified
      },
      submittedAt: kyc.submittedAt ? new Date(kyc.submittedAt).toISOString() : null,
      reviewedAt: kyc.reviewedAt ? new Date(kyc.reviewedAt).toISOString() : null,
      reviewedBy: kyc.reviewedBy,
      rejectionReason: kyc.rejectionReason,
      rejectionCount: kyc.rejectionCount || 0,
      rejectionHistory: kyc.rejectionHistory || [],
      signature: kyc.signature || void 0,
      signatureDate: kyc.signatureDate || void 0
    } : void 0,
    payment: {
      planSelected: biz.subscriptionPlan || "Starter",
      amount: 49,
      paidAt: new Date(biz.createdAt).toISOString()
    },
    w9: w9 ? {
      id: String(w9.id),
      businessId: w9.businessId,
      legalName: w9.legalName,
      businessNameOrDisregarded: w9.businessNameOrDisregarded || "",
      federalTaxClassification: w9.federalTaxClassification,
      llcTaxClassification: w9.llcTaxClassification || void 0,
      streetAddress: w9.streetAddress || "",
      city: w9.city || "",
      state: w9.state || "",
      zipCode: w9.zipCode || "",
      tinType: w9.tinType,
      tinMasked: w9.tinMasked,
      tinVerified: w9.tinVerified,
      tinMatchStatus: "match",
      reusedEkycTin: true,
      certifications: {
        correctTin: w9.certCorrectTin,
        noBackupWithholding: w9.certNoBackupWithholding,
        usPerson: w9.certUsPerson,
        fatcaCorrect: w9.certFatcaCorrect
      },
      signatureName: w9.signatureName,
      agreedPerjury: w9.agreedPerjury,
      status: w9.status,
      signedAt: w9.signedAt ? new Date(w9.signedAt).toISOString() : null,
      signerIp: w9.signerIp || "192.168.1.1",
      pdfGeneratedUrl: w9.pdfGeneratedUrl
    } : void 0,
    nmiPaymentAccount: nmi ? {
      vendorId: nmi.businessId,
      nmiOnboardingStatus: nmi.onboardingStatus,
      nmiGatewayId: nmi.nmiGatewayId,
      companyName: nmi.companyName || "",
      federalTaxId: nmi.federalTaxId || "",
      firstName: nmi.firstName || "",
      lastName: nmi.lastName || "",
      email: nmi.email || "",
      bankRoutingNumber: nmi.bankRoutingNumber || "",
      bankAccountNumber: nmi.bankAccountNumber || "",
      accountType: nmi.accountType,
      accountHolderType: nmi.accountHolderType,
      createdAt: nmi.createdAt ? new Date(nmi.createdAt).toISOString() : void 0,
      activatedAt: nmi.activatedAt ? new Date(nmi.activatedAt).toISOString() : void 0
    } : void 0,
    notifications: [],
    phone: biz.phone || "+1 (555) 019-2834",
    email: biz.email || "contact@business.com",
    website: biz.website || "https://example.com",
    avatarChar: biz.avatarChar || biz.businessName[0] || "B"
  };
}
router2.get("/", async (req, res) => {
  try {
    const all = await db.select().from(businesses);
    const populated = await Promise.all(all.map((b) => getCompleteBusiness(b.id)));
    res.json(populated.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const biz = await getCompleteBusiness(req.params.id);
    if (!biz) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(biz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.post("/", async (req, res) => {
  try {
    const { id, userId, coreDetails, status, subscriptionPlan } = req.body;
    const [created] = await db.insert(businesses).values({
      id: id || `biz-${Date.now()}`,
      userId,
      businessName: coreDetails.businessName,
      legalEntityName: coreDetails.legalEntityName,
      category: coreDetails.category,
      description: coreDetails.description,
      streetAddress: coreDetails.streetAddress,
      city: coreDetails.city,
      state: coreDetails.state,
      zipCode: coreDetails.zipCode,
      status: status || "Draft",
      subscriptionPlan: subscriptionPlan || "Starter"
    }).returning();
    const full = await getCompleteBusiness(created.id);
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.patch("/:id", async (req, res) => {
  try {
    const { coreDetails, status, subscriptionPlan, ...rest } = req.body;
    const updateData = { updatedAt: /* @__PURE__ */ new Date(), ...rest };
    if (coreDetails) {
      if (coreDetails.businessName) updateData.businessName = coreDetails.businessName;
      if (coreDetails.legalEntityName) updateData.legalEntityName = coreDetails.legalEntityName;
      if (coreDetails.category) updateData.category = coreDetails.category;
      if (coreDetails.description !== void 0) updateData.description = coreDetails.description;
      if (coreDetails.streetAddress) updateData.streetAddress = coreDetails.streetAddress;
      if (coreDetails.city) updateData.city = coreDetails.city;
      if (coreDetails.state) updateData.state = coreDetails.state;
      if (coreDetails.zipCode) updateData.zipCode = coreDetails.zipCode;
    }
    if (status) updateData.status = status;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
    await db.update(businesses).set(updateData).where(eq2(businesses.id, req.params.id));
    const updated = await getCompleteBusiness(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var businesses_default = router2;

// server/routes/compliance.ts
import { Router as Router3 } from "express";
import { eq as eq3 } from "drizzle-orm";
var router3 = Router3();
router3.get("/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const [kyc] = await db.select().from(kycVerifications).where(eq3(kycVerifications.businessId, businessId));
    const [w9] = await db.select().from(w9Records).where(eq3(w9Records.businessId, businessId));
    const [nmi] = await db.select().from(nmiPaymentAccounts).where(eq3(nmiPaymentAccounts.businessId, businessId));
    res.json({
      kyc: kyc || null,
      w9: w9 || null,
      nmi: nmi || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/kyc/submit", async (req, res) => {
  try {
    const { businessId, verificationData, signature, signatureDate } = req.body;
    if (!businessId || !verificationData) {
      return res.status(400).json({ error: "businessId and verificationData are required" });
    }
    const payload = {
      businessId,
      legalEntityType: verificationData.legalEntityType,
      status: "Pending Review",
      riskTier: verificationData.riskTier || "Low",
      einRaw: verificationData.tinRaw || verificationData.einVerification?.tinRaw,
      einMasked: verificationData.tinMasked || verificationData.einVerification?.tinMasked,
      tinMatchStatus: verificationData.einVerification?.tinMatchStatus || "Matched",
      beneficialOwnerName: verificationData.beneficialOwner?.fullName,
      beneficialOwnerDob: verificationData.beneficialOwner?.dateOfBirth,
      beneficialOwnerSsnLast4: verificationData.beneficialOwner?.ssnLast4,
      bankAccountHolder: verificationData.bankAccount?.accountHolderName,
      bankRoutingNumber: verificationData.bankAccount?.routingNumber,
      bankAccountNumberMasked: verificationData.bankAccount?.accountNumberMasked,
      bankVerified: verificationData.bankAccount?.verified || false,
      sanctionsStatus: verificationData.sanctionsScreening?.status || "Clear",
      submittedAt: /* @__PURE__ */ new Date(),
      signature,
      signatureDate
    };
    const [existing] = await db.select().from(kycVerifications).where(eq3(kycVerifications.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(kycVerifications).set(payload).where(eq3(kycVerifications.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(kycVerifications).values(payload).returning();
    }
    await db.update(businesses).set({ status: "Pending KYC Review", updatedAt: /* @__PURE__ */ new Date() }).where(eq3(businesses.id, businessId));
    res.json({ success: true, kyc: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/kyc/review", async (req, res) => {
  try {
    const { businessId, action, reviewerName, rejectionReason } = req.body;
    if (!businessId || !action) {
      return res.status(400).json({ error: "businessId and action are required" });
    }
    const isApproved = action === "approve";
    const newStatus = isApproved ? "Approved" : "Rejected";
    const businessStatus = isApproved ? "Live" : "KYC Rejected";
    const [existing] = await db.select().from(kycVerifications).where(eq3(kycVerifications.businessId, businessId));
    let history = Array.isArray(existing?.rejectionHistory) ? existing.rejectionHistory : [];
    let count = existing?.rejectionCount || 0;
    if (!isApproved && rejectionReason) {
      count += 1;
      history = [
        ...history,
        {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          reason: rejectionReason,
          rejectedBy: reviewerName || "Super Admin"
        }
      ];
    }
    const [updatedKyc] = await db.update(kycVerifications).set({
      status: newStatus,
      reviewedAt: /* @__PURE__ */ new Date(),
      reviewedBy: reviewerName || "Super Admin",
      rejectionReason: !isApproved ? rejectionReason : null,
      rejectionCount: count,
      rejectionHistory: history
    }).where(eq3(kycVerifications.businessId, businessId)).returning();
    await db.update(businesses).set({ status: businessStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(businesses.id, businessId));
    res.json({ success: true, kyc: updatedKyc, businessStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/w9/sign", async (req, res) => {
  try {
    const { businessId, w9Data } = req.body;
    if (!businessId || !w9Data) {
      return res.status(400).json({ error: "businessId and w9Data are required" });
    }
    const payload = {
      businessId,
      legalName: w9Data.legalName,
      businessNameOrDisregarded: w9Data.businessNameOrDisregarded,
      federalTaxClassification: w9Data.federalTaxClassification,
      llcTaxClassification: w9Data.llcTaxClassification,
      streetAddress: w9Data.streetAddress,
      city: w9Data.city,
      state: w9Data.state,
      zipCode: w9Data.zipCode,
      tinType: w9Data.tinType,
      tinMasked: w9Data.tinMasked,
      tinVerified: w9Data.tinVerified ?? true,
      certCorrectTin: w9Data.certifications?.correctTin ?? true,
      certNoBackupWithholding: w9Data.certifications?.noBackupWithholding ?? true,
      certUsPerson: w9Data.certifications?.usPerson ?? true,
      certFatcaCorrect: w9Data.certifications?.fatcaCorrect ?? false,
      signatureName: w9Data.signatureName,
      agreedPerjury: w9Data.agreedPerjury ?? true,
      status: "submitted",
      signedAt: /* @__PURE__ */ new Date(),
      signerIp: req.ip || "127.0.0.1",
      pdfGeneratedUrl: w9Data.pdfGeneratedUrl || null
    };
    const [existing] = await db.select().from(w9Records).where(eq3(w9Records.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(w9Records).set(payload).where(eq3(w9Records.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(w9Records).values(payload).returning();
    }
    res.json({ success: true, w9: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/nmi/onboard", async (req, res) => {
  try {
    const { businessId, nmiAccount } = req.body;
    if (!businessId || !nmiAccount) {
      return res.status(400).json({ error: "businessId and nmiAccount are required" });
    }
    const payload = {
      businessId,
      nmiGatewayId: nmiAccount.nmiGatewayId || `nmi-gw-${Date.now()}`,
      onboardingStatus: nmiAccount.nmiOnboardingStatus || "ACTIVE",
      companyName: nmiAccount.companyName,
      federalTaxId: nmiAccount.federalTaxId,
      firstName: nmiAccount.firstName,
      lastName: nmiAccount.lastName,
      email: nmiAccount.email,
      bankRoutingNumber: nmiAccount.bankRoutingNumber,
      bankAccountNumber: nmiAccount.bankAccountNumber,
      accountType: nmiAccount.accountType || "checking",
      accountHolderType: nmiAccount.accountHolderType || "business",
      activatedAt: /* @__PURE__ */ new Date()
    };
    const [existing] = await db.select().from(nmiPaymentAccounts).where(eq3(nmiPaymentAccounts.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(nmiPaymentAccounts).set(payload).where(eq3(nmiPaymentAccounts.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(nmiPaymentAccounts).values(payload).returning();
    }
    res.json({ success: true, nmi: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var compliance_default = router3;

// server/routes/services.ts
import { Router as Router4 } from "express";
import { eq as eq4 } from "drizzle-orm";
var router4 = Router4();
router4.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(serviceCategories);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/business/:businessId", async (req, res) => {
  try {
    const services = await db.select().from(businessServices).where(eq4(businessServices.businessId, req.params.businessId));
    const mapped = services.map((s) => ({
      ...s,
      base_price: Number(s.basePrice),
      hourly_rate: s.hourlyRate ? Number(s.hourlyRate) : void 0,
      duration_minutes: s.durationMinutes,
      requires_approval: s.requiresApproval,
      photo_url: s.photoUrl,
      thumbnail_url: s.thumbnailUrl,
      gallery_photos: s.galleryPhotos || [],
      assigned_workers_count: s.assignedWorkersCount || 1
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.post("/", async (req, res) => {
  try {
    const s = req.body;
    const [inserted] = await db.insert(businessServices).values({
      id: s.id || `srv-${Date.now()}`,
      businessId: s.business_id || s.businessId,
      serviceCategoryId: s.service_category_id || s.serviceCategoryId,
      categoryName: s.category_name || s.categoryName,
      name: s.name,
      photoUrl: s.photo_url || s.photoUrl,
      thumbnailUrl: s.thumbnail_url || s.thumbnailUrl,
      galleryPhotos: s.gallery_photos || s.galleryPhotos || [],
      basePrice: String(s.base_price || s.basePrice),
      hourlyRate: s.hourly_rate ? String(s.hourly_rate) : void 0,
      durationMinutes: s.duration_minutes || s.durationMinutes || 45,
      requiresApproval: s.requires_approval ?? s.requiresApproval ?? false,
      status: s.status || "active",
      assignedWorkersCount: s.assigned_workers_count || 1
    }).returning();
    res.status(201).json({
      ...inserted,
      base_price: Number(inserted.basePrice),
      hourly_rate: inserted.hourlyRate ? Number(inserted.hourlyRate) : void 0,
      duration_minutes: inserted.durationMinutes,
      requires_approval: inserted.requiresApproval,
      photo_url: inserted.photoUrl,
      thumbnail_url: inserted.thumbnailUrl,
      gallery_photos: inserted.galleryPhotos || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.patch("/:id", async (req, res) => {
  try {
    const s = req.body;
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (s.name) updateData.name = s.name;
    if (s.categoryName || s.category_name) updateData.categoryName = s.categoryName || s.category_name;
    if (s.basePrice || s.base_price) updateData.basePrice = String(s.basePrice || s.base_price);
    if (s.durationMinutes || s.duration_minutes) updateData.durationMinutes = s.durationMinutes || s.duration_minutes;
    if (s.photoUrl || s.photo_url) updateData.photoUrl = s.photoUrl || s.photo_url;
    if (s.thumbnailUrl || s.thumbnail_url) updateData.thumbnailUrl = s.thumbnailUrl || s.thumbnail_url;
    if (s.galleryPhotos || s.gallery_photos) updateData.galleryPhotos = s.galleryPhotos || s.gallery_photos;
    if (s.status) updateData.status = s.status;
    const [updated] = await db.update(businessServices).set(updateData).where(eq4(businessServices.id, req.params.id)).returning();
    res.json({
      ...updated,
      base_price: Number(updated.basePrice),
      duration_minutes: updated.durationMinutes,
      requires_approval: updated.requiresApproval,
      photo_url: updated.photoUrl,
      thumbnail_url: updated.thumbnailUrl,
      gallery_photos: updated.galleryPhotos || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    await db.delete(businessServices).where(eq4(businessServices.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var services_default = router4;

// server/routes/cards.ts
import { Router as Router5 } from "express";
import { eq as eq5 } from "drizzle-orm";
var router5 = Router5();
router5.get("/customer/:customerId", async (req, res) => {
  try {
    const cards = await db.select().from(customerSavedCards).where(eq5(customerSavedCards.customerId, req.params.customerId));
    const mapped = cards.map((c) => ({
      id: c.id,
      customer_id: c.customerId,
      cardholder_name: c.cardholderName,
      brand: c.brand,
      last4: c.last4,
      exp_month: c.expMonth,
      exp_year: c.expYear,
      is_default: c.isDefault,
      billing_address: c.billingAddress,
      created_at: c.createdAt.toISOString()
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router5.post("/", async (req, res) => {
  try {
    const {
      customerId,
      customer_id,
      cardholderName,
      cardholder_name,
      brand,
      last4,
      expMonth,
      exp_month,
      expYear,
      exp_year,
      isDefault,
      is_default,
      billingAddress,
      billing_address
    } = req.body;
    const targetCustomerId = customerId || customer_id || "user-customer";
    const makeDefault = isDefault ?? is_default ?? false;
    if (makeDefault) {
      await db.update(customerSavedCards).set({ isDefault: false }).where(eq5(customerSavedCards.customerId, targetCustomerId));
    }
    const [created] = await db.insert(customerSavedCards).values({
      id: `card-${Date.now()}`,
      customerId: targetCustomerId,
      cardholderName: cardholderName || cardholder_name,
      brand: brand || "visa",
      last4: last4 || "4242",
      expMonth: expMonth || exp_month || "12",
      expYear: expYear || exp_year || "28",
      isDefault: makeDefault,
      billingAddress: billingAddress || billing_address || null,
      gatewayToken: `tok_neon_${Date.now()}`
    }).returning();
    res.status(201).json({
      id: created.id,
      customer_id: created.customerId,
      cardholder_name: created.cardholderName,
      brand: created.brand,
      last4: created.last4,
      exp_month: created.expMonth,
      exp_year: created.expYear,
      is_default: created.isDefault,
      billing_address: created.billingAddress,
      created_at: created.createdAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router5.patch("/:id/default", async (req, res) => {
  try {
    const { customerId } = req.body;
    if (customerId) {
      await db.update(customerSavedCards).set({ isDefault: false }).where(eq5(customerSavedCards.customerId, customerId));
    }
    const [updated] = await db.update(customerSavedCards).set({ isDefault: true }).where(eq5(customerSavedCards.id, req.params.id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    await db.delete(customerSavedCards).where(eq5(customerSavedCards.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var cards_default = router5;

// server/routes/bookings.ts
import { Router as Router6 } from "express";
import { eq as eq6, desc } from "drizzle-orm";
var router6 = Router6();
async function getCompleteBooking(bookingId) {
  const [b] = await db.select().from(bookings).where(eq6(bookings.id, bookingId));
  if (!b) return null;
  const items = await db.select().from(bookingItems).where(eq6(bookingItems.bookingId, bookingId));
  return {
    id: b.id,
    reference_number: b.referenceNumber,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_email: b.customerEmail,
    customer_phone: b.customerPhone || void 0,
    business_id: b.businessId,
    business_name: b.businessName,
    business_logo: b.businessLogo || void 0,
    business_category: b.businessCategory || void 0,
    status: b.status,
    payment_status: b.paymentStatus,
    payment_method: b.paymentMethod,
    payment_method_display: b.paymentMethodDisplay || void 0,
    total_amount: Number(b.totalAmount),
    total_price: Number(b.totalAmount),
    discount_amount: Number(b.discountAmount || 0),
    tax_amount: Number(b.taxAmount || 0),
    net_amount: Number(b.netAmount),
    booking_date: b.scheduledDate,
    scheduled_date: b.scheduledDate,
    scheduled_start_time: b.scheduledStartTime,
    scheduled_end_time: b.scheduledEndTime,
    total_duration_minutes: b.totalDurationMinutes,
    special_instructions: b.specialInstructions || void 0,
    notes: b.notes || void 0,
    refund_status: b.refundStatus || void 0,
    refund_estimated_date: b.refundEstimatedDate || void 0,
    refund_id: b.refundId || void 0,
    items: items.map((it) => ({
      id: String(it.id),
      booking_id: it.bookingId,
      business_service_id: it.businessServiceId,
      service_name: it.serviceName,
      price_charged: Number(it.priceCharged),
      price: Number(it.priceCharged),
      duration_minutes: it.durationMinutes,
      worker_id: it.workerId || void 0,
      worker_name: it.workerName || void 0,
      scheduled_start: it.scheduledStart || void 0,
      scheduled_end: it.scheduledEnd || void 0
    })),
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString()
  };
}
router6.get("/", async (req, res) => {
  try {
    const { customerId, businessId } = req.query;
    let query = db.select().from(bookings).orderBy(desc(bookings.createdAt));
    let allBookings;
    if (customerId) {
      allBookings = await db.select().from(bookings).where(eq6(bookings.customerId, String(customerId))).orderBy(desc(bookings.createdAt));
    } else if (businessId) {
      allBookings = await db.select().from(bookings).where(eq6(bookings.businessId, String(businessId))).orderBy(desc(bookings.createdAt));
    } else {
      allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    }
    const populated = await Promise.all(allBookings.map((b) => getCompleteBooking(b.id)));
    res.json(populated.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.get("/:id", async (req, res) => {
  try {
    const booking = await getCompleteBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.post("/create", async (req, res) => {
  try {
    const {
      customerId,
      businessId,
      items,
      dateStr,
      startTime,
      paymentMethod,
      paymentMethodDisplay,
      notes
    } = req.body;
    const [biz] = await db.select().from(businesses).where(eq6(businesses.id, businessId));
    const randomDigits = Math.floor(1e5 + Math.random() * 9e5);
    const bookingId = `BK-${randomDigits}`;
    const referenceNumber = `#BK-${randomDigits}`;
    const totalDuration = (items || []).reduce((acc, it) => acc + (it.duration_minutes || it.durationMinutes || 45), 0);
    const grossTotal = (items || []).reduce((acc, it) => acc + (it.price_charged || it.price || it.base_price || 0), 0);
    const clientTotal = req.body.totalAmount !== void 0 ? Number(req.body.totalAmount) : void 0;
    const clientTax = req.body.taxAmount !== void 0 ? Number(req.body.taxAmount) : void 0;
    const clientRef = req.body.referenceNumber ? String(req.body.referenceNumber) : void 0;
    const netTotal = clientTotal !== void 0 ? clientTotal : Number(grossTotal.toFixed(2));
    const taxAmount = clientTax !== void 0 ? clientTax : 0;
    const finalRef = clientRef || referenceNumber;
    const isPaidOnline = paymentMethod === "credit_card";
    await db.insert(bookings).values({
      id: bookingId,
      referenceNumber: finalRef,
      customerId: customerId || "user-customer",
      customerName: req.body.customerName || "Alex Taylor",
      customerEmail: req.body.customerEmail || "alex_shopper@uspot.com",
      customerPhone: req.body.customerPhone || "+1 (555) 234-5678",
      businessId,
      businessName: biz?.businessName || "Business Partner",
      businessCategory: biz?.category || "Salon & Spa",
      status: "confirmed",
      paymentStatus: isPaidOnline ? "paid" : "unpaid",
      paymentMethod: paymentMethod || "credit_card",
      paymentMethodDisplay: paymentMethodDisplay || (isPaidOnline ? "Mastercard \u2022\u2022\u2022\u2022 4242" : "Cash on Arrival"),
      totalAmount: String(netTotal),
      discountAmount: "0.00",
      taxAmount: String(taxAmount),
      netAmount: String(netTotal),
      scheduledDate: dateStr,
      scheduledStartTime: startTime,
      scheduledEndTime: "11:30 AM",
      totalDurationMinutes: totalDuration || 60,
      specialInstructions: notes || null,
      notes: notes || null
    });
    for (const it of items || []) {
      await db.insert(bookingItems).values({
        bookingId,
        businessServiceId: it.business_service_id || it.id,
        serviceName: it.service_name || it.name,
        priceCharged: String(it.price_charged || it.base_price || 0),
        durationMinutes: it.duration_minutes || 45,
        workerId: it.worker_id || null,
        workerName: it.worker_name || "Assigned Specialist"
      });
    }
    if (isPaidOnline) {
      const commissionRate = 10;
      const commissionAmount = Number((netTotal * commissionRate / 100).toFixed(2));
      const businessAmount = Number((netTotal - commissionAmount).toFixed(2));
      await db.insert(marketplaceTransactions).values({
        id: `TX-${Date.now()}`,
        bookingId,
        businessId,
        businessName: biz?.businessName || "Business Partner",
        customerName: req.body.customerName || "Alex Taylor",
        customerEmail: req.body.customerEmail || "alex_shopper@uspot.com",
        serviceName: items?.[0]?.name || items?.[0]?.service_name || "Booked Service",
        type: "BOOKING_PAYMENT",
        grossAmount: String(netTotal),
        commissionRate: String(commissionRate),
        platformCommission: String(commissionAmount),
        businessAmount: String(businessAmount),
        paymentStatus: "paid",
        withdrawalStatus: "none",
        paymentGateway: "NMI Gateway"
      });
    }
    const complete = await getCompleteBooking(bookingId);
    res.status(201).json({ success: true, booking: complete, message: "Appointment confirmed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.patch("/:id/status", async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const updateData = { status, updatedAt: /* @__PURE__ */ new Date() };
    if (status === "cancelled") {
      updateData.refundStatus = "initiated";
      updateData.refundEstimatedDate = "3 - 5 business days";
      updateData.refundId = `REF-${Math.floor(1e5 + Math.random() * 9e5)}`;
      if (cancellationReason) {
        updateData.notes = cancellationReason;
      }
    }
    await db.update(bookings).set(updateData).where(eq6(bookings.id, req.params.id));
    const updated = await getCompleteBooking(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.patch("/:id/reschedule", async (req, res) => {
  try {
    const { newDate, newStartTime } = req.body;
    await db.update(bookings).set({
      scheduledDate: newDate,
      scheduledStartTime: newStartTime,
      status: "confirmed",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(bookings.id, req.params.id));
    const updated = await getCompleteBooking(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var bookings_default = router6;

// server/routes/reviews.ts
import { Router as Router7 } from "express";
import { eq as eq7, desc as desc2 } from "drizzle-orm";
var router7 = Router7();
router7.get("/business/:businessId", async (req, res) => {
  try {
    const reviews = await db.select().from(businessReviews).where(eq7(businessReviews.businessId, req.params.businessId)).orderBy(desc2(businessReviews.createdAt));
    const populated = await Promise.all(
      reviews.map(async (r) => {
        const [resp] = await db.select().from(reviewResponses).where(eq7(reviewResponses.reviewId, r.id));
        return {
          id: r.id,
          business_id: r.businessId,
          business_name: r.businessName,
          booking_id: r.bookingId || void 0,
          service_id: r.serviceId || void 0,
          service_name: r.serviceName || void 0,
          customer_id: r.customerId || void 0,
          customer_name: r.customerName,
          customer_avatar: r.customerAvatar || void 0,
          rating: r.rating,
          review_text: r.reviewText,
          media: r.media || [],
          created_at: r.createdAt.toISOString(),
          time_ago: r.timeAgo || "Recently",
          response_deadline: r.responseDeadline || void 0,
          response: resp ? {
            text: resp.responseText,
            responded_at: resp.respondedAt.toISOString(),
            responded_time_ago: resp.respondedTimeAgo || "Responded recently",
            author_name: resp.authorName
          } : void 0
        };
      })
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router7.post("/", async (req, res) => {
  try {
    const {
      businessId,
      bookingId,
      serviceId,
      serviceName,
      customerId,
      customerName,
      rating,
      reviewText,
      media
    } = req.body;
    const [biz] = await db.select().from(businesses).where(eq7(businesses.id, businessId));
    const reviewId = `rev-${Date.now()}`;
    const [created] = await db.insert(businessReviews).values({
      id: reviewId,
      businessId,
      businessName: biz?.businessName || "Business",
      bookingId,
      serviceId,
      serviceName,
      customerId: customerId || "user-customer",
      customerName: customerName || "Alex Taylor",
      customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      rating: Number(rating),
      reviewText,
      media: media || [],
      timeAgo: "Just now",
      responseDeadline: 'Response needed within 24 hours to maintain "Fast Responder" badge.'
    }).returning();
    res.status(201).json({
      id: created.id,
      business_id: created.businessId,
      business_name: created.businessName,
      booking_id: created.bookingId || void 0,
      service_id: created.serviceId || void 0,
      service_name: created.serviceName || void 0,
      customer_id: created.customerId || void 0,
      customer_name: created.customerName,
      customer_avatar: created.customerAvatar || void 0,
      rating: created.rating,
      review_text: created.reviewText,
      media: created.media || [],
      created_at: created.createdAt.toISOString(),
      time_ago: created.timeAgo || "Just now"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router7.post("/:id/reply", async (req, res) => {
  try {
    const { replyText, authorName } = req.body;
    const reviewId = req.params.id;
    const [existing] = await db.select().from(reviewResponses).where(eq7(reviewResponses.reviewId, reviewId));
    let saved;
    if (existing) {
      [saved] = await db.update(reviewResponses).set({
        responseText: replyText,
        authorName: authorName || "Management",
        respondedAt: /* @__PURE__ */ new Date(),
        respondedTimeAgo: "Just now"
      }).where(eq7(reviewResponses.reviewId, reviewId)).returning();
    } else {
      [saved] = await db.insert(reviewResponses).values({
        reviewId,
        authorName: authorName || "Management",
        responseText: replyText,
        respondedTimeAgo: "Just now"
      }).returning();
    }
    res.json({
      success: true,
      response: {
        text: saved.responseText,
        responded_at: saved.respondedAt.toISOString(),
        responded_time_ago: saved.respondedTimeAgo || "Just now",
        author_name: saved.authorName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var reviews_default = router7;

// server/routes/ledger.ts
import { Router as Router8 } from "express";
import { eq as eq8, desc as desc3 } from "drizzle-orm";
var router8 = Router8();
router8.get("/transactions", async (req, res) => {
  try {
    const { businessId } = req.query;
    let query;
    if (businessId) {
      query = db.select().from(marketplaceTransactions).where(eq8(marketplaceTransactions.businessId, String(businessId))).orderBy(desc3(marketplaceTransactions.createdAt));
    } else {
      query = db.select().from(marketplaceTransactions).orderBy(desc3(marketplaceTransactions.createdAt));
    }
    const txs = await query;
    res.json(
      txs.map((t) => ({
        id: t.id,
        bookingId: t.bookingId,
        businessId: t.businessId,
        businessName: t.businessName,
        customerName: t.customerName || "",
        customerEmail: t.customerEmail || void 0,
        serviceName: t.serviceName || "",
        type: t.type,
        grossAmount: Number(t.grossAmount),
        commissionRate: Number(t.commissionRate),
        platformCommission: Number(t.platformCommission),
        w9WithholdingRate: Number(t.w9WithholdingRate || 0),
        w9WithholdingAmount: Number(t.w9WithholdingAmount || 0),
        businessAmount: Number(t.businessAmount),
        currency: t.currency || "USD",
        paymentStatus: t.paymentStatus || "paid",
        withdrawalStatus: t.withdrawalStatus || "none",
        paymentGateway: t.paymentGateway || "NMI Gateway",
        notes: t.notes || void 0,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router8.get("/balance/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const txs = await db.select().from(marketplaceTransactions).where(eq8(marketplaceTransactions.businessId, businessId));
    const withdrawals = await db.select().from(withdrawalRequests).where(eq8(withdrawalRequests.businessId, businessId));
    let grossEarned = 0;
    let totalEarned = 0;
    let totalWithheldTax = 0;
    txs.forEach((t) => {
      if (t.type === "BOOKING_PAYMENT") {
        grossEarned += Number(t.grossAmount);
        totalEarned += Number(t.businessAmount);
        totalWithheldTax += Number(t.w9WithholdingAmount || 0);
      }
    });
    let totalWithdrawn = 0;
    let pendingWithdrawal = 0;
    withdrawals.forEach((w) => {
      if (w.status === "Completed") {
        totalWithdrawn += Number(w.amount);
      } else if (w.status === "Pending" || w.status === "Processing") {
        pendingWithdrawal += Number(w.amount);
      }
    });
    const availableBalance = Math.max(0, Number((totalEarned - totalWithdrawn - pendingWithdrawal).toFixed(2)));
    res.json({
      availableBalance,
      pendingWithdrawal,
      totalEarned,
      totalWithdrawn,
      totalWithheldTax,
      grossEarned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router8.post("/withdraw", async (req, res) => {
  try {
    const { businessId, amount, requestedByUserId, requestedByUserName, maskedBankAccount, bankAccountHolder } = req.body;
    const [biz] = await db.select().from(businesses).where(eq8(businesses.id, businessId));
    const requestId = `WTH-${Date.now()}`;
    const [created] = await db.insert(withdrawalRequests).values({
      id: requestId,
      type: "business",
      businessId,
      businessName: biz?.businessName || "Business Partner",
      requestedByUserId: requestedByUserId || "user-biz",
      requestedByUserName: requestedByUserName || "Business Owner",
      amount: String(amount),
      maskedBankAccount: maskedBankAccount || "\u2022\u2022\u2022\u2022 4242",
      bankAccountHolder: bankAccountHolder || "Authorized Signer",
      status: "Pending",
      requestDate: (/* @__PURE__ */ new Date()).toISOString()
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var ledger_default = router8;

// server/app.ts
dotenv2.config();
var app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", database: "Neon PostgreSQL", time: (/* @__PURE__ */ new Date()).toISOString() });
});
var routeMounts = [
  { prefix: "/users", router: users_default },
  { prefix: "/businesses", router: businesses_default },
  { prefix: "/compliance", router: compliance_default },
  { prefix: "/services", router: services_default },
  { prefix: "/customer/cards", router: cards_default },
  { prefix: "/bookings", router: bookings_default },
  { prefix: "/reviews", router: reviews_default },
  { prefix: "/ledger", router: ledger_default }
];
for (const { prefix, router: router9 } of routeMounts) {
  app.use(`/api${prefix}`, router9);
  app.use(prefix, router9);
}
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});
var app_default = app;
export {
  app_default as default
};
