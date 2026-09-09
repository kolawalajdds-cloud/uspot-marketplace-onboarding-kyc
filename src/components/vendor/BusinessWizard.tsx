import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { StatusBadge, RiskTierBadge } from '../StatusBadge';
import { PaymentModal } from './PaymentModal';
import {
  LegalEntityType,
  PlanTier,
  FeeType,
} from '../../types';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  FileCheck,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MapPin,
  Percent,
  Plus,
  Rocket,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  UploadCloud,
  SlidersHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';

const WIZARD_TABS = [
  { id: 'Core Details', label: 'Core Details', icon: Building2 },
  { id: 'Operating Hours', label: 'Operating Hours', icon: Clock },
  { id: 'Image Gallery', label: 'Image Gallery', icon: Camera },
  { id: 'Amenities', label: 'Amenities', icon: Sparkles },
  { id: 'Holidays & Rules', label: 'Holidays & Rules', icon: Calendar },
  { id: 'Fees & Tax', label: 'Fees & Tax', icon: Percent },
  { id: 'Verification', label: 'Verification (KYC/KYB)', icon: ShieldCheck },
] as const;

export const BusinessWizard: React.FC = () => {
  const {
    state,
    activeBusiness: biz,
    setVendorView,
    setWizardTab,
    updateCoreDetails,
    updateOperatingHours,
    applyMondayHoursToAll,
    addImage,
    removeImage,
    setCoverImage,
    toggleAmenity,
    addCustomAmenity,
    updateHolidaysRules,
    addHolidayClosure,
    removeHolidayClosure,
    updateFeesTax,
    addServiceFee,
    removeServiceFee,
    updateVerification,
    simulateTinVerification,
    simulateStateRegistryCheck,
    simulateBeneficialOwnerUpload,
    simulateSanctionsCheck,
    simulateBankVerification,
    submitForKycReview,
    resubmitKyc,
    processPayment,
    publishAndGoLive,
    prefillWizardWithDummyData,
  } = useDemo();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Loading states for simulated verify buttons
  const [loadingTin, setLoadingTin] = useState(false);
  const [loadingStateRegistry, setLoadingStateRegistry] = useState(false);
  const [loadingSanctions, setLoadingSanctions] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  // Simulation controls for demo branches
  const [tinSimulateMode, setTinSimulateMode] = useState<'Matched' | 'Mismatch'>('Matched');
  const [bankSimulateMode, setBankSimulateMode] = useState<'success' | 'fail'>('success');
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Custom amenity input state
  const [showAddAmenity, setShowAddAmenity] = useState<string | null>(null);
  const [customAmenityName, setCustomAmenityName] = useState('');
  const [customAmenityDesc, setCustomAmenityDesc] = useState('');

  // Holiday closure form state
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('2026-12-25');
  const [newHolidayFullDay, setNewHolidayFullDay] = useState(true);

  // Service fee form state
  const [showAddFee, setShowAddFee] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeType, setNewFeeType] = useState<FeeType>('Fixed');
  const [newFeeAmount, setNewFeeAmount] = useState(25);

  if (!biz) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
        <p className="text-neutral-500 text-sm">No business selected.</p>
        <button
          onClick={() => setVendorView('list')}
          className="mt-3 px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 rounded-lg hover:bg-neutral-200"
        >
          Return to My Businesses
        </button>
      </div>
    );
  }

  const currentTab = state.wizardTab;

  // Verification readiness checks
  const v = biz.verification;

  // Exact REQUIRED fields check
  const hasReqEntityType = Boolean(v.legalEntityType);
  const hasReqEin = Boolean((v.einVerification.einEntered || biz.feesTax.businessTaxId || '').trim());
  const hasReqSosDoc = Boolean(v.entityRegistration.documentUploaded);
  const hasReqFullName = Boolean((v.beneficialOwner.fullName || '').trim());
  const hasReqDob = Boolean((v.beneficialOwner.dateOfBirth || '').trim());
  const hasReqSsn = Boolean((v.beneficialOwner.ssnLast4 || '').trim());
  const hasReqGovId = Boolean(v.beneficialOwner.govIdUploaded);
  const hasReqSelfie = Boolean(v.beneficialOwner.selfieUploaded);
  const hasReqBankHolder = Boolean((v.bankAccount.accountHolderName || biz.coreDetails.legalEntityName || '').trim());
  const hasReqRouting = Boolean((v.bankAccount.routingNumber || '').trim());
  const hasReqAccountNum = Boolean((v.bankAccount.accountNumberMasked || '').trim());

  const allRequiredFieldsFilled =
    hasReqEntityType &&
    hasReqEin &&
    hasReqSosDoc &&
    hasReqFullName &&
    hasReqDob &&
    hasReqSsn &&
    hasReqGovId &&
    hasReqSelfie &&
    hasReqBankHolder &&
    hasReqRouting &&
    hasReqAccountNum;

  // 6 Sections success/complete states
  const isSectionASuccess = hasReqEntityType;

  const isTinMatched = v.einVerification.tinMatchStatus === 'Matched';
  const isTinMismatch = v.einVerification.tinMatchStatus === 'Mismatch';
  const isSectionBSuccess =
    hasReqEin &&
    (isTinMatched || (isTinMismatch && Boolean(v.einVerification.cp575DocUploaded)));

  const isStateActive = v.entityRegistration.stateRegistryStatus === 'Active/Good Standing';
  const isSectionCSuccess = hasReqSosDoc && isStateActive;

  const isGovIdDone = Boolean(v.beneficialOwner.govIdUploaded);
  const isSelfieDone = Boolean(v.beneficialOwner.selfieUploaded);
  const isSectionDSuccess =
    hasReqFullName &&
    hasReqDob &&
    hasReqSsn &&
    isGovIdDone &&
    isSelfieDone;

  const isSanctionsClear = v.sanctionsScreening.status === 'Clear';
  const isSectionESuccess = isSanctionsClear;

  const isBankVerified = Boolean(v.bankAccount.verified);
  const isBankFailed = Boolean(v.bankAccount.verificationFailed);
  const isSectionFSuccess =
    hasReqBankHolder &&
    hasReqRouting &&
    hasReqAccountNum &&
    (isBankVerified || (isBankFailed && Boolean(v.bankAccount.voidedCheckUploaded)) || Boolean(v.bankAccount.voidedCheckUploaded));

  const allSixSectionsSuccess =
    isSectionASuccess &&
    isSectionBSuccess &&
    isSectionCSuccess &&
    isSectionDSuccess &&
    isSectionESuccess &&
    isSectionFSuccess;

  // Submit button enabled condition
  const canSubmitKyc = allRequiredFieldsFilled && allSixSectionsSuccess;

  // Handlers for simulated delay verifications
  const handleVerifyTin = async () => {
    setLoadingTin(true);
    await simulateTinVerification(biz.id, tinSimulateMode);
    setLoadingTin(false);
  };

  const handleVerifyStateRegistry = async () => {
    setLoadingStateRegistry(true);
    await simulateStateRegistryCheck(
      biz.id,
      `${biz.coreDetails.state || 'State'}_Articles_Of_Incorporation_Verified.pdf`
    );
    setLoadingStateRegistry(false);
  };

  const handleVerifySanctions = async () => {
    setLoadingSanctions(true);
    await simulateSanctionsCheck(biz.id);
    setLoadingSanctions(false);
  };

  const handleVerifyBank = async () => {
    setLoadingBank(true);
    await simulateBankVerification(biz.id, bankSimulateMode === 'fail');
    setLoadingBank(false);
  };

  const handleCreateCustomAmenity = (cat: 'General & Comfort' | 'Tech & Workspace' | 'Accessibility') => {
    if (!customAmenityName.trim()) return;
    addCustomAmenity(biz.id, cat, customAmenityName.trim(), customAmenityDesc.trim() || 'Custom space amenity');
    setCustomAmenityName('');
    setCustomAmenityDesc('');
    setShowAddAmenity(null);
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;
    addHolidayClosure(biz.id, {
      name: newHolidayName.trim(),
      date: newHolidayDate,
      fullDayClosure: newHolidayFullDay,
    });
    setNewHolidayName('');
    setShowAddHoliday(false);
  };

  const handleCreateFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeName.trim()) return;
    addServiceFee(biz.id, {
      name: newFeeName.trim(),
      type: newFeeType,
      amount: Number(newFeeAmount) || 0,
    });
    setNewFeeName('');
    setShowAddFee(false);
  };

  return (
    <div id="business-wizard-view" className="space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation & Status Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="back-to-businesses-list-btn"
            onClick={() => setVendorView('list')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Back to My Spaces"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to My Spaces</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                {biz.coreDetails.businessName || 'New Business Onboarding'}
              </h1>
              <StatusBadge status={biz.status} size="sm" />
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{biz.coreDetails.legalEntityName || 'Entity unassigned'}</span>
              <span>•</span>
              <span>Plan: {biz.payment.planSelected} (${biz.payment.amount}/mo)</span>
            </div>
          </div>
        </div>

        {/* Action buttons: Quick Fill & Publish Plan */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="prefill-wizard-dummy-data-btn"
            onClick={() => prefillWizardWithDummyData(biz.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Autofill all tabs with realistic dummy data for client walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fill Sample Data</span>
          </button>

          {biz.status === 'Draft' && (
            <button
              id="open-payment-modal-btn"
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Select Plan & Pay</span>
            </button>
          )}

          {biz.status === 'KYC Approved' && (
            <button
              id="go-live-header-btn"
              onClick={() => publishAndGoLive(biz.id)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Publish & Go Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent KYC Approved Go-Live Banner */}
      {biz.status === 'KYC Approved' && (
        <div
          id="kyc-approved-banner"
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                🎉 Your business {biz.coreDetails.businessName} has been approved!
              </h3>
              <p className="text-xs text-white/90">
                You passed all compliance and banking checks. You can now go live on the marketplace.
              </p>
            </div>
          </div>
          <button
            id="banner-publish-go-live-btn"
            onClick={() => publishAndGoLive(biz.id)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white text-emerald-800 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
          >
            <Rocket className="w-4 h-4 text-emerald-600" />
            Publish & Go Live
          </button>
        </div>
      )}

      {/* Rejection alert box if KYC was rejected */}
      {biz.status === 'KYC Rejected' && (
        <div
          id="kyc-rejection-alert"
          className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Verification Rejected by Super-Admin
              </h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {biz.verification.rejectionReason || 'Compliance documentation did not meet guidelines.'}
              </p>
            </div>
          </div>

          <button
            id="resubmit-kyc-btn"
            onClick={() => {
              resubmitKyc(biz.id);
              setWizardTab('Verification');
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Edit & Resubmit Verification
          </button>
        </div>
      )}

      {/* Main Two-Column Layout: Sidebar Nav + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1 lg:sticky lg:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain scrollbar-none">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-2 pt-1">
            Setup Progress
          </div>
          <nav className="space-y-1">
            {WIZARD_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setWizardTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-bold border-l-4 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'Verification' && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        canSubmitKyc ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Plan Info box in sidebar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Plan
              </div>
              <div className="text-sm font-bold text-slate-800">
                {biz.payment.planSelected} Tier (${biz.payment.amount}/mo)
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    biz.payment.paidAt ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
                <span>{biz.payment.paidAt ? 'Subscription Active' : 'Payment Pending'}</span>
              </div>
              {biz.status === 'Draft' && (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="w-full mt-2 py-1.5 text-center text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Upgrade / Pay
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Body Card */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
          {/* TAB 1: CORE DETAILS */}
          {currentTab === 'Core Details' && (
            <div id="tab-core-details" className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Core Details & Venue Location
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  General venue profile, marketplace identity, and physical street address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Business Display Name
                  </label>
                  <input
                    type="text"
                    value={biz.coreDetails.businessName}
                    onChange={(e) => updateCoreDetails(biz.id, { businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    placeholder="e.g. Apex Collaborative Loft"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Legal Entity Name (Registered)
                  </label>
                  <input
                    type="text"
                    value={biz.coreDetails.legalEntityName}
                    onChange={(e) => updateCoreDetails(biz.id, { legalEntityName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    placeholder="e.g. Apex Operations Group LLC"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Marketplace Category
                  </label>
                  <select
                    value={biz.coreDetails.category}
                    onChange={(e) => updateCoreDetails(biz.id, { category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white text-slate-800"
                  >
                    <option value="Coworking & Event Venue">Coworking & Event Venue</option>
                    <option value="Production & Photography Studio">Production & Photography Studio</option>
                    <option value="Executive Boardroom & Suites">Executive Boardroom & Suites</option>
                    <option value="Hardware Prototyping & Maker Space">Hardware Prototyping & Maker Space</option>
                    <option value="Rooftop Terrace & Event Space">Rooftop Terrace & Event Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={biz.coreDetails.streetAddress}
                    onChange={(e) => updateCoreDetails(biz.id, { streetAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    placeholder="123 Market St, Suite 400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={biz.coreDetails.city}
                      onChange={(e) => updateCoreDetails(biz.id, { city: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      placeholder="Austin"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={biz.coreDetails.state}
                      onChange={(e) => updateCoreDetails(biz.id, { state: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={biz.coreDetails.zipCode}
                      onChange={(e) => updateCoreDetails(biz.id, { zipCode: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      placeholder="78701"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Public Listing Description
                  </label>
                  <textarea
                    rows={3}
                    value={biz.coreDetails.description}
                    onChange={(e) => updateCoreDetails(biz.id, { description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    placeholder="Describe key venue features, amenities, access directions, and parking..."
                  />
                </div>
              </div>

              {/* Map Preview Placeholder Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Location Coordinates & Map Preview
                </label>
                <div
                  id="static-map-preview-box"
                  className="relative h-44 w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundImage:
                      'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#e2e8f0 1px, #f8fafc 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Pin card in center */}
                  <div className="relative z-10 flex flex-col items-center p-3 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs animate-bounce">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-1">
                      {biz.coreDetails.streetAddress || 'Address Pin'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {biz.coreDetails.city ? `${biz.coreDetails.city}, ${biz.coreDetails.state} ${biz.coreDetails.zipCode}` : 'Lat: 37.7749°, Lon: -122.4194°'}
                    </span>
                  </div>

                  <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                    USPOT Geospatial Geocoding Preview
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Operating Hours')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Operating Hours</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATING HOURS */}
          {currentTab === 'Operating Hours' && (
            <div id="tab-operating-hours" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Operating Hours & Weekly Availability
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define operational open/close hours for guests and bookings.
                  </p>
                </div>

                <button
                  id="apply-monday-to-all-days-btn"
                  onClick={() => applyMondayHoursToAll(biz.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  title="Copies Monday hours to Tuesday through Friday"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Apply Monday hours to Tue-Fri</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {biz.operatingHours.map((dayItem, index) => (
                  <div
                    key={dayItem.day}
                    className="p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-36">
                      <input
                        type="checkbox"
                        checked={dayItem.isOpen}
                        onChange={(e) => {
                          const updated = [...biz.operatingHours];
                          updated[index] = { ...dayItem, isOpen: e.target.checked };
                          updateOperatingHours(biz.id, updated);
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        {dayItem.day}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {dayItem.isOpen ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dayItem.openTime}
                            onChange={(e) => {
                              const updated = [...biz.operatingHours];
                              updated[index] = { ...dayItem, openTime: e.target.value };
                              updateOperatingHours(biz.id, updated);
                            }}
                            className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-600"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={dayItem.closeTime}
                            onChange={(e) => {
                              const updated = [...biz.operatingHours];
                              updated[index] = { ...dayItem, closeTime: e.target.value };
                              updateOperatingHours(biz.id, updated);
                            }}
                            className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md">
                          Closed all day
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Core Details')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardTab('Image Gallery')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Image Gallery</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE GALLERY */}
          {currentTab === 'Image Gallery' && (
            <div id="tab-image-gallery" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Image Gallery ({biz.imageGallery.length}/20)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add visual showcase photography for marketplace visitors. First tile is flagged as Cover.
                  </p>
                </div>

                <button
                  id="browse-files-btn"
                  onClick={() => addImage(biz.id)}
                  disabled={biz.imageGallery.length >= 20}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo Slot</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                id="gallery-upload-dropzone"
                onClick={() => addImage(biz.id)}
                className="p-6 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  Click or drag files here to add photography
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Simulated photo upload • JPEG/PNG supported (Max 20 images)
                </div>
              </div>

              {/* Grid of images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {biz.imageGallery.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex flex-col justify-between h-36 p-2.5 shadow-xs"
                    style={{
                      background: `linear-gradient(135deg, ${img.color}dd, ${img.color}88)`,
                    }}
                  >
                    <div className="flex items-center justify-between z-10">
                      {img.isCover ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-slate-900 text-white shadow-xs">
                          COVER
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage(biz.id, img.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-slate-800 hover:bg-white transition-opacity cursor-pointer"
                        >
                          Make Cover
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(biz.id, img.id);
                        }}
                        className="p-1 rounded bg-slate-900/50 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="z-10 bg-slate-900/70 backdrop-blur-xs p-1.5 rounded-md text-white">
                      <div className="text-[11px] font-bold truncate">{img.label}</div>
                      <div className="text-[9px] text-slate-300">Slot #{idx + 1}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Operating Hours')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardTab('Amenities')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Amenities</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AMENITIES */}
          {currentTab === 'Amenities' && (
            <div id="tab-amenities" className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Amenities & Facilities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select available equipment, comfort perks, and accessibility features. You can also add custom amenities.
                </p>
              </div>

              <div className="space-y-6">
                {biz.amenities.map((categoryGroup) => (
                  <div key={categoryGroup.category} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {categoryGroup.category}
                      </h3>
                      <button
                        onClick={() =>
                          setShowAddAmenity(
                            showAddAmenity === categoryGroup.category
                              ? null
                              : categoryGroup.category
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom</span>
                      </button>
                    </div>

                    {/* Add custom amenity inline form */}
                    {showAddAmenity === categoryGroup.category && (
                      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customAmenityName}
                            onChange={(e) => setCustomAmenityName(e.target.value)}
                            placeholder="Amenity Name (e.g. 3D Printer)"
                            className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                          />
                          <input
                            type="text"
                            value={customAmenityDesc}
                            onChange={(e) => setCustomAmenityDesc(e.target.value)}
                            placeholder="Brief description"
                            className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowAddAmenity(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleCreateCustomAmenity(
                                categoryGroup.category as any
                              )
                            }
                            className="px-3 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md cursor-pointer"
                          >
                            Add Amenity
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categoryGroup.items.map((item) => (
                        <label
                          key={item.name}
                          className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                            item.checked
                              ? 'border-indigo-600 bg-indigo-50/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() =>
                              toggleAmenity(biz.id, categoryGroup.category, item.name)
                            }
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {item.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Image Gallery')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardTab('Holidays & Rules')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Holidays & Rules</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: HOLIDAYS & RULES */}
          {currentTab === 'Holidays & Rules' && (
            <div id="tab-holidays-rules" className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Holidays & Business Rules
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure holiday blackout schedules and on-premise policies.
                </p>
              </div>

              {/* Business Rules Section */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  On-Premise Policies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Guest Capacity
                    </label>
                    <input
                      type="number"
                      value={biz.holidaysRules.businessRules.maxCapacity}
                      onChange={(e) =>
                        updateHolidaysRules(biz.id, {
                          businessRules: {
                            ...biz.holidaysRules.businessRules,
                            maxCapacity: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age Requirement
                    </label>
                    <input
                      type="text"
                      value={biz.holidaysRules.businessRules.ageRequirement}
                      onChange={(e) =>
                        updateHolidaysRules(biz.id, {
                          businessRules: {
                            ...biz.holidaysRules.businessRules,
                            ageRequirement: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                      placeholder="e.g. 18+ or All ages"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biz.holidaysRules.businessRules.petFriendly}
                      onChange={(e) =>
                        updateHolidaysRules(biz.id, {
                          businessRules: {
                            ...biz.holidaysRules.businessRules,
                            petFriendly: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Pet Friendly Venue
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biz.holidaysRules.businessRules.byobAllowed}
                      onChange={(e) =>
                        updateHolidaysRules(biz.id, {
                          businessRules: {
                            ...biz.holidaysRules.businessRules,
                            byobAllowed: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      BYOB Allowed (Beverages)
                    </span>
                  </label>
                </div>
              </div>

              {/* Holiday Closures Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Holiday Closures & Blackouts
                  </h3>
                  <button
                    onClick={() => setShowAddHoliday(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Holiday</span>
                  </button>
                </div>

                {showAddHoliday && (
                  <form
                    onSubmit={handleCreateHoliday}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newHolidayName}
                        onChange={(e) => setNewHolidayName(e.target.value)}
                        placeholder="Holiday Name (e.g. Labor Day)"
                        required
                        className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                      />
                      <input
                        type="date"
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                        required
                        className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={newHolidayFullDay}
                          onChange={(e) => setNewHolidayFullDay(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Full Day Closure
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddHoliday(false)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {biz.holidaysRules.holidayClosures.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            {holiday.name}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-2">
                            {holiday.date} ({holiday.fullDayClosure ? 'Full Day' : 'Partial'})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeHolidayClosure(biz.id, holiday.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Amenities')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardTab('Fees & Tax')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Fees & Tax</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: FEES & TAX */}
          {currentTab === 'Fees & Tax' && (
            <div id="tab-fees-tax" className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tax Rates, Invoicing & Service Fees
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure merchant financial parameters, automated invoicing, and booking fees.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Tax ID (EIN)
                  </label>
                  <input
                    type="text"
                    value={biz.feesTax.businessTaxId}
                    onChange={(e) => updateFeesTax(biz.id, { businessTaxId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-mono text-slate-800"
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sales Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={biz.feesTax.salesTaxRate}
                    onChange={(e) =>
                      updateFeesTax(biz.id, { salesTaxRate: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                    placeholder="8.25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Settlement Currency
                  </label>
                  <select
                    value={biz.feesTax.currency}
                    onChange={(e) => updateFeesTax(biz.id, { currency: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white text-slate-800"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-0">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biz.feesTax.taxExempt}
                      onChange={(e) => updateFeesTax(biz.id, { taxExempt: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Tax Exempt Organization (501c3)
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biz.feesTax.automaticInvoicing}
                      onChange={(e) =>
                        updateFeesTax(biz.id, { automaticInvoicing: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Automatic Invoicing on Booking Checkout
                    </span>
                  </label>
                </div>
              </div>

              {/* Service Fees */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Custom Booking Surcharges & Fees
                  </h3>
                  <button
                    onClick={() => setShowAddFee(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service Fee</span>
                  </button>
                </div>

                {showAddFee && (
                  <form
                    onSubmit={handleCreateFee}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newFeeName}
                        onChange={(e) => setNewFeeName(e.target.value)}
                        placeholder="Fee Name (e.g. Cleaning)"
                        required
                        className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                      />
                      <select
                        value={newFeeType}
                        onChange={(e) => setNewFeeType(e.target.value as FeeType)}
                        className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                      >
                        <option value="Fixed">Fixed ($)</option>
                        <option value="Percentage">Percentage (%)</option>
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        value={newFeeAmount}
                        onChange={(e) => setNewFeeAmount(Number(e.target.value) || 0)}
                        placeholder="Amount"
                        required
                        className="px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddFee(false)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md cursor-pointer"
                      >
                        Save Fee
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {biz.feesTax.serviceFees.map((fee) => (
                    <div
                      key={fee.id}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900">{fee.name}</span>
                        <span className="text-[11px] text-slate-500 ml-2 font-mono">
                          {fee.type === 'Fixed' ? `$${fee.amount}` : `${fee.amount}%`}
                        </span>
                      </div>
                      <button
                        onClick={() => removeServiceFee(biz.id, fee.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish / Plan Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Marketplace Subscription Tier
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Current plan: <strong>{biz.payment.planSelected}</strong> ($
                    {biz.payment.amount}/mo) •{' '}
                    {biz.payment.paidAt ? 'Paid' : 'Pending Payment'}
                  </div>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  {biz.payment.paidAt ? 'Change Plan' : 'Select Plan & Pay'}
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardTab('Holidays & Rules')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardTab('Verification')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next: Verification (KYC/KYB)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: VERIFICATION (THE STAR OF THE DEMO) */}
          {currentTab === 'Verification' && (
            <div id="tab-verification-kyc" className="space-y-6">
              {/* Header with Risk Tier & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      KYC / KYB Merchant Compliance Verification
                    </h2>
                    <RiskTierBadge tier={v.riskTier} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complete all 6 regulatory sub-checks below to enable submission for Super-Admin review.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-600">
                    <span className="text-rose-500 font-bold">*</span>
                    <span>Required for KYC submission</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDevPanel((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
                      title="Toggle Demo Simulation Controls"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>{showDevPanel ? 'Hide Test Panel' : 'Demo Test Panel'}</span>
                    </button>
                    <div className="text-right">
                      <StatusBadge status={biz.status} size="sm" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Live Demo Environment
                  </span>
                </div>
              </div>

              {/* Collapsible Demo Simulation Panel */}
              {showDevPanel && (
                <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Demo Simulation Controls (Test Fallback Branches)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDevPanel(false)}
                      className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Trigger automated failure states to demo the conditional fallback document uploads:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Section B: TIN Match Outcome</span>
                        <span className="text-[10px] font-mono text-slate-400">{v.einVerification.tinMatchStatus}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setTinSimulateMode('Matched');
                            setLoadingTin(true);
                            await simulateTinVerification(biz.id, 'Matched');
                            setLoadingTin(false);
                          }}
                          className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Simulate Match
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setTinSimulateMode('Mismatch');
                            setLoadingTin(true);
                            await simulateTinVerification(biz.id, 'Mismatch');
                            setLoadingTin(false);
                          }}
                          className="flex-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Simulate Mismatch
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Section F: Bank Verification Outcome</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {v.bankAccount.verified ? 'Verified' : v.bankAccount.verificationFailed ? 'Failed' : 'Unverified'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setBankSimulateMode('success');
                            setLoadingBank(true);
                            await simulateBankVerification(biz.id, false);
                            setLoadingBank(false);
                          }}
                          className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Simulate Pass
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setBankSimulateMode('fail');
                            setLoadingBank(true);
                            await simulateBankVerification(biz.id, true);
                            setLoadingBank(false);
                          }}
                          className="flex-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                        >
                          Simulate Fail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-flow a: Legal Entity Type dropdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                    A
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Legal Entity Structure
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Entity Type <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={v.legalEntityType}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          legalEntityType: e.target.value as LegalEntityType,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="LLC">Limited Liability Company (LLC)</option>
                      <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">General / Limited Partnership</option>
                    </select>
                  </div>
                  <div className="flex items-end text-[11px] text-slate-500 pb-2">
                    Required for IRS form 1099-K reporting and corporate liability underwriting.
                  </div>
                </div>
              </div>

              {/* Sub-flow b: EIN field + "Verify TIN Match" button */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      B
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Employer Identification Number (EIN / TIN Match)
                    </h3>
                  </div>

                  {isTinMatched ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ✅ Matched
                    </span>
                  ) : isTinMismatch ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Mismatch Detected
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not Verified</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Employer Identification Number (EIN) <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={v.einVerification.einEntered || biz.feesTax.businessTaxId || ''}
                      onChange={(e) => {
                        updateVerification(biz.id, {
                          einVerification: {
                            ...v.einVerification,
                            einEntered: e.target.value,
                            tinMatchStatus: 'Not Started',
                          },
                        });
                      }}
                      placeholder="XX-XXXXXXX"
                      className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-md border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
                    />

                    {/* Simulation mode quick selector */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 text-[11px] self-start sm:self-auto">
                      <span className="text-slate-500 font-medium">Outcome:</span>
                      <button
                        type="button"
                        onClick={() => setTinSimulateMode('Matched')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          tinSimulateMode === 'Matched'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Match
                      </button>
                      <button
                        type="button"
                        onClick={() => setTinSimulateMode('Mismatch')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          tinSimulateMode === 'Mismatch'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Mismatch
                      </button>
                    </div>

                    <button
                      id="verify-tin-match-btn"
                      onClick={handleVerifyTin}
                      disabled={loadingTin || isTinMatched}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {loadingTin ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Verifying with IRS Database...</span>
                        </>
                      ) : isTinMatched ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>TIN Matched</span>
                        </>
                      ) : (
                        <span>Verify TIN Match</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Conditional Fallback Document Upload (IRS CP 575) - Hidden by default; only shown if TIN mismatch occurs */}
                {isTinMismatch && (
                  <div className="mt-3 p-3.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800">
                          Upload EIN Confirmation Letter (IRS CP 575)
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/90 px-2 py-0.5 rounded border border-slate-300">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provide this if automated TIN matching is unsuccessful.
                    </p>

                    {v.einVerification.cp575DocUploaded ? (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-700 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {v.einVerification.cp575FileName || 'IRS_CP575_Confirmation_Notice.pdf'}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">(240 KB • Attached)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateVerification(biz.id, {
                              einVerification: {
                                ...v.einVerification,
                                cp575DocUploaded: false,
                                cp575FileName: undefined,
                              },
                            })
                          }
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 cursor-pointer shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        id="upload-cp575-dropzone"
                        onClick={() =>
                          updateVerification(biz.id, {
                            einVerification: {
                              ...v.einVerification,
                              cp575DocUploaded: true,
                              cp575FileName: 'IRS_CP575_Confirmation_Notice.pdf',
                            },
                          })
                        }
                        className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-lg cursor-pointer transition-colors text-center"
                      >
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click to upload EIN Confirmation Letter (IRS CP 575)
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PDF, JPG, or PNG up to 10MB • Routed to Super-Admin for manual verification
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-flow c: Entity Registration Document + "Check State Registry" */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      C
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Secretary of State Registration Certificate
                    </h3>
                  </div>

                  {isStateActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ✅ Active / Good Standing
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not Checked</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Formation Certificate / Articles of Organization Document <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {v.entityRegistration.fileName ||
                            `${biz.coreDetails.state || 'State'}_Articles_Of_Organization.pdf`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Official formation charter and status filing
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!v.entityRegistration.documentUploaded && (
                        <button
                          type="button"
                          onClick={() =>
                            updateVerification(biz.id, {
                              entityRegistration: {
                                ...v.entityRegistration,
                                documentUploaded: true,
                                fileName: `${biz.coreDetails.state || 'State'}_Articles_Of_Organization.pdf`,
                              },
                            })
                          }
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2.5 py-1.5 rounded hover:bg-indigo-50 border border-indigo-200 cursor-pointer"
                        >
                          Attach Document
                        </button>
                      )}
                      <button
                        id="check-state-registry-btn"
                        onClick={handleVerifyStateRegistry}
                        disabled={loadingStateRegistry || isStateActive}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loadingStateRegistry ? (
                          <>
                            <span className="w-3 h-3 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></span>
                            <span>Querying State Records...</span>
                          </>
                        ) : isStateActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Good Standing Confirmed</span>
                          </>
                        ) : (
                          <span>Check State Registry</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-flow d: Beneficial Owner Form */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      D
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Ultimate Beneficial Owner (UBO - 25%+ Ownership)
                    </h3>
                  </div>

                  {isGovIdDone && isSelfieDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ID & Biometrics Uploaded
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Pending Uploads</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Legal Full Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={v.beneficialOwner.fullName}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          beneficialOwner: { ...v.beneficialOwner, fullName: e.target.value },
                        })
                      }
                      placeholder="Jane Doe"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Date of Birth <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      value={v.beneficialOwner.dateOfBirth}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          beneficialOwner: { ...v.beneficialOwner, dateOfBirth: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      SSN (Masked Input) <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={
                        v.beneficialOwner.ssnLast4
                          ? `•••-••-${v.beneficialOwner.ssnLast4}`
                          : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(-4);
                        updateVerification(biz.id, {
                          beneficialOwner: { ...v.beneficialOwner, ssnLast4: val },
                        });
                      }}
                      placeholder="•••-••-1234"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Styled Dropzones for Gov ID & Selfie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div
                    id="upload-gov-id-dropzone"
                    onClick={() => simulateBeneficialOwnerUpload(biz.id, 'govIdUploaded')}
                    className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                      isGovIdDone
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-indigo-300 bg-slate-50/60'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                    <div className="text-xs font-bold text-slate-900">
                      {isGovIdDone ? '✅ Government Photo ID (Passport/DL)' : 'Upload Government ID'}{' '}
                      <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isGovIdDone ? 'High-resolution scan attached' : 'Click to simulate ID upload'}
                    </div>
                  </div>

                  <div
                    id="upload-selfie-dropzone"
                    onClick={() => simulateBeneficialOwnerUpload(biz.id, 'selfieUploaded')}
                    className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                      isSelfieDone
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-indigo-300 bg-slate-50/60'
                    }`}
                  >
                    <Camera className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                    <div className="text-xs font-bold text-slate-900">
                      {isSelfieDone ? '✅ Liveness Biometric Selfie' : 'Upload Liveness Selfie'}{' '}
                      <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isSelfieDone ? 'Anti-spoof biometric matched' : 'Click to simulate biometric capture'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-flow e: "Run Sanctions Screening" button */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      E
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      AML / PEP & Global Sanctions Screening (OFAC)
                    </h3>
                  </div>

                  {isSanctionsClear ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ✅ Clear
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not Screened</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600">
                    Runs real-time automated check against UN, OFAC SDN, EU sanctions, and Politically Exposed Persons registers.
                  </div>

                  <button
                    id="run-sanctions-screening-btn"
                    onClick={handleVerifySanctions}
                    disabled={loadingSanctions || isSanctionsClear}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {loadingSanctions ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></span>
                        <span>Screening Global Watchlists...</span>
                      </>
                    ) : isSanctionsClear ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Clear of Sanctions</span>
                      </>
                    ) : (
                      <span>Run Sanctions Screening</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-flow f: Bank Account Form + Instant Verify */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      F
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Bank Payout Account
                    </h3>
                  </div>

                  {isBankVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ✅ Verified
                    </span>
                  ) : isBankFailed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Instant Verification Failed
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Unverified</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Account Holder Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={v.bankAccount.accountHolderName}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          bankAccount: { ...v.bankAccount, accountHolderName: e.target.value },
                        })
                      }
                      placeholder={biz.coreDetails.legalEntityName || 'Entity Name'}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Routing Number (ABA) <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={v.bankAccount.routingNumber}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          bankAccount: { ...v.bankAccount, routingNumber: e.target.value },
                        })
                      }
                      placeholder="121000358"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Account Number (Masked) <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={v.bankAccount.accountNumberMasked || '•••• •••• 8842'}
                      onChange={(e) =>
                        updateVerification(biz.id, {
                          bankAccount: { ...v.bankAccount, accountNumberMasked: e.target.value },
                        })
                      }
                      placeholder="•••• •••• 8842"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  {/* Simulation mode quick selector */}
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 text-[11px]">
                    <span className="text-slate-500 font-medium">Outcome:</span>
                    <button
                      type="button"
                      onClick={() => setBankSimulateMode('success')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        bankSimulateMode === 'success'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Instant Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankSimulateMode('fail')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        bankSimulateMode === 'fail'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Simulate Fail
                    </button>
                  </div>

                  <button
                    id="verify-bank-instantly-btn"
                    onClick={handleVerifyBank}
                    disabled={loadingBank || isBankVerified}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingBank ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Confirming ACH Open Banking...</span>
                      </>
                    ) : isBankVerified ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Bank Verified</span>
                      </>
                    ) : (
                      <span>Verify Instantly</span>
                    )}
                  </button>
                </div>

                {/* Conditional Fallback Document Upload (Voided Check) - Hidden by default; only shown if instant verification fails */}
                {isBankFailed && (
                  <div className="mt-3 p-3.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800">
                          Upload Voided Check
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/90 px-2 py-0.5 rounded border border-slate-300">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provide this if instant bank verification is unavailable for your account.
                    </p>

                    {v.bankAccount.voidedCheckUploaded ? (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-700 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {v.bankAccount.voidedCheckFileName || 'Voided_Company_Check.pdf'}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">(180 KB • Attached)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateVerification(biz.id, {
                              bankAccount: {
                                ...v.bankAccount,
                                voidedCheckUploaded: false,
                                voidedCheckFileName: undefined,
                              },
                            })
                          }
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 cursor-pointer shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        id="upload-voided-check-dropzone"
                        onClick={() =>
                          updateVerification(biz.id, {
                            bankAccount: {
                              ...v.bankAccount,
                              voidedCheckUploaded: true,
                              voidedCheckFileName: 'Voided_Company_Check.pdf',
                            },
                          })
                        }
                        className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-lg cursor-pointer transition-colors text-center"
                      >
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click to upload Voided Check (PDF, JPG, PNG)
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Attach voided check for manual underwriting verification
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-flow g: Big "Submit for KYC Review" button */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-slate-900">
                    Ready to Submit KYC Package?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {canSubmitKyc
                      ? 'All required fields and compliance sections are verified and ready. Submit your file to enter the Super-Admin review queue.'
                      : 'Complete all required (*) fields and confirm all 6 sections to unlock compliance submission.'}
                  </p>
                </div>

                <button
                  id="submit-kyc-for-review-btn"
                  onClick={() => submitForKycReview(biz.id)}
                  disabled={!canSubmitKyc || biz.status === 'Pending KYC Review' || biz.status === 'Live'}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                    canSubmitKyc && biz.status !== 'Pending KYC Review' && biz.status !== 'Live'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {biz.status === 'Pending KYC Review'
                      ? 'Submitted & Under Review'
                      : biz.status === 'Live'
                      ? 'Business Already Live'
                      : 'Submit for KYC Review'}
                  </span>
                </button>

                {!canSubmitKyc && biz.status !== 'Pending KYC Review' && biz.status !== 'Live' && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 rounded-lg p-3 max-w-lg mx-auto text-left space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Requirements remaining for submission:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {!hasReqEntityType && <li>Select Legal Entity Type (Section A)</li>}
                      {(!hasReqEin || !isSectionBSuccess) && (
                        <li>
                          {!hasReqEin
                            ? 'Enter EIN (Section B)'
                            : isTinMismatch && !v.einVerification.cp575DocUploaded
                            ? 'TIN Mismatch: Attach IRS CP 575 Letter or re-verify with matching records (Section B)'
                            : 'Verify TIN Match with IRS database (Section B)'}
                        </li>
                      )}
                      {(!hasReqSosDoc || !isSectionCSuccess) && (
                        <li>
                          {!hasReqSosDoc
                            ? 'Upload State Formation Document (Section C)'
                            : 'Check State Registry for Active/Good Standing status (Section C)'}
                        </li>
                      )}
                      {(!hasReqFullName || !hasReqDob || !hasReqSsn || !hasReqGovId || !hasReqSelfie) && (
                        <li>
                          Provide all UBO details, Government Photo ID, and Liveness Selfie (Section D)
                        </li>
                      )}
                      {!isSectionESuccess && (
                        <li>Run AML / OFAC Sanctions Screening (Section E)</li>
                      )}
                      {(!hasReqBankHolder || !hasReqRouting || !hasReqAccountNum || !isSectionFSuccess) && (
                        <li>
                          {!hasReqBankHolder || !hasReqRouting || !hasReqAccountNum
                            ? 'Enter all required bank payout details (Section F)'
                            : isBankFailed && !v.bankAccount.voidedCheckUploaded
                            ? 'Instant verification failed: Attach Voided Check or re-verify (Section F)'
                            : 'Verify bank payout account (Section F)'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {biz.verification.submittedAt && (
                  <div className="text-[11px] text-slate-400">
                    Last submitted:{' '}
                    {new Date(biz.verification.submittedAt).toLocaleDateString()} at{' '}
                    {new Date(biz.verification.submittedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        businessId={biz.id}
        businessName={biz.coreDetails.businessName}
        initialPlan={biz.payment.planSelected}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={async (plan, amount) => {
          await processPayment(biz.id, plan, amount);
        }}
      />
    </div>
  );
};
