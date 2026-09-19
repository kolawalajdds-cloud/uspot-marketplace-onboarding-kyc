import { db, pool } from './db';
import {
  users,
  businesses,
  businessHours,
  businessAmenities,
  businessGallery,
  holidayClosures,
  kycVerifications,
  w9Records,
  nmiPaymentAccounts,
  serviceCategories,
  businessServices,
  customerSavedCards,
  bookings,
  bookingItems,
  businessReviews,
  reviewResponses,
} from './db/schema';
import { SEEDED_USERS } from '../src/data/seedUsers';
import {
  getSeedBusinesses,
  getSeedServiceCategories,
  getSeedBusinessServices,
  getSeedCustomerSavedCards,
  getSeedBookings,
  getSeedBusinessReviews,
} from '../src/data/seedData';
import { eq } from 'drizzle-orm';

export async function seedNeonDatabase() {
  console.log('🌱 Starting Neon PostgreSQL database seeding...');

  try {
    // 1. Seed Users
    console.log('Inserting users...');
    for (const u of SEEDED_USERS) {
      await db
        .insert(users)
        .values({
          id: u.id,
          role: u.role,
          roleLabel: u.roleLabel,
          status: u.status,
          email: u.email,
          username: u.username,
          phone: u.phone,
          nickname: u.nickname,
          fullName: u.fullName,
          referralCode: u.referralCode,
          emailVerified: u.emailVerified,
          phoneVerified: u.phoneVerified,
          timezone: u.timezone,
          avatarInitials: u.avatarInitials,
          department: u.department,
          primaryServiceCategory: u.primaryServiceCategory,
          yearsOfExperience: u.yearsOfExperience ? String(u.yearsOfExperience) : null,
          memberSince: u.memberSince,
        })
        .onConflictDoNothing();
    }

    // 2. Seed Businesses
    console.log('Inserting businesses...');
    const seedBizList = getSeedBusinesses();
    for (const b of seedBizList) {
      await db
        .insert(businesses)
        .values({
          id: b.id,
          userId: b.userId || 'user-business',
          businessName: b.coreDetails.businessName,
          legalEntityName: b.coreDetails.legalEntityName,
          category: b.coreDetails.category,
          description: b.coreDetails.description,
          streetAddress: b.coreDetails.streetAddress,
          city: b.coreDetails.city,
          state: b.coreDetails.state,
          zipCode: b.coreDetails.zipCode,
          phone: b.phone,
          email: b.email,
          website: b.website,
          status: b.status,
          subscriptionPlan: b.subscription || 'Starter',
          salesTaxRate: String(b.feesTax?.salesTaxRate || 8.87),
          currency: b.feesTax?.currency || 'USD',
          automaticInvoicing: b.feesTax?.automaticInvoicing ?? true,
          avatarChar: b.avatarChar,
        })
        .onConflictDoNothing();

      // Hours
      if (b.operatingHours) {
        const dayMap: Record<string, number> = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        for (const h of b.operatingHours) {
          await db
            .insert(businessHours)
            .values({
              businessId: b.id,
              dayOfWeek: dayMap[h.day] ?? 1,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: !h.isOpen,
            })
            .onConflictDoNothing();
        }
      }

      // Amenities
      if (b.amenities) {
        for (const cat of b.amenities) {
          for (const item of cat.items) {
            await db
              .insert(businessAmenities)
              .values({
                businessId: b.id,
                category: cat.category,
                name: item.name,
                description: item.description,
                checked: item.checked,
              })
              .onConflictDoNothing();
          }
        }
      }

      // Gallery
      if (b.imageGallery) {
        for (const [idx, img] of b.imageGallery.entries()) {
          if (img.url) {
            await db
              .insert(businessGallery)
              .values({
                businessId: b.id,
                url: img.url,
                label: img.label,
                isCover: img.isCover,
                sortOrder: idx,
              })
              .onConflictDoNothing();
          }
        }
      }

      // Holidays
      if (b.holidaysRules?.holidayClosures) {
        for (const hol of b.holidaysRules.holidayClosures) {
          await db
            .insert(holidayClosures)
            .values({
              businessId: b.id,
              name: hol.name,
              date: hol.date,
              fullDayClosure: hol.fullDayClosure,
              enabled: hol.enabled,
            })
            .onConflictDoNothing();
        }
      }

      // KYC
      if (b.verification) {
        await db
          .insert(kycVerifications)
          .values({
            businessId: b.id,
            legalEntityType: b.verification.legalEntityType,
            status: b.verification.status || 'Approved',
            riskTier: b.verification.riskTier || 'Low',
            einMasked: b.verification.einVerification?.einEntered,
            tinMatchStatus: b.verification.einVerification?.tinMatchStatus || 'Matched',
            beneficialOwnerName: b.verification.beneficialOwner?.fullName,
            beneficialOwnerDob: b.verification.beneficialOwner?.dateOfBirth,
            beneficialOwnerSsnLast4: b.verification.beneficialOwner?.ssnLast4,
            bankAccountHolder: b.verification.bankAccount?.accountHolderName,
            bankRoutingNumber: b.verification.bankAccount?.routingNumber,
            bankAccountNumberMasked: b.verification.bankAccount?.accountNumberMasked,
            bankVerified: b.verification.bankAccount?.verified || true,
            sanctionsStatus: b.verification.sanctionsScreening?.status || 'Clear',
            submittedAt: b.verification.submittedAt ? new Date(b.verification.submittedAt) : new Date(),
            reviewedAt: b.verification.reviewedAt ? new Date(b.verification.reviewedAt) : new Date(),
            reviewedBy: b.verification.reviewedBy || 'Super Admin',
            rejectionCount: b.verification.rejectionCount || 0,
            rejectionHistory: b.verification.rejectionHistory || [],
          })
          .onConflictDoNothing();
      }

      // W9
      if (b.w9) {
        await db
          .insert(w9Records)
          .values({
            businessId: b.id,
            legalName: b.w9.legalName,
            businessNameOrDisregarded: b.w9.businessNameOrDisregarded,
            federalTaxClassification: b.w9.federalTaxClassification,
            llcTaxClassification: b.w9.llcTaxClassification,
            streetAddress: b.w9.streetAddress,
            city: b.w9.city,
            state: b.w9.state,
            zipCode: b.w9.zipCode,
            tinType: b.w9.tinType,
            tinMasked: b.w9.tinMasked,
            tinVerified: b.w9.tinVerified,
            certCorrectTin: b.w9.certifications?.correctTin ?? true,
            certNoBackupWithholding: b.w9.certifications?.noBackupWithholding ?? true,
            certUsPerson: b.w9.certifications?.usPerson ?? true,
            certFatcaCorrect: b.w9.certifications?.fatcaCorrect ?? false,
            signatureName: b.w9.signatureName,
            agreedPerjury: b.w9.agreedPerjury ?? true,
            status: b.w9.status || 'submitted',
            signedAt: b.w9.signedAt ? new Date(b.w9.signedAt) : new Date(),
            signerIp: b.w9.signerIp || '127.0.0.1',
          })
          .onConflictDoNothing();
      }

      // NMI
      if (b.nmiPaymentAccount) {
        await db
          .insert(nmiPaymentAccounts)
          .values({
            businessId: b.id,
            nmiGatewayId: b.nmiPaymentAccount.nmiGatewayId || `nmi-${b.id}`,
            onboardingStatus: b.nmiPaymentAccount.nmiOnboardingStatus || 'ACTIVE',
            companyName: b.nmiPaymentAccount.companyName,
            federalTaxId: b.nmiPaymentAccount.federalTaxId,
            firstName: b.nmiPaymentAccount.firstName,
            lastName: b.nmiPaymentAccount.lastName,
            email: b.nmiPaymentAccount.email,
            bankRoutingNumber: b.nmiPaymentAccount.bankRoutingNumber,
            bankAccountNumber: b.nmiPaymentAccount.bankAccountNumber,
            accountType: b.nmiPaymentAccount.accountType || 'checking',
            accountHolderType: b.nmiPaymentAccount.accountHolderType || 'business',
            activatedAt: new Date(),
          })
          .onConflictDoNothing();
      }
    }

    // 3. Seed Service Categories & Services
    console.log('Inserting service categories and services...');
    const categories = getSeedServiceCategories();
    for (const cat of categories) {
      await db
        .insert(serviceCategories)
        .values({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          photoUrl: cat.photo_url,
          status: cat.status,
        })
        .onConflictDoNothing();
    }

    const servicesList = getSeedBusinessServices();
    for (const s of servicesList) {
      if (s.service_category_id) {
        await db
          .insert(serviceCategories)
          .values({
            id: s.service_category_id,
            name: s.category_name || 'General Services',
            status: 'active',
          })
          .onConflictDoNothing();
      }

      await db
        .insert(businessServices)
        .values({
          id: s.id,
          businessId: s.business_id,
          serviceCategoryId: s.service_category_id,
          categoryName: s.category_name,
          name: s.name,
          photoUrl: s.photo_url,
          thumbnailUrl: s.thumbnail_url,
          galleryPhotos: s.gallery_photos || [],
          basePrice: String(s.base_price),
          hourlyRate: s.hourly_rate ? String(s.hourly_rate) : null,
          durationMinutes: s.duration_minutes || 45,
          requiresApproval: s.requires_approval ?? false,
          status: s.status,
          assignedWorkersCount: s.assigned_workers_count || 1,
        })
        .onConflictDoNothing();
    }

    // 4. Seed Customer Saved Cards
    console.log('Inserting customer saved cards...');
    const cards = getSeedCustomerSavedCards();
    for (const c of cards) {
      await db
        .insert(customerSavedCards)
        .values({
          id: c.id,
          customerId: c.customer_id,
          cardholderName: c.cardholder_name,
          brand: c.brand,
          last4: c.last4,
          expMonth: c.exp_month,
          expYear: c.exp_year,
          isDefault: c.is_default,
          billingAddress: c.billing_address,
          gatewayToken: `tok_neon_seed_${c.id}`,
        })
        .onConflictDoNothing();
    }

    // 5. Seed Bookings & Items
    console.log('Inserting bookings and items...');
    const bookingsList = getSeedBookings();
    for (const b of bookingsList) {
      await db
        .insert(bookings)
        .values({
          id: b.id,
          referenceNumber: b.reference_number || `#${b.id}`,
          customerId: b.customer_id,
          customerName: b.customer_name,
          customerEmail: b.customer_email,
          customerPhone: b.customer_phone,
          businessId: b.business_id,
          businessName: b.business_name,
          businessLogo: b.business_logo,
          businessCategory: b.business_category,
          status: b.status,
          paymentStatus: b.payment_status,
          paymentMethod: b.payment_method,
          paymentMethodDisplay: b.payment_method_display,
          totalAmount: String(b.total_amount),
          discountAmount: String(b.discount_amount || 0),
          taxAmount: String(b.tax_amount || 0),
          netAmount: String(b.net_amount || b.total_amount),
          scheduledDate: b.scheduled_date || b.booking_date,
          scheduledStartTime: b.scheduled_start_time,
          scheduledEndTime: b.scheduled_end_time,
          totalDurationMinutes: b.total_duration_minutes,
          specialInstructions: b.special_instructions,
          notes: b.notes,
          refundStatus: b.refund_status,
          refundEstimatedDate: b.refund_estimated_date,
          refundId: b.refund_id,
        })
        .onConflictDoNothing();

      if (b.items) {
        for (const item of b.items) {
          await db
            .insert(bookingItems)
            .values({
              bookingId: b.id,
              businessServiceId: item.business_service_id,
              serviceName: item.service_name,
              priceCharged: String(item.price_charged),
              durationMinutes: item.duration_minutes,
              workerId: item.worker_id,
              workerName: item.worker_name,
              scheduledStart: item.scheduled_start,
              scheduledEnd: item.scheduled_end,
            })
            .onConflictDoNothing();
        }
      }
    }

    // 6. Seed Reviews & Replies
    console.log('Inserting reviews and replies...');
    const reviews = getSeedBusinessReviews();
    for (const r of reviews) {
      await db
        .insert(businessReviews)
        .values({
          id: r.id,
          businessId: r.business_id,
          businessName: r.business_name,
          bookingId: r.booking_id,
          serviceId: r.service_id,
          serviceName: r.service_name,
          customerId: r.customer_id,
          customerName: r.customer_name,
          customerAvatar: r.customer_avatar,
          rating: r.rating,
          reviewText: r.review_text,
          media: r.media || [],
          timeAgo: r.time_ago,
          responseDeadline: r.response_deadline,
        })
        .onConflictDoNothing();

      if (r.response) {
        await db
          .insert(reviewResponses)
          .values({
            reviewId: r.id,
            authorName: r.response.author_name || 'Management',
            responseText: r.response.text,
            respondedTimeAgo: r.response.responded_time_ago,
            respondedAt: r.response.responded_at ? new Date(r.response.responded_at) : new Date(),
          })
          .onConflictDoNothing();
      }
    }

    console.log('✅ Neon PostgreSQL Database Seeding Complete!');
  } catch (error) {
    console.error('❌ Error during Neon database seeding:', error);
    throw error;
  }
}

// Run seeder when executed directly via tsx
seedNeonDatabase()
  .then(() => {
    console.log('Seeding finished successfully.');
    pool.end();
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    pool.end();
    process.exit(1);
  });

