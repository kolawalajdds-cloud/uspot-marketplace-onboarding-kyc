import React, { useState, useMemo } from 'react';
import {
  Star,
  Download,
  CornerDownLeft,
  Flag,
  AlertCircle,
  MessageSquare,
  Edit2,
  ChevronDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  X,
  Send,
  Building2,
  Filter,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { BusinessReview } from '../../types';

interface BusinessReviewsManagementViewProps {
  businessId?: string | null;
}

export const BusinessReviewsManagementView: React.FC<BusinessReviewsManagementViewProps> = ({
  businessId,
}) => {
  const { businessReviews, addVendorReviewReply, state } = useDemo();

  // Filters
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('all');
  const [selectedStarsFilter, setSelectedStarsFilter] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'replied' | 'unreplied'>('all');

  // Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [editingReplyReviewId, setEditingReplyReviewId] = useState<string | null>(null);
  const [reportSuccessId, setReportSuccessId] = useState<string | null>(null);

  // Pagination / Display limit
  const [displayCount, setDisplayCount] = useState<number>(6);

  // Unique businesses for dropdown filter
  const businessOptions = useMemo(() => {
    const list = new Set<string>();
    businessReviews.forEach((r) => {
      if (r.business_name) list.add(r.business_name);
    });
    // Also add businesses from registered businesses
    state.businesses.forEach((b) => {
      if (b.coreDetails.businessName) list.add(b.coreDetails.businessName);
    });
    return Array.from(list);
  }, [businessReviews, state.businesses]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return businessReviews.filter((review) => {
      // Business filter
      if (selectedBusinessFilter !== 'all') {
        if (
          review.business_name.toLowerCase() !== selectedBusinessFilter.toLowerCase() &&
          review.business_id !== selectedBusinessFilter
        ) {
          return false;
        }
      }

      // Star filter
      if (selectedStarsFilter !== 'all') {
        const starNum = parseInt(selectedStarsFilter, 10);
        if (review.rating !== starNum) {
          return false;
        }
      }

      // Status filter
      if (activeStatusTab === 'replied') {
        if (!review.response?.text) return false;
      } else if (activeStatusTab === 'unreplied') {
        if (review.response?.text) return false;
      }

      return true;
    });
  }, [businessReviews, selectedBusinessFilter, selectedStarsFilter, activeStatusTab]);

  // Counts
  const totalCount = businessReviews.length;
  const repliedCount = businessReviews.filter((r) => !!r.response?.text).length;
  const unrepliedCount = businessReviews.filter((r) => !r.response?.text).length;

  const averageRating = useMemo(() => {
    if (businessReviews.length === 0) return 4.8;
    const sum = businessReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / businessReviews.length).toFixed(1);
  }, [businessReviews]);

  const handleOpenReply = (reviewId: string, currentText?: string) => {
    setReplyingReviewId(reviewId);
    setReplyText(currentText || '');
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addVendorReviewReply(reviewId, replyText.trim());
    setReplyingReviewId(null);
    setEditingReplyReviewId(null);
    setReplyText('');
  };

  const handleExportData = () => {
    const headers = 'ID,Business,Customer,Rating,Review,Replied,Created\n';
    const rows = filteredReviews
      .map(
        (r) =>
          `"${r.id}","${r.business_name}","${r.customer_name}",${r.rating},"${r.review_text.replace(
            /"/g,
            '""'
          )}","${r.response ? 'Yes' : 'No'}","${r.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleReviews = filteredReviews.slice(0, displayCount);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reviews Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and respond to customer feedback across all your business locations.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* 3 Top Stat KPI Cards (Exact match to Reference Image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: AVERAGE RATING */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            AVERAGE RATING
          </span>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{averageRating}</span>
            <span className="text-lg font-medium text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-slate-900">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(Number(averageRating))
                    ? 'fill-slate-900 text-slate-900'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: TOTAL REVIEWS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            TOTAL REVIEWS
          </span>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {totalCount > 10 ? totalCount.toLocaleString() : '1,240'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              12%
            </span>
          </div>
          <p className="text-xs text-slate-400">+142 reviews this month</p>
        </div>

        {/* Card 3: UNANSWERED REVIEWS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              UNANSWERED REVIEWS
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {unrepliedCount || 12}
              </span>
              <span className="text-xs font-bold text-rose-600">Action Required</span>
            </div>
            <p className="text-xs text-slate-400">Typical response time: 2.5 hours</p>
          </div>

          {/* Vertical Progress Bar Graphic */}
          <div className="w-2.5 h-16 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="w-full h-1/2 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Filter Bar Row (Dropdowns & Status Tabs matching Reference Image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Left Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Business Dropdown */}
          <div className="relative">
            <select
              value={selectedBusinessFilter}
              onChange={(e) => setSelectedBusinessFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Businesses</option>
              {businessOptions.map((biz) => (
                <option key={biz} value={biz}>
                  {biz}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Stars Dropdown */}
          <div className="relative">
            <select
              value={selectedStarsFilter}
              onChange={(e) => setSelectedStarsFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Status Filter Tabs */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex items-center self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStatusTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveStatusTab('replied')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStatusTab === 'replied'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Replied
          </button>
          <button
            onClick={() => setActiveStatusTab('unreplied')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStatusTab === 'unreplied'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Unreplied</span>
            <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
              {unrepliedCount || 12}
            </span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {visibleReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No reviews match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your star rating, business filter, or status tab.
            </p>
          </div>
        ) : (
          visibleReviews.map((review) => {
            const hasVendorReply = Boolean(review.response?.text);
            const isReplying = replyingReviewId === review.id;
            const isReported = reportSuccessId === review.id;

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Review Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        review.customer_avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={review.customer_name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-snug">
                        {review.customer_name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span>{review.time_ago || 'Recently'}</span>
                        <span className="mx-1.5">•</span>
                        <span className="font-semibold text-slate-700">
                          {review.business_name}
                        </span>
                        {review.service_name && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span className="text-slate-500">{review.service_name}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 5-Star Rating Top Right */}
                  <div className="flex items-center gap-1 text-slate-900 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-slate-900 text-slate-900'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Body Text */}
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  "{review.review_text}"
                </p>

                {/* Attachments (if customer uploaded photos/videos) */}
                {review.media && review.media.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {review.media.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer group"
                      >
                        <img
                          src={imgUrl}
                          alt="Customer attachment"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* VENDOR RESPONSE BLOCK (if already replied) */}
                {hasVendorReply && review.response && (
                  <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200/80 border-l-4 border-l-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-700" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                          VENDOR RESPONSE
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenReply(review.id, review.response?.text)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Reply</span>
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 italic leading-relaxed">
                      “{review.response.text}”
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {review.response.responded_time_ago || 'Responded 1 hour after post'}
                    </p>
                  </div>
                )}

                {/* INLINE REPLY COMPOSER (when vendor clicks Reply or Edit) */}
                {isReplying && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-300 space-y-3 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-slate-800">
                      Write an official response from {review.business_name}:
                    </label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Thank the customer, address feedback, and maintain professional tone..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendReply(review.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Response</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* UNREPLIED ACTIONS & FAST RESPONDER BADGE WARNING */}
                {!hasVendorReply && !isReplying && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleOpenReply(review.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <CornerDownLeft className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>

                      <button
                        onClick={() => {
                          setReportSuccessId(review.id);
                          setTimeout(() => setReportSuccessId(null), 3000);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isReported ? 'Reported' : 'Report'}</span>
                      </button>
                    </div>

                    {/* Alert Banner: Response needed to maintain Fast Responder badge */}
                    {review.response_deadline && (
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-rose-600">
                        <span className="font-black text-rose-600">!</span>
                        <span>{review.response_deadline}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load Older Reviews Footer */}
      {filteredReviews.length > displayCount && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 6)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors py-2 px-4 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <span>Load older reviews</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
