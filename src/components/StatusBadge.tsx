import React from 'react';
import { BusinessStatus, RiskTier } from '../types';
import { AlertCircle, CheckCircle2, Clock, FileText, Radio, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: BusinessStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs font-bold px-2.5 py-0.5 gap-1.5 uppercase tracking-wider',
    lg: 'text-sm font-bold px-3 py-1 gap-2 uppercase tracking-wider',
  }[size];

  switch (status) {
    case 'Draft':
      return (
        <span
          id={`status-badge-draft`}
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          {showIcon && <FileText className="w-3.5 h-3.5 text-slate-400" />}
          Draft
        </span>
      );

    case 'Pending Payment':
      return (
        <span
          id={`status-badge-pending-payment`}
          className={`inline-flex items-center rounded-full bg-blue-100 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600" />}
          Pending Payment
        </span>
      );

    case 'Pending KYC Review':
      return (
        <span
          id={`status-badge-pending-kyc`}
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
          Pending KYC Review
        </span>
      );

    case 'KYC Approved':
      return (
        <span
          id={`status-badge-kyc-approved`}
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          KYC Approved
        </span>
      );

    case 'KYC Rejected':
      return (
        <span
          id={`status-badge-kyc-rejected`}
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          KYC Rejected
        </span>
      );

    case 'Live':
      return (
        <span
          id={`status-badge-live`}
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs ${sizeClasses}`}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
          )}
          Live
        </span>
      );

    default:
      return null;
  }
};

export const RiskTierBadge: React.FC<{ tier: RiskTier; size?: 'sm' | 'md' }> = ({
  tier,
  size = 'md',
}) => {
  const classes =
    size === 'sm' ? 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider' : 'text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider';

  if (tier === 'High') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${classes}`}
      >
        <AlertCircle className="w-3 h-3 text-rose-600" />
        High Risk
      </span>
    );
  }
  if (tier === 'Medium') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${classes}`}
      >
        <Radio className="w-3 h-3 text-amber-600" />
        Medium Risk
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${classes}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      Low Risk
    </span>
  );
};
