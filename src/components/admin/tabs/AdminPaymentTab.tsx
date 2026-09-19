import React, { useState, useEffect } from 'react';
import { useDemo } from '../../../context/DemoContext';
import {
  CreditCard,
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Sparkles,
  Check,
  Building2,
  ArrowDownToLine,
  Landmark,
  X,
  XCircle,
  Clock,
  ShieldCheck,
  Coins,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { WithdrawalRequest, BusinessBalance } from '../../../types';
import {
  calculateLedgerBalances,
  getTransactionTypeMeta,
  normalizeTransactionType,
} from '../../../utils/ledgerAccounting';

interface AdminPaymentTabProps {
  onSaveSuccess?: (newRate: number) => void;
}

export const AdminPaymentTab: React.FC<AdminPaymentTabProps> = ({ onSaveSuccess }) => {
  const {
    state,
    currentUser,
    platformLedger,
    approveWithdrawal,
    rejectWithdrawal,
    requestSuperAdminWithdrawal,
  } = useDemo();

  const commissionRate = platformLedger?.commissionRate ?? 10.0;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAdminWithdrawModalOpen, setIsAdminWithdrawModalOpen] = useState(false);
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState<string>('');
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showSuccessBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Dynamic Single Source of Truth Balances calculated from financial ledger
  const calculatedBalances = calculateLedgerBalances(
    platformLedger?.transactions || [],
    platformLedger?.withdrawals || []
  );

  // Pending withdrawals
  const pendingWithdrawals = (platformLedger?.withdrawals || []).filter((w) => w.status === 'Pending');
  const pastWithdrawals = (platformLedger?.withdrawals || []).filter((w) => w.status !== 'Pending');

  // Handle Approve
  const handleApprove = (w: WithdrawalRequest) => {
    const res = approveWithdrawal(w.id, currentUser?.fullName || 'Super Admin');
    if (res.success) {
      const net = w.netPayoutAmount !== undefined ? w.netPayoutAmount : (w.amount - (w.commissionAmount || 0) - (w.w9WithholdingAmount || 0));
      const tax = w.w9WithholdingAmount || 0;
      const comm = w.commissionAmount !== undefined ? w.commissionAmount : (w.amount * ((w.commissionRate || commissionRate)/100));
      showSuccessBanner(
        `✓ Approved & Disbursed $${net.toFixed(2)} to ${w.bankName || 'bank'} (${w.maskedBankAccount}) for ${w.businessName}! (Gross: $${w.amount.toFixed(2)}, Commission: -$${comm.toFixed(2)}${tax > 0 ? `, 24% IRS Tax Withheld: -$${tax.toFixed(2)} [W-9 Missing]` : ', 0% Tax Withheld [W-9 Certified]'}).`
      );
    } else {
      setErrorMessage(res.error || 'Failed to approve withdrawal.');
    }
  };

  // Handle Reject Modal Open & Confirm
  const handleOpenRejectModal = (w: WithdrawalRequest) => {
    setRejectingWithdrawal(w);
    setRejectionReasonInput('Verification requirements incomplete. Please review compliance documentation.');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawal) return;

    const res = rejectWithdrawal(
      rejectingWithdrawal.id,
      rejectionReasonInput,
      currentUser?.fullName || 'Super Admin'
    );

    if (res.success) {
      showSuccessBanner(
        `✓ Rejected withdrawal of $${rejectingWithdrawal.amount.toFixed(2)} for ${rejectingWithdrawal.businessName}. Reserved amount has been restored to the business available balance.`
      );
      setRejectingWithdrawal(null);
      setRejectionReasonInput('');
    } else {
      setErrorMessage(res.error || 'Failed to reject withdrawal.');
    }
  };

  // Handle Super Admin Withdrawal
  const handleOpenAdminWithdrawModal = () => {
    setAdminWithdrawAmount(
      calculatedBalances.superAdminBalance > 0
        ? calculatedBalances.superAdminBalance.toFixed(2)
        : '0.00'
    );
    setIsAdminWithdrawModalOpen(true);
  };

  const handleConfirmAdminWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(adminWithdrawAmount.replace(/,/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMessage('Please enter a valid amount to withdraw.');
      return;
    }
    if (parsed > calculatedBalances.superAdminBalance) {
      setErrorMessage(`Cannot withdraw more than current commission balance ($${calculatedBalances.superAdminBalance.toFixed(2)}).`);
      return;
    }

    const res = requestSuperAdminWithdrawal(parsed);
    if (res.success) {
      setIsAdminWithdrawModalOpen(false);
      showSuccessBanner(
        `✓ Super Admin commission withdrawal of $${parsed.toFixed(2)} completed. Routed to ${platformLedger.superAdminBank.accountMasked}.`
      );
    } else {
      setErrorMessage(res.error || 'Failed to process Super Admin withdrawal.');
    }
  };

  return (
    <div id="admin-payment-tab" className="space-y-6 animate-in fade-in duration-150 pb-16 max-w-7xl mx-auto">
      {/* 1. Header with Breadcrumb & Quick Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>URSPOT Super Admin</span>
            <span>›</span>
            <span className="text-slate-700 font-semibold">Payment, Balances & Withdrawals</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Marketplace Balances & Treasury</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              {commissionRate}% Active Commission
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform-held customer payments, internal balance allocations, W-9 backup withholding escrow, and vendor withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-medium">Gateway:</span>
            <strong className="text-slate-800 font-bold">NMI Payment Gateway</strong>
          </div>
          <button
            onClick={handleOpenAdminWithdrawModal}
            disabled={calculatedBalances.superAdminBalance <= 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              calculatedBalances.superAdminBalance > 0
                ? 'bg-black hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Withdraw Commission (${calculatedBalances.superAdminBalance.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex items-center justify-between gap-2.5 text-rose-900 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Platform Balance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Platform Balance</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ${calculatedBalances.totalPlatformBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Held in NMI Merchant Escrow</span>
        </div>

        {/* Super Admin Balance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Super Admin Balance</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ${calculatedBalances.superAdminBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Net platform commissions</span>
        </div>

        {/* Total Business Balances */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Business Balances</span>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-1 font-mono">
            ${calculatedBalances.totalBusinessBalances.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            ${calculatedBalances.totalBusinessAvailable.toFixed(2)} avail • ${calculatedBalances.totalBusinessPending.toFixed(2)} pending
          </span>
        </div>

        {/* IRS Tax Withholding Escrow */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">IRS Withholding (24%)</span>
            <div className={`w-2 h-2 rounded-full ${calculatedBalances.totalTaxWithheld > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
            ${calculatedBalances.totalTaxWithheld.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Non-W9 Backup Withholding</span>
        </div>

        {/* Active Commission Rate */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Commission Rate</span>
            <div className="w-2 h-2 rounded-full bg-violet-500" />
          </div>
          <p className="text-2xl font-black text-violet-700 mt-1 font-mono">
            {commissionRate}%
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Managed in Configuration</span>
        </div>
      </div>

      {/* 3. Super Admin Treasury & Commission Withdrawal Card */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">Super Admin Commission Withdrawal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Treasury Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">
              Balance: <strong className="text-emerald-400 font-black">${calculatedBalances.superAdminBalance.toFixed(2)}</strong> • Registered Account: {platformLedger.superAdminBank.bankName} ({platformLedger.superAdminBank.accountMasked})
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdminWithdrawModal}
          disabled={calculatedBalances.superAdminBalance <= 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 ${
            calculatedBalances.superAdminBalance > 0
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Withdraw ${calculatedBalances.superAdminBalance.toFixed(2)}</span>
        </button>
      </div>

      {/* 4. Pending Business Withdrawal Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Pending Business Withdrawal Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">Disbursements awaiting Super Admin verification and authorization</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
            {pendingWithdrawals.length} Pending
          </span>
        </div>

        {pendingWithdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No pending business withdrawals at this time. All requests have been reviewed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Business & Bank Destination</th>
                  <th className="py-3.5 px-4">Form W-9 Status</th>
                  <th className="py-3.5 px-4">Gross Requested</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Tax Withheld (24%)</th>
                  <th className="py-3.5 px-4">Net Transfer</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingWithdrawals.map((w) => {
                  const wComm = w.commissionAmount !== undefined ? w.commissionAmount : (w.amount * ((w.commissionRate || commissionRate) / 100));
                  const isW9Done = w.w9Status === 'verified' || (w.w9WithholdingRate !== undefined && w.w9WithholdingRate === 0);
                  const wTax = w.w9WithholdingAmount !== undefined ? w.w9WithholdingAmount : (isW9Done ? 0 : Number((w.amount * 0.24).toFixed(2)));
                  const wNet = w.netPayoutAmount !== undefined ? w.netPayoutAmount : (w.amount - wComm - wTax);

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{w.businessName}</div>
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                          <Landmark className="w-3 h-3 text-slate-400" />
                          <span>{w.bankName || 'Bank'} ({w.maskedBankAccount})</span>
                        </div>
                        {w.bankAccountHolder && (
                          <div className="text-[10px] text-slate-400">{w.bankAccountHolder}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isW9Done ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Certified (0% Tax)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Missing W-9 (24% Tax)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        ${w.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-violet-700 font-bold">
                        -${wComm.toFixed(2)} ({w.commissionRate || commissionRate}%)
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {wTax > 0 ? (
                          <span className="text-rose-600 font-bold">-${wTax.toFixed(2)} (24%)</span>
                        ) : (
                          <span className="text-slate-400 font-medium">$0.00 (0%)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-sm">
                        ${wNet.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(w.requestDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(w)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          Approve & Transfer
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(w)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Completed & Rejected Withdrawal History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Withdrawal History</h3>
              <p className="text-xs text-slate-400 mt-0.5">Authorizations, completed direct deposits, and declined requests</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
            {pastWithdrawals.length} processed
          </span>
        </div>

        {pastWithdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No completed or rejected withdrawals yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Recipient / Business</th>
                  <th className="py-3.5 px-4">Gross Amount</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Tax Withheld</th>
                  <th className="py-3.5 px-4">Net Transferred</th>
                  <th className="py-3.5 px-4">Destination Bank</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Processed Date & Admin Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastWithdrawals.map((w) => {
                  const wComm = w.commissionAmount !== undefined ? w.commissionAmount : (w.amount * ((w.commissionRate || commissionRate) / 100));
                  const wTax = w.w9WithholdingAmount || 0;
                  const wNet = w.netPayoutAmount !== undefined ? w.netPayoutAmount : (w.amount - wComm - wTax);

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{w.businessName}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                          {w.type === 'super_admin' ? 'Super Admin Commission' : 'Vendor Payout'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">${w.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-violet-700 font-bold">
                        {wComm > 0 ? `-$${wComm.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {wTax > 0 ? (
                          <span className="text-rose-600 font-bold">-$${wTax.toFixed(2)} (24%)</span>
                        ) : (
                          <span className="text-slate-400">$0.00 (0%)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-sm">
                        ${wNet.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {w.bankName ? `${w.bankName} (${w.maskedBankAccount})` : w.maskedBankAccount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            w.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {w.status === 'Rejected' ? (
                          <span className="text-rose-700 font-medium">
                            Declined: {w.rejectionReason || 'Restored to business available balance'}
                          </span>
                        ) : (
                          <span>
                            Approved by {w.processedBy || 'Super Admin'} on{' '}
                            {w.processedDate ? new Date(w.processedDate).toLocaleDateString() : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Marketplace Transaction & Commission Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Master Platform Financial Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit trail of customer payments, fees, tax deductions, and disbursements</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
            {platformLedger.transactions.length} transactions
          </span>
        </div>

        {platformLedger.transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No marketplace transactions recorded yet. Book a service in the Customer portal to generate ledger records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Booking / Tx</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Business</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Gross Total</th>
                  <th className="py-3.5 px-4">Commission (%)</th>
                  <th className="py-3.5 px-4">Admin Commission</th>
                  <th className="py-3.5 px-4">IRS Withholding (24%)</th>
                  <th className="py-3.5 px-4">Business Net</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platformLedger.transactions.map((tx) => {
                  const typeMeta = getTransactionTypeMeta(tx.type, tx.paymentStatus);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{tx.bookingId}</div>
                        {tx.id !== tx.bookingId && (
                          <div className="text-[10px] text-slate-400 font-mono font-normal">Tx: {tx.id}</div>
                        )}
                        <span className="text-[10px] text-slate-400 font-normal font-sans block max-w-[150px] truncate">{tx.serviceName}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badgeBg}`}
                          title={typeMeta.description}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${typeMeta.dotBg}`} />
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{tx.businessName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{tx.customerName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${tx.grossAmount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {tx.commissionRate > 0 ? `${tx.commissionRate}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                        {tx.platformCommission > 0 ? `+$${tx.platformCommission.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {tx.w9WithholdingAmount > 0 ? (
                          <span className="text-amber-700 font-bold">
                            +${tx.w9WithholdingAmount.toFixed(2)} (24%)
                          </span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        ${tx.businessAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">{tx.paymentGateway}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tx.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : tx.paymentStatus === 'failed'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SUPER ADMIN COMMISSION WITHDRAWAL                                 */}
      {/* ========================================================================= */}
      {isAdminWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Super Admin Withdrawal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Disburse earned platform commissions to treasury</p>
              </div>
              <button
                onClick={() => setIsAdminWithdrawModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmAdminWithdrawal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commission Balance Available</label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-semibold">Super Admin Balance</span>
                  <span className="font-mono font-black text-emerald-700 text-base">
                    ${platformLedger.platformCommissionBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Withdrawal Amount ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={platformLedger.platformCommissionBalance}
                  required
                  value={adminWithdrawAmount}
                  onChange={(e) => setAdminWithdrawAmount(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Treasury Account</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {platformLedger.superAdminBank.accountHolder}
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    Bank: {platformLedger.superAdminBank.bankName} ({platformLedger.superAdminBank.accountMasked})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Verified platform account. Bank details do not need to be re-entered.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    platformLedger.platformCommissionBalance <= 0 ||
                    parseFloat(adminWithdrawAmount) <= 0 ||
                    parseFloat(adminWithdrawAmount) > platformLedger.platformCommissionBalance ||
                    isNaN(parseFloat(adminWithdrawAmount))
                  }
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
                    platformLedger.platformCommissionBalance > 0 &&
                    parseFloat(adminWithdrawAmount) > 0 &&
                    parseFloat(adminWithdrawAmount) <= platformLedger.platformCommissionBalance
                      ? 'bg-black text-white hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT WITHDRAWAL REASON MODAL                                    */}
      {/* ========================================================================= */}
      {rejectingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Withdrawal Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Restore reserved funds to business available balance</p>
              </div>
              <button
                onClick={() => setRejectingWithdrawal(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Business:</span>
                  <strong className="text-slate-900 font-bold">{rejectingWithdrawal.businessName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Requested Amount:</span>
                  <strong className="text-slate-900 font-mono font-black">${rejectingWithdrawal.amount.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bank Account:</span>
                  <span className="text-slate-700 font-mono">{rejectingWithdrawal.maskedBankAccount}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Balance Restoration:</strong> Rejecting this request will immediately return the reserved <strong>${rejectingWithdrawal.amount.toFixed(2)}</strong> back to the business's Available Balance.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Bank information mismatch, verification documents pending update..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingWithdrawal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Rejection & Restore Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentTab;
