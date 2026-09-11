import { describe, it, expect } from 'vitest';
import { calculateLedgerBalances, normalizeTransactionType } from '../ledgerAccounting';
import { MarketplaceTransaction, WithdrawalRequest } from '../../types';

describe('Ledger Accounting Engine', () => {
  const sampleTransactions: MarketplaceTransaction[] = [
    {
      id: 'tx-1',
      bookingId: 'BK-313830',
      type: 'BOOKING_PAYMENT',
      customerName: 'Alex Taylor',
      businessId: 'biz-nexus',
      businessName: 'The Nexus Workspace & Lab',
      serviceName: 'Executive Studio & Workspace Booking',
      grossAmount: 1000,
      commissionRate: 50,
      platformCommission: 500,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 500,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway',
      createdAt: '2026-11-09T10:00:00.000Z',
      updatedAt: '2026-11-09T10:00:00.000Z',
    },
    {
      id: 'tx-2',
      bookingId: 'WD-900358-863',
      type: 'BUSINESS_PAYOUT',
      customerName: 'Platform Settlement',
      businessId: 'biz-qwer',
      businessName: 'qwer',
      serviceName: 'Payout to Bank (•••• •••• 4829)',
      grossAmount: 180,
      commissionRate: 0,
      platformCommission: 0,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 180,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'completed',
      paymentGateway: 'ACH / Direct Deposit',
      createdAt: '2026-11-09T10:10:00.000Z',
      updatedAt: '2026-11-09T10:10:00.000Z',
    },
    {
      id: 'tx-3',
      bookingId: 'WD-900358-863',
      type: 'PAYOUT_REVERSAL',
      customerName: 'Escrow Restoration',
      businessId: 'biz-qwer',
      businessName: 'qwer',
      serviceName: 'Reversal of failed payout WD-900358-863',
      grossAmount: 180,
      commissionRate: 0,
      platformCommission: 0,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 180,
      currency: 'USD',
      paymentStatus: 'refunded',
      withdrawalStatus: 'rejected',
      paymentGateway: 'Platform Escrow',
      relatedTransactionId: 'WD-900358-863',
      createdAt: '2026-11-09T10:15:00.000Z',
      updatedAt: '2026-11-09T10:15:00.000Z',
    },
    {
      id: 'tx-4',
      bookingId: 'WD-900358-863',
      type: 'PAYOUT_FAILED',
      customerName: 'Platform Settlement',
      businessId: 'biz-qwer',
      businessName: 'qwer',
      serviceName: 'Payout Failed (Insufficient routing)',
      grossAmount: 180,
      commissionRate: 0,
      platformCommission: 0,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 180,
      currency: 'USD',
      paymentStatus: 'failed',
      withdrawalStatus: 'rejected',
      paymentGateway: 'ACH / Direct Deposit',
      createdAt: '2026-11-09T10:20:00.000Z',
      updatedAt: '2026-11-09T10:20:00.000Z',
    },
    {
      id: 'tx-5',
      bookingId: 'BK-764920',
      type: 'BOOKING_PAYMENT',
      customerName: 'Samira Khan',
      businessId: 'biz-qwer',
      businessName: 'qwer',
      serviceName: 'Podcast Studio Suite Booking',
      grossAmount: 200,
      commissionRate: 10,
      platformCommission: 20,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 180,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway',
      createdAt: '2026-11-09T11:00:00.000Z',
      updatedAt: '2026-11-09T11:00:00.000Z',
    },
    {
      id: 'tx-6',
      bookingId: 'WD-985474-320',
      type: 'BUSINESS_PAYOUT',
      customerName: 'Platform Settlement',
      businessId: 'biz-nexus',
      businessName: 'The Nexus Workspace & Lab',
      serviceName: 'Payout to Bank (•••• •••• 9382)',
      grossAmount: 90,
      commissionRate: 0,
      platformCommission: 0,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 90,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'completed',
      paymentGateway: 'ACH / Direct Deposit',
      createdAt: '2026-11-09T11:30:00.000Z',
      updatedAt: '2026-11-09T11:30:00.000Z',
    },
    {
      id: 'tx-7',
      bookingId: 'BK-542199',
      type: 'BOOKING_PAYMENT',
      customerName: 'Marcus Vance',
      businessId: 'biz-nexus',
      businessName: 'The Nexus Workspace & Lab',
      serviceName: 'Full Campus Hot-Desk Day Pass',
      grossAmount: 100,
      commissionRate: 10,
      platformCommission: 10,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 90,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway',
      createdAt: '2026-11-09T12:00:00.000Z',
      updatedAt: '2026-11-09T12:00:00.000Z',
    },
  ];

  const sampleWithdrawals: WithdrawalRequest[] = [
    {
      id: 'WD-900358-863',
      type: 'business',
      businessId: 'biz-qwer',
      businessName: 'qwer',
      requestedByUserId: 'user-qwer',
      requestedByUserName: 'qwer owner',
      amount: 180,
      maskedBankAccount: '•••• •••• 4829',
      bankAccountHolder: 'qwer owner',
      status: 'Rejected',
      requestDate: '2026-11-09T10:05:00.000Z',
      processedDate: '2026-11-09T10:15:00.000Z',
      rejectionReason: 'Failed routing check',
    },
    {
      id: 'WD-985474-320',
      type: 'business',
      businessId: 'biz-nexus',
      businessName: 'The Nexus Workspace & Lab',
      requestedByUserId: 'user-nexus',
      requestedByUserName: 'Nexus Ops',
      amount: 90,
      maskedBankAccount: '•••• •••• 9382',
      bankAccountHolder: 'Nexus Operations LLC',
      status: 'Completed',
      requestDate: '2026-11-09T11:20:00.000Z',
      processedDate: '2026-11-09T11:30:00.000Z',
      processedBy: 'Super Admin',
    },
  ];

  it('correctly calculates platform balances and avoids double counting failed/reversed payouts', () => {
    const balances = calculateLedgerBalances(sampleTransactions, sampleWithdrawals);

    expect(balances.totalCustomerPayments).toBe(1300);
    expect(balances.totalAdminCommissionEarned).toBe(530);
    expect(balances.totalBusinessEarned).toBe(770);
    expect(balances.totalBusinessWithdrawn).toBe(90);
    expect(balances.totalBusinessBalances).toBe(680);
    expect(balances.superAdminBalance).toBe(530);
    expect(balances.totalPlatformBalance).toBe(1210);
    expect(balances.totalTaxWithheld).toBe(0);
  });

  it('handles Super Admin withdrawal without modifying business balances', () => {
    const adminWithdrawal: WithdrawalRequest = {
      id: 'WD-ADMIN-1',
      type: 'super_admin',
      businessName: 'Super Admin Treasury',
      requestedByUserId: 'super-admin-id',
      requestedByUserName: 'Super Admin',
      amount: 200,
      maskedBankAccount: '•••• •••• 5678',
      bankAccountHolder: 'URSPOT Platform Operations LLC',
      status: 'Completed',
      requestDate: '2026-11-10T08:00:00.000Z',
      processedDate: '2026-11-10T08:05:00.000Z',
      processedBy: 'Super Admin',
    };

    const balances = calculateLedgerBalances(sampleTransactions, [adminWithdrawal, ...sampleWithdrawals]);

    expect(balances.superAdminBalance).toBe(330);
    expect(balances.totalPlatformBalance).toBe(1010);
    expect(balances.totalBusinessBalances).toBe(680);
  });

  it('correctly applies 24% IRS backup withholding when business has not completed W-9', () => {
    const uncertifiedBooking: MarketplaceTransaction = {
      id: 'tx-w9-uncertified',
      bookingId: 'BK-100-TEST',
      type: 'BOOKING_PAYMENT',
      customerName: 'Sarah Customer',
      businessId: 'biz-uncertified',
      businessName: 'Uncertified Venue LLC',
      serviceName: 'Studio Session',
      grossAmount: 100,
      commissionRate: 10,
      platformCommission: 10,
      w9Submitted: false,
      w9WithholdingRate: 24,
      w9WithholdingAmount: 24,
      businessAmount: 66,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway',
      createdAt: '2026-11-10T12:00:00.000Z',
      updatedAt: '2026-11-10T12:00:00.000Z',
    };

    const balances = calculateLedgerBalances([uncertifiedBooking], []);

    expect(balances.totalCustomerPayments).toBe(100);
    expect(balances.totalAdminCommissionEarned).toBe(10);
    expect(balances.totalTaxWithheld).toBe(24);
    expect(balances.totalBusinessEarned).toBe(66);
    expect(balances.businessBreakdown['biz-uncertified'].availableBalance).toBe(66);
    expect(balances.businessBreakdown['biz-uncertified'].totalWithheldTax).toBe(24);
    expect(balances.totalPlatformBalance).toBe(100);
  });

  it('correctly applies 0% IRS backup withholding when business has completed and verified W-9', () => {
    const certifiedBooking: MarketplaceTransaction = {
      id: 'tx-w9-certified',
      bookingId: 'BK-101-TEST',
      type: 'BOOKING_PAYMENT',
      customerName: 'Sarah Customer',
      businessId: 'biz-certified',
      businessName: 'Certified Venue LLC',
      serviceName: 'Studio Session',
      grossAmount: 100,
      commissionRate: 10,
      platformCommission: 10,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 90,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway',
      createdAt: '2026-11-10T12:05:00.000Z',
      updatedAt: '2026-11-10T12:05:00.000Z',
    };

    const balances = calculateLedgerBalances([certifiedBooking], []);

    expect(balances.totalCustomerPayments).toBe(100);
    expect(balances.totalAdminCommissionEarned).toBe(10);
    expect(balances.totalTaxWithheld).toBe(0);
    expect(balances.totalBusinessEarned).toBe(90);
    expect(balances.businessBreakdown['biz-certified'].availableBalance).toBe(90);
    expect(balances.businessBreakdown['biz-certified'].totalWithheldTax).toBe(0);
    expect(balances.totalPlatformBalance).toBe(100);
  });
});
