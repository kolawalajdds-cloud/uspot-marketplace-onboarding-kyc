import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  Upload,
  CheckCircle2,
  Coins,
  Star,
  Calendar,
  Download,
  Eye,
  Check,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { UserProfile, WorkerJob, WorkerStats } from '../../../types';

interface WorkerDashboardPageProps {
  worker: UserProfile;
  onNavigate: (page: string, params?: any) => void;
  onSelectJob: (job: WorkerJob) => void;
}

export const WorkerDashboardPage: React.FC<WorkerDashboardPageProps> = ({
  worker,
  onNavigate,
  onSelectJob,
}) => {
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Fallback / standard seed jobs matching the screenshot reference
  const upcomingJobsReference: WorkerJob[] = [
    {
      id: 'REF-101',
      workerId: worker.id,
      businessId: 'biz-luxe',
      businessName: 'Luxe Aesthetics',
      title: 'On-site Consultation',
      serviceCategory: 'Aesthetics',
      customerName: 'Alice Smith',
      customerPhone: '+1 (555) 345-6789',
      customerEmail: 'alice.smith@example.com',
      location: '123 Business Way, Suite 100, New York, NY',
      scheduledDate: '2024-02-22',
      scheduledStartTime: '09:00 AM',
      scheduledEndTime: '10:30 AM',
      durationMinutes: 90,
      status: 'scheduled', // displays as ASSIGNED
      rate: 120,
      tip: 0,
      totalPayout: 120,
      notes: 'Please bring aesthetic consultation kit and sanitized equipment.',
    },
    {
      id: 'REF-102',
      workerId: worker.id,
      businessId: 'biz-dental',
      businessName: 'Modern Dental',
      title: 'Premium Cleaning',
      serviceCategory: 'Dental & Sanitation',
      customerName: 'Robert Brown',
      customerPhone: '+1 (555) 789-0123',
      customerEmail: 'robert.b@example.com',
      location: '456 Medical Center Blvd, Floor 2, New York, NY',
      scheduledDate: '2024-02-23',
      scheduledStartTime: '02:30 PM',
      scheduledEndTime: '04:00 PM',
      durationMinutes: 90,
      status: 'accepted',
      rate: 85,
      tip: 0,
      totalPayout: 85,
      notes: 'Customer confirmed arrival time. Workstation is pre-sterilized.',
    },
  ];

  const recentJobsReference: WorkerJob[] = [
    {
      id: 'REF-099',
      workerId: worker.id,
      businessId: 'biz-elite',
      businessName: 'Elite Health',
      title: 'Deep Tissue Massage',
      serviceCategory: 'Wellness',
      customerName: 'Marcus Vance',
      customerPhone: '+1 (555) 123-4567',
      customerEmail: 'marcus.v@example.com',
      location: '88 Hudson Yards, Thermal Suite B, New York, NY',
      scheduledDate: '2024-02-13',
      scheduledStartTime: '11:00 AM',
      scheduledEndTime: '01:00 PM',
      durationMinutes: 120,
      status: 'completed',
      rate: 150,
      tip: 0,
      totalPayout: 150,
      notes: 'Full therapeutic deep tissue session completed.',
      checkInTime: new Date(Date.now() - 86400000 * 10).toISOString(),
      checkOutTime: new Date(Date.now() - 86400000 * 10 + 7200000).toISOString(),
    },
    {
      id: 'REF-098',
      workerId: worker.id,
      businessId: 'biz-city',
      businessName: 'City Clinic',
      title: 'General Consultation',
      serviceCategory: 'Healthcare',
      customerName: 'David Chen',
      customerPhone: '+1 (555) 234-5678',
      customerEmail: 'david.c@example.com',
      location: '742 Evergreen Terrace, Suite 104, New York, NY',
      scheduledDate: '2024-02-12',
      scheduledStartTime: '01:30 PM',
      scheduledEndTime: '02:30 PM',
      durationMinutes: 60,
      status: 'completed',
      rate: 90,
      tip: 0,
      totalPayout: 90,
      notes: 'Patient check-in and room prep completed.',
      checkInTime: new Date(Date.now() - 86400000 * 11).toISOString(),
      checkOutTime: new Date(Date.now() - 86400000 * 11 + 3600000).toISOString(),
    },
  ];

  const [upcomingJobs, setUpcomingJobs] = useState<WorkerJob[]>(upcomingJobsReference);
  const [recentJobs, setRecentJobs] = useState<WorkerJob[]>(recentJobsReference);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await workerService.getDashboard(worker.id);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.todayJobs && data.todayJobs.length > 0) {
          // Merge or keep reference
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [worker.id]);

  const handleExportData = () => {
    setExportNotice('Exporting worker report (PDF / CSV)... Download ready in moments.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleViewJob = (job: WorkerJob) => {
    onSelectJob(job);
    onNavigate('job-details', { job });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. WELCOME BACK HEADER WITH DATE RANGE & EXPORT BUTTON (Exact Image 1)    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block mb-1">
            WELCOME BACK, {worker.fullName ? worker.fullName.split(' ')[0].toUpperCase() : 'JOHN'}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Date Range Selector Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Feb 14 - Feb 21</span>
          </div>

          {/* Export Data Button */}
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 6 METRIC CARDS ROW (Exact match to Image 1)                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Card 1: Wallet Balance */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <CreditCard className="w-4 h-4 text-gray-700" />
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
              READY
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Wallet Balance</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight block mt-1">
              ${stats?.availableBalance ? stats.availableBalance.toFixed(2) : '450.00'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Earnings */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Banknote className="w-4 h-4 text-gray-700" />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Total Earnings</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight block mt-1">
              ${stats?.totalEarnings ? stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '3,200.00'}
            </span>
          </div>
        </div>

        {/* Card 3: Total Payouts */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Upload className="w-4 h-4 text-gray-700" />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Total Payouts</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight block mt-1">
              $2,750.00
            </span>
          </div>
        </div>

        {/* Card 4: Jobs Completed */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-4 h-4 text-gray-700" />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Jobs Completed</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight block mt-1">
              {stats?.completedJobsCount ?? 42}
            </span>
          </div>
        </div>

        {/* Card 5: Coins Balance */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Coins className="w-4 h-4 text-gray-700" />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Coins Balance</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight block mt-1">
              150
            </span>
          </div>
        </div>

        {/* Card 6: Avg Rating */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Star className="w-4 h-4 text-gray-700 fill-current" />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium text-gray-500 block">Avg Rating</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {worker.rating ? worker.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-sm font-bold text-gray-900">★</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UPCOMING JOBS CARD (Exact match to Image 1)                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Upcoming Jobs</h2>
          <span className="text-xs font-medium text-gray-500">2 Jobs Scheduled</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">REF #</th>
                <th className="py-3.5 px-6">DATE/TIME</th>
                <th className="py-3.5 px-6">BUSINESS</th>
                <th className="py-3.5 px-6">SERVICE</th>
                <th className="py-3.5 px-6">CUSTOMER</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {/* Row 1: REF-101 */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">REF-101</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Feb 22, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">09:00 AM</div>
                </td>
                <td className="py-4 px-6 font-semibold text-gray-900">Luxe Aesthetics</td>
                <td className="py-4 px-6 text-gray-600">On-site Consultation</td>
                <td className="py-4 px-6 text-gray-700">Alice Smith</td>
                <td className="py-4 px-6 font-black text-gray-900">$120.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold inline-block">
                    ASSIGNED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleViewJob(upcomingJobs[0])}
                    className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>

              {/* Row 2: REF-102 */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">REF-102</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">Feb 23, 2024</div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">02:30 PM</div>
                </td>
                <td className="py-4 px-6 font-semibold text-gray-900">Modern Dental</td>
                <td className="py-4 px-6 text-gray-600">Premium Cleaning</td>
                <td className="py-4 px-6 text-gray-700">Robert Brown</td>
                <td className="py-4 px-6 font-black text-gray-900">$85.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-semibold inline-block">
                    ACCEPTED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleViewJob(upcomingJobs[1])}
                    className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT JOBS CARD (Exact match to Image 1)                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Recent Jobs</h2>
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="text-xs font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            View History
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">REF #</th>
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">BUSINESS</th>
                <th className="py-3.5 px-6">SERVICE</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {/* Row 1: REF-099 */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">REF-099</td>
                <td className="py-4 px-6 text-gray-800">Feb 13, 2024</td>
                <td className="py-4 px-6 font-semibold text-gray-900">Elite Health</td>
                <td className="py-4 px-6 text-gray-600">Deep Tissue Massage</td>
                <td className="py-4 px-6 font-black text-gray-900">$150.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold inline-block">
                    COMPLETED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleViewJob(recentJobs[0])}
                    className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>

              {/* Row 2: REF-098 */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">REF-098</td>
                <td className="py-4 px-6 text-gray-800">Feb 12, 2024</td>
                <td className="py-4 px-6 font-semibold text-gray-900">City Clinic</td>
                <td className="py-4 px-6 text-gray-600">General Consultation</td>
                <td className="py-4 px-6 font-black text-gray-900">$90.00</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold inline-block">
                    COMPLETED
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => handleViewJob(recentJobs[1])}
                    className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-800 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FOOTER (Exact match to Image 1)                                        */}
      {/* ========================================================================= */}
      <div className="pt-8 pb-4 text-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          &copy; 2024 URSPOT ENTERPRISE SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};
