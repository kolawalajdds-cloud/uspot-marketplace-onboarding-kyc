import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  DollarSign,
  ShieldCheck,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { WorkerBusinessSchedule, WorkerContract } from '../../../types';

interface WorkerMultiBusinessSchedulePageProps {
  workerId: string;
}

const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: 'Monday', short: 'Mon' },
  { dayOfWeek: 2, name: 'Tuesday', short: 'Tue' },
  { dayOfWeek: 3, name: 'Wednesday', short: 'Wed' },
  { dayOfWeek: 4, name: 'Thursday', short: 'Thu' },
  { dayOfWeek: 5, name: 'Friday', short: 'Fri' },
  { dayOfWeek: 6, name: 'Saturday', short: 'Sat' },
  { dayOfWeek: 0, name: 'Sunday', short: 'Sun' },
];

const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

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

export const WorkerMultiBusinessSchedulePage: React.FC<WorkerMultiBusinessSchedulePageProps> = ({
  workerId,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday
  const [scheduleSlots, setScheduleSlots] = useState<WorkerBusinessSchedule[]>([]);
  const [contracts, setContracts] = useState<WorkerContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modal / Inline Add Shift state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBusinessId, setNewBusinessId] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('12:00 PM');
  const [newHourlyRate, setNewHourlyRate] = useState('85.00');
  const [newNotes, setNewNotes] = useState('');

  // Fetch worker contracts & existing schedule
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contractsData, scheduleData] = await Promise.all([
          workerService.getContracts(workerId),
          workerService.getSchedule(workerId),
        ]);
        setContracts(contractsData);
        setScheduleSlots(scheduleData);

        if (contractsData.length > 0) {
          setNewBusinessId(contractsData[0].businessId || 'biz-salon-01');
          setNewBusinessName(contractsData[0].businessName || 'Glow Salon & Hair Studio');
          setNewHourlyRate(String(contractsData[0].hourlyRate || 85));
        }
      } catch (err) {
        console.error('Failed to fetch worker schedule data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [workerId]);

  // Slots for current selected day
  const currentDaySlots = useMemo(() => {
    return scheduleSlots
      .filter((s) => Number(s.dayOfWeek) === selectedDay)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  }, [scheduleSlots, selectedDay]);

  // Detect conflicts / overlaps on the current day
  const detectedConflicts = useMemo(() => {
    const conflicts: { slotA: WorkerBusinessSchedule; slotB: WorkerBusinessSchedule }[] = [];
    for (let i = 0; i < currentDaySlots.length; i++) {
      for (let j = i + 1; j < currentDaySlots.length; j++) {
        const a = currentDaySlots[i];
        const b = currentDaySlots[j];
        const startA = parseTimeToMinutes(a.startTime);
        const endA = parseTimeToMinutes(a.endTime);
        const startB = parseTimeToMinutes(b.startTime);
        const endB = parseTimeToMinutes(b.endTime);

        if (Math.max(startA, startB) < Math.min(endA, endB)) {
          conflicts.push({ slotA: a, slotB: b });
        }
      }
    }
    return conflicts;
  }, [currentDaySlots]);

  // Check if prospective new slot overlaps with existing slots on selected day
  const newSlotOverlap = useMemo(() => {
    if (!isAddModalOpen) return null;
    const startM = parseTimeToMinutes(newStartTime);
    const endM = parseTimeToMinutes(newEndTime);
    if (endM <= startM) return 'End time must be after start time.';

    for (const slot of currentDaySlots) {
      const sM = parseTimeToMinutes(slot.startTime);
      const eM = parseTimeToMinutes(slot.endTime);
      if (Math.max(startM, sM) < Math.min(endM, eM)) {
        return `Overlaps with existing shift at ${slot.businessName} (${slot.startTime} - ${slot.endTime}).`;
      }
    }
    return null;
  }, [isAddModalOpen, newStartTime, newEndTime, currentDaySlots]);

  // Add shift handler
  const handleAddShift = () => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDay);
    const newSlot: WorkerBusinessSchedule = {
      id: `sch-${workerId}-${selectedDay}-${Date.now()}`,
      workerId,
      businessId: newBusinessId || 'biz-salon-01',
      businessName: newBusinessName || 'Glow Salon & Hair Studio',
      dayOfWeek: selectedDay,
      dayName: dayObj?.name || 'Monday',
      startTime: newStartTime,
      endTime: newEndTime,
      isAvailable: true,
      hourlyRate: newHourlyRate,
      notes: newNotes,
    };

    setScheduleSlots((prev) => [...prev, newSlot]);
    setIsAddModalOpen(false);
    setNewNotes('');
  };

  // Delete shift handler
  const handleDeleteSlot = (id: string) => {
    setScheduleSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // Copy current day schedule to all weekdays (Monday through Friday)
  const handleCopyDayToWeekdays = () => {
    const templateSlots = currentDaySlots;
    if (templateSlots.length === 0) return;

    setScheduleSlots((prev) => {
      // Remove all slots for Mon-Fri (1, 2, 3, 4, 5)
      const nonWeekdays = prev.filter((s) => s.dayOfWeek === 0 || s.dayOfWeek === 6);
      const newWeekdaysSlots: WorkerBusinessSchedule[] = [];

      [1, 2, 3, 4, 5].forEach((day) => {
        const dayObj = DAYS_OF_WEEK.find((d) => d.dayOfWeek === day);
        templateSlots.forEach((slot, idx) => {
          newWeekdaysSlots.push({
            ...slot,
            id: `sch-${workerId}-${day}-${Date.now()}-${idx}`,
            dayOfWeek: day,
            dayName: dayObj?.name || 'Weekday',
          });
        });
      });

      return [...nonWeekdays, ...newWeekdaysSlots];
    });

    setSaveSuccessMsg(`Copied ${DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDay)?.name} schedule to all weekdays (Mon-Fri)! Click Save to persist.`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Apply default split shift preset
  const handleApplyPresetSplitShift = () => {
    const presetSlots: WorkerBusinessSchedule[] = [];
    // Mon-Fri: 9 AM - 12 PM Glow Salon, 2 PM - 6 PM Onyx Spa
    [1, 2, 3, 4, 5].forEach((day) => {
      const dayObj = DAYS_OF_WEEK.find((d) => d.dayOfWeek === day);
      presetSlots.push({
        id: `sch-${workerId}-${day}-1`,
        workerId,
        businessId: 'biz-salon-01',
        businessName: 'Glow Salon & Hair Studio',
        dayOfWeek: day,
        dayName: dayObj?.name || 'Weekday',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        isAvailable: true,
        hourlyRate: '85.00',
        notes: 'Morning haircutting & styling',
      });
      presetSlots.push({
        id: `sch-${workerId}-${day}-2`,
        workerId,
        businessId: 'biz-spa-02',
        businessName: 'Onyx Luxury Spa & Wellness',
        dayOfWeek: day,
        dayName: dayObj?.name || 'Weekday',
        startTime: '02:00 PM',
        endTime: '06:00 PM',
        isAvailable: true,
        hourlyRate: '95.00',
        notes: 'Afternoon spa sauna & wellness treatments',
      });
    });

    // Saturday: 10 AM - 4 PM Glow Salon
    presetSlots.push({
      id: `sch-${workerId}-6-1`,
      workerId,
      businessId: 'biz-salon-01',
      businessName: 'Glow Salon & Hair Studio',
      dayOfWeek: 6,
      dayName: 'Saturday',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      isAvailable: true,
      hourlyRate: '95.00',
      notes: 'Weekend prime shift',
    });

    setScheduleSlots(presetSlots);
    setSaveSuccessMsg('Applied split-shift schedule (Glow Salon mornings, Onyx Spa afternoons). Click Save to sync to database.');
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Save to database
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await workerService.saveSchedule(workerId, scheduleSlots);
      if (res.success) {
        setScheduleSlots(res.schedule);
        setSaveSuccessMsg('Schedule successfully synchronized and saved to database!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save schedule:', err);
      alert('Error saving schedule to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to get color style by business name
  const getBusinessColor = (name: string) => {
    if (name.toLowerCase().includes('salon')) {
      return {
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
        timelineBg: 'bg-rose-500',
        cardBorder: 'border-rose-200 hover:border-rose-300',
        dot: 'bg-rose-500',
      };
    }
    if (name.toLowerCase().includes('spa')) {
      return {
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        timelineBg: 'bg-emerald-500',
        cardBorder: 'border-emerald-200 hover:border-emerald-300',
        dot: 'bg-emerald-500',
      };
    }
    return {
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
      timelineBg: 'bg-blue-500',
      cardBorder: 'border-blue-200 hover:border-blue-300',
      dot: 'bg-blue-500',
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
              Multi-Business Scheduling
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Live DB Persistence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Multi-Business Working Hours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Configure your scheduled working hours across partner businesses. For instance, dedicate 9:00 AM to 12:00 PM to Business A, then 2:00 PM to 6:00 PM to Business B. Partner venues check your availability in real-time before assigning jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleApplyPresetSplitShift}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Load Dual-Business Split Shift Preset"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Split Preset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Days of Week Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = selectedDay === d.dayOfWeek;
          const dayCount = scheduleSlots.filter((s) => Number(s.dayOfWeek) === d.dayOfWeek).length;
          return (
            <button
              key={d.dayOfWeek}
              type="button"
              onClick={() => setSelectedDay(d.dayOfWeek)}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? 'bg-[#0B1120] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-bold">{d.name}</span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : dayCount > 0
                      ? 'bg-slate-200 text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {dayCount} {dayCount === 1 ? 'shift' : 'shifts'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conflict Alert If Any Overlaps Exist */}
      {detectedConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-black text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Schedule Conflict Warning on {DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDay)?.name}</span>
          </div>
          <p className="text-[11px] text-amber-700">
            You have overlapping time blocks scheduled for different businesses on this day:
          </p>
          <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-0.5">
            {detectedConflicts.map((c, idx) => (
              <li key={idx}>
                <strong>{c.slotA.businessName}</strong> ({c.slotA.startTime} - {c.slotA.endTime}) overlaps with{' '}
                <strong>{c.slotB.businessName}</strong> ({c.slotB.startTime} - {c.slotB.endTime}).
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Day Timeline & Shifts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Shift Cards & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDay)?.name} Work Allocations
                </h3>
                <p className="text-xs text-slate-400">
                  {currentDaySlots.length} business {currentDaySlots.length === 1 ? 'shift' : 'shifts'} configured
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentDaySlots.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyDayToWeekdays}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    title="Copy this day's blocks to Monday through Friday"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Copy to Mon-Fri</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Shift Block</span>
                </button>
              </div>
            </div>

            {/* Visual Time Block Bar (8 AM to 8 PM) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>08:00 AM</span>
                <span>12:00 PM</span>
                <span>04:00 PM</span>
                <span>08:00 PM</span>
              </div>
              <div className="h-6 w-full rounded-xl bg-slate-100 relative overflow-hidden border border-slate-200 flex">
                {/* Timeline window is 8 AM (480 min) to 8 PM (1200 min) = 720 minutes */}
                {currentDaySlots.map((slot) => {
                  const startM = parseTimeToMinutes(slot.startTime);
                  const endM = parseTimeToMinutes(slot.endTime);
                  const leftPercent = Math.max(0, Math.min(100, ((startM - 480) / 720) * 100));
                  const widthPercent = Math.max(5, Math.min(100 - leftPercent, ((endM - startM) / 720) * 100));
                  const colors = getBusinessColor(slot.businessName);

                  return (
                    <div
                      key={slot.id}
                      className={`absolute top-0 bottom-0 ${colors.timelineBg} opacity-85 text-white flex items-center px-1.5 text-[9px] font-black truncate shadow-xs transition-all`}
                      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                      title={`${slot.businessName}: ${slot.startTime} - ${slot.endTime}`}
                    >
                      <span className="truncate">{slot.businessName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shift Cards List */}
            {currentDaySlots.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No shifts scheduled for this day</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Add time blocks for the businesses you partner with so they know when to assign appointments to you.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Shift</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDaySlots.map((slot) => {
                  const colors = getBusinessColor(slot.businessName);
                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border ${colors.cardBorder} bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${colors.dot} shrink-0`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{slot.businessName}</h4>
                            <span className={`px-2 py-0.2 text-[10px] font-bold rounded-md border ${colors.badgeBg}`}>
                              {slot.businessId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                            <span className="flex items-center gap-1 text-slate-800 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              ${slot.hourlyRate}/hr
                            </span>
                            {slot.notes && (
                              <span className="text-slate-400 italic">"{slot.notes}"</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Remove Shift Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Contracted Businesses & Live Guidance */}
        <div className="space-y-5">
          {/* Active Partner Businesses */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Contracted Partner Venues</h3>
            </div>
            <p className="text-xs text-slate-500">
              Businesses with whom you have active specialist agreements:
            </p>

            <div className="space-y-2.5">
              {contracts.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Loading agreements...</div>
              ) : (
                contracts.map((c) => {
                  const colors = getBusinessColor(c.businessName);
                  const weekMinutes = scheduleSlots
                    .filter(
                      (s) =>
                        s.businessId === c.businessId ||
                        s.businessName.toLowerCase() === c.businessName.toLowerCase()
                    )
                    .reduce((acc, s) => {
                      const dur = parseTimeToMinutes(s.endTime) - parseTimeToMinutes(s.startTime);
                      return acc + Math.max(0, dur);
                    }, 0);
                  const weekHours = (weekMinutes / 60).toFixed(1);

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{c.businessName}</span>
                        <span className={`px-2 py-0.2 rounded-md text-[9px] font-extrabold border ${colors.badgeBg}`}>
                          ${c.hourlyRate}/hr
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Weekly Allocation:</span>
                        <span className="font-bold text-slate-800">{weekHours} hrs / week</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Dispatch Info Callout */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] rounded-3xl p-6 text-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">
                How Live Dispatch Works
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a venue receives a customer appointment (e.g. 10:00 AM on Monday), their dispatch system checks which contracted workers are on duty for their venue.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you are scheduled at another business (e.g. 2:00 PM at Onyx Spa), the system automatically prevents double-booking and flags you as <em>"Busy at Another Partner"</em>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD SHIFT BLOCK                                                    */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Add Working Shift</h3>
                <p className="text-xs text-slate-400">
                  {DAYS_OF_WEEK.find((d) => d.dayOfWeek === selectedDay)?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Business Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Select Partner Business</label>
              <select
                value={newBusinessId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setNewBusinessId(bId);
                  const matched = contracts.find((c) => c.businessId === bId);
                  if (matched) {
                    setNewBusinessName(matched.businessName);
                    setNewHourlyRate(String(matched.hourlyRate || 85));
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.businessId || c.id}>
                    {c.businessName} (${c.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Start Time</label>
                <select
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`start-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">End Time</label>
                <select
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`end-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Overlap warning if any */}
            {newSlotOverlap && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{newSlotOverlap}</span>
              </div>
            )}

            {/* Hourly Rate & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Notes / Duties</label>
                <input
                  type="text"
                  placeholder="e.g. Master haircuts & coloring"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddShift}
                disabled={Boolean(newSlotOverlap)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Confirm Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
