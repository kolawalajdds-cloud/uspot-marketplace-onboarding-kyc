import React, { useState, useEffect } from 'react';
import { PlanTier } from '../../types';
import {
  Check,
  CreditCard,
  Lock,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface PaymentModalProps {
  businessId: string;
  businessName: string;
  initialPlan?: PlanTier;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: PlanTier, amount: number) => Promise<void>;
}

const PLANS: {
  tier: PlanTier;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  features: string[];
}[] = [
  {
    tier: 'Starter',
    name: 'Starter Tier',
    price: 29,
    period: '/month',
    features: [
      'Standard marketplace listing',
      'Basic calendar availability sync',
      'Standard KYC compliance processing',
      'Email support (24-48h SLA)',
      'Up to 10 photos in image gallery',
    ],
  },
  {
    tier: 'Pro',
    name: 'Pro Marketplace',
    price: 79,
    period: '/month',
    popular: true,
    features: [
      'Priority localized search boost',
      'Fast-track 24h KYC processing queue',
      'Instant direct booking messaging',
      'Dynamic automated sales tax & invoicing',
      'Full 20-photo HD visual showcase',
      'Dedicated compliance manager liaison',
    ],
  },
  {
    tier: 'Premium',
    name: 'Enterprise VIP',
    price: 149,
    period: '/month',
    features: [
      'Prime top-rank featured placement',
      'Same-day priority KYC escalation queue',
      '0% platform surcharge on booking checkout',
      'Custom white-label marketplace embed widget',
      'Multi-admin staff role management',
      '24/7 dedicated phone & Slack VIP desk',
    ],
  },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  businessName,
  initialPlan = 'Pro',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardholderName, setCardholderName] = useState(businessName || 'Business Owner');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalStep, setModalStep] = useState<'select_plan' | 'confirm_plan' | 'success'>('select_plan');

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(initialPlan);
      setModalStep('select_plan');
      setIsProcessing(false);
      setCardholderName(businessName || 'Business Owner');
    }
  }, [isOpen, initialPlan, businessName]);

  if (!isOpen) return null;

  const currentPlan = PLANS.find((p) => p.tier === selectedPlan) || PLANS[1];

  const handlePayAndContinue = async () => {
    setIsProcessing(true);
    try {
      await onSuccess(selectedPlan, currentPlan.price);
      setIsProcessing(false);
      setModalStep('success');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="payment-modal-card"
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-600 text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {modalStep === 'select_plan' && 'Select Subscription Plan & Payment'}
                {modalStep === 'confirm_plan' && 'Confirm Subscription Plan'}
                {modalStep === 'success' && 'Subscription Confirmed!'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {modalStep === 'select_plan' && (
                <>Choose a marketplace subscription tier for <strong className="text-slate-800">{businessName}</strong>.</>
              )}
              {modalStep === 'confirm_plan' && (
                <>Please review and confirm your chosen plan details before activating <strong className="text-slate-800">{businessName}</strong>.</>
              )}
              {modalStep === 'success' && (
                <>Your subscription has been activated successfully and your business is now Live.</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: SELECT PLAN */}
          {modalStep === 'select_plan' && (
            <>
              {/* Plan Cards */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  1. Choose Subscription Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.tier;
                    return (
                      <div
                        key={plan.tier}
                        id={`plan-card-${plan.tier.toLowerCase()}`}
                        onClick={() => !isProcessing && setSelectedPlan(plan.tier)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/30 shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                            Recommended
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">
                              {plan.name}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="mt-2 mb-3">
                            <span className="text-2xl font-black text-slate-900">
                              ${plan.price}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {plan.period}
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-[11px] text-slate-600">
                            {plan.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Form */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    2. Payment Method (Credit / Debit Card)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    256-bit SSL Encryption
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        disabled={isProcessing}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          disabled={isProcessing}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-mono"
                          placeholder="4242 4242 4242 4242"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        disabled={isProcessing}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-mono"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        CVC Code
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        disabled={isProcessing}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-mono"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: CONFIRMATION STEP */}
          {modalStep === 'confirm_plan' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Attention / Confirmation prompt banner */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    Please Confirm Your Plan Selection
                  </h3>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Review the subscription details below. Once confirmed, payment will be processed and your business will be immediately activated and live.
                  </p>
                </div>
              </div>

              {/* Order / Subscription Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subscription Summary
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-full">
                    {currentPlan.tier} Tier
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Target Business</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{businessName}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      KYC Approved
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Selected Plan</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{currentPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">${currentPlan.price}.00</span>
                      <span className="text-xs text-slate-500 font-medium"> / month</span>
                    </div>
                  </div>

                  <div className="py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Key Included Features</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentPlan.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Billed to card ending in <strong className="text-slate-800">4242</strong></span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Billed recurring monthly</span>
                  </div>
                </div>
              </div>

              {/* Explicit Confirmation Question */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Are you sure you want to subscribe <strong>{businessName}</strong> to the <strong>{currentPlan.name}</strong> for <strong>${currentPlan.price}/month</strong>?
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMED */}
          {modalStep === 'success' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Subscription Confirmed & Activated!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Payment for the <strong className="text-slate-800">{currentPlan.name}</strong> plan (${currentPlan.price}/month) has been processed successfully.
                </p>
              </div>

              <div className="max-w-sm mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Business:</span>
                  <strong className="text-slate-800">{businessName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <strong className="text-indigo-600">{currentPlan.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <strong className="text-emerald-600 font-bold">Active & Live on Marketplace</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <strong className="text-slate-900">${currentPlan.price}.00 / mo</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {modalStep === 'select_plan' && (
            <>
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Selected: <strong className="text-slate-900 text-sm font-bold">{currentPlan.name}</strong> (${currentPlan.price}.00/mo)
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="proceed-to-confirmation-btn"
                  onClick={() => setModalStep('confirm_plan')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Select & Confirm Plan (${currentPlan.price})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {modalStep === 'confirm_plan' && (
            <>
              <button
                type="button"
                onClick={() => setModalStep('select_plan')}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Plan</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-pay-btn"
                  onClick={handlePayAndContinue}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing Payment & Activating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Yes, Confirm & Pay (${currentPlan.price})</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {modalStep === 'success' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                id="payment-done-btn"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Done & View Business
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
