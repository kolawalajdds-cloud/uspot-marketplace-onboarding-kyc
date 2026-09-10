import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Users,
  PawPrint,
  IdCard,
  Wine,
  X,
  Sparkles,
} from 'lucide-react';
import { BusinessFormData } from './types';

interface HolidaysRulesTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

export const HolidaysRulesTab: React.FC<HolidaysRulesTabProps> = ({ data, onChange }) => {
  // State for search and modals
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('2026-12-25');

  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<'CAPACITY' | 'POLICY' | 'RESTRICTION'>('POLICY');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleValue, setNewRuleValue] = useState('');

  const [editingCapacity, setEditingCapacity] = useState(false);
  const [capacityInput, setCapacityInput] = useState(String(data.maxCapacity || 150));

  // Toggle holiday enabled status
  const toggleHoliday = (id: string) => {
    const updated = (data.holidays || []).map((h) =>
      h.id === id ? { ...h, enabled: !h.enabled } : h
    );
    onChange({ holidays: updated });
  };

  // Add new holiday closure
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;

    const newH = {
      id: `hol-${Date.now()}`,
      name: newHolidayName.trim(),
      date: newHolidayDate,
      enabled: true,
    };

    onChange({ holidays: [...(data.holidays || []), newH] });
    setNewHolidayName('');
    setShowAddHoliday(false);
  };

  // Import standard federal calendar
  const handleImportCalendar = () => {
    const standardHolidays = [
      { id: 'h1', name: "New Year's Day", date: '2026-01-01', enabled: true },
      { id: 'h2', name: 'Independence Day', date: '2026-07-04', enabled: true },
      { id: 'h3', name: 'Thanksgiving', date: '2026-11-28', enabled: false },
      { id: 'h4', name: 'Memorial Day', date: '2026-05-25', enabled: true },
      { id: 'h5', name: 'Labor Day', date: '2026-09-07', enabled: true },
      { id: 'h6', name: 'Christmas Day', date: '2026-12-25', enabled: true },
    ];
    onChange({ holidays: standardHolidays });
  };

  // Add custom rule
  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    const newR = {
      id: `rule-${Date.now()}`,
      title: newRuleTitle.trim(),
      category: newRuleCategory,
      description: newRuleDesc.trim() || 'Custom venue and operational guideline.',
      value: newRuleValue.trim() || 'Active',
      active: true,
    };

    onChange({ customRules: [...(data.customRules || []), newR] });
    setNewRuleTitle('');
    setNewRuleDesc('');
    setNewRuleValue('');
    setShowAddRule(false);
  };

  // Cycle Pet Friendly Policy
  const cyclePetFriendlyPolicy = () => {
    const current = data.petFriendlyPolicy || (data.petFriendly ? 'Allowed (Patio Only)' : 'Not Permitted');
    let nextPolicy = 'Allowed (Patio Only)';
    let nextBool = true;

    if (current === 'Allowed (Patio Only)') {
      nextPolicy = 'Pet Friendly (All Areas)';
      nextBool = true;
    } else if (current === 'Pet Friendly (All Areas)') {
      nextPolicy = 'Not Permitted';
      nextBool = false;
    } else {
      nextPolicy = 'Allowed (Patio Only)';
      nextBool = true;
    }

    onChange({ petFriendly: nextBool, petFriendlyPolicy: nextPolicy });
  };

  // Cycle Age Requirement
  const cycleAgeRequirement = () => {
    const current = data.ageRequirement || '21+ after 9:00 PM';
    let nextAge = '21+ after 9:00 PM';
    if (current === '21+ after 9:00 PM') {
      nextAge = 'All Ages Welcome';
    } else if (current === 'All Ages Welcome') {
      nextAge = '18+ Adults Only';
    } else {
      nextAge = '21+ after 9:00 PM';
    }
    onChange({ ageRequirement: nextAge });
  };

  // Toggle BYOB
  const toggleByob = () => {
    onChange({ byobAllowed: !data.byobAllowed });
  };

  // Save Capacity
  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(capacityInput, 10);
    if (!isNaN(val) && val > 0) {
      onChange({ maxCapacity: val });
    }
    setEditingCapacity(false);
  };

  // Parse YYYY-MM-DD into month abbreviation and 2-digit day
  const formatBadge = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const dayStr = String(day).padStart(2, '0');
        return { month: monthStr, day: dayStr };
      }
    } catch (e) {
      // fallback
    }
    return { month: 'HOL', day: '01' };
  };

  // Prepare standard rules for search filtering
  const standardRules = [
    {
      id: 'rule-capacity',
      category: 'CAPACITY',
      icon: Users,
      title: 'Maximum Capacity',
      description: 'The maximum number of concurrent visitors allowed in...',
      value: `${data.maxCapacity || 150} Persons`,
      hasDot: false,
      isMuted: false,
      onClick: () => {
        setCapacityInput(String(data.maxCapacity || 150));
        setEditingCapacity(true);
      },
    },
    {
      id: 'rule-pet',
      category: 'POLICY',
      icon: PawPrint,
      title: 'Pet Friendly',
      description: 'Determines if customers can bring pets. Service animals are...',
      value: data.petFriendlyPolicy || (data.petFriendly ? 'Allowed (Patio Only)' : 'Not Permitted'),
      hasDot: true,
      dotColor: data.petFriendly !== false ? 'bg-emerald-500' : 'bg-slate-300',
      isMuted: false,
      onClick: cyclePetFriendlyPolicy,
    },
    {
      id: 'rule-age',
      category: 'RESTRICTION',
      icon: IdCard,
      title: 'Age Requirement',
      description: 'Minimum age required for entry after specific hours.',
      value: data.ageRequirement || '21+ after 9:00 PM',
      hasDot: false,
      isMuted: false,
      onClick: cycleAgeRequirement,
    },
    {
      id: 'rule-byob',
      category: 'POLICY',
      icon: Wine,
      title: 'BYOB Allowed',
      description: 'Permit customers to bring their own alcoholic beverages.',
      value: data.byobAllowed ? 'Allowed' : 'Not Permitted',
      hasDot: true,
      dotColor: data.byobAllowed ? 'bg-emerald-500' : 'bg-slate-300',
      isMuted: !data.byobAllowed,
      onClick: toggleByob,
    },
  ];

  // Filter rules based on searchQuery
  const query = searchQuery.toLowerCase().trim();
  const filteredStandardRules = standardRules.filter((r) => {
    if (!query) return true;
    return (
      r.title.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.value.toLowerCase().includes(query)
    );
  });

  const filteredCustomRules = (data.customRules || []).filter((cr) => {
    if (!query) return true;
    return (
      cr.title.toLowerCase().includes(query) ||
      cr.category.toLowerCase().includes(query) ||
      cr.description.toLowerCase().includes(query) ||
      cr.value.toLowerCase().includes(query)
    );
  });

  const holidaysList =
    data.holidays && data.holidays.length > 0
      ? data.holidays
      : [
          { id: 'h1', name: "New Year's Day", date: '2026-01-01', enabled: true },
          { id: 'h3', name: 'Independence Day', date: '2026-07-04', enabled: true },
          { id: 'h5', name: 'Thanksgiving', date: '2026-11-28', enabled: false },
        ];

  return (
    <div id="tab-content-holidays-rules" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HOLIDAY CLOSURES (Matching Image)                            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Holiday Closures
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Override default operating hours.
                </p>
              </div>

              <button
                id="add-holiday-btn"
                type="button"
                onClick={() => setShowAddHoliday(true)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                title="Add Holiday Closure"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Holiday Items List */}
            <div className="divide-y divide-slate-100">
              {holidaysList.map((holiday) => {
                const badge = formatBadge(holiday.date);
                return (
                  <div
                    key={holiday.id}
                    className="py-3.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
                  >
                    {/* Left: Date badge + Name & Description */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider leading-none">
                          {badge.month}
                        </span>
                        <span className="text-sm font-black text-slate-900 leading-none mt-0.5">
                          {badge.day}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {holiday.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Full Day Closure
                        </p>
                      </div>
                    </div>

                    {/* Right: Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={holiday.enabled}
                      onClick={() => toggleHoliday(holiday.id)}
                      title={holiday.enabled ? 'Closure enabled (closed)' : 'Closure disabled (open)'}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        holiday.enabled ? 'bg-black' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          holiday.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Button: Import Calendar */}
            <button
              id="import-calendar-btn"
              type="button"
              onClick={handleImportCalendar}
              className="w-full py-2.5 px-4 mt-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Calendar</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: BUSINESS RULES (Matching Image)                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Section Title */}
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Business Rules
          </h2>

          {/* Search Bar & + Add Rule Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-rules-input"
                type="text"
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            <button
              id="add-rule-btn"
              type="button"
              onClick={() => setShowAddRule(true)}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>

          {/* 2x2 Grid of Rule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Standard Rule Cards */}
            {filteredStandardRules.map((rule) => {
              const IconComponent = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow min-h-[160px]"
                >
                  <div>
                    {/* Category with Icon */}
                    <div
                      className={`flex items-center gap-1.5 ${
                        rule.isMuted ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {rule.category}
                      </span>
                    </div>

                    {/* Rule Title */}
                    <h4
                      className={`text-base font-extrabold mt-2 tracking-tight ${
                        rule.isMuted ? 'text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {rule.title}
                    </h4>

                    {/* Rule Description */}
                    <p
                      className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        rule.isMuted ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {rule.description}
                    </p>
                  </div>

                  {/* Value / Setting Pill */}
                  <button
                    type="button"
                    onClick={rule.onClick}
                    title="Click to adjust setting"
                    className={`bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between self-start gap-2.5 mt-4 transition-colors cursor-pointer ${
                      rule.isMuted ? 'text-slate-400 font-semibold' : 'text-slate-900'
                    }`}
                  >
                    <span>{rule.value}</span>
                    {rule.hasDot && (
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.dotColor} shrink-0`} />
                    )}
                  </button>
                </div>
              );
            })}

            {/* Custom User Added Rules */}
            {filteredCustomRules.map((cr) => (
              <div
                key={cr.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow min-h-[160px]"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {cr.category}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold mt-2 tracking-tight text-slate-900">
                    {cr.title}
                  </h4>

                  <p className="text-xs mt-1 line-clamp-2 leading-relaxed text-slate-500">
                    {cr.description}
                  </p>
                </div>

                <div className="bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between self-start gap-2 mt-4">
                  <span>{cr.value}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state if search filters out everything */}
          {filteredStandardRules.length === 0 && filteredCustomRules.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <p className="text-xs font-bold text-slate-700">No rules match "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Clear search query
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD HOLIDAY CLOSURE                                                */}
      {/* ========================================================================= */}
      {showAddHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Add Holiday Closure</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHoliday(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founders Day or Labor Day"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Closure Date
                </label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHoliday(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-black hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Add Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD BUSINESS RULE                                                  */}
      {/* ========================================================================= */}
      {showAddRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Add Business Rule</h3>
                  <p className="text-[11px] text-slate-500">Define custom policies or restrictions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRule(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quiet Hours or Dress Code"
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="POLICY">POLICY</option>
                    <option value="RESTRICTION">RESTRICTION</option>
                    <option value="CAPACITY">CAPACITY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rule Setting / Value
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enforced after 10 PM"
                    value={newRuleValue}
                    onChange={(e) => setNewRuleValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief explanation for guests and staff..."
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRule(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-black hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MAXIMUM CAPACITY                                              */}
      {/* ========================================================================= */}
      {editingCapacity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-3.5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-900">Set Maximum Capacity</h3>
              <button
                type="button"
                onClick={() => setEditingCapacity(false)}
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapacity} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Concurrent Guests Allowed
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  required
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingCapacity(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold bg-black text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
