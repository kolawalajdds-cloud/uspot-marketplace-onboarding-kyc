import React, { useState } from 'react';
import {
  Banknote,
  Search,
  Bell,
  Settings,
  HelpCircle,
  Landmark,
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Info,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

interface WorkerEarningsPageProps {
  workerId: string;
  onNavigate: (page: string) => void;
}

interface PayoutRecord {
  id: string;
  ref: string;
  date: string;
  requestedAmount: number;
  fee: number;
  netAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  notes: string;
}

export const WorkerEarningsPage: React.FC<WorkerEarningsPageProps> = ({
  workerId,
  onNavigate,
}) => {
  // Navigation between 'manage' (Image 2) and 'request' (Image 3)
  const [viewMode, setViewMode] = useState<'manage' | 'request'>('manage');
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Request Payout Form State (Image 3)
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('0.00');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available wallet balance
  const [availableBalance, setAvailableBalance] = useState<number>(4850.0);

  // Initial payout records from Image 2
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: '1',
      ref: 'PR-001',
      date: 'Jun 15, 2026',
      requestedAmount: 200.0,
      fee: 2.5,
      netAmount: 197.5,
      status: 'Pending',
      notes: 'Weekly withdrawal',
    },
    {
      id: '2',
      ref: 'PR-002',
      date: 'Jun 08, 2026',
      requestedAmount: 150.0,
      fee: 2.5,
      netAmount: 147.5,
      status: 'Paid',
      notes: '-',
    },
    {
      id: '3',
      ref: 'PR-003',
      date: 'Jun 01, 2026',
      requestedAmount: 3200.0,
      fee: 15.0,
      netAmount: 3185.0,
      status: 'Paid',
      notes: 'Project Milestone 2',
    },
    {
      id: '4',
      ref: 'PR-004',
      date: 'May 25, 2026',
      requestedAmount: 450.0,
      fee: 5.0,
      netAmount: 445.0,
      status: 'Rejected',
      notes: 'Verification failed',
    },
    {
      id: '5',
      ref: 'PR-005',
      date: 'May 18, 2026',
      requestedAmount: 1100.0,
      fee: 10.0,
      netAmount: 1090.0,
      status: 'Approved',
      notes: 'Monthly retainer',
    },
  ]);

  // Tab filtering & search
  const filteredPayouts = payouts.filter((p) => {
    const matchesTab = activeTab === 'All' ? true : p.status === activeTab;
    const matchesSearch =
      p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.date.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const parsedAmount = parseFloat(withdrawalAmount) || 0;
  const processingFee = parsedAmount > 0 ? 2.5 : 0;
  const netAmount = Math.max(0, parsedAmount - processingFee);

  const handleConfirmPayout = () => {
    if (parsedAmount <= 0) return;
    const newRecord: PayoutRecord = {
      id: String(Date.now()),
      ref: `PR-00${payouts.length + 1}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      requestedAmount: parsedAmount,
      fee: processingFee,
      netAmount: netAmount,
      status: 'Pending',
      notes: notes || 'Direct withdrawal request',
    };

    setPayouts([newRecord, ...payouts]);
    setAvailableBalance((prev) => Math.max(0, prev - parsedAmount));
    setShowConfirmModal(false);
    setViewMode('manage');
    setSuccessMessage(`Payout request ${newRecord.ref} of $${parsedAmount.toFixed(2)} submitted successfully!`);
    setTimeout(() => setSuccessMessage(null), 4500);
    setWithdrawalAmount('0.00');
    setNotes('');
  };

  const getStatusBadge = (status: PayoutRecord['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold">
            Pending
          </span>
        );
      case 'Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
            Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold">
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* Top Banner Message */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: MANAGE PAYOUTS (Image 2)                                          */}
      {/* ========================================================================= */}
      {viewMode === 'manage' && (
        <div className="space-y-6">
          {/* Topbar: Search & Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="text-sm font-extrabold text-gray-900">
              Payout Requests
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reference..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/worker/notifications')}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/worker/security')}
                  className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-gray-900">Alexander Pierce</div>
                  <div className="text-[10px] text-gray-400 font-semibold">Senior Consultant</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  AP
                </div>
              </div>
            </div>
          </div>

          {/* Page Title & Request Payout Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Manage Payouts
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Track and request your earnings. Payouts are processed every Friday at 12:00 PM EST.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('request')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>+</span>
              <span>REQUEST PAYOUT</span>
            </button>
          </div>

          {/* 4 Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                AVAILABLE BALANCE
              </span>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                PENDING PAYOUTS
              </span>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900">$200.00</div>
                <div className="text-xs text-gray-400 mt-1">1 active request</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                TOTAL WITHDRAWN
              </span>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900">$12,400.50</div>
                <div className="text-xs text-gray-400 mt-1">Year to date</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                NEXT PAYOUT DATE
              </span>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900">Jun 19</div>
                <div className="text-xs text-gray-400 mt-1">Scheduled automatically</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-6">
              {(['Pending', 'Approved', 'Paid', 'Rejected', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === tab
                      ? 'text-gray-900 border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-6">REFERENCE #</th>
                    <th className="py-4 px-6">REQUESTED AMOUNT</th>
                    <th className="py-4 px-6">FEE</th>
                    <th className="py-4 px-6">NET AMOUNT</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">
                        No payout records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-6 text-gray-900 font-medium whitespace-nowrap">
                          {p.date}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {p.ref}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                          ${p.requestedAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                          ${p.fee.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                          ${p.netAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="py-4 px-6 text-gray-500 max-w-xs truncate">
                          {p.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Showing 1 to {Math.min(5, filteredPayouts.length)} of {filteredPayouts.length} results
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded bg-black text-white font-bold flex items-center justify-center text-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black cursor-pointer text-xs"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black cursor-pointer text-xs"
                >
                  3
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards: Payout Schedule & Banking Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payout Schedule Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-gray-900" />
                  <h3 className="font-extrabold text-sm text-gray-900">Payout Schedule</h3>
                </div>

                <div className="space-y-4 text-xs text-gray-600">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Requests submitted before Wednesday are processed in the current week cycle.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Verification typically takes 24-48 business hours for new banking methods.
                    </p>
                  </div>
                </div>
              </div>

              {/* Watermark Icon */}
              <Calendar className="w-20 h-20 text-gray-100 absolute -bottom-2 -right-2 pointer-events-none stroke-1" />
            </div>

            {/* Banking Method Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-4 h-4 text-gray-900" />
                  <h3 className="font-extrabold text-sm text-gray-900">Banking Method</h3>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Chase Bank Primary</div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Checking •••• 4291
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Bank details edit modal')}
                    className="text-xs font-bold text-gray-800 hover:text-black cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => alert('Add Alternative Payout Method modal')}
                  className="text-xs font-bold text-gray-700 hover:text-black cursor-pointer"
                >
                  + Add Alternative Payout Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: REQUEST PAYOUT FORM (Image 3)                                     */}
      {/* ========================================================================= */}
      {viewMode === 'request' && (
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <button
              onClick={() => setViewMode('manage')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Earnings
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">Request Payout</span>
          </div>

          {/* Page Heading */}
          <div className="text-center py-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Request Payout
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter the amount you wish to withdraw from your wallet balance.
            </p>
          </div>

          {/* Form 2-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-4xl mx-auto">
            {/* Left Form: Inputs */}
            <div className="md:col-span-7 bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={availableBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                  <span>Available Balance: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawalAmount(availableBalance.toFixed(2))}
                    className="font-bold text-gray-800 hover:text-black cursor-pointer"
                  >
                    Max Amount
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reference for your records..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-black transition-colors resize-none"
                />
              </div>

              {/* Direct Deposit Target Card */}
              <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-800 flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">Direct Deposit</div>
                    <div className="text-[11px] text-gray-500">
                      Wells Fargo •••• 0201 (Default)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Change bank destination')}
                  className="text-xs font-bold text-gray-700 hover:text-black cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Right Card: Fee Breakdown */}
            <div className="md:col-span-5 flex flex-col justify-between bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 mb-4">Fee Breakdown</h3>
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Processing Fee</span>
                    <span className="font-semibold text-gray-900">${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transaction Fee</span>
                    <span className="font-semibold text-gray-900">$0.00</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4" />

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      NET AMOUNT
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      ${netAmount.toFixed(2)}
                    </span>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={parsedAmount <= 0}
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-3 px-4 rounded-lg bg-black hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Submit Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2.5">
                  Payouts are typically processed within 2-3 business days depending on your bank.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Last Payout
                </div>
                <div className="text-lg font-black text-gray-900 mt-0.5">$4,250.00</div>
                <div className="text-[10px] text-gray-400 font-medium">Oct 12, 2023 • Completed</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pending Total
                </div>
                <div className="text-lg font-black text-gray-900 mt-0.5">$0.00</div>
                <div className="text-[10px] text-gray-400 font-medium">No active requests</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total Paid Out
                </div>
                <div className="text-lg font-black text-gray-900 mt-0.5">$92,840.12</div>
                <div className="text-[10px] text-gray-400 font-medium">Life to date earnings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM PAYOUT REQUEST MODAL (Exact match to Image 3)                     */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Top Icon: Check in black circle */}
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>

            <h3 className="text-lg font-extrabold text-gray-900">
              Confirm Payout Request
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
              Please review your withdrawal details before we initiate the transfer.
            </p>

            {/* Details Box */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 text-left mb-6">
              <div className="flex items-center justify-between text-gray-600">
                <span>Requested Amount</span>
                <span className="font-bold text-gray-900">${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Total Fees</span>
                <span className="font-bold text-gray-900">${processingFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200/80 pt-2 flex items-center justify-between font-bold text-gray-900">
                <span>Transferring to Bank</span>
                <span className="text-sm font-black">${netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmPayout}
                className="w-full py-2.5 px-4 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Payout
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
