import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  HelpCircle,
  CheckCircle2,
  Brush,
  Building,
  MapPin,
  Phone,
  AlertCircle,
  User,
  FileText,
  CreditCard,
  Clock,
  MessageSquare,
  Navigation,
  Car,
  Check,
  ArrowRightFromLine,
  ExternalLink,
} from 'lucide-react';
import { WorkerJob, WorkerJobStatus } from '../../../types';
import { useDemo } from '../../../context/DemoContext';

interface WorkerJobDetailPageProps {
  job: WorkerJob | null;
  onNavigate: (page: string) => void;
  onStartCheckIn?: (job: WorkerJob) => void;
  onStartCheckOut?: (job: WorkerJob) => void;
}

export const WorkerJobDetailPage: React.FC<WorkerJobDetailPageProps> = ({
  job: initialJob,
  onNavigate,
}) => {
  const { updateWorkerJobLifecycle } = useDemo();

  // Fallback demo job if none is passed in (matches Image 3 & Image 5)
  const defaultJob: WorkerJob = {
    id: 'REF-123',
    workerId: 'user-specialist',
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
    status: 'accepted',
    rate: 100,
    tip: 10,
    totalPayout: 110,
    notes: 'Please bring extra supplies and check in at the back entrance.',
  };

  const [currentJob, setCurrentJob] = useState<WorkerJob>(initialJob || defaultJob);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isScheduledOrAccepted = currentJob.status === 'scheduled' || currentJob.status === 'accepted';
  const isEnRoute = currentJob.status === 'en_route';
  const isInProgress = currentJob.status === 'in_progress';
  const isCompleted = currentJob.status === 'completed';

  // Handle Start Travel
  const handleStartTravel = () => {
    const updated = {
      ...currentJob,
      status: 'en_route' as WorkerJobStatus,
      enRouteAt: new Date().toISOString(),
    };
    setCurrentJob(updated);
    updateWorkerJobLifecycle(currentJob.id, 'en_route', updated);
    setToastMessage('Status updated: Heading to venue (En Route). Host business notified.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Confirm Check-In from Modal (Image 4)
  const handleConfirmCheckIn = () => {
    const nowIso = new Date().toISOString();
    const updated = {
      ...currentJob,
      status: 'in_progress' as WorkerJobStatus,
      checkInTime: nowIso,
    };
    setCurrentJob(updated);
    updateWorkerJobLifecycle(currentJob.id, 'in_progress', updated);
    setShowCheckInModal(false);
    setToastMessage('Checked in successfully! Job timer started & business notified.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Complete Job
  const handleCompleteJob = () => {
    const nowIso = new Date().toISOString();
    const updated = {
      ...currentJob,
      status: 'completed' as WorkerJobStatus,
      checkOutTime: nowIso,
    };
    setCurrentJob(updated);
    updateWorkerJobLifecycle(currentJob.id, 'completed', updated);
    setToastMessage('Job completed and signed off! Payout recorded.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (Exact match to Image 3 & Image 5)                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        {/* Left: Back button + Job Details text + Ref ID pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="flex items-center gap-2 text-xs font-bold text-gray-800 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-extrabold text-sm text-gray-900">Job Details</span>
          </button>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-mono font-bold rounded">
            #{currentJob.id}
          </span>
        </div>

        {/* Right: Bell, Help Question, Avatar chip */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer p-1">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </div>

          <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-gray-900">Alex Miller</div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                FIELD AGENT
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              AM
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JOB TITLE & CONFIRMED STATUS BADGE                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Job #{currentJob.id}
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Created on Jun 14, 2026 &bull; Premium Service Tier
          </p>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-500/80 bg-emerald-50/70 text-emerald-600 text-xs font-bold tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>CONFIRMED</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN 2-COLUMN GRID (Exact layout to Image 3 & Image 5)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ======================================================================= */}
        {/* LEFT COLUMN (approx 8 cols)                                             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top 2 Cards Row: Service Details + Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Service Details */}
            <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                  <Brush className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">Service Details</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Service Type</span>
                  <span className="font-bold text-gray-900">{currentJob.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Duration</span>
                  <span className="font-bold text-gray-900">{currentJob.durationMinutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Date</span>
                  <span className="font-bold text-gray-900">Jun 17, 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Time</span>
                  <span className="font-bold text-gray-900">{currentJob.scheduledStartTime}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Business Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">Business Info</h3>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  PROVIDER
                </span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {currentJob.businessName}
                </span>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-700 font-medium">{currentJob.location}</div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-black underline mt-0.5 inline-block"
                      >
                        Open in Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="text-gray-700 font-medium">555-0123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Special Instructions (Exact match to Image 3 & 5) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-3">
              <AlertCircle className="w-4 h-4 text-black" />
              <h3 className="font-bold text-sm text-gray-900">Special Instructions</h3>
            </div>

            <div className="bg-gray-100/90 border-l-4 border-black p-4 rounded-r-lg">
              <p className="text-xs italic text-gray-800 font-medium">
                "{currentJob.notes || 'Please bring extra supplies and check in at the back entrance.'}"
              </p>
            </div>
          </div>

          {/* Card 4: Location Map (Exact match to Image 3 & 5) */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="h-64 sm:h-72 w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
              {/* Stylized Grayscale World/Street Map Graphic */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-multiply bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
                }}
              />

              {/* Pin Marker (matching screenshot) */}
              <div className="relative z-10 flex flex-col items-center animate-bounce duration-1000">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
                <div className="w-3 h-1 bg-black/40 rounded-full blur-xs mt-1" />
              </div>

              {/* Map Controls / Watermark */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700 border border-gray-200">
                123 Business Way, Suite 100
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN (approx 4 cols)                                            */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Customer (Exact match to Image 3 & 5) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <User className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-sm text-gray-900">Customer</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{currentJob.customerName}</h4>
                <p className="text-xs text-gray-400 font-medium">Member since 2023</p>
              </div>
            </div>

            <a
              href={`tel:${currentJob.customerPhone}`}
              className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-gray-700" />
              <span>{currentJob.customerPhone}</span>
            </a>
          </div>

          {/* Card 2: Payment Summary (Exact match to Image 3 & 5) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-sm text-gray-900">Payment Summary</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span>Service Fee</span>
                <span className="text-gray-900 font-semibold">$100.00</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Service Tax</span>
                <span className="text-gray-900 font-semibold">$10.00</span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-base text-gray-900">$110.00</span>
              </div>
            </div>

            <div className="mt-4 p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>Credit Card</span>
              </div>
              <span className="font-mono text-[11px] text-gray-400">•••• 4242</span>
            </div>
          </div>

          {/* Card 3: Timeline (Exact match to Image 3 & 5) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <Clock className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-sm text-gray-900">Timeline</h3>
            </div>

            <div className="relative pl-6 space-y-5 text-xs">
              {/* Stepper 1: Assigned */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div className="font-bold text-gray-900">Assigned</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Jun 14, 2:00 PM</div>
              </div>

              {/* Vertical connector line */}
              <div className="absolute left-[7px] top-4 bottom-3 w-0.5 bg-gray-200" />

              {/* Stepper 2: Started Travel */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    isEnRoute || isInProgress || isCompleted
                      ? 'bg-black text-white'
                      : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {(isEnRoute || isInProgress || isCompleted) && <Check className="w-2.5 h-2.5" />}
                </div>
                <div className={`font-bold ${isEnRoute || isInProgress || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  Started Travel
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {isEnRoute || isInProgress || isCompleted ? 'En Route to Venue' : '--'}
                </div>
              </div>

              {/* Stepper 3: Checked In */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    isInProgress || isCompleted
                      ? 'bg-black text-white'
                      : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {(isInProgress || isCompleted) && <Check className="w-2.5 h-2.5" />}
                </div>
                <div className={`font-bold ${isInProgress || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  Checked In
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {isInProgress || isCompleted ? 'Geo-Fencing Verified' : '--'}
                </div>
              </div>

              {/* Stepper 4: Completed */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-black text-white' : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted && <Check className="w-2.5 h-2.5" />}
                </div>
                <div className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  Completed
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {isCompleted ? 'Signed off & closed' : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTION BAR (Exact match to Image 3 & Image 5)                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('support-tickets')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
            <span>Contact Customer</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('support-tickets')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            <span>Contact Business</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('support-tickets')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Report Issue</span>
          </button>
        </div>

        {/* Right Action Buttons (Transitions: Image 5 -> Image 3) */}
        <div className="flex items-center gap-3">
          {/* If scheduled or accepted: Show "Start Travel" (black) & "Navigate" (white) [Image 5] */}
          {isScheduledOrAccepted && (
            <>
              <button
                type="button"
                onClick={handleStartTravel}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Start Travel</span>
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.location)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-gray-700" />
                <span>Navigate</span>
              </a>
            </>
          )}

          {/* If En Route: Show "Navigate" (white) & "Check-In" (black) [Image 3] */}
          {isEnRoute && (
            <>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.location)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-gray-700" />
                <span>Navigate</span>
              </a>

              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowRightFromLine className="w-4 h-4" />
                <span>Check-In</span>
              </button>
            </>
          )}

          {/* If In Progress: Show Complete Job button */}
          {isInProgress && (
            <button
              type="button"
              onClick={handleCompleteJob}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Complete Job</span>
            </button>
          )}

          {/* If Completed */}
          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Job Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CHECK-IN CONFIRMATION MODAL (Exact match to Image 4)                   */}
      {/* ========================================================================= */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-150">
            {/* Top Pin Icon Circle */}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-black" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Check-In Confirmation
            </h2>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Are you currently at <strong className="text-gray-900 font-bold">123 Business Way</strong>? Checking in will notify the business and start the job timer.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className="w-full py-3 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Confirm Check-In
              </button>

              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="w-full py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Footer Geo-Fencing Strip */}
            <div className="pt-4 mt-5 border-t border-gray-100 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              GEO-FENCING VERIFIED &bull; 12:44 PM
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
