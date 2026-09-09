import React, { useState } from 'react';
import {
  Landmark,
  Banknote,
  Receipt,
  Plus,
  CreditCard,
  Sparkles,
  Percent,
  Trash2,
  X,
} from 'lucide-react';
import { BusinessFormData, CustomFee } from './types';

interface FeesTaxTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD - US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR - Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP - British Pound (£)', symbol: '£' },
  { code: 'CAD', label: 'CAD - Canadian Dollar ($)', symbol: '$' },
];

export const FeesTaxTab: React.FC<FeesTaxTabProps> = ({ data, onChange }) => {
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeType, setNewFeeType] = useState<'Fixed' | 'Percentage'>('Fixed');
  const [newFeeAmount, setNewFeeAmount] = useState('10.00');
  const [newFeeDesc, setNewFeeDesc] = useState('Applied per booking');

  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeName.trim()) return;

    const newFee: CustomFee = {
      id: `fee-${Date.now()}`,
      name: newFeeName.trim(),
      type: newFeeType,
      amount: parseFloat(newFeeAmount) || 0,
      description: newFeeDesc.trim(),
    };

    onChange({ serviceFees: [...data.serviceFees, newFee] });
    setNewFeeName('');
    setNewFeeAmount('10.00');
    setShowAddFeeModal(false);
  };

  const removeFee = (id: string) => {
    onChange({ serviceFees: data.serviceFees.filter((f) => f.id !== id) });
  };

  return (
    <div id="tab-content-fees-tax" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Tax Info & Currency/Billing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Tax Information matching Image 7 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Landmark className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Tax Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Tax ID (EIN)
                </label>
                <input
                  id="fees-tax-id"
                  type="text"
                  value={data.taxId}
                  onChange={(e) => onChange({ taxId: e.target.value })}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Sales Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    id="fees-sales-tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.salesTaxRate}
                    onChange={(e) =>
                      onChange({ salesTaxRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="8.50"
                    className="w-full pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 transition-colors"
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm font-semibold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 mt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tax-Exempt Status</h4>
                <p className="text-[11px] text-slate-500">Check if entity is non-profit</p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ taxExempt: !data.taxExempt })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  data.taxExempt ? 'bg-black' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                    data.taxExempt ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 2: Currency & Billing matching Image 7 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Banknote className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Currency & Billing
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Currency
              </label>
              <select
                id="fees-primary-currency"
                value={data.currency}
                onChange={(e) => onChange({ currency: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Automatic Invoicing</h4>
                <p className="text-[11px] text-slate-500">Send bills on booking</p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ automaticInvoicing: !data.automaticInvoicing })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  data.automaticInvoicing ? 'bg-black' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                    data.automaticInvoicing ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Service Fees matching Image 7 */}
        <div>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-800" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Service Fees
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFeeModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Fee</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Manage additional charges applied to bookings at this location.
            </p>

            <div className="divide-y divide-slate-100">
              {data.serviceFees.map((fee) => (
                <div
                  key={fee.id}
                  className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      {fee.name.toLowerCase().includes('clean') ? (
                        <Sparkles className="w-4 h-4" />
                      ) : fee.type === 'Percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{fee.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {fee.type}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {fee.description ||
                            (fee.type === 'Fixed'
                              ? 'Applied per booking'
                              : 'Calculated on subtotal')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-extrabold text-slate-900">
                      {fee.type === 'Fixed' ? `$${fee.amount.toFixed(2)}` : `${fee.amount}%`}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFee(fee.id)}
                      className="p-1 rounded-md text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Fee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Fee Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Service Fee</h3>
              <button
                type="button"
                onClick={() => setShowAddFeeModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFee} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Name</label>
                <input
                  type="text"
                  required
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                  placeholder="e.g. Linen Service, Maintenance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fee Type</label>
                  <select
                    value={newFeeType}
                    onChange={(e) => setNewFeeType(e.target.value as 'Fixed' | 'Percentage')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="Fixed">Fixed ($)</option>
                    <option value="Percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application Rule</label>
                <input
                  type="text"
                  value={newFeeDesc}
                  onChange={(e) => setNewFeeDesc(e.target.value)}
                  placeholder="e.g. Applied once per reservation"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFeeModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-1.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-slate-800"
                >
                  Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
