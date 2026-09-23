import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface WorkerTransactionsPageProps {
  workerId: string;
}

interface LedgerTransaction {
  id: string;
  date: string;
  type: 'Commission' | 'Payout' | 'Salary' | 'Lease Fee' | 'Refund';
  description: string;
  amount: string;
  isCredit: boolean;
  balanceAfter: string;
  status: 'Completed' | 'Paid';
}

export const WorkerTransactionsPage: React.FC<WorkerTransactionsPageProps> = () => {
  const seedTransactions: LedgerTransaction[] = [
    {
      id: 'tx-1',
      date: 'Jun 15, 2026',
      type: 'Commission',
      description: 'Job #REF-123',
      amount: '+$50.00',
      isCredit: true,
      balanceAfter: '$450.00',
      status: 'Completed',
    },
    {
      id: 'tx-2',
      date: 'Jun 14, 2026',
      type: 'Payout',
      description: 'Payout Request #PR-45',
      amount: '-$200.00',
      isCredit: false,
      balanceAfter: '$400.00',
      status: 'Paid',
    },
    {
      id: 'tx-3',
      date: 'Jun 12, 2026',
      type: 'Salary',
      description: 'Weekly Payment',
      amount: '+$1,200.00',
      isCredit: true,
      balanceAfter: '$600.00',
      status: 'Completed',
    },
    {
      id: 'tx-4',
      date: 'Jun 10, 2026',
      type: 'Lease Fee',
      description: 'Vehicle Lease',
      amount: '+$45.00',
      isCredit: true,
      balanceAfter: '$2,000.00',
      status: 'Completed',
    },
    {
      id: 'tx-5',
      date: 'Jun 08, 2026',
      type: 'Refund',
      description: 'Adjustment #ADJ-09',
      amount: '-$20.00',
      isCredit: false,
      balanceAfter: '$1,955.00',
      status: 'Completed',
    },
  ];

  const [transactions, setTransactions] = useState<LedgerTransaction[]>(seedTransactions);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilter = () => {
    let filtered = seedTransactions;
    if (selectedType !== 'All Types') {
      filtered = filtered.filter((t) => t.type === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }
    setTransactions(filtered);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOPBAR SEARCH & SWITCH ROLE (Exact match to Image 1)                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100/90 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            Switch Role
          </button>

          <div className="flex items-center gap-2 pl-2">
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-gray-900">Alex Sterling</div>
              <div className="text-[10px] text-gray-400 font-semibold">Pro Contractor</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              AS
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEADER: TRANSACTION HISTORY & SUBTITLE                                 */}
      {/* ========================================================================= */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Transaction History
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Review your full ledger of income, payouts, and adjustments.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER CARD (Exact match to Image 1)                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* From Date */}
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              FROM DATE
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* To Date */}
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              TO DATE
            </label>
            <div className="relative">
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              TYPE
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-black appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Commission">Commission</option>
                <option value="Payout">Payout</option>
                <option value="Salary">Salary</option>
                <option value="Lease Fee">Lease Fee</option>
                <option value="Refund">Refund</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter Button */}
          <div className="sm:col-span-1">
            <button
              type="button"
              onClick={handleFilter}
              className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LEDGER TABLE (Exact match to Image 1)                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">TYPE</th>
                <th className="py-3.5 px-6">DESCRIPTION</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6">BALANCE AFTER</th>
                <th className="py-3.5 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">{tx.date}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-800 font-semibold">{tx.description}</td>
                  <td
                    className={`py-4 px-6 font-bold ${
                      tx.isCredit ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tx.amount}
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-900">{tx.balanceAfter}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                        tx.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500 font-medium">
          <span>Showing 5 of 124 transactions</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded bg-black text-white cursor-pointer"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
            >
              3
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
