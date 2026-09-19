import { Router } from 'express';
import { db } from '../db';
import {
  businesses,
  businessHours,
  businessAmenities,
  businessGallery,
  holidayClosures,
  kycVerifications,
  w9Records,
  nmiPaymentAccounts,
} from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Helper to fetch complete business object matching frontend Business interface
async function getCompleteBusiness(businessId: string) {
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!biz) return null;

  const hours = await db.select().from(businessHours).where(eq(businessHours.businessId, businessId));
  const amenities = await db.select().from(businessAmenities).where(eq(businessAmenities.businessId, businessId));
  const gallery = await db.select().from(businessGallery).where(eq(businessGallery.businessId, businessId));
  const holidays = await db.select().from(holidayClosures).where(eq(holidayClosures.businessId, businessId));
  const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.businessId, businessId));
  const [w9] = await db.select().from(w9Records).where(eq(w9Records.businessId, businessId));
  const [nmi] = await db.select().from(nmiPaymentAccounts).where(eq(nmiPaymentAccounts.businessId, businessId));

  // Map into the format expected by the frontend
  return {
    id: biz.id,
    userId: biz.userId,
    status: biz.status,
    coreDetails: {
      businessName: biz.businessName,
      legalEntityName: biz.legalEntityName,
      category: biz.category,
      description: biz.description || '',
      streetAddress: biz.streetAddress,
      city: biz.city,
      state: biz.state,
      zipCode: biz.zipCode,
    },
    operatingHours: hours.map((h) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][h.dayOfWeek] || 'Monday',
      isOpen: !h.isClosed,
      openTime: h.openTime,
      closeTime: h.closeTime,
    })),
    imageGallery: gallery.map((g) => ({
      id: String(g.id),
      label: g.label || 'Gallery Photo',
      color: 'from-slate-700 to-slate-900',
      isCover: !!g.isCover,
      url: g.url,
    })),
    amenities: [
      {
        category: 'General & Comfort',
        items: amenities
          .filter((a) => a.category === 'General & Comfort')
          .map((a) => ({ id: String(a.id), name: a.name, description: a.description || '', checked: a.checked })),
      },
      {
        category: 'Tech & Workspace',
        items: amenities
          .filter((a) => a.category === 'Tech & Workspace')
          .map((a) => ({ id: String(a.id), name: a.name, description: a.description || '', checked: a.checked })),
      },
      {
        category: 'Accessibility',
        items: amenities
          .filter((a) => a.category === 'Accessibility')
          .map((a) => ({ id: String(a.id), name: a.name, description: a.description || '', checked: a.checked })),
      },
    ],
    holidaysRules: {
      holidayClosures: holidays.map((h) => ({
        id: String(h.id),
        name: h.name,
        date: h.date,
        fullDayClosure: h.fullDayClosure,
        enabled: h.enabled,
      })),
      businessRules: {
        maxCapacity: 25,
        petFriendly: true,
        ageRequirement: '18+',
        byobAllowed: false,
      },
    },
    feesTax: {
      businessTaxId: kyc?.einMasked || 'XX-XXXXXXX',
      salesTaxRate: Number(biz.salesTaxRate || 8.87),
      taxExempt: false,
      currency: biz.currency || 'USD',
      automaticInvoicing: biz.automaticInvoicing ?? true,
      serviceFees: [],
    },
    verification: kyc
      ? {
          status: kyc.status,
          legalEntityType: kyc.legalEntityType,
          riskTier: kyc.riskTier,
          einVerification: {
            einEntered: kyc.einMasked || '',
            tinMasked: kyc.einMasked || '',
            tinMatchStatus: kyc.tinMatchStatus,
            verifiedAt: kyc.reviewedAt ? new Date(kyc.reviewedAt).toISOString() : null,
          },
          entityRegistration: {
            documentUploaded: true,
            stateRegistryStatus: 'Active/Good Standing',
          },
          beneficialOwner: {
            fullName: kyc.beneficialOwnerName || '',
            dateOfBirth: kyc.beneficialOwnerDob || '',
            ssnLast4: kyc.beneficialOwnerSsnLast4 || '',
            govIdUploaded: true,
            selfieUploaded: true,
          },
          sanctionsScreening: {
            status: kyc.sanctionsStatus,
          },
          bankAccount: {
            accountHolderName: kyc.bankAccountHolder || '',
            routingNumber: kyc.bankRoutingNumber || '',
            accountNumberMasked: kyc.bankAccountNumberMasked || '',
            verificationMethod: 'Instant',
            verified: kyc.bankVerified,
          },
          submittedAt: kyc.submittedAt ? new Date(kyc.submittedAt).toISOString() : null,
          reviewedAt: kyc.reviewedAt ? new Date(kyc.reviewedAt).toISOString() : null,
          reviewedBy: kyc.reviewedBy,
          rejectionReason: kyc.rejectionReason,
          rejectionCount: kyc.rejectionCount || 0,
          rejectionHistory: (kyc.rejectionHistory as any) || [],
          signature: kyc.signature || undefined,
          signatureDate: kyc.signatureDate || undefined,
        }
      : undefined,
    payment: {
      planSelected: (biz.subscriptionPlan as any) || 'Starter',
      amount: 49.0,
      paidAt: new Date(biz.createdAt).toISOString(),
    },
    w9: w9
      ? {
          id: String(w9.id),
          businessId: w9.businessId,
          legalName: w9.legalName,
          businessNameOrDisregarded: w9.businessNameOrDisregarded || '',
          federalTaxClassification: w9.federalTaxClassification,
          llcTaxClassification: w9.llcTaxClassification || undefined,
          streetAddress: w9.streetAddress || '',
          city: w9.city || '',
          state: w9.state || '',
          zipCode: w9.zipCode || '',
          tinType: w9.tinType as any,
          tinMasked: w9.tinMasked,
          tinVerified: w9.tinVerified,
          tinMatchStatus: 'match',
          reusedEkycTin: true,
          certifications: {
            correctTin: w9.certCorrectTin,
            noBackupWithholding: w9.certNoBackupWithholding,
            usPerson: w9.certUsPerson,
            fatcaCorrect: w9.certFatcaCorrect,
          },
          signatureName: w9.signatureName,
          agreedPerjury: w9.agreedPerjury,
          status: w9.status as any,
          signedAt: w9.signedAt ? new Date(w9.signedAt).toISOString() : null,
          signerIp: w9.signerIp || '192.168.1.1',
          pdfGeneratedUrl: w9.pdfGeneratedUrl,
        }
      : undefined,
    nmiPaymentAccount: nmi
      ? {
          vendorId: nmi.businessId,
          nmiOnboardingStatus: nmi.onboardingStatus as any,
          nmiGatewayId: nmi.nmiGatewayId,
          companyName: nmi.companyName || '',
          federalTaxId: nmi.federalTaxId || '',
          firstName: nmi.firstName || '',
          lastName: nmi.lastName || '',
          email: nmi.email || '',
          bankRoutingNumber: nmi.bankRoutingNumber || '',
          bankAccountNumber: nmi.bankAccountNumber || '',
          accountType: nmi.accountType as any,
          accountHolderType: nmi.accountHolderType as any,
          createdAt: nmi.createdAt ? new Date(nmi.createdAt).toISOString() : undefined,
          activatedAt: nmi.activatedAt ? new Date(nmi.activatedAt).toISOString() : undefined,
        }
      : undefined,
    notifications: [],
    phone: biz.phone || '+1 (555) 019-2834',
    email: biz.email || 'contact@business.com',
    website: biz.website || 'https://example.com',
    avatarChar: biz.avatarChar || biz.businessName[0] || 'B',
  };
}

// GET all businesses
router.get('/', async (req, res) => {
  try {
    const all = await db.select().from(businesses);
    const populated = await Promise.all(all.map((b) => getCompleteBusiness(b.id)));
    res.json(populated.filter(Boolean));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single business
router.get('/:id', async (req, res) => {
  try {
    const biz = await getCompleteBusiness(req.params.id);
    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(biz);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create business
router.post('/', async (req, res) => {
  try {
    const { id, userId, coreDetails, status, subscriptionPlan } = req.body;
    const [created] = await db
      .insert(businesses)
      .values({
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
        status: status || 'Draft',
        subscriptionPlan: subscriptionPlan || 'Starter',
      })
      .returning();

    const full = await getCompleteBusiness(created.id);
    res.status(201).json(full);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update business
router.patch('/:id', async (req, res) => {
  try {
    const { coreDetails, status, subscriptionPlan, ...rest } = req.body;
    const updateData: any = { updatedAt: new Date(), ...rest };
    if (coreDetails) {
      if (coreDetails.businessName) updateData.businessName = coreDetails.businessName;
      if (coreDetails.legalEntityName) updateData.legalEntityName = coreDetails.legalEntityName;
      if (coreDetails.category) updateData.category = coreDetails.category;
      if (coreDetails.description !== undefined) updateData.description = coreDetails.description;
      if (coreDetails.streetAddress) updateData.streetAddress = coreDetails.streetAddress;
      if (coreDetails.city) updateData.city = coreDetails.city;
      if (coreDetails.state) updateData.state = coreDetails.state;
      if (coreDetails.zipCode) updateData.zipCode = coreDetails.zipCode;
    }
    if (status) updateData.status = status;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;

    await db.update(businesses).set(updateData).where(eq(businesses.id, req.params.id));
    const updated = await getCompleteBusiness(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
