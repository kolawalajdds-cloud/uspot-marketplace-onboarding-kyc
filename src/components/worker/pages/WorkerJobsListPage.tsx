import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  RotateCcw,
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
  // Rich jobs dataset matching the reference UI exactly
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
      status: 'scheduled',
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
    {
      id: 'REF-125',
      workerId,
      businessId: 'biz-shine',
      businessName: 'Shine Cleaning',
      title: 'Window Cleaning - 90 min',
      serviceCategory: 'Cleaning',
      customerName: 'David Kim',
      customerPhone: '555-3321',
      customerEmail: 'david.kim@example.com',
      location: '55 Wall St, Suite 400, New York, NY',
      scheduledDate: '2024-06-18',
      scheduledStartTime: '10:00 AM',
      scheduledEndTime: '11:30 AM',
      durationMinutes: 90,
      status: 'accepted',
      rate: 95,
      tip: 15,
      totalPayout: 110,
      notes: 'Commercial lobby window treatment and spotless drying.',
    },
    {
      id: 'REF-126',
      workerId,
      businessId: 'biz-fixit',
      businessName: 'FixIt Co.',
      title: 'Pipe Replacement - 180 min',
      serviceCategory: 'Plumbing',
      customerName: 'Sarah Connor',
      customerPhone: '555-8844',
      customerEmail: 'sarah.c@example.com',
      location: '88 Tech Park, Floor 2, New York, NY',
      scheduledDate: '2024-06-19',
      scheduledStartTime: '01:00 PM',
      scheduledEndTime: '04:00 PM',
      durationMinutes: 180,
      status: 'scheduled',
      rate: 240,
      tip: 0,
      totalPayout: 240,
      notes: 'Main riser copper manifold replacement.',
    },
    {
      id: 'REF-127',
      workerId,
      businessId: 'biz-sparky',
      businessName: 'Sparky Pro',
      title: 'Light Fixtures - 60 min',
      serviceCategory: 'Electrical',
      customerName: 'Michael Chang',
      customerPhone: '555-7711',
      customerEmail: 'm.chang@example.com',
      location: '104 Hudson Yards, New York, NY',
      scheduledDate: '2024-06-14',
      scheduledStartTime: '03:00 PM',
      scheduledEndTime: '04:00 PM',
      durationMinutes: 60,
      status: 'completed',
      rate: 90,
      tip: 20,
      totalPayout: 110,
      notes: 'Track LED lighting installation with remote dimmer.',
    },
    {
      id: 'REF-128',
      workerId,
      businessId: 'biz-handy',
      businessName: 'Handy Max',
      title: 'Cabinet Assembly - 120 min',
      serviceCategory: 'Handyman',
      customerName: 'Emily Davis',
      customerPhone: '555-2299',
      customerEmail: 'emily.d@example.com',
      location: '410 Broadway, New York, NY',
      scheduledDate: '2024-06-13',
      scheduledStartTime: '11:00 AM',
      scheduledEndTime: '01:00 PM',
      durationMinutes: 120,
      status: 'cancelled',
      rate: 150,
      tip: 0,
      totalPayout: 0,
      notes: 'Customer postponed delivery of modular furniture.',
    },
  ];

  // Filtering & Pagination State
  const [jobs] = useState<WorkerJob[]>(initialJobsList);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Helper date normalizer to handle mm/dd/yyyy and yyyy-mm-dd
  const parseDateString = (str: string): number | null => {
    if (!str.trim()) return null;
    const trimmed = str.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
    }
    const d = new Date(trimmed).getTime();
    return isNaN(d) ? null : d;
  };

  // Dynamic filter computation (reactive to searchQuery, activeTab, and date range)
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Text Search Filter (matches Job ID, Customer, Business, Title, Category, Location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          j.id.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          j.businessName.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          (j.serviceCategory && j.serviceCategory.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Tab Filter
      if (activeTab === 'today') {
        const isToday =
          j.scheduledDate === '2024-06-16' ||
          j.status === 'in_progress' ||
          j.id === 'REF-123' ||
          j.id === 'REF-120';
        if (!isToday) return false;
      } else if (activeTab === 'upcoming') {
        if (j.status !== 'accepted' && j.status !== 'scheduled') return false;
      } else if (activeTab === 'completed') {
        if (j.status !== 'completed') return false;
      } else if (activeTab === 'cancelled') {
        if (j.status !== 'cancelled') return false;
      }

      // 3. From Date Filter
      const jobTime = parseDateString(j.scheduledDate);
      if (fromDate.trim() && jobTime) {
        const fromTime = parseDateString(fromDate);
        if (fromTime && jobTime < fromTime) return false;
      }

      // 4. To Date Filter
      if (toDate.trim() && jobTime) {
        const toTime = parseDateString(toDate);
        if (toTime && jobTime > toTime + 86400000 - 1) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, activeTab, fromDate, toDate]);

  // Dynamic counts for tab badges
  const upcomingCount = useMemo(() => {
    return jobs.filter((j) => j.status === 'accepted' || j.status === 'scheduled').length;
  }, [jobs]);

  // Pagination calculation
  const totalCount = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedJobs = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, safeCurrentPage, itemsPerPage]);

  const handleClear = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
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

  const formatDisplayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold inline-block">
            ACCEPTED
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold inline-block">
            ASSIGNED
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-700 text-xs font-semibold inline-block">
            IN PROGRESS
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold inline-block">
            COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold inline-block">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold inline-block uppercase">
            {status}
          </span>
        );
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
      {/* 2. SEARCH & DATE FILTER CARD (Reactive Real-time)                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Search Jobs</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by Job ID, Customer, or Business..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* From Date */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">From Date</label>
            <div className="relative">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="mm/dd/yyyy"
                className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* To Date */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">To Date</label>
            <div className="relative">
              <input
                type="text"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
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
      {/* 3. TABS BAR & MORE FILTERS                                                */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('today');
              setCurrentPage(1);
            }}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'today' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upcoming');
              setCurrentPage(1);
            }}
            className={`pb-3 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'upcoming' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            <span>Upcoming</span>
            <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('completed');
              setCurrentPage(1);
            }}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'completed' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Completed
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('cancelled');
              setCurrentPage(1);
            }}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'cancelled' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Cancelled
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'all' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-500 hover:text-black'
            }`}
          >
            All
          </button>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="pb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>More Filters</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOBS TABLE (Fully Dynamic Mapping)                                     */}
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
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-gray-400" />
                      <div className="text-sm font-bold text-gray-800">No jobs match your filter criteria</div>
                      <div className="text-xs text-gray-400 max-w-sm">
                        Try searching with a different term, clearing the date filters, or switching tabs.
                      </div>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="mt-3 px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{formatDisplayDate(job.scheduledDate)}</div>
                      <div className="text-[11px] text-gray-400 font-normal mt-0.5">
                        {job.scheduledStartTime}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">{job.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          {getBusinessIcon(job.serviceCategory || '')}
                        </div>
                        <span className="font-bold text-gray-900">{job.businessName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{job.title}</td>
                    <td className="py-4 px-6 text-gray-700">{job.customerName}</td>
                    <td className="py-4 px-6 font-black text-gray-900">${job.totalPayout.toFixed(2)}</td>
                    <td className="py-4 px-6">{renderStatusBadge(job.status)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenJob(job)}
                          className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {job.status !== 'completed' && job.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleQuickPlay(job)}
                            className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Quick Start"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination matching Image 2 */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
          <span>
            {totalCount === 0
              ? 'Showing 0 of 0 jobs'
              : `Showing ${(safeCurrentPage - 1) * itemsPerPage + 1} - ${Math.min(
                  safeCurrentPage * itemsPerPage,
                  totalCount
                )} of ${totalCount} jobs`}
          </span>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer transition-colors ${
                  safeCurrentPage === p
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
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
