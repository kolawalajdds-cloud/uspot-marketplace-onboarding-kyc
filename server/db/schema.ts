import {
  pgTable,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  serial,
  time,
  date,
} from 'drizzle-orm/pg-core';

// ============================================================================
// 1. USERS & PROFILES
// ============================================================================
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  role: varchar('role', { length: 32 }).notNull(), // 'super_admin' | 'business' | 'customer' | 'specialist'
  roleLabel: varchar('role_label', { length: 64 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).unique(),
  phone: varchar('phone', { length: 50 }),
  nickname: varchar('nickname', { length: 100 }),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  referralCode: varchar('referral_code', { length: 50 }),
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  timezone: varchar('timezone', { length: 50 }).default('America/New_York'),
  avatarInitials: varchar('avatar_initials', { length: 10 }),
  department: varchar('department', { length: 100 }),
  primaryServiceCategory: varchar('primary_service_category', { length: 100 }),
  yearsOfExperience: varchar('years_of_experience', { length: 20 }),
  memberSince: varchar('member_since', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 2. BUSINESSES & OPERATIONAL SETTINGS
// ============================================================================
export const businesses = pgTable('businesses', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  legalEntityName: varchar('legal_entity_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  streetAddress: text('street_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  website: text('website'),
  status: varchar('status', { length: 50 }).default('Draft').notNull(),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('Starter'),
  salesTaxRate: numeric('sales_tax_rate', { precision: 5, scale: 2 }).default('8.87'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  automaticInvoicing: boolean('automatic_invoicing').default(true),
  avatarChar: varchar('avatar_char', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const businessHours = pgTable('business_hours', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday ... 6 = Saturday
  openTime: varchar('open_time', { length: 20 }).notNull(),
  closeTime: varchar('close_time', { length: 20 }).notNull(),
  isClosed: boolean('is_closed').default(false).notNull(),
});

export const businessAmenities = pgTable('business_amenities', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  checked: boolean('checked').default(true).notNull(),
});

export const businessGallery = pgTable('business_gallery', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  label: varchar('label', { length: 100 }),
  isCover: boolean('is_cover').default(false),
  sortOrder: integer('sort_order').default(0),
});

export const holidayClosures = pgTable('holiday_closures', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  date: varchar('date', { length: 30 }).notNull(),
  fullDayClosure: boolean('full_day_closure').default(true),
  enabled: boolean('enabled').default(true),
});

// ============================================================================
// 3. COMPLIANCE & KYC
// ============================================================================
export const kycVerifications = pgTable('kyc_verifications', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull().unique(),
  legalEntityType: varchar('legal_entity_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('Draft').notNull(),
  riskTier: varchar('risk_tier', { length: 20 }).default('Low').notNull(),
  einRaw: varchar('ein_raw', { length: 20 }),
  einMasked: varchar('ein_masked', { length: 20 }),
  tinMatchStatus: varchar('tin_match_status', { length: 50 }).default('Not Started'),
  beneficialOwnerName: varchar('beneficial_owner_name', { length: 150 }),
  beneficialOwnerDob: varchar('beneficial_owner_dob', { length: 30 }),
  beneficialOwnerSsnLast4: varchar('beneficial_owner_ssn_last4', { length: 4 }),
  bankAccountHolder: varchar('bank_account_holder', { length: 150 }),
  bankRoutingNumber: varchar('bank_routing_number', { length: 50 }),
  bankAccountNumberMasked: varchar('bank_account_number_masked', { length: 50 }),
  bankVerified: boolean('bank_verified').default(false),
  sanctionsStatus: varchar('sanctions_status', { length: 50 }).default('Not Started'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: varchar('reviewed_by', { length: 150 }),
  rejectionReason: text('rejection_reason'),
  rejectionCount: integer('rejection_count').default(0),
  rejectionHistory: jsonb('rejection_history').default([]),
  signature: text('signature'),
  signatureDate: varchar('signature_date', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const w9Records = pgTable('w9_records', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull().unique(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  businessNameOrDisregarded: varchar('business_name_or_disregarded', { length: 255 }),
  federalTaxClassification: varchar('federal_tax_classification', { length: 100 }).notNull(),
  llcTaxClassification: varchar('llc_tax_classification', { length: 50 }),
  streetAddress: text('street_address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  tinType: varchar('tin_type', { length: 10 }).notNull(), // 'EIN' | 'SSN'
  tinMasked: varchar('tin_masked', { length: 20 }).notNull(),
  tinVerified: boolean('tin_verified').default(false),
  certCorrectTin: boolean('cert_correct_tin').default(true),
  certNoBackupWithholding: boolean('cert_no_backup_withholding').default(true),
  certUsPerson: boolean('cert_us_person').default(true),
  certFatcaCorrect: boolean('cert_fatca_correct').default(false),
  signatureName: varchar('signature_name', { length: 150 }).notNull(),
  agreedPerjury: boolean('agreed_perjury').default(true),
  status: varchar('status', { length: 20 }).default('submitted').notNull(),
  signedAt: timestamp('signed_at', { withTimezone: true }).defaultNow(),
  signerIp: varchar('signer_ip', { length: 50 }),
  pdfGeneratedUrl: text('pdf_generated_url'),
});

export const nmiPaymentAccounts = pgTable('nmi_payment_accounts', {
  id: serial('id').primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull().unique(),
  nmiGatewayId: varchar('nmi_gateway_id', { length: 100 }),
  onboardingStatus: varchar('onboarding_status', { length: 30 }).default('NOT_STARTED').notNull(),
  companyName: varchar('company_name', { length: 255 }),
  federalTaxId: varchar('federal_tax_id', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  bankRoutingNumber: varchar('bank_routing_number', { length: 50 }),
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  accountType: varchar('account_type', { length: 20 }).default('checking'),
  accountHolderType: varchar('account_holder_type', { length: 20 }).default('business'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
});

// ============================================================================
// 4. SERVICE CATALOG & BUSINESS SERVICES
// ============================================================================
export const serviceCategories = pgTable('service_categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  photoUrl: text('photo_url'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
});

export const businessServices = pgTable('business_services', {
  id: varchar('id', { length: 64 }).primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  serviceCategoryId: varchar('service_category_id', { length: 64 }),
  categoryName: varchar('category_name', { length: 100 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  photoUrl: text('photo_url'),
  thumbnailUrl: text('thumbnail_url'),
  galleryPhotos: jsonb('gallery_photos').default([]),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  pricingType: varchar('pricing_type', { length: 20 }).default('fixed'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  durationMinutes: integer('duration_minutes').default(45).notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  assignedWorkersCount: integer('assigned_workers_count').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 5. CUSTOMER SAVED CARDS (PAYMENT VAULT)
// ============================================================================
export const customerSavedCards = pgTable('customer_saved_cards', {
  id: varchar('id', { length: 64 }).primaryKey(),
  customerId: varchar('customer_id', { length: 64 }).notNull(),
  cardholderName: varchar('cardholder_name', { length: 150 }).notNull(),
  brand: varchar('brand', { length: 20 }).notNull(), // 'mastercard' | 'visa' | 'amex' | 'discover'
  last4: varchar('last4', { length: 4 }).notNull(),
  expMonth: varchar('exp_month', { length: 2 }).notNull(),
  expYear: varchar('exp_year', { length: 4 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  billingAddress: jsonb('billing_address'),
  gatewayToken: varchar('gateway_token', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 6. BOOKINGS & LINE ITEMS
// ============================================================================
export const bookings = pgTable('bookings', {
  id: varchar('id', { length: 64 }).primaryKey(),
  referenceNumber: varchar('reference_number', { length: 50 }).unique().notNull(),
  customerId: varchar('customer_id', { length: 64 }).notNull(),
  customerName: varchar('customer_name', { length: 150 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id).notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessLogo: text('business_logo'),
  businessCategory: varchar('business_category', { length: 100 }),
  status: varchar('status', { length: 30 }).default('confirmed').notNull(), // 'pending' | 'confirmed' | 'visited' | 'cancelled' | 'noshow'
  paymentStatus: varchar('payment_status', { length: 30 }).default('paid').notNull(), // 'unpaid' | 'paid' | 'refunded' | 'failed'
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(), // 'credit_card' | 'cash'
  paymentMethodDisplay: varchar('payment_method_display', { length: 100 }),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
  scheduledDate: varchar('scheduled_date', { length: 30 }).notNull(),
  scheduledStartTime: varchar('scheduled_start_time', { length: 20 }).notNull(),
  scheduledEndTime: varchar('scheduled_end_time', { length: 20 }).notNull(),
  totalDurationMinutes: integer('total_duration_minutes').notNull(),
  specialInstructions: text('special_instructions'),
  notes: text('notes'),
  refundStatus: varchar('refund_status', { length: 30 }),
  refundEstimatedDate: varchar('refund_estimated_date', { length: 50 }),
  refundId: varchar('refund_id', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bookingItems = pgTable('booking_items', {
  id: serial('id').primaryKey(),
  bookingId: varchar('booking_id', { length: 64 }).references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  businessServiceId: varchar('business_service_id', { length: 64 }).notNull(),
  serviceName: varchar('service_name', { length: 150 }).notNull(),
  priceCharged: numeric('price_charged', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  workerId: varchar('worker_id', { length: 64 }),
  workerName: varchar('worker_name', { length: 150 }),
  scheduledStart: varchar('scheduled_start', { length: 50 }),
  scheduledEnd: varchar('scheduled_end', { length: 50 }),
});

// ============================================================================
// 7. BUSINESS REVIEWS & RESPONSES
// ============================================================================
export const businessReviews = pgTable('business_reviews', {
  id: varchar('id', { length: 64 }).primaryKey(),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  bookingId: varchar('booking_id', { length: 64 }),
  serviceId: varchar('service_id', { length: 64 }),
  serviceName: varchar('service_name', { length: 150 }),
  customerId: varchar('customer_id', { length: 64 }),
  customerName: varchar('customer_name', { length: 150 }).notNull(),
  customerAvatar: text('customer_avatar'),
  rating: integer('rating').notNull(),
  reviewText: text('review_text').notNull(),
  media: jsonb('media').default([]),
  timeAgo: varchar('time_ago', { length: 50 }),
  responseDeadline: text('response_deadline'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reviewResponses = pgTable('review_responses', {
  id: serial('id').primaryKey(),
  reviewId: varchar('review_id', { length: 64 }).references(() => businessReviews.id, { onDelete: 'cascade' }).notNull().unique(),
  authorName: varchar('author_name', { length: 150 }).notNull(),
  responseText: text('response_text').notNull(),
  respondedTimeAgo: varchar('responded_time_ago', { length: 50 }),
  respondedAt: timestamp('responded_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 8. FINANCIAL LEDGER & WITHDRAWALS
// ============================================================================
export const marketplaceTransactions = pgTable('marketplace_transactions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  bookingId: varchar('booking_id', { length: 64 }),
  businessId: varchar('business_id', { length: 64 }).references(() => businesses.id).notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 150 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  serviceName: varchar('service_name', { length: 150 }),
  type: varchar('type', { length: 50 }).notNull(),
  grossAmount: numeric('gross_amount', { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull(),
  platformCommission: numeric('platform_commission', { precision: 10, scale: 2 }).notNull(),
  w9WithholdingRate: numeric('w9_withholding_rate', { precision: 5, scale: 2 }).default('0'),
  w9WithholdingAmount: numeric('w9_withholding_amount', { precision: 10, scale: 2 }).default('0'),
  businessAmount: numeric('business_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  paymentStatus: varchar('payment_status', { length: 30 }).default('paid'),
  withdrawalStatus: varchar('withdrawal_status', { length: 30 }).default('none'),
  paymentGateway: varchar('payment_gateway', { length: 50 }).default('NMI Gateway'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: varchar('id', { length: 64 }).primaryKey(),
  type: varchar('type', { length: 30 }).default('business').notNull(),
  businessId: varchar('business_id', { length: 64 }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  requestedByUserId: varchar('requested_by_user_id', { length: 64 }).notNull(),
  requestedByUserName: varchar('requested_by_user_name', { length: 150 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  maskedBankAccount: varchar('masked_bank_account', { length: 50 }).notNull(),
  bankAccountHolder: varchar('bank_account_holder', { length: 150 }).notNull(),
  status: varchar('status', { length: 30 }).default('Pending').notNull(),
  requestDate: varchar('request_date', { length: 50 }).notNull(),
  processedDate: varchar('processed_date', { length: 50 }),
  rejectionReason: text('rejection_reason'),
});

// ============================================================================
// 9. GLOBAL & BUSINESS NOTIFICATIONS
// ============================================================================
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  businessId: varchar('business_id', { length: 64 }),
  message: text('message').notNull(),
  type: varchar('type', { length: 20 }).default('info').notNull(),
  read: boolean('read').default(false).notNull(),
  actionRequired: varchar('action_required', { length: 50 }),
  timestamp: varchar('timestamp', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
