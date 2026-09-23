import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  Search,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Business, Booking, AvailableWorkerResult, WorkerBusinessSchedule } from '../../types';
import { workerService } from '../../services/api/marketplaceApi';
import { useDemo } from '../../context/DemoContext';

interface BusinessWorkersManagementViewProps {
  business: Business;
  allBusinesses: Business[];
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
}

export const BusinessWorkersManagementView: React.FC<BusinessWorkersManagementViewProps> = ({
  business,
  allBusinesses,
  bookings,
  onSelectBooking,
}) => {
  const { users } = useDemo();
  const [activeTab, setActiveTab] = useState<'checker' | 'roster' | 'matrix'>('checker');

  // Availability Checker State
  const [targetDate, setTargetDate] = useState<string>(() => {
    // Default to upcoming Monday or today
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [isChecking, setIsChecking] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<AvailableWorkerResult[]>([]);
  const [availabilityMeta, setAvailabilityMeta] = useState<{
    dayName: string;
    availableCount: number;
    businessName: string;
  } | null>(null);

  // Dispatch / Assign Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedWorkerForDispatch, setSelectedWorkerForDispatch] = useState<AvailableWorkerResult | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [dispatchCustomTitle, setDispatchCustomTitle] = useState('');
  const [dispatchCustomerName, setDispatchCustomerName] = useState('');
  const [dispatchCustomerPhone, setDispatchCustomerPhone] = useState('');
  const [dispatchLocation, setDispatchLocation] = useState('');
  const [dispatchRate, setDispatchRate] = useState('85.00');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Add Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffTitle, setStaffTitle] = useState('Certified Specialist & Operator');
  const [staffDepartment, setStaffDepartment] = useState('Service & Client Operations');
  const [staffRate, setStaffRate] = useState('85');
  const [staffCommission, setStaffCommission] = useState('75');
  const [staffContractType, setStaffContractType] = useState('independent_contractor');
  const [staffWorkDays, setStaffWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [staffStartTime, setStaffStartTime] = useState('09:00 AM');
  const [staffEndTime, setStaffEndTime] = useState('05:00 PM');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [addStaffError, setAddStaffError] = useState<string | null>(null);

  const businessId = business.id || 'biz-salon-01';
  const businessName = business.coreDetails?.businessName || (business as any)?.name || 'Glow Salon & Hair Studio';

  // Run availability check
  const checkAvailability = async (dateStr: string, slotStr: string) => {
    setIsChecking(true);
    try {
      const res = await workerService.getAvailableWorkersForBusiness(businessId, {
        date: dateStr,
        timeSlot: slotStr,
      });

      if (res.success) {
        setAvailableWorkers(res.workers);
        setAvailabilityMeta({
          dayName: res.dayName,
          availableCount: res.availableCount,
          businessName: res.businessName,
        });
      }
    } catch (err) {
      console.error('Failed to check worker availability:', err);
    } finally {
      setIsChecking(false);
    }
  };

  // Initial load
  useEffect(() => {
    checkAvailability(targetDate, selectedTimeSlot);
  }, [businessId, targetDate, selectedTimeSlot]);

  // Open dispatch modal
  const handleOpenDispatch = (workerRes: AvailableWorkerResult) => {
    setSelectedWorkerForDispatch(workerRes);
    setDispatchRate(String(workerRes.contract?.hourlyRate || 85));

    // Try to auto-pick first booking for this business
    const unassigned = bookings.filter(
      (b) => b.business_id === businessId || b.business_id === business.id
    );
    if (unassigned.length > 0) {
      const firstB = unassigned[0];
      setSelectedBookingId(firstB.id);
      setDispatchCustomTitle(firstB.items?.[0]?.service_name || 'Salon & Specialist Session');
      setDispatchCustomerName(firstB.customer_name);
      setDispatchCustomerPhone(firstB.customer_phone || '+1 (555) 432-8899');
      setDispatchLocation(firstB.business_address || 'Studio Main Floor, Station 4');
    } else {
      setSelectedBookingId('');
      setDispatchCustomTitle('On-Site Specialist Appointment');
      setDispatchCustomerName('Walk-In Customer');
      setDispatchCustomerPhone('+1 (555) 432-8899');
      setDispatchLocation(business.coreDetails?.address || '742 Evergreen Terrace, New York, NY');
    }

    setIsDispatchModalOpen(true);
  };

  // Execute assignment
  const handleConfirmAssignment = async () => {
    if (!selectedWorkerForDispatch) return;
    setIsDispatching(true);
    setDispatchSuccessMsg(null);

    try {
      const [startT, endT] = selectedTimeSlot.split('-').map((s) => s.trim());
      const res = await workerService.assignWorkerToJob(businessId, {
        workerId: selectedWorkerForDispatch.worker.id,
        bookingId: selectedBookingId || undefined,
        title: dispatchCustomTitle || 'Specialist Appointment',
        serviceCategory: 'Specialist Operation',
        customerName: dispatchCustomerName || 'Valued Customer',
        customerPhone: dispatchCustomerPhone,
        location: dispatchLocation,
        scheduledDate: targetDate,
        scheduledStartTime: startT || '10:00 AM',
        scheduledEndTime: endT || '12:00 PM',
        durationMinutes: 120,
        rate: dispatchRate,
        notes: `Assigned for ${businessName} via Real-Time Worker Availability Dispatcher.`,
      });

      if (res.success) {
        setIsDispatchModalOpen(false);
        setDispatchSuccessMsg(
          `Successfully assigned ${dispatchCustomTitle} to ${selectedWorkerForDispatch.worker.fullName}! Job #${res.job.id} created.`
        );
        // Refresh availability
        checkAvailability(targetDate, selectedTimeSlot);
        setTimeout(() => setDispatchSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Failed to assign job:', err);
      alert('Error assigning job to worker.');
    } finally {
      setIsDispatching(false);
    }
  };

  // Add Staff Handler
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFullName.trim() || !staffEmail.trim()) {
      setAddStaffError('Staff member full name and email are required.');
      return;
    }

    setIsAddingStaff(true);
    setAddStaffError(null);

    try {
      const res = await workerService.addStaffToBusiness(businessId, {
        fullName: staffFullName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || undefined,
        title: staffTitle.trim(),
        department: staffDepartment.trim(),
        hourlyRate: staffRate,
        commissionPercentage: staffCommission,
        contractType: staffContractType,
        workDays: staffWorkDays,
        startTime: staffStartTime,
        endTime: staffEndTime,
      });

      if (res.success) {
        setIsAddStaffModalOpen(false);
        setDispatchSuccessMsg(res.message || `Successfully added ${staffFullName} to staff roster!`);
        setStaffFullName('');
        setStaffEmail('');
        setStaffPhone('');
        await checkAvailability(targetDate, selectedTimeSlot);
        setTimeout(() => setDispatchSuccessMsg(null), 6000);
      }
    } catch (err: any) {
      setAddStaffError(err.message || 'Failed to add staff member.');
    } finally {
      setIsAddingStaff(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" />
              Staff & Specialists Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Real-Time Cross-Business Availability
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Specialist Workers & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl font-medium">
            Monitor contracted staff working across partner venues. Check worker availability by date and time slot, detect when they are scheduled at other businesses, and assign customer bookings directly.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsAddStaffModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </button>

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('checker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'checker'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Availability</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Roster ({availableWorkers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {dispatchSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setDispatchSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: LIVE AVAILABILITY CHECKER & DISPATCHER                         */}
      {/* ===================================================================== */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          {/* Query Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Customer Booking Schedule Checker
              </span>
              <button
                type="button"
                onClick={() => checkAvailability(targetDate, selectedTimeSlot)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Refresh Query</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Appointment Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              {/* Time Slot Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Required Service Time Slot</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="09:00 AM - 12:00 PM">Morning: 09:00 AM – 12:00 PM</option>
                  <option value="10:00 AM - 12:00 PM">Mid-Morning: 10:00 AM – 12:00 PM</option>
                  <option value="01:00 PM - 03:00 PM">Early Afternoon: 01:00 PM – 03:00 PM</option>
                  <option value="02:00 PM - 05:00 PM">Afternoon: 02:00 PM – 05:00 PM</option>
                  <option value="03:00 PM - 06:00 PM">Late Afternoon: 03:00 PM – 06:00 PM</option>
                  <option value="05:00 PM - 08:00 PM">Evening: 05:00 PM – 08:00 PM</option>
                </select>
              </div>

              {/* Venue Context */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Target Business Venue</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-black text-slate-900 truncate">{businessName}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 shrink-0">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Summary Pill */}
            {availabilityMeta && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Querying <strong>{availabilityMeta.dayName}</strong> ({targetDate}) at{' '}
                    <strong>{selectedTimeSlot}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-slate-500">Available Specialists:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      availabilityMeta.availableCount > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {availabilityMeta.availableCount} Available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Contracted Specialists Availability Status ({availableWorkers.length})
            </h3>

            {availableWorkers.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900">No Staff or Specialists Contracted Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add staff specialists to your venue to manage shift coverage, check cross-business availability, and dispatch bookings.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Staff Member</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await workerService.seedDefaultWorkers();
                      checkAvailability(targetDate, selectedTimeSlot);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Load Default Specialists (Morgan Blake)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWorkers.map((res) => {
                  const liveUser = users.find((u) => u.id === res.worker.id || u.fullName.toLowerCase() === res.worker.fullName.toLowerCase());
                  const liveAvail = liveUser?.availabilityStatus;
                  const isOffline = liveAvail === 'offline';
                  const isOnBreak = liveAvail === 'break';
                  const isAvailable = !isOffline && !isOnBreak && res.availabilityStatus === 'available';
                  const isBusyOther = !isOffline && !isOnBreak && res.availabilityStatus === 'busy_other_business';
                  const isBusyJob = !isOffline && !isOnBreak && (liveAvail === 'busy' || res.availabilityStatus === 'busy_job');

                  return (
                    <div
                      key={res.worker.id}
                      className={`p-5 rounded-3xl bg-white border transition-all shadow-2xs space-y-4 ${
                        isAvailable
                          ? 'border-emerald-200 hover:border-emerald-300'
                          : isBusyOther || isOnBreak
                          ? 'border-amber-200 hover:border-amber-300'
                          : isOffline
                          ? 'border-slate-200 opacity-80'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Worker Profile & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                            {res.worker.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-slate-900">{res.worker.fullName}</h4>
                              <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[9px] font-extrabold border border-blue-200">
                                Worker
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {liveUser?.skills && liveUser.skills.length > 0
                                ? liveUser.skills.slice(0, 2).join(' • ')
                                : res.contract?.title || 'Certified Specialist'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {res.worker.email} {res.worker.phone ? `• ${res.worker.phone}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isOffline && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Offline
                            </span>
                          )}
                          {isOnBreak && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              On Break
                            </span>
                          )}
                          {!isOffline && !isOnBreak && isAvailable && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Available
                            </span>
                          )}
                          {!isOffline && !isOnBreak && isBusyOther && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                              <AlertTriangle className="w-3 h-3" />
                              Busy Other Biz
                            </span>
                          )}
                          {!isOffline && !isOnBreak && isBusyJob && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                              <Clock className="w-3 h-3" />
                              Busy On Job
                            </span>
                          )}
                          {!isOffline && !isOnBreak && res.availabilityStatus === 'off_duty' && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center gap-1">
                              Off-Duty
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Availability Detail Box */}
                      <div
                        className={`p-3 rounded-2xl text-xs font-medium ${
                          isAvailable
                            ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
                            : isBusyOther || isOnBreak
                            ? 'bg-amber-50/70 border border-amber-100 text-amber-900'
                            : 'bg-slate-50 border border-slate-100 text-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed">
                          {isOffline
                            ? 'Specialist is currently offline. Direct assignments will queue an automated dispatch notification.'
                            : isOnBreak
                            ? `Specialist is temporarily on break${liveUser?.statusNote ? `: "${liveUser.statusNote}"` : ''}.`
                            : res.availabilityMessage}
                        </p>
                        {isBusyOther && res.conflictingBusinessName && (
                          <div className="mt-1 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>Venue: {res.conflictingBusinessName}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-700 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>${res.contract?.hourlyRate || 85}/hr contracted rate</span>
                        </div>

                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDispatch(res)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Assign Work</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold italic">
                            Cannot Dispatch
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CONTRACTED ROSTER                                              */}
      {/* ===================================================================== */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Contracted Specialist Roster</h3>
              <p className="text-xs text-slate-500 font-medium">
                Specialists authorized and contracted to provide services for {businessName}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Specialist to Roster</span>
            </button>
          </div>

          {availableWorkers.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No staff contracted for this business yet.</p>
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
              >
                + Add Staff Member Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
            {availableWorkers.map((res) => (
              <div key={res.worker.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black flex items-center justify-center text-xs">
                    {res.worker.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{res.worker.fullName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{res.contract?.title}</p>
                    <p className="text-[11px] text-slate-400">
                      Contract: {res.contract?.status.toUpperCase()} • Rate: ${res.contract?.hourlyRate}/hr
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('checker');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    Check Availability
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDispatch(res)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Dispatch Now
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: WEEKLY COVERAGE MATRIX                                         */}
      {/* ===================================================================== */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900">Weekly Specialist Coverage Matrix</h3>
            <p className="text-xs text-slate-500 font-medium">
              Overview of scheduled specialist hours committed to {businessName} vs other venues across the week.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Specialist</th>
                  <th className="py-3 px-2">Mon</th>
                  <th className="py-3 px-2">Tue</th>
                  <th className="py-3 px-2">Wed</th>
                  <th className="py-3 px-2">Thu</th>
                  <th className="py-3 px-2">Fri</th>
                  <th className="py-3 px-2">Sat</th>
                  <th className="py-3 px-2">Sun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableWorkers.map((res) => {
                  const schedules = res.daySchedules || [];
                  const days = [1, 2, 3, 4, 5, 6, 0];

                  return (
                    <tr key={res.worker.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {res.worker.fullName}
                      </td>
                      {days.map((dayNum) => {
                        const daySlots = schedules.filter((s) => s.dayOfWeek === dayNum);
                        const thisBizSlot = daySlots.find(
                          (s) =>
                            s.businessId === businessId ||
                            s.businessName.toLowerCase().includes(businessName.toLowerCase().slice(0, 4))
                        );
                        const otherBizSlot = daySlots.find(
                          (s) =>
                            s.businessId !== businessId &&
                            !s.businessName.toLowerCase().includes(businessName.toLowerCase().slice(0, 4))
                        );

                        return (
                          <td key={dayNum} className="py-3 px-2 align-top">
                            {thisBizSlot ? (
                              <div className="p-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold leading-tight">
                                <div>{thisBizSlot.startTime}</div>
                                <div className="text-[9px] text-emerald-600">at {businessName.slice(0, 10)}..</div>
                              </div>
                            ) : otherBizSlot ? (
                              <div className="p-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold leading-tight">
                                <div>{otherBizSlot.startTime}</div>
                                <div className="text-[9px] text-amber-600 truncate max-w-[80px]">
                                  {otherBizSlot.businessName}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN WORKER DISPATCH                                             */}
      {/* ========================================================================= */}
      {isDispatchModalOpen && selectedWorkerForDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Assign Job to Specialist</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Dispatching to <strong>{selectedWorkerForDispatch.worker.fullName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Worker Availability Summary */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 font-medium">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Worker Verified Available for This Slot</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Target: {targetDate} at {selectedTimeSlot} ({businessName})
              </p>
            </div>

            {/* Link to Existing Booking or Manual */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Link to Customer Booking (Optional)</label>
              <select
                value={selectedBookingId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setSelectedBookingId(bId);
                  const matched = bookings.find((b) => b.id === bId);
                  if (matched) {
                    setDispatchCustomTitle(matched.items?.[0]?.service_name || 'Salon Specialist Session');
                    setDispatchCustomerName(matched.customer_name);
                    setDispatchCustomerPhone(matched.customer_phone || '+1 (555) 432-8899');
                    setDispatchLocation(matched.business_address || 'Studio Main Floor');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="">— Direct Work Order (No Booking Link) —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Booking #{b.id.slice(0, 8)} • {b.customer_name} ({b.items?.[0]?.service_name || 'Service'})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Job / Service Title</label>
              <input
                type="text"
                value={dispatchCustomTitle}
                onChange={(e) => setDispatchCustomTitle(e.target.value)}
                placeholder="e.g. Master Color Correction & Highlights"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Customer Name</label>
                <input
                  type="text"
                  value={dispatchCustomerName}
                  onChange={(e) => setDispatchCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Customer Phone</label>
                <input
                  type="text"
                  value={dispatchCustomerPhone}
                  onChange={(e) => setDispatchCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 432-8899"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Location & Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Location / Workstation</label>
                <input
                  type="text"
                  value={dispatchLocation}
                  onChange={(e) => setDispatchLocation(e.target.value)}
                  placeholder="e.g. Suite 104, Station 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Payout Rate ($)</label>
                <input
                  type="number"
                  value={dispatchRate}
                  onChange={(e) => setDispatchRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isDispatching || !dispatchCustomTitle || !dispatchCustomerName}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-slate-900/20"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Assignment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD NEW STAFF / SPECIALIST                                    */}
      {/* ===================================================================== */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative space-y-4 my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Staff Member</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Contract & roster for {businessName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addStaffError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{addStaffError}</span>
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffFullName}
                    onChange={(e) => setStaffFullName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g. elena.vance@uspot.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Phone & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+1 (555) 234-9876"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Staff Role / Title</label>
                  <input
                    type="text"
                    value={staffTitle}
                    onChange={(e) => setStaffTitle(e.target.value)}
                    placeholder="e.g. Master Colorist & Stylist"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Department & Contract Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Department</label>
                  <input
                    type="text"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    placeholder="e.g. Salon Floor / Styling"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Contract Agreement Type</label>
                  <select
                    value={staffContractType}
                    onChange={(e) => setStaffContractType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="independent_contractor">Independent Contractor (1099)</option>
                    <option value="w2_hourly">W-2 Hourly Employee</option>
                    <option value="master_service_agreement">Master Service Agreement (MSA)</option>
                  </select>
                </div>
              </div>

              {/* Financials: Hourly Rate & Commission */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Hourly Rate ($/hr)</label>
                  <input
                    type="number"
                    min="15"
                    max="500"
                    value={staffRate}
                    onChange={(e) => setStaffRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Commission Split (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffCommission}
                    onChange={(e) => setStaffCommission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Work Days Checkbox Pills */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 block">Committed Work Shift Days</label>
                <div className="grid grid-cols-7 gap-1">
                  {[
                    { day: 1, label: 'Mon' },
                    { day: 2, label: 'Tue' },
                    { day: 3, label: 'Wed' },
                    { day: 4, label: 'Thu' },
                    { day: 5, label: 'Fri' },
                    { day: 6, label: 'Sat' },
                    { day: 0, label: 'Sun' },
                  ].map(({ day, label }) => {
                    const isSelected = staffWorkDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setStaffWorkDays((prev) =>
                            isSelected ? prev.filter((d) => d !== day) : [...prev, day]
                          );
                        }}
                        className={`py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Shift Start Time</label>
                  <input
                    type="text"
                    value={staffStartTime}
                    onChange={(e) => setStaffStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Shift End Time</label>
                  <input
                    type="text"
                    value={staffEndTime}
                    onChange={(e) => setStaffEndTime(e.target.value)}
                    placeholder="05:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStaff || !staffFullName || !staffEmail}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {isAddingStaff ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Staff Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Contract & Add to Roster</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
