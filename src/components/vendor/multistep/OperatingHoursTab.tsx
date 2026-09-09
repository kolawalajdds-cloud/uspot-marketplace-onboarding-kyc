import React from 'react';
import { Copy, Plus, X, Clock, Check } from 'lucide-react';
import { BusinessFormData, DaySchedule, TimeSlot } from './types';

interface OperatingHoursTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

const TIME_OPTIONS = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
  '11:30 PM',
];

const TIMEZONE_OPTIONS = [
  '(GMT-08:00) Pacific Time (US & Canada)',
  '(GMT-07:00) Mountain Time (US & Canada)',
  '(GMT-06:00) Central Time (US & Canada)',
  '(GMT-05:00) Eastern Time (US & Canada)',
  '(GMT+00:00) UTC / Greenwich Mean Time',
  '(GMT+01:00) Central European Time',
];

const SLOT_INTERVALS = ['15 mins', '30 mins', '45 mins', '60 mins', '90 mins', '120 mins'];
const BUFFER_TIMES = ['0 mins', '10 mins', '15 mins', '20 mins', '30 mins', '45 mins'];

export const OperatingHoursTab: React.FC<OperatingHoursTabProps> = ({ data, onChange }) => {
  const [copiedDay, setCopiedDay] = React.useState<string | null>(null);

  const toggleDayOpen = (dayIndex: number) => {
    const newSchedule = [...data.schedule];
    const target = newSchedule[dayIndex];
    const newIsOpen = !target.isOpen;
    target.isOpen = newIsOpen;
    if (newIsOpen && target.slots.length === 0) {
      target.slots = [{ id: `slot-${Date.now()}`, start: '09:00 AM', end: '05:00 PM' }];
    }
    onChange({ schedule: newSchedule });
  };

  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...data.schedule];
    newSchedule[dayIndex].slots.push({
      id: `slot-${Date.now()}`,
      start: '06:00 PM',
      end: '09:00 PM',
    });
    onChange({ schedule: newSchedule });
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...data.schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    if (newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].isOpen = false;
    }
    onChange({ schedule: newSchedule });
  };

  const updateSlotTime = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    val: string
  ) => {
    const newSchedule = [...data.schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = val;
    onChange({ schedule: newSchedule });
  };

  const copyToAllDays = (sourceDayIndex: number) => {
    const source = data.schedule[sourceDayIndex];
    const newSchedule = data.schedule.map((d) => ({
      ...d,
      isOpen: source.isOpen,
      slots: source.slots.map((s) => ({ ...s, id: `slot-${Math.random()}` })),
    }));
    onChange({ schedule: newSchedule });
    setCopiedDay(source.day);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  return (
    <div id="tab-content-operating-hours" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Weekly Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Weekly Schedule</h2>
              {copiedDay && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied {copiedDay} to all days!
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {data.schedule.map((dayItem, dayIdx) => (
                <div key={dayItem.day} className="py-4.5 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Interactive Toggle Switch matching Image 2 */}
                      <button
                        type="button"
                        onClick={() => toggleDayOpen(dayIdx)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          dayItem.isOpen ? 'bg-black' : 'bg-slate-200'
                        }`}
                        title={dayItem.isOpen ? 'Set Closed' : 'Set Open'}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                            dayItem.isOpen ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>

                      <span className="text-sm font-bold text-slate-900">{dayItem.day}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {!dayItem.isOpen && (
                        <span className="text-sm font-medium text-slate-400">Closed</span>
                      )}

                      <button
                        type="button"
                        onClick={() => copyToAllDays(dayIdx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={`Copy ${dayItem.day} hours to all days`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Time Slots when open */}
                  {dayItem.isOpen && (
                    <div className="pl-14 space-y-2.5">
                      {dayItem.slots.map((slot, slotIdx) => (
                        <div key={slot.id} className="flex items-center gap-2">
                          <select
                            value={slot.start}
                            onChange={(e) =>
                              updateSlotTime(dayIdx, slotIdx, 'start', e.target.value)
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>

                          <span className="text-slate-400 text-sm font-medium">—</span>

                          <select
                            value={slot.end}
                            onChange={(e) =>
                              updateSlotTime(dayIdx, slotIdx, 'end', e.target.value)
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => removeTimeSlot(dayIdx, slotIdx)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Slot"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addTimeSlot(dayIdx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-black transition-colors pt-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Time Slot</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Booking Rules */}
        <div>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Booking Rules</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  TIMEZONE
                </label>
                <select
                  id="booking-rules-timezone"
                  value={data.timezone}
                  onChange={(e) => onChange({ timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  SLOT INTERVAL
                </label>
                <select
                  id="booking-rules-slot-interval"
                  value={data.slotInterval}
                  onChange={(e) => onChange({ slotInterval: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  {SLOT_INTERVALS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Defines the increments for available booking times.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  BUFFER TIME
                </label>
                <select
                  id="booking-rules-buffer-time"
                  value={data.bufferTime}
                  onChange={(e) => onChange({ bufferTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  {BUFFER_TIMES.map((buf) => (
                    <option key={buf} value={buf}>
                      {buf}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Time automatically blocked off between appointments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
