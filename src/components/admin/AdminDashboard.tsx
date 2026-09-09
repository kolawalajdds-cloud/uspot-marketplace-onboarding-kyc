import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { StatusBadge, RiskTierBadge } from '../StatusBadge';
import { Business, BusinessStatus } from '../../types';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Landmark,
  Layers,
  MapPin,
  Percent,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    state,
    setAdminView,
    selectBusinessForAdmin,
    adminSelectedBusiness: reviewBiz,
    adminApproveBusiness,
    adminRejectBusiness,
  } = useDemo();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  // Queue of pending reviews, sorted oldest-first
  const pendingQueue = state.businesses
    .filter((b) => b.status === 'Pending KYC Review')
    .sort((a, b) => {
      const timeA = a.verification.submittedAt ? new Date(a.verification.submittedAt).getTime() : 0;
      const timeB = b.verification.submittedAt ? new Date(b.verification.submittedAt).getTime() : 0;
      return timeA - timeB;
    });

  // Filtered list for "All Businesses" table
  const allFilteredBusinesses = state.businesses.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      b.coreDetails.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.coreDetails.legalEntityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.coreDetails.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = () => {
    if (!reviewBiz) return;
    adminApproveBusiness(reviewBiz.id);
    setApproveConfirmOpen(false);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBiz || !rejectionReasonInput.trim()) return;
    adminRejectBusiness(reviewBiz.id, rejectionReasonInput.trim());
    setRejectModalOpen(false);
    setRejectionReasonInput('');
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">Super-Admin KYC Operations</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 uppercase tracking-wider border border-slate-700">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Compliance oversight, risk scoring, and merchant approval for the USPOT multi-tenant marketplace.
          </p>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            id="admin-queue-tab-btn"
            onClick={() => setAdminView('queue')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              state.adminView === 'queue'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>KYC Review Queue</span>
            {pendingQueue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-black">
                {pendingQueue.length}
              </span>
            )}
          </button>

          <button
            id="admin-all-businesses-tab-btn"
            onClick={() => setAdminView('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              state.adminView === 'all'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Businesses</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300 font-semibold">
              {state.businesses.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: KYC REVIEW QUEUE */}
      {state.adminView === 'queue' && (
        <div id="admin-queue-view" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Awaiting Compliance Review ({pendingQueue.length})
              </h2>
              <p className="text-xs text-slate-500">
                Sorted oldest-first to enforce KYC SLA turnarounds.
              </p>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">Review Queue is Clear!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are currently no merchant applications in Pending KYC Review status.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Business Name & Category</th>
                      <th className="py-3 px-4">Legal Entity Type</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Risk Tier</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingQueue.map((biz) => (
                      <tr
                        key={biz.id}
                        id={`queue-row-${biz.id}`}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {biz.coreDetails.businessName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {biz.coreDetails.legalEntityName} • {biz.coreDetails.category}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {biz.verification.legalEntityType}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {biz.verification.submittedAt ? (
                            <div>
                              <div className="font-medium">
                                {new Date(biz.verification.submittedAt).toLocaleDateString()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(biz.verification.submittedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <RiskTierBadge tier={biz.verification.riskTier} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            id={`review-application-btn-${biz.id}`}
                            onClick={() => selectBusinessForAdmin(biz.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Application</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ALL BUSINESSES TABLE */}
      {state.adminView === 'all' && (
        <div id="admin-all-businesses-view" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                All Registered Marketplace Businesses ({allFilteredBusinesses.length})
              </h2>
              <p className="text-xs text-slate-500">
                Complete overview of business lifecycles and compliance records.
              </p>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, entity, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden focus:border-indigo-600 w-48 text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-hidden text-slate-700 focus:border-indigo-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending Payment">Pending Payment</option>
                <option value="Pending KYC Review">Pending KYC Review</option>
                <option value="KYC Approved">KYC Approved</option>
                <option value="KYC Rejected">KYC Rejected</option>
                <option value="Live">Live</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Business & Entity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allFilteredBusinesses.map((biz) => (
                    <tr
                      key={biz.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {biz.coreDetails.businessName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {biz.coreDetails.legalEntityName || 'Legal entity pending'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={biz.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {biz.coreDetails.city
                          ? `${biz.coreDetails.city}, ${biz.coreDetails.state}`
                          : 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {biz.payment.planSelected}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">
                          (${biz.payment.amount}/mo)
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <RiskTierBadge tier={biz.verification.riskTier} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => selectBusinessForAdmin(biz.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BUSINESS REVIEW DETAIL PAGE */}
      {state.adminView === 'detail' && reviewBiz && (
        <div id="admin-business-detail-page" className="space-y-6">
          {/* Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                id="back-to-queue-btn"
                onClick={() => setAdminView('queue')}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {reviewBiz.coreDetails.businessName}
                  </h2>
                  <StatusBadge status={reviewBiz.status} size="sm" />
                  <RiskTierBadge tier={reviewBiz.verification.riskTier} size="sm" />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Legal Entity: <strong className="text-slate-800">{reviewBiz.coreDetails.legalEntityName}</strong> ({reviewBiz.verification.legalEntityType})
                </div>
              </div>
            </div>

            {/* Quick Status Action Pill */}
            {reviewBiz.verification.reviewedBy && (
              <div className="text-xs text-slate-500 text-right">
                <div>
                  Reviewed by: <strong className="text-slate-800">{reviewBiz.verification.reviewedBy}</strong>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {reviewBiz.verification.reviewedAt
                    ? new Date(reviewBiz.verification.reviewedAt).toLocaleString()
                    : ''}
                </div>
              </div>
            )}
          </div>

          {/* Rejection notice if previously rejected */}
          {reviewBiz.status === 'KYC Rejected' && reviewBiz.verification.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">Current Rejection Reason:</h4>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {reviewBiz.verification.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: VERIFICATION & COMPLIANCE DOSSIER (HIGHEST PRIORITY) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  KYC / KYB Compliance Dossier & Verification Sub-Checks
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Submitted:{' '}
                {reviewBiz.verification.submittedAt
                  ? new Date(reviewBiz.verification.submittedAt).toLocaleString()
                  : 'Not Submitted'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* EIN / TIN Status */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  IRS EIN / TIN Verification
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {reviewBiz.verification.einVerification.einEntered || reviewBiz.feesTax.businessTaxId || 'N/A'}
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.einVerification.tinMatchStatus === 'Matched'
                        ? 'bg-emerald-100 text-emerald-800'
                        : reviewBiz.verification.einVerification.tinMatchStatus === 'Mismatch'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {reviewBiz.verification.einVerification.tinMatchStatus === 'Matched' && (
                      <Check className="w-3 h-3 text-emerald-600" />
                    )}
                    {reviewBiz.verification.einVerification.tinMatchStatus}
                  </span>
                  {reviewBiz.verification.einVerification.cp575DocUploaded && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                      <FileCheck className="w-3 h-3 text-indigo-600" />
                      IRS CP 575 Letter Attached
                    </span>
                  )}
                </div>
              </div>

              {/* State Registry */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Secretary of State Registry
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {reviewBiz.verification.entityRegistration.fileName || 'Corporate Filing Attached'}
                </div>
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.entityRegistration.stateRegistryStatus ===
                      'Active/Good Standing'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {reviewBiz.verification.entityRegistration.stateRegistryStatus ===
                      'Active/Good Standing' && <Check className="w-3 h-3 text-emerald-600" />}
                    {reviewBiz.verification.entityRegistration.stateRegistryStatus}
                  </span>
                </div>
              </div>

              {/* Sanctions */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  AML & OFAC Sanctions Screening
                </div>
                <div className="text-xs text-slate-600">Global PEP / Watchlists</div>
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.sanctionsScreening.status === 'Clear'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {reviewBiz.verification.sanctionsScreening.status === 'Clear' && (
                      <Check className="w-3 h-3 text-emerald-600" />
                    )}
                    {reviewBiz.verification.sanctionsScreening.status}
                  </span>
                </div>
              </div>

              {/* Beneficial Owner */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1 sm:col-span-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ultimate Beneficial Owner (UBO)
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {reviewBiz.verification.beneficialOwner.fullName || 'Unspecified Owner'}
                </div>
                <div className="text-[11px] text-slate-500">
                  DOB: {reviewBiz.verification.beneficialOwner.dateOfBirth || 'N/A'} • SSN Last 4:{' '}
                  <span className="font-mono">
                    {reviewBiz.verification.beneficialOwner.ssnLast4 ? `•••-••-${reviewBiz.verification.beneficialOwner.ssnLast4}` : 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.beneficialOwner.govIdUploaded
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Gov Photo ID: {reviewBiz.verification.beneficialOwner.govIdUploaded ? 'Verified' : 'Missing'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.beneficialOwner.selfieUploaded
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Biometric Selfie: {reviewBiz.verification.beneficialOwner.selfieUploaded ? 'Verified' : 'Missing'}
                  </span>
                </div>
              </div>

              {/* Bank Account */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Commercial Bank Payout Account
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {reviewBiz.verification.bankAccount.accountHolderName || reviewBiz.coreDetails.legalEntityName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Routing: {reviewBiz.verification.bankAccount.routingNumber || 'N/A'}
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      reviewBiz.verification.bankAccount.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : reviewBiz.verification.bankAccount.verificationFailed
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reviewBiz.verification.bankAccount.verified && (
                      <Check className="w-3 h-3 text-emerald-600" />
                    )}
                    {reviewBiz.verification.bankAccount.verified
                      ? 'Verified (Open Banking)'
                      : reviewBiz.verification.bankAccount.verificationFailed
                      ? 'Instant Verification Failed'
                      : 'Unverified'}
                  </span>
                  {reviewBiz.verification.bankAccount.voidedCheckUploaded && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                      <FileCheck className="w-3 h-3 text-indigo-600" />
                      Voided Check Attached
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: BUSINESS PROFILE, FEES, SCHEDULE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Core Details & Location */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Physical Location & Description
              </h4>
              <div className="text-xs text-slate-700 space-y-1.5">
                <div>
                  <span className="text-slate-400 font-medium">Address:</span>{' '}
                  <strong>{reviewBiz.coreDetails.streetAddress}</strong>,{' '}
                  {reviewBiz.coreDetails.city}, {reviewBiz.coreDetails.state}{' '}
                  {reviewBiz.coreDetails.zipCode}
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Category:</span>{' '}
                  {reviewBiz.coreDetails.category}
                </div>
                <div className="pt-2 text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {reviewBiz.coreDetails.description || 'No public description entered.'}
                </div>
              </div>
            </div>

            {/* Fees & Financial Config */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-slate-400" />
                Tax, Subscription & Booking Surcharges
              </h4>
              <div className="text-xs text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Marketplace Tier:</span>
                  <span className="font-bold text-slate-900">
                    {reviewBiz.payment.planSelected} (${reviewBiz.payment.amount}/mo)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Tax Rate:</span>
                  <span className="font-medium text-slate-900">
                    {reviewBiz.feesTax.salesTaxRate}% ({reviewBiz.feesTax.currency})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Surcharges:</span>
                  <span className="font-medium text-slate-900">
                    {reviewBiz.feesTax.serviceFees.length} configured
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Photos Uploaded:</span>
                  <span className="font-medium text-slate-900">
                    {reviewBiz.imageGallery.length} photos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN ACTION FOOTER (Approve / Reject) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Super-Admin Decision</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Approve to permit the vendor to Go Live, or Reject with detailed compliance feedback.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="admin-reject-btn"
                onClick={() => setRejectModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject KYC</span>
              </button>

              <button
                id="admin-approve-btn"
                onClick={() => setApproveConfirmOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve KYC Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      {approveConfirmOpen && reviewBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Merchant Approval
                </h3>
                <p className="text-xs text-slate-500">
                  Approve {reviewBiz.coreDetails.businessName} for marketplace publication.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will update the business status to <strong>KYC Approved</strong>, record your review timestamp, and notify the vendor that their space is ready to Publish & Go Live.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setApproveConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-approve-modal-btn"
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL (Requires Reason) */}
      {rejectModalOpen && reviewBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Application & Request Resubmission
                </h3>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the exact compliance deficiency so the vendor can rectify and resubmit their application.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason (Mandatory Feedback)
                </label>
                <textarea
                  id="rejection-reason-textarea"
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  required
                  placeholder="e.g. The Beneficial Owner government ID uploaded has expired. Additionally, the registered entity name differs from the official state certificate. Please upload updated credentials."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500 leading-relaxed text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-reject-modal-btn"
                  type="submit"
                  disabled={!rejectionReasonInput.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
