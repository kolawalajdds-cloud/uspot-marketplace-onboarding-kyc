import { Router } from 'express';
import { db } from '../db';
import { kycVerifications, w9Records, nmiPaymentAccounts, businesses } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET compliance details for a business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.businessId, businessId));
    const [w9] = await db.select().from(w9Records).where(eq(w9Records.businessId, businessId));
    const [nmi] = await db.select().from(nmiPaymentAccounts).where(eq(nmiPaymentAccounts.businessId, businessId));

    res.json({
      kyc: kyc || null,
      w9: w9 || null,
      nmi: nmi || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST submit KYC verification
router.post('/kyc/submit', async (req, res) => {
  try {
    const { businessId, verificationData, signature, signatureDate } = req.body;
    if (!businessId || !verificationData) {
      return res.status(400).json({ error: 'businessId and verificationData are required' });
    }

    const payload = {
      businessId,
      legalEntityType: verificationData.legalEntityType,
      status: 'Pending Review',
      riskTier: verificationData.riskTier || 'Low',
      einRaw: verificationData.tinRaw || verificationData.einVerification?.tinRaw,
      einMasked: verificationData.tinMasked || verificationData.einVerification?.tinMasked,
      tinMatchStatus: verificationData.einVerification?.tinMatchStatus || 'Matched',
      beneficialOwnerName: verificationData.beneficialOwner?.fullName,
      beneficialOwnerDob: verificationData.beneficialOwner?.dateOfBirth,
      beneficialOwnerSsnLast4: verificationData.beneficialOwner?.ssnLast4,
      bankAccountHolder: verificationData.bankAccount?.accountHolderName,
      bankRoutingNumber: verificationData.bankAccount?.routingNumber,
      bankAccountNumberMasked: verificationData.bankAccount?.accountNumberMasked,
      bankVerified: verificationData.bankAccount?.verified || false,
      sanctionsStatus: verificationData.sanctionsScreening?.status || 'Clear',
      submittedAt: new Date(),
      signature,
      signatureDate,
    };

    // Upsert KYC verification record
    const [existing] = await db.select().from(kycVerifications).where(eq(kycVerifications.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(kycVerifications).set(payload).where(eq(kycVerifications.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(kycVerifications).values(payload).returning();
    }

    // Update business status
    await db.update(businesses).set({ status: 'Pending KYC Review', updatedAt: new Date() }).where(eq(businesses.id, businessId));

    res.json({ success: true, kyc: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST review KYC verification (Admin approve / reject)
router.post('/kyc/review', async (req, res) => {
  try {
    const { businessId, action, reviewerName, rejectionReason } = req.body;
    if (!businessId || !action) {
      return res.status(400).json({ error: 'businessId and action are required' });
    }

    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'Approved' : 'Rejected';
    const businessStatus = isApproved ? 'Live' : 'KYC Rejected';

    const [existing] = await db.select().from(kycVerifications).where(eq(kycVerifications.businessId, businessId));
    let history = Array.isArray(existing?.rejectionHistory) ? existing.rejectionHistory : [];
    let count = existing?.rejectionCount || 0;

    if (!isApproved && rejectionReason) {
      count += 1;
      history = [
        ...history,
        {
          date: new Date().toISOString(),
          reason: rejectionReason,
          rejectedBy: reviewerName || 'Super Admin',
        },
      ];
    }

    const [updatedKyc] = await db
      .update(kycVerifications)
      .set({
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: reviewerName || 'Super Admin',
        rejectionReason: !isApproved ? rejectionReason : null,
        rejectionCount: count,
        rejectionHistory: history,
      })
      .where(eq(kycVerifications.businessId, businessId))
      .returning();

    await db.update(businesses).set({ status: businessStatus, updatedAt: new Date() }).where(eq(businesses.id, businessId));

    res.json({ success: true, kyc: updatedKyc, businessStatus });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST submit / sign W-9 form
router.post('/w9/sign', async (req, res) => {
  try {
    const { businessId, w9Data } = req.body;
    if (!businessId || !w9Data) {
      return res.status(400).json({ error: 'businessId and w9Data are required' });
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
      status: 'submitted',
      signedAt: new Date(),
      signerIp: req.ip || '127.0.0.1',
      pdfGeneratedUrl: w9Data.pdfGeneratedUrl || null,
    };

    const [existing] = await db.select().from(w9Records).where(eq(w9Records.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(w9Records).set(payload).where(eq(w9Records.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(w9Records).values(payload).returning();
    }

    res.json({ success: true, w9: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST save NMI payment gateway account
router.post('/nmi/onboard', async (req, res) => {
  try {
    const { businessId, nmiAccount } = req.body;
    if (!businessId || !nmiAccount) {
      return res.status(400).json({ error: 'businessId and nmiAccount are required' });
    }

    const payload = {
      businessId,
      nmiGatewayId: nmiAccount.nmiGatewayId || `nmi-gw-${Date.now()}`,
      onboardingStatus: nmiAccount.nmiOnboardingStatus || 'ACTIVE',
      companyName: nmiAccount.companyName,
      federalTaxId: nmiAccount.federalTaxId,
      firstName: nmiAccount.firstName,
      lastName: nmiAccount.lastName,
      email: nmiAccount.email,
      bankRoutingNumber: nmiAccount.bankRoutingNumber,
      bankAccountNumber: nmiAccount.bankAccountNumber,
      accountType: nmiAccount.accountType || 'checking',
      accountHolderType: nmiAccount.accountHolderType || 'business',
      activatedAt: new Date(),
    };

    const [existing] = await db.select().from(nmiPaymentAccounts).where(eq(nmiPaymentAccounts.businessId, businessId));
    let saved;
    if (existing) {
      [saved] = await db.update(nmiPaymentAccounts).set(payload).where(eq(nmiPaymentAccounts.businessId, businessId)).returning();
    } else {
      [saved] = await db.insert(nmiPaymentAccounts).values(payload).returning();
    }

    res.json({ success: true, nmi: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
