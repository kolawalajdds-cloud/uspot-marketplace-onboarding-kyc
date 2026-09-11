import { MarketplaceTransaction, WithdrawalRequest, BusinessBalance, TransactionType } from '../types';

/**
 * Standardized transaction classification normalizer
 */
export function normalizeTransactionType(
  type: string,
  paymentStatus?: string
): 'BOOKING_PAYMENT' | 'BUSINESS_PAYOUT' | 'PAYOUT_FAILED' | 'PAYOUT_REVERSAL' | 'ADMIN_WITHDRAWAL' | 'REFUND' | 'WITHHOLDING' {
  const upper = (type || '').toUpperCase();

  if (upper === 'PAYOUT_FAILED' || (upper === 'BUSINESS_WITHDRAWAL' && paymentStatus === 'failed') || (upper === 'BUSINESS_PAYOUT' && paymentStatus === 'failed')) {
    return 'PAYOUT_FAILED';
  }
  if (
    upper === 'PAYOUT_REVERSAL' ||
    upper === 'WITHDRAWAL_REJECTION_REFUND' ||
    upper === 'ESCROW_RESTORATION' ||
    upper === 'REVERSAL'
  ) {
    return 'PAYOUT_REVERSAL';
  }
  if (upper === 'BUSINESS_PAYOUT' || upper === 'BUSINESS_WITHDRAWAL') {
    return 'BUSINESS_PAYOUT';
  }
  if (upper === 'ADMIN_WITHDRAWAL') {
    return 'ADMIN_WITHDRAWAL';
  }
  if (upper === 'REFUND') {
    return 'REFUND';
  }
  if (upper === 'WITHHOLDING') {
    return 'WITHHOLDING';
  }
  return 'BOOKING_PAYMENT';
}

/**
 * Visual badge metadata for ledger display
 */
export function getTransactionTypeMeta(type: string, status?: string) {
  const normalized = normalizeTransactionType(type, status);
  switch (normalized) {
    case 'BOOKING_PAYMENT':
      return {
        label: 'Booking Payment',
        code: 'BOOKING_PAYMENT',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dotBg: 'bg-emerald-500',
        description: 'Customer payment received via gateway',
      };
    case 'BUSINESS_PAYOUT':
      return {
        label: 'Business Payout',
        code: 'BUSINESS_PAYOUT',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        dotBg: 'bg-blue-500',
        description: 'Disbursement to business bank account',
      };
    case 'PAYOUT_FAILED':
      return {
        label: 'Payout Failed',
        code: 'PAYOUT_FAILED',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        dotBg: 'bg-rose-500',
        description: 'Bank transfer failed or was declined',
      };
    case 'PAYOUT_REVERSAL':
      return {
        label: 'Payout Reversal',
        code: 'PAYOUT_REVERSAL',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        dotBg: 'bg-amber-500',
        description: 'Internal escrow restoration of reserved funds',
      };
    case 'ADMIN_WITHDRAWAL':
      return {
        label: 'Admin Treasury Withdrawal',
        code: 'ADMIN_WITHDRAWAL',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        dotBg: 'bg-purple-500',
        description: 'Platform commission transfer to treasury',
      };
    case 'REFUND':
      return {
        label: 'Customer Refund',
        code: 'REFUND',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        dotBg: 'bg-rose-500',
        description: 'Clawed back customer payment',
      };
    case 'WITHHOLDING':
      return {
        label: 'IRS Withholding',
        code: 'WITHHOLDING',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
        dotBg: 'bg-slate-500',
        description: '24% backup withholding transferred to tax escrow',
      };
  }
}

export interface CalculatedLedgerBalances {
  totalCustomerPayments: number;
  totalAdminCommissionEarned: number;
  totalAdminWithdrawn: number;
  superAdminBalance: number;
  totalTaxWithheld: number;
  totalBusinessEarned: number;
  totalBusinessWithdrawn: number;
  totalBusinessPending: number;
  totalBusinessAvailable: number;
  totalBusinessBalances: number;
  totalPlatformBalance: number;
  businessBreakdown: Record<
    string,
    {
      availableBalance: number;
      pendingWithdrawal: number;
      totalEarned: number;
      totalWithdrawn: number;
      totalWithheldTax: number;
      grossEarned: number;
    }
  >;
}

/**
 * Single source of truth financial accounting calculation engine.
 * Calculates exact platform balances according to transaction accounting rules.
 * 
 * Rules:
 * 1. Platform-held balance = successful customer funds - successful payouts - successful admin withdrawals - refunds +/- valid reversals
 * 2. Super Admin balance = earned platform commissions - Super Admin withdrawals - applicable commission reversals/refunds
 * 3. Business balance = business earnings - successful business withdrawals - applicable refunds/reversals
 * 4. Payout reversals only restore reserved available balance; they are NOT customer revenue.
 * 5. Payouts are money leaving the business; they do NOT add to customer gross revenue.
 */
export function calculateLedgerBalances(
  transactions: MarketplaceTransaction[] = [],
  withdrawals: WithdrawalRequest[] = []
): CalculatedLedgerBalances {
  let totalCustomerPayments = 0;
  let totalAdminCommissionEarned = 0;
  let totalAdminWithdrawn = 0;
  let totalTaxWithheld = 0;
  let totalBusinessEarned = 0;
  let totalBusinessWithdrawn = 0;
  let totalBusinessPending = 0;

  const businessBreakdown: Record<
    string,
    {
      availableBalance: number;
      pendingWithdrawal: number;
      totalEarned: number;
      totalWithdrawn: number;
      totalWithheldTax: number;
      grossEarned: number;
    }
  > = {};

  const getBiz = (bizId: string) => {
    if (!businessBreakdown[bizId]) {
      businessBreakdown[bizId] = {
        availableBalance: 0,
        pendingWithdrawal: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        totalWithheldTax: 0,
        grossEarned: 0,
      };
    }
    return businessBreakdown[bizId];
  };

  // 1. Process customer bookings & refunds from ledger transactions
  for (const tx of transactions) {
    const normalized = normalizeTransactionType(tx.type, tx.paymentStatus);
    const biz = tx.businessId ? getBiz(tx.businessId) : null;

    if (normalized === 'BOOKING_PAYMENT') {
      if (tx.paymentStatus === 'paid') {
        const gross = tx.grossAmount || 0;
        const comm = tx.platformCommission || 0;
        const tax = tx.w9WithholdingAmount || 0;
        const bizNet = tx.businessAmount || 0;

        totalCustomerPayments += gross;
        totalAdminCommissionEarned += comm;
        totalTaxWithheld += tax;
        totalBusinessEarned += bizNet;

        if (biz) {
          biz.grossEarned += bizNet;
          biz.totalWithheldTax += tax;
        }
      }
    } else if (normalized === 'REFUND') {
      if (tx.paymentStatus === 'paid') {
        const gross = tx.grossAmount || 0;
        const comm = tx.platformCommission || 0;
        const tax = tx.w9WithholdingAmount || 0;
        const bizNet = tx.businessAmount || 0;

        totalCustomerPayments -= gross;
        totalAdminCommissionEarned -= comm;
        totalTaxWithheld -= tax;
        totalBusinessEarned -= bizNet;

        if (biz) {
          biz.grossEarned -= bizNet;
          biz.totalWithheldTax -= tax;
        }
      }
    }
  }

  // 2. Track payout events, failures, and reversals with duplicate protection
  // Set of reversed payout IDs (a payout can only be restored ONCE)
  const reversedPayoutIds = new Set<string>();
  for (const tx of transactions) {
    const normalized = normalizeTransactionType(tx.type, tx.paymentStatus);
    if (normalized === 'PAYOUT_REVERSAL') {
      const refId = tx.relatedTransactionId || tx.bookingId;
      if (refId) {
        reversedPayoutIds.add(refId);
      }
    }
  }

  // Set of accounted payout / withdrawal IDs to avoid double counting across transactions & withdrawals
  const accountedPayoutIds = new Set<string>();

  // A. First process explicit withdrawal requests list
  for (const w of withdrawals) {
    if (w.type === 'business' && w.businessId) {
      accountedPayoutIds.add(w.id);
      const biz = getBiz(w.businessId);

      if (w.status === 'Pending') {
        biz.pendingWithdrawal += w.amount || 0;
        totalBusinessPending += w.amount || 0;
      } else if (w.status === 'Completed') {
        biz.totalWithdrawn += w.amount || 0;
        biz.totalEarned += w.amount || 0; // Successfully withdrawn funds
        totalBusinessWithdrawn += w.amount || 0;
      } else if (w.status === 'Rejected') {
        // Failed / Rejected: funds were restored back to available balance.
        // It does not count towards totalWithdrawn, and pending is 0.
      }
    } else if (w.type === 'super_admin') {
      accountedPayoutIds.add(w.id);
      if (w.status === 'Completed') {
        totalAdminWithdrawn += w.amount || 0;
      }
    }
  }

  // B. Next process transactions that represent payouts NOT already accounted for in withdrawals list
  for (const tx of transactions) {
    const normalized = normalizeTransactionType(tx.type, tx.paymentStatus);
    const payoutId = tx.bookingId || tx.id;

    if (normalized === 'BUSINESS_PAYOUT') {
      if (!accountedPayoutIds.has(payoutId)) {
        accountedPayoutIds.add(payoutId);
        const biz = tx.businessId ? getBiz(tx.businessId) : null;
        const amount = tx.businessAmount || tx.grossAmount || 0;

        if (tx.paymentStatus === 'paid') {
          if (biz) {
            biz.totalWithdrawn += amount;
            biz.totalEarned += amount;
          }
          totalBusinessWithdrawn += amount;
        } else if (tx.paymentStatus === 'pending') {
          if (biz) {
            biz.pendingWithdrawal += amount;
          }
          totalBusinessPending += amount;
        }
      }
    } else if (normalized === 'ADMIN_WITHDRAWAL') {
      if (!accountedPayoutIds.has(payoutId)) {
        accountedPayoutIds.add(payoutId);
        if (tx.paymentStatus === 'paid' || tx.withdrawalStatus === 'completed') {
          totalAdminWithdrawn += tx.platformCommission || tx.grossAmount || 0;
        }
      }
    }
  }

  // 3. Finalize available balances for each business
  // available = max(0, grossEarned - totalWithdrawn - pendingWithdrawal)
  let totalBusinessAvailable = 0;
  for (const biz of Object.values(businessBreakdown)) {
    biz.availableBalance = Number(
      Math.max(0, biz.grossEarned - biz.totalWithdrawn - biz.pendingWithdrawal).toFixed(2)
    );
    biz.pendingWithdrawal = Number(biz.pendingWithdrawal.toFixed(2));
    biz.totalWithdrawn = Number(biz.totalWithdrawn.toFixed(2));
    biz.totalEarned = Number(biz.totalEarned.toFixed(2));
    biz.totalWithheldTax = Number(biz.totalWithheldTax.toFixed(2));
    biz.grossEarned = Number(biz.grossEarned.toFixed(2));

    totalBusinessAvailable += biz.availableBalance;
  }

  const superAdminBalance = Number(
    Math.max(0, totalAdminCommissionEarned - totalAdminWithdrawn).toFixed(2)
  );

  const totalBusinessBalances = Number((totalBusinessAvailable + totalBusinessPending).toFixed(2));
  const totalPlatformBalance = Number(
    (superAdminBalance + totalTaxWithheld + totalBusinessBalances).toFixed(2)
  );

  return {
    totalCustomerPayments: Number(totalCustomerPayments.toFixed(2)),
    totalAdminCommissionEarned: Number(totalAdminCommissionEarned.toFixed(2)),
    totalAdminWithdrawn: Number(totalAdminWithdrawn.toFixed(2)),
    superAdminBalance,
    totalTaxWithheld: Number(totalTaxWithheld.toFixed(2)),
    totalBusinessEarned: Number(totalBusinessEarned.toFixed(2)),
    totalBusinessWithdrawn: Number(totalBusinessWithdrawn.toFixed(2)),
    totalBusinessPending: Number(totalBusinessPending.toFixed(2)),
    totalBusinessAvailable: Number(totalBusinessAvailable.toFixed(2)),
    totalBusinessBalances,
    totalPlatformBalance,
    businessBreakdown,
  };
}
