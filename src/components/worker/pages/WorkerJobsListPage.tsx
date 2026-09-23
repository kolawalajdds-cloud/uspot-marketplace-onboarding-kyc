import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Eye,
  Play,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Clock,
  ShieldCheck,
  Wrench,
  Sparkles,
  Zap,
  Hammer,
} from 'lucide-react';
import { WorkerJob } from '../../../types';

interface WorkerJobsListPageProps {
  workerId: string;
  onSelectJob: (job: WorkerJob) => void;
  onNavigate: (page: string) => void;
}

export const WorkerJobsListPage: React.FC<WorkerJobsListPageProps> = ({
  workerId,
  onSelectJob,
  onNavigate,
}) => {
  // Jobs matching the reference image 2
  const initialJobsList: WorkerJob[] = [
    {
      id: 'REF-123',
      workerId,
      businessId: 'biz-fixit',
      businessName: 'FixIt Co.',
      title: 'Plumbing - 60 min',
      serviceCategory: 'Plumbing',
      customerName: 'John Doe',
      customerPhone: '555-4567',
      customerEmail: 'john.doe@example.com',
      location: '123 Business Way, Suite 100, New York, NY',
      scheduledDate: '2024-06-16',
      scheduledStartTime: '02:00 PM',
      scheduledEndTime: '03:00 PM',
      durationMinutes: 60,
      status: 'accepted',
      rate: 65,
      tip: 0,
      totalPayout: 65,
      notes: 'Please bring extra supplies and check in at the back entrance.',
    },
    {
      id: 'REF-124',
      workerId,
      businessId: 'biz-shine',
      businessName: 'Shine Cleaning',
      title: 'Deep Clean - 120 min',
      serviceCategory: 'Cleaning',
      customerName: 'Jane Smith',
      customerPhone: '555-0123',
      customerEmail: 'jane.smith@example.com',
      location: '123 Business Way, Suite 100, New York, NY',
      scheduledDate: '2024-06-17',
      scheduledStartTime: '09:00 AM',
      scheduledEndTime: '11:00 AM',
      durationMinutes: 120,
      status: 'scheduled', // Displays as ASSIGNED
      rate: 110,
      tip: 0,
      totalPayout: 110,
      notes: 'Customer requested eco-friendly cleaning detergents.',
    },
    {
      id: 'REF-120',
      workerId,
      businessId: 'biz-sparky',
      businessName: 'Sparky Pro',
      title: 'Wiring - 45 min',
      serviceCategory: 'Electrical',
      customerName: 'Robert Brown',
      customerPhone: '555-9876',
      customerEmail: 'robert.b@example.com',
      location: '789 Energy Blvd, New York, NY',
      scheduledDate: '2024-06-16',
      scheduledStartTime: '11:30 AM',
      scheduledEndTime: '12:15 PM',
      durationMinutes: 45,
      status: 'in_progress',
      rate: 85,
      tip: 0,
      totalPayout: 85,
      notes: 'Kitchen island circuit breaker wiring diagnosis.',
      checkInTime: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'REF-118',
      workerId,
      businessId: 'biz-handy',
      businessName: 'Handy Max',
      title: 'Repair - 30 min',
      serviceCategory: 'Handyman',
      customerName: 'Alice Wong',
      customerPhone: '555-6543',
      customerEmail: 'alice.wong@example.com',
      location: '321 Maker Lane, New York, NY',
      scheduledDate: '2024-06-15',
      scheduledStartTime: '04:00 PM',
      scheduledEndTime: '04:30 PM',
      durationMinutes: 30,
      status: 'completed',
      rate: 40,
      tip: 0,
      totalPayout: 40,
      notes: 'Door hinge reinforcement and latch alignment.',
      checkInTime: new Date(Date.now() - 86400000).toISOString(),
      checkOutTime: new Date(Date.now() - 86400000 + 1800000).toISOString(),
    },
  ];

  const [jobs, setJobs] = useState<WorkerJob[]>(initialJobsList);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    let filtered = initialJobsList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          j.businessName.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q)
      );
    }
    setJobs(filtered);
  };

  const handleClear = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setJobs(initialJobsList);
  };

  const handleOpenJob = (job: WorkerJob) => {
    onSelectJob(job);
    onNavigate('job-details');
  };

  const handleQuickPlay = (job: WorkerJob) => {
    onSelectJob(job);
    onNavigate('job-details');
  };

  const getBusinessIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return <Wrench className="w-3.5 h-3.5 text-gray-700" />;
      case 'cleaning':
        return <Sparkles className="w-3.5 h-3.5 text-gray-700" />;
      case 'electrical':
        return <Zap className="w-3.5 h-3.5 text-gray-700" />;
      default:
        return <Hammer className="w-3.5 h-3.5 text-gray-700" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & TITLE                                                     */}
      {/* ========================================================================= */}
      <div>
        <nav className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">My Jobs</span>
          <span>/</span>
          <span className="text-gray-400 font-mono">/accounts/orders</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Jobs</h1>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & DATE FILTER CARD (Exact match to Image 2)                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Input (approx 6 cols) */}
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Search Jobs</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Job ID, Customer, or Business..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* From Date (approx 3 cols) */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">From Date</label>
            <div className="relative">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* To Date (approx 3 cols) */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">To Date</label>
            <div className="relative">
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clear & Search Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="px-6 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABS BAR & MORE FILTERS (Exact match to Image 2)                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'today' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'upcoming' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            <span>Upcoming</span>
            <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'completed' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Completed
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'cancelled' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Cancelled
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'all' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            All
          </button>
        </div>

        <button
          type="button"
          className="pb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>More Filters</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOBS TABLE (Exact match to Image 2)                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">Date/Time</th>
                <th className="py-3.5 px-6">Ref #</th>
                <th className="py-3.5 px-6">Business</th>
                <th className="py-3.5 px-6">Service</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {/* Row 1: Jun 16, 2024 / REF-123 / FixIt Co. / Plumbing - 60 min */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Jun 16, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">2:00 PM</div>
                </td>
                <td className="py-4 px-6 font-bold text-gray-900">REF-123</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      {getBusinessIcon('plumbing')}
                    </div>
                    <span className="font-bold text-gray-900">FixIt Co.</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">Plumbing - 60 min</td>
                <td className="py-4 px-6 text-gray-700">John Doe</td>
                <td className="py-4 px-6 font-black text-gray-900">$65.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold inline-block">
                    ACCEPTED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenJob(jobs[0])}
                      className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPlay(jobs[0])}
                      className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Quick Start"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: Jun 17, 2024 / REF-124 / Shine Cleaning / Deep Clean - 120 min */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Jun 17, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">9:00 AM</div>
                </td>
                <td className="py-4 px-6 font-bold text-gray-900">REF-124</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      {getBusinessIcon('cleaning')}
                    </div>
                    <span className="font-bold text-gray-900">Shine Cleaning</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">Deep Clean - 120 min</td>
                <td className="py-4 px-6 text-gray-700">Jane Smith</td>
                <td className="py-4 px-6 font-black text-gray-900">$110.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold inline-block">
                    ASSIGNED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleOpenJob(jobs[1])}
                    className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              {/* Row 3: Jun 16, 2024 / REF-120 / Sparky Pro / Wiring - 45 min */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Jun 16, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">11:30 AM</div>
                </td>
                <td className="py-4 px-6 font-bold text-gray-900">REF-120</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      {getBusinessIcon('electrical')}
                    </div>
                    <span className="font-bold text-gray-900">Sparky Pro</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">Wiring - 45 min</td>
                <td className="py-4 px-6 text-gray-700">Robert Brown</td>
                <td className="py-4 px-6 font-black text-gray-900">$85.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-700 text-xs font-semibold inline-block">
                    IN PROGRESS
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleOpenJob(jobs[2])}
                    className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              {/* Row 4: Jun 15, 2024 / REF-118 / Handy Max / Repair - 30 min */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Jun 15, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">4:00 PM</div>
                </td>
                <td className="py-4 px-6 font-bold text-gray-900">REF-118</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      {getBusinessIcon('handyman')}
                    </div>
                    <span className="font-bold text-gray-900">Handy Max</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">Repair - 30 min</td>
                <td className="py-4 px-6 text-gray-700">Alice Wong</td>
                <td className="py-4 px-6 font-black text-gray-900">$40.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold inline-block">
                    COMPLETED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleOpenJob(jobs[3])}
                    className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination matching Image 2 */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
          <span>Showing 1 - 4 of 24 jobs</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded bg-black text-white cursor-pointer"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
            >
              3
            </button>
            <span className="px-1 text-gray-400">...</span>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM 3 SUMMARY CARDS (Exact match to Image 2)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Pending Payouts */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">Pending Payouts</span>
            <span className="text-xl font-black text-gray-900 tracking-tight block mt-0.5">
              $1,240.00
            </span>
          </div>
        </div>

        {/* Card 2: Weekly Hours */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">Weekly Hours</span>
            <span className="text-xl font-black text-gray-900 tracking-tight block mt-0.5">
              38.5 hrs
            </span>
          </div>
        </div>

        {/* Card 3: Performance Rating */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">Performance Rating</span>
            <span className="text-xl font-black text-gray-900 tracking-tight block mt-0.5">
              4.92 / 5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
