import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { TinType, TinVerificationStatus } from '../../types';

export interface DynamicTinInputProps {
  tinType: TinType;
  value: string; // can be formatted or raw
  onChange: (normalizedValue: string, formattedValue: string) => void;
  onVerify: () => Promise<void> | void;
  status: TinVerificationStatus;
  onStatusChange?: (newStatus: TinVerificationStatus) => void;
  isReadOnly?: boolean;
  maskedValue?: string;
  businessName?: string;
  showTestingControls?: boolean;
}

// Utility: format raw digits to visual EIN XX-XXXXXXX or SSN XXX-XX-XXXX
export function formatTinDisplay(value: string, type: TinType): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (type === 'EIN') {
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else {
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
}

// Utility: mask 9-digit TIN to safe display
export function maskTinDisplay(value: string, type: TinType): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const last4 = digits.slice(-4) || '****';
  if (type === 'EIN') {
    return `**-*****${last4}`;
  } else {
    return `***-**-${last4}`;
  }
}

export const DynamicTinInput: React.FC<DynamicTinInputProps> = ({
  tinType,
  value,
  onChange,
  onVerify,
  status,
  onStatusChange,
  isReadOnly = false,
  maskedValue,
  businessName = 'business',
  showTestingControls = true,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const isMatch = status === 'match';
  const isMismatch = status === 'mismatch';
  const isPending = status === 'pending';
  const isError = status === 'unavailable' || status === 'error';
  const isVerifying = status === 'verifying';
  const isNotVerified = status === 'not_verified' || !status;

  const rawDigits = value.replace(/\D/g, '');
  const isComplete = rawDigits.length === 9;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const digitsOnly = inputVal.replace(/\D/g, '').slice(0, 9);
    const formatted = formatTinDisplay(digitsOnly, tinType);
    onChange(digitsOnly, formatted);
  };

  const displayString = isReadOnly
    ? maskedValue || maskTinDisplay(value, tinType)
    : showRaw
    ? formatTinDisplay(value, tinType)
    : isMatch
    ? maskedValue || maskTinDisplay(value, tinType)
    : formatTinDisplay(value, tinType);

  return (
    <div className="space-y-3" id="dynamic-tin-component">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-800">
          {tinType === 'EIN'
            ? 'Employer Identification Number (EIN)'
            : 'Social Security Number (SSN)'}{' '}
          <span className="text-red-500">*</span>
        </label>
        {isMatch && (
          <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>TIN Match Verified</span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="relative flex-1">
          <input
            id="dynamic-tin-input"
            type="text"
            disabled={isReadOnly || isVerifying || (isMatch && !showRaw)}
            value={displayString}
            onChange={handleInputChange}
            placeholder={tinType === 'EIN' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
            maxLength={tinType === 'EIN' ? 10 : 11}
            className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border transition-all ${
              isMatch
                ? 'border-emerald-300 bg-emerald-50/30 text-emerald-950 font-semibold'
                : isMismatch
                ? 'border-rose-300 bg-rose-50/30 text-rose-950 focus:border-rose-600'
                : isError
                ? 'border-amber-300 bg-amber-50/30 text-amber-950'
                : 'border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden'
            } disabled:cursor-not-allowed`}
          />

          {isMatch && !isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setShowRaw(!showRaw);
                if (!showRaw && onStatusChange) {
                  // User editing will reset status to not_verified
                  onStatusChange('not_verified');
                }
              }}
              className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1 font-sans"
              title={showRaw ? 'Mask TIN' : 'Edit / Reveal TIN'}
            >
              {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {isReadOnly && (
            <div className="absolute right-3 top-3 text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Verification Action Button */}
        {!isReadOnly && (
          <div className="shrink-0">
            {isNotVerified && (
              <button
                type="button"
                id="btn-verify-tin-match"
                onClick={() => onVerify()}
                disabled={!isComplete || isVerifying}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verify TIN Match</span>
              </button>
            )}

            {isVerifying && (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span>Verifying TIN...</span>
              </button>
            )}

            {isMatch && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Verified</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRaw(true);
                    if (onStatusChange) onStatusChange('not_verified');
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Correct or change TIN"
                >
                  Change
                </button>
              </div>
            )}

            {isMismatch && (
              <button
                type="button"
                id="btn-retry-tin-mismatch"
                onClick={() => onVerify()}
                disabled={!isComplete || isVerifying}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Verify TIN</span>
              </button>
            )}

            {isPending && (
              <button
                type="button"
                id="btn-check-pending-tin"
                onClick={() => onVerify()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Check Status</span>
              </button>
            )}

            {isError && (
              <button
                type="button"
                id="btn-retry-tin-error"
                onClick={() => onVerify()}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* State Feedback Callouts */}
      {isMismatch && (
        <div
          id="tin-mismatch-banner"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-rose-950">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>✕ TIN / Name Mismatch</span>
          </div>
          <p className="text-[11px] leading-relaxed text-rose-800">
            The submitted TIN could not be matched with the provided taxpayer/business name "<strong>{businessName}</strong>". Please verify the information or provide the exact name as filed with the IRS.
          </p>
        </div>
      )}

      {isPending && (
        <div
          id="tin-pending-banner"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>⏳ Verification Pending</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Your TIN verification is still being processed. You can continue only if the current onboarding rules allow it.
          </p>
        </div>
      )}

      {isError && (
        <div
          id="tin-unavailable-banner"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5 animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>⚠ TIN Verification Temporarily Unavailable</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            The IRS verification service is temporarily unavailable or returned a technical timeout. Your EIN is not marked invalid. Please try again in a few moments.
          </p>
        </div>
      )}

      {/* Security Message */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Your TIN is encrypted and securely stored.</span>
      </div>

      {/* Testing Controls: Allows simulation of any Middesk asynchronous result */}
      {showTestingControls && onStatusChange && (
        <div className="pt-2 border-t border-dashed border-slate-200 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Test Outcome:</span>
          <button
            type="button"
            onClick={() => onStatusChange('match')}
            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
          >
            ✓ Match
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('mismatch')}
            className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px] cursor-pointer"
          >
            ✕ Mismatch
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('pending')}
            className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] cursor-pointer"
          >
            ⏳ Pending
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('unavailable')}
            className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] cursor-pointer"
          >
            ⚠ Unavailable
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('not_verified')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
export default DynamicTinInput;
