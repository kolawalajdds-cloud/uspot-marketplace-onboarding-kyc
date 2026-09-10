import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Sparkles,
  Check,
} from 'lucide-react';

interface AdminPaymentTabProps {
  onSaveSuccess?: (newRate: number) => void;
}

const STORAGE_KEY = 'urspot_superadmin_payment_rate';
const DEFAULT_RATE = 10.0;

export const AdminPaymentTab: React.FC<AdminPaymentTabProps> = ({ onSaveSuccess }) => {
  // Load saved rate from localStorage or fallback to default
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
    return DEFAULT_RATE;
  });

  const [rateInput, setRateInput] = useState<string>(commissionRate.toString());
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [sampleAmount, setSampleAmount] = useState<number>(100);

  // Additional payment settings
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [minPayoutThreshold, setMinPayoutThreshold] = useState<number>(50);
  const [autoHoldDisputes, setAutoHoldDisputes] = useState<boolean>(true);

  // Sync rate input if commissionRate changes externally
  useEffect(() => {
    setRateInput(commissionRate.toString());
  }, [commissionRate]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsed = parseFloat(rateInput);
    if (isNaN(parsed)) {
      setErrorMessage('Please enter a valid numeric percentage.');
      return;
    }

    if (parsed < 0 || parsed > 100) {
      setErrorMessage('Percentage must be between 0% and 100%.');
      return;
    }

    setErrorMessage(null);
    setCommissionRate(parsed);
    localStorage.setItem(STORAGE_KEY, parsed.toString());

    // Update timestamp
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(`Today at ${formatted}`);

    setIsSaved(true);
    if (onSaveSuccess) {
      onSaveSuccess(parsed);
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handlePresetClick = (preset: number) => {
    setRateInput(preset.toString());
    setErrorMessage(null);
  };

  // Live calculation based on current input rate
  const activeRate = !isNaN(parseFloat(rateInput)) ? Math.max(0, Math.min(100, parseFloat(rateInput))) : commissionRate;
  const calculatedPlatformFee = ((sampleAmount * activeRate) / 100).toFixed(2);
  const calculatedVendorPayout = (sampleAmount - (sampleAmount * activeRate) / 100).toFixed(2);

  return (
    <div id="admin-payment-tab" className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header with Breadcrumb & Quick Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>URSPOT Super Admin</span>
            <span>›</span>
            <span className="text-slate-700 font-semibold">Payment</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Payment Configuration</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              {commissionRate}% Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage marketplace transaction commission rate, payment gateway parameters, and vendor disbursement fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-medium">Gateway Status:</span>
            <strong className="text-slate-800 font-bold">Stripe Connect Online</strong>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Platform payment percentage updated to <strong>{commissionRate}%</strong> successfully. All future bookings will use this rate.</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">{lastSavedTime}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex items-center gap-2.5 text-rose-900 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}



      {/* 3. Primary Payment Percentage Input & Save Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Input Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Platform Payment Fee Percentage
                </h2>
                <p className="text-xs text-slate-500">
                  Set the percentage deducted from completed customer bookings.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-medium text-slate-400">
              Last saved: <strong className="text-slate-700">{lastSavedTime}</strong>
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Input Field Section */}
            <div className="space-y-2">
              <label htmlFor="payment-percentage-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Payment Commission Rate (%)
              </label>

              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Percent className="w-4 h-4" />
                </div>
                <input
                  id="payment-percentage-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={rateInput}
                  onChange={(e) => {
                    setRateInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. 10.0"
                  className="w-full pl-10 pr-14 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-2xs"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">
                    %
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the percentage fee to collect from each transaction. For example, entering <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-bold">10</code> means 10% platform fee and 90% payout to the business owner.
              </p>
            </div>

            {/* Quick Percentage Presets */}
            <div className="space-y-2 pt-1">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Presets
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[5, 7.5, 10, 12.5, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      parseFloat(rateInput) === preset
                        ? 'bg-slate-900 text-white shadow-xs scale-102'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Schedule & Hold Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vendor Payout Frequency
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="daily">Daily Automated Payouts</option>
                  <option value="weekly">Weekly Automated Payouts (Every Monday)</option>
                  <option value="biweekly">Bi-Weekly Automated Payouts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Payout Threshold ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={minPayoutThreshold}
                    onChange={(e) => setMinPayoutThreshold(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Auto Hold Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Auto-Hold On Customer Dispute</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically freeze payout release for reservations with active chargebacks or disputes.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoHoldDisputes}
                onClick={() => setAutoHoldDisputes(!autoHoldDisputes)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoHoldDisputes ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoHoldDisputes ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Action Row with Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRateInput(DEFAULT_RATE.toString());
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Reset to Default (10%)
              </button>

              <button
                id="btn-save-payment-settings"
                type="submit"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black hover:bg-slate-800 text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Interactive Live Fee Simulator & Policy */}
        <div className="space-y-6">
          {/* Live Simulator Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Live Fee Simulator
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Test how the configured percentage impacts booking fees in real time.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Sample Booking Total ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={sampleAmount}
                  onChange={(e) => setSampleAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono shadow-2xs"
                />
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Customer Pays</span>
                <strong className="text-slate-900 font-mono">${sampleAmount.toFixed(2)}</strong>
              </div>

              <div className="flex items-center justify-between text-xs text-blue-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Percent className="w-3 h-3" /> Platform Fee ({activeRate}%)
                </span>
                <strong className="font-mono">+${calculatedPlatformFee}</strong>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-bold">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Vendor Receives
                </span>
                <strong className="font-mono text-sm font-black text-emerald-700">
                  ${calculatedVendorPayout}
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
              <strong className="text-blue-900 block mb-0.5">Automated Ledger Accounting:</strong>
              UrSpot collects the customer payment via Stripe Connect and automatically deposits the net payout of {100 - activeRate}% into the vendor's verified bank account.
            </div>
          </div>

          {/* Payment Gateways Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-slate-600" />
              Connected Gateways
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                    S
                  </div>
                  <span className="font-bold text-slate-800">Stripe Connect</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-black text-[10px]">
                    P
                  </div>
                  <span className="font-bold text-slate-800">Plaid eKYC & ACH</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentTab;
