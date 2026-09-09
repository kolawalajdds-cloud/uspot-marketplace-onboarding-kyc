import React, { useState } from 'react';
import { Calendar, Plus, ShieldCheck, X } from 'lucide-react';
import { BusinessFormData } from './types';

interface HolidaysRulesTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

export const HolidaysRulesTab: React.FC<HolidaysRulesTabProps> = ({ data, onChange }) => {
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('2026-12-25');

  const toggleHoliday = (id: string) => {
    const updated = data.holidays.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h));
    onChange({ holidays: updated });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;

    const newH = {
      id: `hol-${Date.now()}`,
      name: newHolidayName.trim(),
      date: newHolidayDate,
      enabled: true,
    };

    onChange({ holidays: [...data.holidays, newH] });
    setNewHolidayName('');
    setShowAddHoliday(false);
  };

  return (
    <div id="tab-content-holidays-rules" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Holiday Closures & Business Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Holiday Closures */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Holiday Closures
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically block off reservations on designated national holidays.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddHoliday(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Holiday</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {data.holidays.map((holiday) => (
                <div key={holiday.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{holiday.name}</h4>
                      <p className="text-xs text-slate-400">{holiday.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">
                      {holiday.enabled ? 'Closed' : 'Open as usual'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleHoliday(holiday.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        holiday.enabled ? 'bg-black' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                          holiday.enabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Business Rules */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Venue Rules & Capacity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maximum Capacity (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={data.maxCapacity}
                  onChange={(e) => onChange({ maxCapacity: Number(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age Requirement
                </label>
                <select
                  value={data.ageRequirement}
                  onChange={(e) => onChange({ ageRequirement: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  <option value="All Ages">All Ages Welcome</option>
                  <option value="18+">18+ Adults Only</option>
                  <option value="21+">21+ Legal Age Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pet Friendly Space</h4>
                  <p className="text-[11px] text-slate-500">Allow customers to bring pets</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ petFriendly: !data.petFriendly })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    data.petFriendly ? 'bg-black' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                      data.petFriendly ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">BYOB Allowed</h4>
                  <p className="text-[11px] text-slate-500">Guests may bring own beverage</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ byobAllowed: !data.byobAllowed })}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    data.byobAllowed ? 'bg-black' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                      data.byobAllowed ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Policies */}
        <div>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Booking Policies
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cancellation Policy
                </label>
                <select
                  value={data.cancellationPolicy}
                  onChange={(e) => onChange({ cancellationPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 cursor-pointer"
                >
                  <option value="Flexible">Flexible: Full refund up to 24 hours before</option>
                  <option value="Moderate">Moderate: Full refund up to 5 days before</option>
                  <option value="Strict">Strict: 50% refund up to 7 days before</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Security Deposit</h4>
                    <p className="text-[11px] text-slate-500">Hold deposit during booking</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ depositRequired: !data.depositRequired })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      data.depositRequired ? 'bg-black' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                        data.depositRequired ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {data.depositRequired && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Deposit Amount (% of Booking)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={data.depositPercentage}
                      onChange={(e) =>
                        onChange({ depositPercentage: Number(e.target.value) || 20 })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddHoliday && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Holiday Closure</h3>
              <button
                type="button"
                onClick={() => setShowAddHoliday(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founders Day"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHoliday(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-black text-white rounded-lg hover:bg-slate-800"
                >
                  Add Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
