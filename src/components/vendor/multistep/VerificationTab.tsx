import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Calendar,
  Lock,
  RefreshCw,
  AlertCircle,
  History,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
} from 'lucide-react';
import { BusinessFormData } from './types';
import { DynamicTinInput, formatTinDisplay, maskTinDisplay } from '../DynamicTinInput';
import { TinType, TinVerificationStatus } from '../../../types';

interface VerificationTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
  onNavigateToPayment?: () => void;
}

const ENTITY_TYPE_OPTIONS = [
  'Limited Liability Company (LLC)',
  'C-Corporation',
  'S-Corporation',
  'General Partnership',
  'Sole Proprietorship',
  'Non-Profit Organization (501(c)(3))',
  'Other',
];

const LLC_TAX_TREATMENT_OPTIONS = [
  { value: 'C Corporation', label: 'C Corporation (EIN Required)', defaultTin: 'EIN' as TinType },
  { value: 'S Corporation', label: 'S Corporation (EIN Required)', defaultTin: 'EIN' as TinType },
  { value: 'Partnership', label: 'Partnership (EIN Required)', defaultTin: 'EIN' as TinType },
  { value: 'Disregarded Entity', label: 'Disregarded Entity (Owner TIN: SSN or EIN)', defaultTin: 'SSN' as TinType },
];

export const VerificationTab: React.FC<VerificationTabProps> = ({ data, onChange, onNavigateToPayment }) => {
  const [isVerifyingTin, setIsVerifyingTin] = useState(false);
  const [isCheckingState, setIsCheckingState] = useState(false);
  const [isScreeningSanctions, setIsScreeningSanctions] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isRejected =
    data.kycStatus === 'Rejected' ||
    data.status === 'KYC Rejected' ||
    Boolean(data.rejectionReason && data.kycStatus !== 'Verified' && data.status !== 'KYC Approved');

  const isVerified =
    data.kycStatus === 'Verified' ||
    data.status === 'KYC Approved' ||
    data.status === 'Live';

  const isPendingReview =
    !isRejected &&
    !isVerified &&
    (data.kycStatus === 'Pending Review' ||
      data.status === 'Pending KYC Review' ||
      Boolean(data.kycSubmitted));

  // Determine dynamic TIN Type based on entity and taxpayer configuration (Rule 3)
  const getEffectiveTinType = (): TinType => {
    if (data.entityType === 'Limited Liability Company (LLC)') {
      if (data.federalTaxClassification === 'Disregarded Entity') {
        return data.tinType || 'SSN';
      }
      return 'EIN';
    }
    if (data.entityType === 'Sole Proprietorship') {
      return data.tinType || 'SSN';
    }
    if (data.entityType === 'Other') {
      return data.tinType || 'EIN';
    }
    return 'EIN';
  };

  const effectiveTinType = getEffectiveTinType();
  const currentTinRaw = (data.tinRaw || data.ein || '').replace(/\D/g, '');
  const tinVerificationStatus: TinVerificationStatus =
    (data.tinStatus as TinVerificationStatus) || (data.einMatched ? 'match' : 'not_verified');

  // Missing requirements calculations
  const missingList: string[] = [];
  if (!data.entityType) missingList.push('Select Legal Entity Type (Section A)');
  if (data.entityType === 'Limited Liability Company (LLC)' && !data.federalTaxClassification) {
    missingList.push('Select Federal Tax Classification for LLC (Section A)');
  }
  if (!currentTinRaw || currentTinRaw.length < 9) {
    missingList.push(`${effectiveTinType === 'EIN' ? 'EIN' : 'SSN'} (9 digits) is required (Section B)`);
  } else if (tinVerificationStatus !== 'match') {
    missingList.push('Please verify your TIN before submitting your eKYC — TIN status must be "Match" (Section B)');
  }
  if (!data.uboFullName?.trim()) missingList.push('Complete UBO Legal Full Name (Section D)');
  if (!data.uboDob) missingList.push('Complete UBO Date of Birth (Section D)');
  if (!data.uboSsn || data.uboSsn.length < 4) missingList.push('Complete UBO SSN Last 4 Digits (Section D)');
  if (!data.govIdUploaded) missingList.push('Upload Government ID (Section D)');
  if (!data.selfieUploaded) missingList.push('Upload Liveness Selfie (Section D)');
  if (!data.sanctionsClear) missingList.push('Complete OFAC Sanctions Screening (Section E)');

  const canSubmit = missingList.length === 0;

  const handleVerifyTin = (forcedStatus?: TinVerificationStatus) => {
    if (!currentTinRaw || currentTinRaw.length < 9) return;
    setIsVerifyingTin(true);
    onChange({ tinStatus: 'verifying' });

    setTimeout(() => {
      setIsVerifyingTin(false);
      // Simulated backend Middesk response
      const outcome =
        forcedStatus ||
        (currentTinRaw === '000000000'
          ? 'error'
          : currentTinRaw === '999999999'
          ? 'mismatch'
          : 'match');

      const masked = maskTinDisplay(currentTinRaw, effectiveTinType);
      onChange({
        tinStatus: outcome,
        einMatched: outcome === 'match',
        tinRaw: currentTinRaw,
        tinMasked: masked,
        ein: currentTinRaw,
        tinType: effectiveTinType,
      });
    }, 900);
  };

  const handleCheckStateRegistry = () => {
    setIsCheckingState(true);
    setTimeout(() => {
      setIsCheckingState(false);
      onChange({ stateRegistryActive: true });
    }, 800);
  };

  const handleRunSanctions = () => {
    setIsScreeningSanctions(true);
    setTimeout(() => {
      setIsScreeningSanctions(false);
      onChange({ sanctionsClear: true });
    }, 800);
  };

  const handleSubmitKyc = () => {
    if (!canSubmit) return;
    const now =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onChange({
      kycSubmitted: true,
      kycStatus: 'Pending Review',
      status: 'Pending KYC Review',
      subTab: 'kyc-requests',
      submittedAt: now,
      resubmittedAt: isRejected ? now : data.resubmittedAt,
      rejectionReason: null,
      tinType: effectiveTinType,
      tinMasked: data.tinMasked || maskTinDisplay(currentTinRaw, effectiveTinType),
    });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  return (
    <div id="tab-content-verification" className="space-y-6">
      {/* Rejection Alert Banner if previously rejected by Super Admin */}
      {isRejected && (
        <div
          id="kyc-rejection-notice-banner"
          className="bg-rose-50/90 border-2 border-rose-300/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-rose-950">
                    KYC Application Rejected — Action Required
                  </h3>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                    Attempt #{data.rejectionCount || 1}
                  </span>
                  {(data.rejectionCount || 0) > 0 && (
                    <span className="text-[11px] font-bold text-rose-700">
                      Rejected {data.rejectionCount} time{(data.rejectionCount || 0) > 1 ? 's' : ''} previously
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  The Super Admin reviewed your KYC submission and requested updates before compliance verification can be granted.
                </p>
              </div>
            </div>
          </div>

          {/* Super Admin Feedback Reason Box */}
          <div className="p-4.5 bg-white rounded-2xl border border-rose-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-900">
                Super Admin Rejection Description:
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Official Compliance Note
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              "{data.rejectionReason || 'Please verify that the EIN matches IRS records and that the beneficial owner identification document is clearly legible.'}"
            </p>
            <p className="text-[11px] text-slate-600">
              💡 <strong>Next steps:</strong> Edit any fields or re-upload documents in Sections A–E below, then click{' '}
              <strong className="text-rose-900">"Update Changes & Resubmit KYC Package"</strong> at the bottom.
            </p>
          </div>

          {/* Prior Rejection History Toggle if multiple */}
          {data.rejectionHistory && data.rejectionHistory.length > 1 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>
                  {showHistory ? 'Hide Previous Rejection Log' : `View All Past Rejections (${data.rejectionHistory.length})`}
                </span>
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {data.rejectionHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/90 rounded-xl border border-rose-200/70 text-xs text-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Review #{idx + 1} • {item.date}</span>
                        <span>By {item.rejectedBy || 'Super Admin'}</span>
                      </div>
                      <p className="text-xs text-slate-700 italic">"{item.reason}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Review Notice Banner if waiting for response */}
      {isPendingReview && (
        <div
          id="kyc-pending-review-banner"
          className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl sm:rounded-3xl p-6 shadow-sm flex items-start gap-3.5 animate-in fade-in"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-amber-950">
                KYC Application Submitted — Under Super Admin Review
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                Awaiting Response
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Your KYC compliance package has been submitted to the Super Admin. The submission button is disabled while awaiting a response. You may continue making edits across all tabs and click <strong>"Save Changes"</strong> at the bottom.
            </p>
          </div>
        </div>
      )}

      {/* Verified Notice Banner */}
      {isVerified && (
        <div
          id="kyc-verified-banner"
          className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl sm:rounded-3xl p-6 shadow-sm flex items-start gap-3.5 animate-in fade-in"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950">
              KYC Verification Approved & Verified
            </h3>
            <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
              This business has been approved and verified by the Super Admin. All regulatory requirements are satisfied.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner matching Image 6 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              KYC / KYB Merchant Compliance Verification
            </h2>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPendingReview
                  ? 'bg-amber-100 text-amber-800'
                  : isRejected
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isVerified
                ? 'KYC Verified'
                : isPendingReview
                ? 'Submitted for Review'
                : isRejected
                ? 'Needs Correction (Rejected)'
                : 'Not Verified'}
            </span>
            {data.resubmittedAt && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Resubmitted
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Complete all 5 regulatory sub-checks below (Sections A–E) to enable submission for Super-Admin review. Required for payout activation and marketplace listing.
          </p>
        </div>
      </div>

      {/* Regulatory Sections */}
      <div className="space-y-6">
        {/* Section A: Legal Entity Structure */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                A
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                LEGAL ENTITY STRUCTURE & TAX CLASSIFICATION
              </h3>
            </div>
            {data.entityType && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Select your legal entity type and applicable federal tax treatment. Required for IRS compliance and underwriting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Legal Entity Type <span className="text-red-500">*</span>
              </label>
              <select
                id="verification-entity-type"
                value={data.entityType}
                onChange={(e) => {
                  const newType = e.target.value;
                  const updates: Partial<BusinessFormData> = {
                    entityType: newType,
                    einMatched: false,
                    tinStatus: 'not_verified',
                  };
                  if (newType === 'Limited Liability Company (LLC)') {
                    updates.federalTaxClassification = data.federalTaxClassification || 'C Corporation';
                    updates.tinType = 'EIN';
                  } else if (newType === 'Sole Proprietorship') {
                    updates.tinType = data.tinType || 'SSN';
                  } else {
                    updates.tinType = 'EIN';
                  }
                  onChange(updates);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
              >
                <option value="">Select entity type...</option>
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* LLC Conditional: Federal Tax Treatment */}
            {data.entityType === 'Limited Liability Company (LLC)' && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  LLC Federal Tax Treatment <span className="text-red-500">*</span>
                </label>
                <select
                  id="llc-federal-tax-classification"
                  value={data.federalTaxClassification || 'C Corporation'}
                  onChange={(e) => {
                    const treatment = e.target.value;
                    const defaultTin = treatment === 'Disregarded Entity' ? (data.tinType || 'SSN') : 'EIN';
                    onChange({
                      federalTaxClassification: treatment,
                      tinType: defaultTin,
                      einMatched: false,
                      tinStatus: 'not_verified',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  {LLC_TAX_TREATMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Single-member disregarded LLCs may use owner's SSN or EIN. Multi-member and corporate LLCs use EIN.
                </p>
              </div>
            )}

            {/* Disregarded Entity or Sole Prop: Choice of SSN vs EIN */}
            {(data.entityType === 'Sole Proprietorship' ||
              (data.entityType === 'Limited Liability Company (LLC)' &&
                data.federalTaxClassification === 'Disregarded Entity')) && (
              <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
                <span className="block text-xs font-bold text-slate-800">
                  Select Applicable Taxpayer Identification Number (TIN) Type:
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="taxpayer-tin-type-choice"
                      checked={effectiveTinType === 'SSN'}
                      onChange={() =>
                        onChange({
                          tinType: 'SSN',
                          einMatched: false,
                          tinStatus: 'not_verified',
                        })
                      }
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>Social Security Number (SSN)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="taxpayer-tin-type-choice"
                      checked={effectiveTinType === 'EIN'}
                      onChange={() =>
                        onChange({
                          tinType: 'EIN',
                          einMatched: false,
                          tinStatus: 'not_verified',
                        })
                      }
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>Employer Identification Number (EIN)</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  {data.entityType === 'Sole Proprietorship'
                    ? 'Sole proprietors without employees typically report under SSN, or EIN if registered as an employer.'
                    : 'Disregarded single-member LLCs may report using the owner’s individual SSN or the LLC’s separate EIN.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section B: Dynamic TIN Input */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                B
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                TAXPAYER IDENTIFICATION NUMBER ({effectiveTinType} / TIN MATCH)
              </h3>
            </div>
            {tinVerificationStatus === 'match' && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched with IRS ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            The frontend securely validates this {effectiveTinType} with IRS records via our backend verification integration (Middesk).
          </p>

          <div className="max-w-xl">
            <DynamicTinInput
              tinType={effectiveTinType}
              value={currentTinRaw}
              onChange={(rawDigits) => {
                onChange({
                  tinRaw: rawDigits,
                  ein: rawDigits,
                  einMatched: false,
                  tinStatus: 'not_verified',
                  tinType: effectiveTinType,
                });
              }}
              onVerify={() => handleVerifyTin()}
              status={tinVerificationStatus}
              onStatusChange={(newStatus) => {
                onChange({
                  tinStatus: newStatus,
                  einMatched: newStatus === 'match',
                  tinMasked: maskTinDisplay(currentTinRaw, effectiveTinType),
                  tinType: effectiveTinType,
                });
              }}
              businessName={data.legalEntityName || data.businessName || 'Your Business'}
              showTestingControls={true}
            />
          </div>
        </div>

        {/* Section C: SOS Registration Certificate */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                C
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                SECRETARY OF STATE REGISTRATION CERTIFICATE
              </h3>
            </div>
            {data.stateRegistryActive && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active / Good Standing ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Formation Certificate / Articles of Organization Document
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div
              onClick={() =>
                onChange({
                  sosDocUploaded: true,
                  sosDocName: 'Articles_Of_Incorporation.pdf',
                })
              }
              className="md:col-span-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <UploadCloud className="w-6 h-6 text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {data.sosDocUploaded
                    ? `Uploaded: ${data.sosDocName}`
                    : 'Upload Document / Drag and drop your PDF file here, or browse files'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, JPG, PNG &nbsp;•&nbsp; Optional &nbsp;•&nbsp; Up to 4 files
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckStateRegistry}
              disabled={isCheckingState}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              {isCheckingState ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Registry...</span>
                </>
              ) : (
                <span>Check State Registry</span>
              )}
            </button>
          </div>
        </div>

        {/* Section D: Ultimate Beneficial Owner (UBO) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                D
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                ULTIMATE BENEFICIAL OWNER (UBO - 25%+ OWNERSHIP)
              </h3>
            </div>
            {data.govIdUploaded && data.selfieUploaded && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ID & Selfie Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Legal Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="ubo-full-name"
                type="text"
                value={data.uboFullName}
                onChange={(e) => onChange({ uboFullName: e.target.value })}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="ubo-dob"
                  type="date"
                  value={data.uboDob}
                  onChange={(e) => onChange({ uboDob: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              SSN (Last 4 Digits) <span className="text-red-500">*</span>
            </label>
            <div className="relative max-w-xs">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="ubo-ssn"
                type="password"
                maxLength={4}
                value={data.uboSsn}
                onChange={(e) => onChange({ uboSsn: e.target.value })}
                placeholder="••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 tracking-widest focus:outline-hidden focus:border-slate-900"
              />
            </div>
          </div>

          {/* 2 Dropzones side-by-side matching Image 6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => onChange({ govIdUploaded: true, govIdName: 'Passport_Scan.pdf' })}
              className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                data.govIdUploaded
                  ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900'
                  : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-slate-500" />
              <div>
                <p className="text-xs font-bold">
                  {data.govIdUploaded
                    ? 'Passport_Scan.pdf (Uploaded ✓)'
                    : 'Upload Government ID *'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Passport, Driver's License &nbsp;•&nbsp; Required &nbsp;•&nbsp; Up to 3 files
                </p>
              </div>
            </div>

            <div
              onClick={() => onChange({ selfieUploaded: true })}
              className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                data.selfieUploaded
                  ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900'
                  : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-slate-500" />
              <div>
                <p className="text-xs font-bold">
                  {data.selfieUploaded ? 'Selfie Captured ✓' : 'Upload Liveness Selfie *'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live photo for identity verification &nbsp;•&nbsp; Required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section E: AML / PEP & Global Sanctions Screening */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                E
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                AML / PEP & GLOBAL SANCTIONS SCREENING (OFAC)
              </h3>
            </div>
            {data.sanctionsClear && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clear ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Runs an automated check against UN, OFAC, SDN, EU sanctions, and Politically Exposed Persons registers.
          </p>

          <div>
            <button
              type="button"
              onClick={handleRunSanctions}
              disabled={isScreeningSanctions}
              className="py-2.5 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
            >
              {isScreeningSanctions ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Registers...</span>
                </>
              ) : (
                <span>Run Sanctions Screening</span>
              )}
            </button>
          </div>
        </div>

        {/* Business Identity & Location Information (Read-Only) - Last Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  BUSINESS IDENTITY & LOCATION DETAILS
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Registered platform information (View-Only / Non-Editable)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 shadow-2xs">
              <Lock className="w-3 h-3 text-slate-500" /> View Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Business Name */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Business Name
              </span>
              <p className="text-sm font-black text-slate-900 truncate" title={data.businessName}>
                {data.businessName || '—'}
              </p>
            </div>

            {/* City */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                City
              </span>
              <p className="text-sm font-bold text-slate-800 truncate" title={data.city}>
                {data.city || '—'}
              </p>
            </div>

            {/* State */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                State
              </span>
              <p className="text-sm font-bold text-slate-800 truncate" title={data.state}>
                {data.state || '—'}
              </p>
            </div>

            {/* Zip code */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Zip Code
              </span>
              <p className="text-sm font-mono font-bold text-slate-800 tracking-wider">
                {data.zipCode || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Ready to Submit KYC Package Card matching Image 6 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Ready to Submit KYC Package?
            </h3>
            <p className="text-xs text-slate-500">
              Complete all required (*) fields and confirm the required sections to unlock compliance submission.
            </p>
          </div>

          {/* Missing items warning or status feedback */}
          {isPendingReview ? (
            <div className="p-4.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 flex items-start gap-3.5 animate-in fade-in">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                    KYC Status: Under Review
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    ✓ eKYC Submitted
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                  Your verification information has been submitted for admin review.
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <em>Note:</em> Middesk TIN verification does NOT equal UrSpot KYC approval. The final KYC decision is made by the UrSpot Admin. You will be able to select your plan and access the W-9 tax certification as soon as an Admin approves your application.
                </p>
              </div>
            </div>
          ) : isVerified ? (
            <div className="p-4.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm font-black text-emerald-950 block">✓ eKYC Approved</span>
                <span className="text-xs text-emerald-800 font-medium">Compliance verification complete and approved by UrSpot Super Admin. You can now select a plan and complete your W-9.</span>
              </div>
            </div>
          ) : !canSubmit ? (
            <div className="p-4.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Requirements remaining before eKYC submission:</span>
              </div>
              <ul className="space-y-1.5 pl-6 text-xs text-rose-700 list-disc font-medium">
                {missingList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All regulatory prerequisites satisfied! Your verified TIN and eKYC dossier are ready for admin review.</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {isRejected || data.rejectionCount
                ? 'eKYC package updated and resubmitted! Super Admin has been notified for re-evaluation.'
                : '✓ eKYC Submitted! Your verification information has been submitted for admin review.'}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            {isPendingReview ? (
              <>
                <button
                  type="button"
                  disabled={true}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-2"
                  title="Disabled: Verification package submitted and awaiting Super Admin response"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Submitted — Under Admin Review</span>
                </button>
                <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Locked awaiting Admin decision. You may still update and save details across tabs.</span>
                </span>
              </>
            ) : isVerified ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={true}
                    className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ eKYC Approved</span>
                  </button>
                  {onNavigateToPayment && (
                    <button
                      id="btn-verification-pay-now"
                      type="button"
                      onClick={onNavigateToPayment}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pay Now & Select Plan</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Ready for Plan Selection & W-9 completion
                </span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="btn-submit-ekyc"
                  onClick={handleSubmitKyc}
                  disabled={!canSubmit}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-2 ${
                    isRejected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white disabled:bg-slate-200 disabled:text-slate-400'
                      : 'bg-black hover:bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400'
                  }`}
                >
                  {isRejected ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Update Changes & Resubmit eKYC</span>
                    </>
                  ) : (
                    <span>Submit eKYC</span>
                  )}
                </button>
                {isRejected && (
                  <span className="text-[11px] font-semibold text-rose-700">
                    Action required: Resubmit after making revisions
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
