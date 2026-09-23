import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Briefcase,
  Play,
  CheckCircle2,
  Copy,
  Building2,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Check,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { WorkerJob, WorkerBusinessSchedule, WorkerContract } from '../../../types';
import { DAY_NAMES } from '../../../utils/serviceBookingUtils';

interface WorkerCalendarPageProps {
  workerId: string;
  onSelectJob: (job: WorkerJob) => void;
  onNavigate: (page: string) => void;
}

const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

interface DayScheduleRow {
  day_of_week: number;
  day_name: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

function parseTimeToMinutes(tStr: string): number {
  if (!tStr) return 0;
  const cleaned = tStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const timePart = cleaned.replace(/AM|PM/g, '').trim();
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export const WorkerCalendarPage: React.FC<WorkerCalendarPageProps> = ({
  workerId,
  onSelectJob,
  onNavigate,
}) => {
  // Top View Switcher: Weekly Operating Schedule (Matching prompt screenshot) vs Monthly Calendar
  const [activeView, setActiveView] = useState<'weekly-schedule' | 'monthly-calendar'>('weekly-schedule');

  // Multi-Business Schedule & Contracts State
  const [contracts, setContracts] = useState<WorkerContract[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [allSchedules, setAllSchedules] = useState<WorkerBusinessSchedule[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [hoursSaveSuccess, setHoursSaveSuccess] = useState(false);

  // 7-day Form state for currently selected business
  const [dayRows, setDayRows] = useState<DayScheduleRow[]>(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => ({
      day_of_week: dayIdx,
      day_name: DAY_NAMES[dayIdx],
      open_time: '08:30 AM',
      close_time: '07:00 PM',
      is_closed: dayIdx === 0, // Sunday closed by default like screenshot
    }));
  });

  // Monthly Calendar State
  const [jobs, setJobs] = useState<WorkerJob[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  // Fetch Contracts, Schedule, and Calendar Jobs
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsScheduleLoading(true);
      setIsCalendarLoading(true);
      try {
        const [contractsData, schedulesData, calendarJobs] = await Promise.all([
          workerService.getContracts(workerId),
          workerService.getSchedule(workerId),
          workerService.getCalendar(workerId),
        ]);

        setContracts(contractsData);
        setAllSchedules(schedulesData);
        setJobs(calendarJobs);

        if (contractsData.length > 0) {
          const defaultBiz = contractsData[0].businessId || 'biz-salon-01';
          setSelectedBusinessId(defaultBiz);
        }
      } catch (err) {
        console.error('Failed to load worker calendar/schedule data:', err);
      } finally {
        setIsScheduleLoading(false);
        setIsCalendarLoading(false);
      }
    };
    fetchInitialData();
  }, [workerId]);

  // When selectedBusinessId or allSchedules changes, populate the 7-day rows for that business
  useEffect(() => {
    if (!selectedBusinessId) return;

    const matchedContract = contracts.find(
      (c) => c.businessId === selectedBusinessId || c.id === selectedBusinessId
    );
    const targetBizName = matchedContract?.businessName || '';

    const newRows: DayScheduleRow[] = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
      const existingSlot = allSchedules.find(
        (s) =>
          Number(s.dayOfWeek) === dayIdx &&
          (s.businessId === selectedBusinessId ||
            (targetBizName && s.businessName.toLowerCase() === targetBizName.toLowerCase()))
      );

      if (existingSlot) {
        return {
          day_of_week: dayIdx,
          day_name: DAY_NAMES[dayIdx],
          open_time: existingSlot.startTime || '08:30 AM',
          close_time: existingSlot.endTime || '07:00 PM',
          is_closed: !existingSlot.isAvailable,
        };
      }

      // Default fallback
      return {
        day_of_week: dayIdx,
        day_name: DAY_NAMES[dayIdx],
        open_time: '08:30 AM',
        close_time: '07:00 PM',
        is_closed: dayIdx === 0, // Sunday closed by default
      };
    });

    setDayRows(newRows);
  }, [selectedBusinessId, allSchedules, contracts]);

  // Selected Business Object
  const selectedBusinessContract = useMemo(() => {
    return (
      contracts.find(
        (c) => c.businessId === selectedBusinessId || c.id === selectedBusinessId
      ) ||
      contracts[0] || {
        id: 'ctr-default',
        businessId: 'biz-salon-01',
        businessName: 'Glow Salon & Hair Studio',
        hourlyRate: 85,
        status: 'active',
        contractType: 'independent_contractor',
      }
    );
  }, [contracts, selectedBusinessId]);

  // Active days count for the badge (matching screenshot)
  const activeDaysCount = useMemo(() => {
    return dayRows.filter((r) => !r.is_closed).length;
  }, [dayRows]);

  // Toggle Day Open/Closed
  const handleToggleDayClosed = (dayIdx: number) => {
    setDayRows((prev) =>
      prev.map((r) => (r.day_of_week === dayIdx ? { ...r, is_closed: !r.is_closed } : r))
    );
  };

  // Update Open/Close Time
  const handleUpdateDayTime = (
    dayIdx: number,
    field: 'open_time' | 'close_time',
    value: string
  ) => {
    setDayRows((prev) =>
      prev.map((r) => (r.day_of_week === dayIdx ? { ...r, [field]: value } : r))
    );
  };

  // Copy Day Hours to All Days (matching screenshot feature)
  const handleCopyDayToAll = (sourceDayIdx: number) => {
    const source = dayRows.find((r) => r.day_of_week === sourceDayIdx);
    if (!source || source.is_closed) return;

    setDayRows((prev) =>
      prev.map((r) => ({
        ...r,
        open_time: source.open_time,
        close_time: source.close_time,
      }))
    );
  };

  // Save Hours to Neon PostgreSQL Database
  const handleSaveHours = async () => {
    setIsSavingHours(true);
    setHoursSaveSuccess(false);

    try {
      const bizId = selectedBusinessContract.businessId || selectedBusinessId || 'biz-salon-01';
      const bizName = selectedBusinessContract.businessName || 'Glow Salon & Hair Studio';
      const rate = String(selectedBusinessContract.hourlyRate || 85);

      // 1. Keep slots for OTHER businesses
      const otherBusinessesSlots = allSchedules.filter(
        (s) =>
          s.businessId !== bizId &&
          s.businessName.toLowerCase() !== bizName.toLowerCase()
      );

      // 2. Convert active dayRows into slots for THIS business
      const thisBusinessNewSlots: WorkerBusinessSchedule[] = dayRows
        .filter((r) => !r.is_closed)
        .map((r) => ({
          id: `sch-${workerId}-${r.day_of_week}-${bizId}`,
          workerId,
          businessId: bizId,
          businessName: bizName,
          dayOfWeek: r.day_of_week,
          dayName: r.day_name,
          startTime: r.open_time,
          endTime: r.close_time,
          isAvailable: true,
          hourlyRate: rate,
          notes: `Regular shift for ${bizName}`,
        }));

      const combinedSlots = [...otherBusinessesSlots, ...thisBusinessNewSlots];

      const res = await workerService.saveSchedule(workerId, combinedSlots);
      if (res.success) {
        setAllSchedules(res.schedule);
        setHoursSaveSuccess(true);
        setTimeout(() => setHoursSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save hours:', err);
      alert('Error saving hours to database.');
    } finally {
      setIsSavingHours(false);
    }
  };

  // Monthly Calendar Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDayJobs = jobs.filter((j) => j.scheduledDate === selectedDateStr);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header with View Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              Worker Operating Schedule
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Live DB Synced
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Shift & Operating Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Select a partner business and configure the weekly hours you will work in it. Partner venues check your availability in real-time.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('weekly-schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'weekly-schedule'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Weekly Operating Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('monthly-calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'monthly-calendar'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Monthly Shift Calendar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: WEEKLY OPERATING SCHEDULE (MATCHES USER SCREENSHOT EXACTLY)        */}
      {/* ========================================================================= */}
      {activeView === 'weekly-schedule' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Business Selector Header Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Select Partner Business To Configure
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer max-w-[320px] truncate"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.businessId || c.id}>
                        {c.businessName} (${c.hourlyRate}/hr)
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Active Partner
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 font-medium">
              <span>Contracted Rate:</span>
              <strong className="text-slate-900 font-black text-sm">
                ${selectedBusinessContract.hourlyRate}/hr
              </strong>
            </div>
          </div>

          {/* Main 2-Column Grid: 7-Day Operating Schedule (Left) + Partner Info (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: The Exact Card from the User's Screenshot */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
                {/* Card Header matching Screenshot */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Weekly Operating Schedule
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      DBML schema `business_hours` (0 = Sunday to 6 = Saturday)
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {activeDaysCount} Days Active
                  </span>
                </div>

                {/* 7-Day Rows matching Screenshot */}
                <div className="space-y-2.5">
                  {dayRows.map((row) => {
                    const isClosed = row.is_closed;

                    return (
                      <div
                        key={row.day_of_week}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isClosed
                            ? 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        {/* Day Title & Toggle Switch */}
                        <div className="flex items-center gap-3 w-40 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleDayClosed(row.day_of_week)}
                            className={`w-8 h-5 rounded-full transition-colors relative cursor-pointer ${
                              !isClosed ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={!isClosed ? 'Click to mark Closed / Off-duty' : 'Click to mark Open'}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                                !isClosed ? 'left-4' : 'left-0.75'
                              }`}
                            />
                          </button>
                          <div>
                            <span
                              className={`text-xs font-extrabold ${
                                !isClosed ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {row.day_name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {row.day_of_week === 0 || row.day_of_week === 6 ? 'Weekend' : 'Weekday'}
                            </span>
                          </div>
                        </div>

                        {/* Hours Dropdowns or Closed Notice */}
                        <div className="flex-1 flex items-center gap-2">
                          {!isClosed ? (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-slate-400 font-medium text-[11px]">Open:</span>
                              <select
                                value={row.open_time}
                                onChange={(e) =>
                                  handleUpdateDayTime(row.day_of_week, 'open_time', e.target.value)
                                }
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`open-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>

                              <span className="text-slate-400 font-medium text-[11px]">to</span>

                              <select
                                value={row.close_time}
                                onChange={(e) =>
                                  handleUpdateDayTime(row.day_of_week, 'close_time', e.target.value)
                                }
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                              >
                                {TIME_OPTIONS.map((t) => (
                                  <option key={`close-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">
                              Closed all day. No slots will be offered to customers.
                            </span>
                          )}
                        </div>

                        {/* Copy to All Button */}
                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => handleCopyDayToAll(row.day_of_week)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                            title="Copy these hours to all days"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy to All</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Footer matching Screenshot */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400 font-medium">
                    Changes will immediately apply to customer availability calculations.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveHours}
                    disabled={isSavingHours}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isSavingHours ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : hoursSaveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save Hours</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Partner Business Context & Cross-Venue Allocation */}
            <div className="space-y-5">
              {/* Active Business Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Configuring Schedule For
                  </h4>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <h5 className="text-sm font-black text-slate-900">
                    {selectedBusinessContract.businessName}
                  </h5>
                  <p className="text-xs text-slate-500 font-medium">
                    Contract: {selectedBusinessContract.status.toUpperCase()} ({selectedBusinessContract.contractType})
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    ${selectedBusinessContract.hourlyRate}/hour contracted
                  </p>
                </div>
              </div>

              {/* Cross-Business Schedule Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Other Partner Venues
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400">
                    {contracts.filter((c) => (c.businessId || c.id) !== selectedBusinessId).length} Other
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {contracts
                    .filter((c) => (c.businessId || c.id) !== selectedBusinessId)
                    .map((otherC) => {
                      const otherBizId = otherC.businessId || otherC.id;
                      const otherSlots = allSchedules.filter(
                        (s) =>
                          s.businessId === otherBizId ||
                          s.businessName.toLowerCase() === otherC.businessName.toLowerCase()
                      );

                      return (
                        <div
                          key={otherC.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{otherC.businessName}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedBusinessId(otherBizId)}
                              className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Switch to this venue →
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {otherSlots.length} active scheduled days ({otherSlots.length * 4} approx hrs/week)
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Real-time Availability Rule Note */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Dispatch Match</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  When a customer books an appointment at <strong>{selectedBusinessContract.businessName}</strong>, only the hours you specify here will be treated as available for assignment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: MONTHLY SHIFT CALENDAR & BOOKINGS AGENDA                          */}
      {/* ========================================================================= */}
      {activeView === 'monthly-calendar' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDateStr(today.toISOString().split('T')[0]);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Today
            </button>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-xs font-black text-slate-800">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left (2 Cols): Calendar Grid */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank leading days */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/40 opacity-40" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayJobs = jobs.filter((j) => j.scheduledDate === dateStr);
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : isSelected
                              ? 'text-blue-900 font-black'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {dayJobs.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                            {dayJobs.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        {dayJobs.slice(0, 2).map((j) => (
                          <div
                            key={j.id}
                            className={`text-[9px] font-medium truncate px-1.5 py-0.5 rounded ${
                              j.status === 'in_progress'
                                ? 'bg-blue-600 text-white'
                                : j.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {j.scheduledStartTime} {j.title}
                          </div>
                        ))}
                        {dayJobs.length > 2 && (
                          <div className="text-[9px] text-slate-400 font-bold px-1">
                            +{dayJobs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right (1 Col): Selected Day Agenda */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Selected Day
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {selectedDayJobs.length} {selectedDayJobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>

              <div className="space-y-3">
                {selectedDayJobs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No jobs scheduled on this date.
                  </div>
                ) : (
                  selectedDayJobs.map((job) => {
                    const isInProgress = job.status === 'in_progress';

                    return (
                      <div
                        key={job.id}
                        onClick={() => {
                          onSelectJob(job);
                          onNavigate('job-details');
                        }}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</span>
                          <span className="text-xs font-black text-slate-900">${job.totalPayout}</span>
                        </div>

                        <p className="text-[11px] text-blue-600 font-semibold">{job.businessName}</p>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {job.scheduledStartTime} – {job.scheduledEndTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{job.location}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : job.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {job.status.replace('_', ' ')}
                          </span>

                          <span className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
