import React, { useState } from 'react';
import {
  Bell,
  Settings,
  Star,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface WorkerPerformancePageProps {
  worker: UserProfile;
  onNavigate?: (page: string) => void;
}

interface CustomerReview {
  id: string;
  date: string;
  customerInitials: string;
  customerName: string;
  businessName: string;
  rating: number;
  comment: string;
}

export const WorkerPerformancePage: React.FC<WorkerPerformancePageProps> = ({
  worker,
  onNavigate,
}) => {
  const [monthRange, setMonthRange] = useState<'6m' | '12m'>('6m');
  const [searchQuery, setSearchQuery] = useState('');

  // 6 Metric Cards from Image 3
  const metrics = [
    { label: 'Jobs Completed', value: '120', trend: '+12%' },
    { label: 'Avg Rating', value: '4.8 ★', trend: null },
    { label: 'Total Reviews', value: '95', trend: null },
    { label: 'Acceptance Rate', value: '98%', trend: null },
    { label: 'Cancellation Rate', value: '1%', trend: null },
    { label: 'On-Time %', value: '95%', trend: null },
  ];

  // Rating Distribution from Image 3
  const ratingBreakdown = [
    { stars: 5, reviews: 82, percentage: 86 },
    { stars: 4, reviews: 10, percentage: 11 },
    { stars: 3, reviews: 2, percentage: 2 },
    { stars: 2, reviews: 1, percentage: 1 },
    { stars: 1, reviews: 0, percentage: 0 },
  ];

  // Monthly Performance Bar Data from Image 3
  const monthlyData6M = [
    { month: 'Jan', jobs: 18, height: '48%' },
    { month: 'Feb', jobs: 22, height: '58%' },
    { month: 'Mar', jobs: 28, height: '78%' },
    { month: 'Apr', jobs: 24, height: '65%' },
    { month: 'May', jobs: 32, height: '90%' },
    { month: 'Jun', jobs: 26, height: '72%', isCurrent: true },
  ];

  const monthlyData12M = [
    { month: 'Jul', jobs: 16, height: '42%' },
    { month: 'Aug', jobs: 19, height: '50%' },
    { month: 'Sep', jobs: 21, height: '55%' },
    { month: 'Oct', jobs: 25, height: '68%' },
    { month: 'Nov', jobs: 27, height: '74%' },
    { month: 'Dec', jobs: 30, height: '82%' },
    ...monthlyData6M,
  ];

  const displayBars = monthRange === '6m' ? monthlyData6M : monthlyData12M;

  // Recent Customer Reviews from Image 3
  const reviews: CustomerReview[] = [
    {
      id: 'rev-1',
      date: 'Jun 15, 2026',
      customerInitials: 'JD',
      customerName: 'John Doe',
      businessName: 'FixIt Co.',
      rating: 5,
      comment: 'Great service, arrived exactly on time!',
    },
    {
      id: 'rev-2',
      date: 'Jun 12, 2026',
      customerInitials: 'JS',
      customerName: 'Jane Smith',
      businessName: 'Shine Cleaning',
      rating: 4,
      comment: 'Very thorough job, highly recommend.',
    },
    {
      id: 'rev-3',
      date: 'Jun 08, 2026',
      customerInitials: 'ML',
      customerName: 'Mark Lewis',
      businessName: 'Swift Logistic',
      rating: 5,
      comment: 'Incredible professionalism. Would hire again.',
    },
  ];

  const filteredReviews = reviews.filter(
    (r) =>
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR (Exact match to Image 3)                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Performance &amp; Reports
          </h1>
          <span className="text-xs text-gray-400 font-semibold hidden sm:inline-block">
            Analytics
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('/worker/notifications')}
              className="relative p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('/worker/security')}
              className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => alert('Generating custom performance report...')}
            className="px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            New Report
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 6 KEY METRIC CARDS ROW (Exact match to Image 3)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between"
          >
            <span className="text-[10px] font-bold text-gray-400 block truncate">
              {m.label}
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {m.value}
              </span>
              {m.trend && (
                <span className="text-[11px] font-bold text-emerald-600">
                  {m.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE SECTION: RATING DISTRIBUTION & MONTHLY PERFORMANCE (Image 3)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Rating Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">
                Rating Distribution
              </h3>
              <span className="text-xs text-gray-400 font-medium">Lifetime</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {ratingBreakdown.map((row) => (
                <div key={row.stars} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{row.stars} Stars</span>
                    <span className="text-gray-400">{row.reviews} reviews</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Card */}
          <div className="bg-gray-50/90 rounded-xl p-4 border border-gray-100 text-xs italic text-gray-600 leading-relaxed">
            &ldquo;Your rating has increased by 0.2 points since last month. Excellent consistency!&rdquo;
          </div>
        </div>

        {/* Right Column (7 Cols): Monthly Performance Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Monthly Performance
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Jobs completed per month
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMonthRange('6m')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  monthRange === '6m'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setMonthRange('12m')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  monthRange === '12m'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                12 Months
              </button>
            </div>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-8 pb-2">
            <div className="flex items-end justify-between gap-3 h-48 border-b border-gray-100 pb-2 px-2">
              {displayBars.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.jobs}
                  </span>
                  {/* The Black Bar */}
                  <div
                    className="w-full max-w-10 bg-black rounded-t-xs hover:bg-neutral-800 transition-all duration-300"
                    style={{ height: bar.height }}
                  />
                  {/* Month Label */}
                  <span
                    className={`text-xs mt-1 ${
                      bar.isCurrent ? 'font-black text-gray-900' : 'font-medium text-gray-500'
                    }`}
                  >
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM SECTION: RECENT CUSTOMER REVIEWS (Image 3)                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Header & Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Recent Customer Reviews
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={() => alert('Filter reviews modal')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 hover:border-black text-xs font-bold text-gray-800 transition-colors cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6 w-32">DATE</th>
                <th className="py-4 px-6">CUSTOMER</th>
                <th className="py-4 px-6">BUSINESS</th>
                <th className="py-4 px-6">RATING</th>
                <th className="py-4 px-6">COMMENT</th>
                <th className="py-4 px-6 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                    No customer reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 text-gray-500 font-medium whitespace-nowrap">
                      {rev.date}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {rev.customerInitials}
                        </div>
                        <span className="font-bold text-gray-900">
                          {rev.customerName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-800 font-medium whitespace-nowrap">
                      {rev.businessName}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-0.5 text-black">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-black text-black'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-gray-600 italic max-w-sm truncate">
                      &ldquo;{rev.comment}&rdquo;
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alert(`Review actions for ${rev.customerName}`)}
                        className="p-1 text-gray-400 hover:text-black cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Showing 1-3 of 95 reviews
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
