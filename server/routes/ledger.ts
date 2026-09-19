import { Router } from 'express';
import { db } from '../db';
import { marketplaceTransactions, withdrawalRequests, businesses } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// GET all marketplace transactions
router.get('/transactions', async (req, res) => {
  try {
    const { businessId } = req.query;
    let query;
    if (businessId) {
      query = db.select().from(marketplaceTransactions).where(eq(marketplaceTransactions.businessId, String(businessId))).orderBy(desc(marketplaceTransactions.createdAt));
    } else {
      query = db.select().from(marketplaceTransactions).orderBy(desc(marketplaceTransactions.createdAt));
    }
    const txs = await query;
    res.json(
      txs.map((t) => ({
        id: t.id,
        bookingId: t.bookingId,
        businessId: t.businessId,
        businessName: t.businessName,
        customerName: t.customerName || '',
        customerEmail: t.customerEmail || undefined,
        serviceName: t.serviceName || '',
        type: t.type,
        grossAmount: Number(t.grossAmount),
        commissionRate: Number(t.commissionRate),
        platformCommission: Number(t.platformCommission),
        w9WithholdingRate: Number(t.w9WithholdingRate || 0),
        w9WithholdingAmount: Number(t.w9WithholdingAmount || 0),
        businessAmount: Number(t.businessAmount),
        currency: t.currency || 'USD',
        paymentStatus: t.paymentStatus || 'paid',
        withdrawalStatus: t.withdrawalStatus || 'none',
        paymentGateway: t.paymentGateway || 'NMI Gateway',
        notes: t.notes || undefined,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET balance breakdown for a business
router.get('/balance/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const txs = await db.select().from(marketplaceTransactions).where(eq(marketplaceTransactions.businessId, businessId));
    const withdrawals = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.businessId, businessId));

    let grossEarned = 0;
    let totalEarned = 0; // net after platform commission and tax
    let totalWithheldTax = 0;

    txs.forEach((t) => {
      if (t.type === 'BOOKING_PAYMENT') {
        grossEarned += Number(t.grossAmount);
        totalEarned += Number(t.businessAmount);
        totalWithheldTax += Number(t.w9WithholdingAmount || 0);
      }
    });

    let totalWithdrawn = 0;
    let pendingWithdrawal = 0;

    withdrawals.forEach((w) => {
      if (w.status === 'Completed') {
        totalWithdrawn += Number(w.amount);
      } else if (w.status === 'Pending' || w.status === 'Processing') {
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
      grossEarned,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create withdrawal request
router.post('/withdraw', async (req, res) => {
  try {
    const { businessId, amount, requestedByUserId, requestedByUserName, maskedBankAccount, bankAccountHolder } = req.body;
    const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId));

    const requestId = `WTH-${Date.now()}`;
    const [created] = await db
      .insert(withdrawalRequests)
      .values({
        id: requestId,
        type: 'business',
        businessId,
        businessName: biz?.businessName || 'Business Partner',
        requestedByUserId: requestedByUserId || 'user-biz',
        requestedByUserName: requestedByUserName || 'Business Owner',
        amount: String(amount),
        maskedBankAccount: maskedBankAccount || '•••• 4242',
        bankAccountHolder: bankAccountHolder || 'Authorized Signer',
        status: 'Pending',
        requestDate: new Date().toISOString(),
      })
      .returning();

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
