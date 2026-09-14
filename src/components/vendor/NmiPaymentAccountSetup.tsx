import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  AlertCircle,
  User,
  X,
} from 'lucide-react';
import { NmiPaymentAccountData } from '../../types';

interface NmiPaymentAccountSetupProps {
  businessId?: string;
  initialData?: Partial<NmiPaymentAccountData>;
  allowSkip?: boolean;
  onSuccess?: (account: NmiPaymentAccountData) => void;
  onSkip?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

type StepState = 'form' | 'processing' | 'success';

export const NmiPaymentAccountSetup: React.FC<NmiPaymentAccountSetupProps> = ({
  businessId = 'biz-001',
  initialData,
  allowSkip = true,
  onSuccess,
  onSkip,
  onCancel,
  isModal = false,
}) => {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || 'The Nexus Workspace & Lab',
    federalTaxId: initialData?.federalTaxId || '12-3456789',
    firstName: initialData?.firstName || 'Alex',
    lastName: initialData?.lastName || 'Vance',
    email: initialData?.email || 'alex.vance@uspot.com',
    bankRoutingNumber: initialData?.bankRoutingNumber || '',
    bankAccountNumber: initialData?.bankAccountNumber || '',
    accountType: (initialData?.accountType || 'checking') as 'checking' | 'savings',
    accountHolderType: (initialData?.accountHolderType || 'business') as 'business' | 'individual',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<StepState>('form');
  const [processingIndex, setProcessingIndex] = useState(0);
  const [generatedGatewayId, setGeneratedGatewayId] = useState<string>('');

  const processingStages = [
    { title: 'Creating payment account...', desc: 'Registering entity with NMI Gateway network' },
    { title: 'Verifying business information...', desc: 'Validating legal entity name & federal tax ID' },
    { title: 'Setting up bank account...', desc: 'Configuring ACH settlement routing protocols' },
    { title: 'Activating payment account...', desc: 'Enabling direct balance disbursements' },
  ];

  const isAlreadyActive = initialData?.nmiOnboardingStatus === 'ACTIVE' && initialData?.nmiGatewayId;

  const handleFillSandboxData = () => {
    setFormData({
      companyName: initialData?.companyName || 'Nexus Operations LLC',
      federalTaxId: '12-3456789',
      firstName: 'Alex',
      lastName: 'Vance',
      email: initialData?.email || 'alex.vance@uspot.com',
      bankRoutingNumber: '125000024',
      bankAccountNumber: '987654321',
      accountType: 'checking',
      accountHolderType: 'business',
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errs.companyName = 'Company Legal Name is required';
    }
    if (!formData.federalTaxId.trim()) {
      errs.federalTaxId = 'Federal Tax ID / EIN is required';
    }
    if (!formData.firstName.trim()) {
      errs.firstName = 'First Name is required';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = 'Last Name is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid business email is required';
    }

    const cleanRouting = formData.bankRoutingNumber.replace(/\D/g, '');
    if (!cleanRouting) {
      errs.bankRoutingNumber = 'Routing number is required';
    } else if (cleanRouting.length !== 9) {
      errs.bankRoutingNumber = 'Routing number must be exactly 9 digits';
    }

    const cleanAccount = formData.bankAccountNumber.replace(/\D/g, '');
    if (!cleanAccount) {
      errs.bankAccountNumber = 'Account number is required';
    } else if (cleanAccount.length < 4) {
      errs.bankAccountNumber = 'Account number is too short';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setCurrentStep('processing');
    setProcessingIndex(0);

    const gatewayId = `NMI-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setGeneratedGatewayId(gatewayId);

    const stepDuration = 600;
    processingStages.forEach((_, idx) => {
      setTimeout(() => {
        setProcessingIndex(idx);
      }, idx * stepDuration);
    });

    setTimeout(() => {
      setCurrentStep('success');
      const accountData: NmiPaymentAccountData = {
        vendorId: businessId,
        nmiOnboardingStatus: 'ACTIVE',
        nmiGatewayId: gatewayId,
        companyName: formData.companyName,
        federalTaxId: formData.federalTaxId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bankRoutingNumber: formData.bankRoutingNumber,
        bankAccountNumber: formData.bankAccountNumber,
        accountType: formData.accountType,
        accountHolderType: formData.accountHolderType,
        activatedAt: new Date().toISOString(),
      };
      if (onSuccess) {
        onSuccess(accountData);
      }
    }, processingStages.length * stepDuration + 300);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className={`w-full ${isModal ? '' : 'max-w-3xl mx-auto'}`}>
      {/* PROCESSING STATE */}
      {currentStep === 'processing' && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl text-center animate-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-5 shadow-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-1.5">
            Configuring NMI Sub-Account
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-8">
            Establishing direct merchant settlement relationship with the NMI Payment Gateway network.
          </p>

          <div className="max-w-md mx-auto space-y-3 text-left">
            {processingStages.map((stage, idx) => {
              const isCompleted = processingIndex > idx;
              const isCurrent = processingIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-slate-50 border-slate-300 shadow-2xs'
                      : 'bg-white border-slate-100 opacity-40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in-50 duration-150" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-slate-900 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCompleted
                          ? 'text-emerald-900'
                          : isCurrent
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {stage.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {currentStep === 'success' && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl text-center animate-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            NMI Sub-Account Active
          </span>

          <h3 className="text-xl font-black text-slate-900 mb-1">
            Payment Account Connected!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Your vendor settlement sub-account is configured. Payout requests and automated ACH bank transfers are fully active.
          </p>

          {/* Account Credential Card */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-2.5 mb-6 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Gateway ID
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {generatedGatewayId || initialData?.nmiGatewayId || 'NMI-ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Merchant Entity:</span>
              <span className="font-bold text-slate-900">{formData.companyName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Settlement Bank:</span>
              <span className="font-mono font-medium text-slate-900">
                Routing: ••••{formData.bankRoutingNumber.slice(-4)} | Acc: ••••{formData.bankAccountNumber.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Settlement Protocol:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Direct ACH Transfer
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
            }}
            className="w-full max-w-md mx-auto py-3 px-6 rounded-xl font-bold text-xs text-white bg-black hover:bg-slate-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Dashboard / Withdrawals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FORM STATE */}
      {currentStep === 'form' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between bg-white">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Payment Account Setup
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    NMI Sub-Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  Set up your payment account now to receive payouts. You can also skip this step and complete it later when you request a withdrawal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Sandbox Test Data Helper Button */}
              <button
                type="button"
                onClick={handleFillSandboxData}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                <span>Fill Sandbox Test Data</span>
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isAlreadyActive && (
            <div className="mx-6 sm:mx-7 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Payment Account Currently Connected
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Gateway ID: <span className="font-mono font-bold">{initialData?.nmiGatewayId}</span> • Direct ACH payouts active.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Updating will modify linked settlement details</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
            {/* Section 1: Business Identification */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Business Legal Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Company Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Nexus Operations LLC"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.companyName
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Federal Tax ID (EIN / SSN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.federalTaxId}
                    onChange={(e) => setFormData({ ...formData, federalTaxId: e.target.value })}
                    placeholder="XX-XXXXXXX"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.federalTaxId
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.federalTaxId && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.federalTaxId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Authorized Representative */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Authorized Signer / Representative
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Alex"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.firstName
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Vance"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.lastName
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex.vance@uspot.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.email
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Settlement Bank Account */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Direct Settlement Bank Account
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-bit Encrypted ACH Routing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Bank Routing Number (ABA - 9 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    value={formData.bankRoutingNumber}
                    onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="125000024"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.bankRoutingNumber
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.bankRoutingNumber ? (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.bankRoutingNumber}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Test Sandbox Routing: 125000024</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="987654321"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition placeholder:text-slate-400 placeholder:font-normal ${
                      errors.bankAccountNumber
                        ? 'border-red-300 ring-1 ring-red-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {errors.bankAccountNumber ? (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.bankAccountNumber}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Test Sandbox Acc: 987654321</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'checking' | 'savings' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                  >
                    <option value="checking">Checking Account (Recommended)</option>
                    <option value="savings">Savings Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Account Holder Type
                  </label>
                  <select
                    value={formData.accountHolderType}
                    onChange={(e) =>
                      setFormData({ ...formData, accountHolderType: e.target.value as 'business' | 'individual' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                  >
                    <option value="business">Business Entity</option>
                    <option value="individual">Sole Proprietor / Individual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compliance & Security Callout */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 mb-0.5">
                  NMI Verified Merchant Sub-Account Integration
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Funds from customer bookings are settled directly into this account via the NMI Payment Gateway. All routing data is processed in full compliance with NACHA and PCI-DSS Level 1 standards.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div>
                {allowSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Skip for Now
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Connect Payment Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
