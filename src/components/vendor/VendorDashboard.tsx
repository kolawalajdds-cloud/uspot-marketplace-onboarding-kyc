import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { StatusBadge } from '../StatusBadge';
import {
  Building2,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  CreditCard,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const {
    state,
    selectBusinessForVendor,
    createNewBusiness,
    publishAndGoLive,
  } = useDemo();

  const total = state.businesses.length;
  const liveCount = state.businesses.filter((b) => b.status === 'Live').length;
  const pendingCount = state.businesses.filter((b) => b.status === 'Pending KYC Review').length;
  const draftCount = state.businesses.filter((b) => b.status === 'Draft' || b.status === 'Pending Payment').length;

  return (
    <div id="vendor-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Businesses
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Vendor Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage your workspace and venue listings, complete regulatory KYB/KYC verification, and launch live bookings on the USPOT Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="add-new-business-btn"
            onClick={createNewBusiness}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Business</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Entities
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active / Live
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{liveCount}</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Under KYC Review
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{pendingCount}</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Drafts / Action Needed
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{draftCount}</div>
        </div>
      </div>

      {/* Business Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Registered Spaces & Venues ({state.businesses.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Click any entity to inspect or continue onboarding
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {state.businesses.map((biz) => {
            const isApproved = biz.status === 'KYC Approved';
            const isRejected = biz.status === 'KYC Rejected';
            const isLive = biz.status === 'Live';

            return (
              <div
                key={biz.id}
                id={`business-card-${biz.id}`}
                className={`relative p-6 rounded-xl bg-white border transition-all ${
                  isApproved
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : isRejected
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                } shadow-sm hover:shadow-md`}
              >
                {/* KYC Rejection alert box inside card if rejected */}
                {isRejected && biz.verification.rejectionReason && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="font-semibold block mb-0.5">KYC Action Required:</strong>
                      {biz.verification.rejectionReason}
                    </div>
                  </div>
                )}

                {/* KYC Approved Callout: Pay Now if unpaid, Go Live if paid */}
                {isApproved && (
                  <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-950">
                          {biz.payment?.paidAt
                            ? '🎉 Verification Passed! Ready to Go Live'
                            : '🎉 KYC Verification Approved! Next: Select Plan & Pay'}
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          {biz.payment?.paidAt
                            ? 'Super-Admin approved this entity. Publish your listing to begin taking live bookings.'
                            : 'Super-Admin has verified this entity. Complete your subscription plan payment to activate.'}
                        </div>
                      </div>
                    </div>
                    {biz.payment?.paidAt ? (
                      <button
                        id={`go-live-card-btn-${biz.id}`}
                        onClick={() => publishAndGoLive(biz.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        Publish & Go Live
                      </button>
                    ) : (
                      <button
                        id={`pay-now-card-btn-${biz.id}`}
                        onClick={() => selectBusinessForVendor(biz.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pay Now</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner font-bold text-sm"
                      style={{
                        backgroundColor:
                          biz.imageGallery[0]?.color || '#4f46e5',
                      }}
                    >
                      <Building2 className="w-6 h-6 text-white/90" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {biz.coreDetails.businessName || 'Untitled Business'}
                        </h3>
                        <StatusBadge status={biz.status} size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">
                          {biz.coreDetails.legalEntityName || biz.verification.legalEntityType}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {biz.coreDetails.city ? `${biz.coreDetails.city}, ${biz.coreDetails.state}` : 'Location unconfigured'}
                        </span>
                        <span>•</span>
                        <span>{biz.coreDetails.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      id={`open-business-wizard-btn-${biz.id}`}
                      onClick={() => selectBusinessForVendor(biz.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <span>{isLive ? 'View & Edit Space' : 'Continue Setup'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Sub-status tracker bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>
                      Plan:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {biz.payment.planSelected} (${biz.payment.amount}/mo)
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Photos: <strong className="text-slate-800 font-semibold">{biz.imageGallery.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      TIN Match:{' '}
                      <strong
                        className={
                          biz.verification.einVerification.tinMatchStatus === 'Matched'
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-700'
                        }
                      >
                        {biz.verification.einVerification.tinMatchStatus}
                      </strong>
                    </span>
                  </div>

                  {biz.verification.submittedAt && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      Submitted {new Date(biz.verification.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
