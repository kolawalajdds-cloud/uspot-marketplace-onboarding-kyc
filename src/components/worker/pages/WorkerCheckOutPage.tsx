import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Banknote,
  Camera,
  ArrowRight,
  Check,
  ArrowLeft,
  Images,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { WorkerJob } from '../../../types';
import { useDemo } from '../../../context/DemoContext';

interface WorkerCheckOutPageProps {
  workerId: string;
  selectedJob: WorkerJob | null;
  onNavigate: (page: string) => void;
  onJobUpdated: (job: WorkerJob) => void;
}

export const WorkerCheckOutPage: React.FC<WorkerCheckOutPageProps> = ({
  workerId,
  selectedJob,
  onNavigate,
  onJobUpdated,
}) => {
  const { updateWorkerJobLifecycle } = useDemo();

  const fallbackJob: WorkerJob = {
    id: 'REF-123',
    workerId,
    businessId: 'biz-shine',
    businessName: 'Shine Cleaning',
    title: 'Deep Cleaning',
    serviceCategory: 'Cleaning',
    customerName: 'John Doe',
    customerPhone: '555-4567',
    customerEmail: 'john.doe@example.com',
    location: '123 Business Way, Suite 100, New York, NY',
    scheduledDate: '2026-06-17',
    scheduledStartTime: '10:00 AM',
    scheduledEndTime: '12:00 PM',
    durationMinutes: 120,
    status: 'in_progress',
    rate: 100,
    tip: 10,
    totalPayout: 110,
    notes: 'Completed all exterior windows and checked locks.',
  };

  const [job, setJob] = useState<WorkerJob>(selectedJob || fallbackJob);
  const [cashConfirmed, setCashConfirmed] = useState<boolean | null>(true);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      setJob(selectedJob);
    }
  }, [selectedJob]);

  const handleCompleteCheckOut = () => {
    const updated: WorkerJob = {
      ...job,
      status: 'completed',
      checkOutTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJob(updated);
    onJobUpdated(updated);
    updateWorkerJobLifecycle(job.id, 'completed', updated);
    setIsCompletedSuccess(true);
    setTimeout(() => {
      onNavigate('jobs');
    }, 2500);
  };

  if (isCompletedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Job Completed & Checked Out!
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">
          Physical payment of ${job.totalPayout.toFixed(2)} recorded and verified. Payout voucher
          generated.
        </p>
        <span className="text-[11px] text-gray-400 font-mono block">
          Redirecting to jobs overview...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Breadcrumb / Back button */}
      <button
        type="button"
        onClick={() => onNavigate('jobs')}
        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assigned Jobs</span>
      </button>

      {/* Header matching Image 4 */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Job #{job.id} Summary
        </h1>
        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
          PENDING CHECKOUT
        </span>
      </div>

      {/* Service Details Meta Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">
          {job.title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Business
            </span>
            <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
              {job.businessName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Scheduled Date
            </span>
            <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
              June 17, 2026
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Completion Time
            </span>
            <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
              12:00 PM
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Job ID
            </span>
            <span className="font-extrabold text-gray-900 text-sm font-mono mt-0.5 block">
              #{job.id}-DC
            </span>
          </div>
        </div>
      </div>

      {/* EVIDENCE & NOTES Card (Exact match to Image 4) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            EVIDENCE & NOTES
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1.5">
            <Images className="w-3 h-3 text-gray-600" />
            <span>4 Photos Uploaded</span>
          </span>
        </div>

        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
          <span className="text-[10px] italic text-gray-400 block mb-1">Last recorded note:</span>
          <p className="text-xs italic font-medium text-gray-800">
            "{job.notes || 'Completed all exterior windows and checked locks.'}"
          </p>
        </div>

        {/* 4 Photo Thumbnails with +1 More badge on 4th */}
        <div className="grid grid-cols-4 gap-3 pt-1">
          {/* Photo 1: Window drops */}
          <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80"
              alt="Cleaned exterior window"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Photo 2: Door lock handle */}
          <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=300&q=80"
              alt="Secured door lock"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Photo 3: Clean interior room */}
          <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"
              alt="Living room service"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Photo 4: Cleaning supplies with +1 More overlay */}
          <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 border border-gray-100 relative">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80"
              alt="Sanitized equipment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-white text-xs font-bold">+1 More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Settlement Card (Exact match to Image 4) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-gray-900">Cash Settlement</h3>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          Confirm the receipt of physical payment before checking out. Did the customer pay{' '}
          <strong className="text-gray-900 font-bold">${job.totalPayout.toFixed(2)}</strong> in
          cash?
        </p>

        {/* Two Large Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={() => setCashConfirmed(true)}
            className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cashConfirmed === true
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${cashConfirmed === true ? 'text-white' : 'text-gray-400'}`}
            />
            <span>Yes, Confirm Cash</span>
          </button>

          <button
            type="button"
            onClick={() => setCashConfirmed(false)}
            className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cashConfirmed === false
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <XCircle
              className={`w-4 h-4 ${cashConfirmed === false ? 'text-white' : 'text-gray-400'}`}
            />
            <span>No, Not Yet</span>
          </button>
        </div>
      </div>

      {/* Complete & Check-Out Submission Button */}
      <button
        type="button"
        onClick={handleCompleteCheckOut}
        className="w-full py-4 rounded-xl bg-neutral-800 hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Complete & Check-Out</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
