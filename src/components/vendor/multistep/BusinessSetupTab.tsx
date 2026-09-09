import React, { useState } from 'react';
import { MapPin, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { BusinessFormData } from './types';
import { BusinessLocationMap } from './BusinessLocationMap';

interface BusinessSetupTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

const CATEGORY_OPTIONS = [
  'Coworking & Office',
  'Wellness & Spa',
  'Event Venue & Studio',
  'Photography & Film',
  'Fitness & Sports',
  'Culinary & Dining',
  'Retail & Pop-up',
  'Salon & Beauty',
  'Beverages & Cafe',
  'IT & Tech',
  'Design & Media',
  'Supply Chain',
];

const CITY_STATE_LOOKUP: Record<string, string> = {
  'san francisco': 'CA',
  'new york': 'NY',
  austin: 'TX',
  chicago: 'IL',
  seattle: 'WA',
  'los angeles': 'CA',
  miami: 'FL',
  boston: 'MA',
  denver: 'CO',
  dallas: 'TX',
};

export const BusinessSetupTab: React.FC<BusinessSetupTabProps> = ({ data, onChange }) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleCityChange = (city: string) => {
    const trimmed = city.trim().toLowerCase();
    const autoState = CITY_STATE_LOOKUP[trimmed] || data.state;
    onChange({
      city,
      state: autoState,
    });
  };

  return (
    <div id="tab-content-business-setup" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Info & Location Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Info */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-business-name"
                  type="text"
                  value={data.businessName}
                  onChange={(e) => onChange({ businessName: e.target.value })}
                  placeholder="e.g. Urban Zen Spa"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Legal Entity Name
                </label>
                <input
                  id="setup-legal-name"
                  type="text"
                  value={data.legalEntityName}
                  onChange={(e) => onChange({ legalEntityName: e.target.value })}
                  placeholder="e.g. Urban Zen Holdings LLC"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="setup-category"
                  value={data.category}
                  onChange={(e) => onChange({ category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                >
                  <option value="">Select business category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="setup-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  placeholder="e.g. 14192354219"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Description
              </label>
              <textarea
                id="setup-description"
                rows={4}
                value={data.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Tell your customers about what you do..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Location Details */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Location Details</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="setup-address"
                type="text"
                value={data.streetAddress}
                onChange={(e) => onChange({ streetAddress: e.target.value })}
                placeholder="123 Enterprise Way, Suite 400"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="setup-city"
                    type="text"
                    value={data.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="setup-state"
                    type="text"
                    value={data.state}
                    onChange={(e) => onChange({ state: e.target.value })}
                    placeholder="Auto-filled from City"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="setup-zipcode"
                    type="text"
                    value={data.zipCode}
                    onChange={(e) => onChange({ zipCode: e.target.value })}
                    placeholder="e.g. 94105"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg): Map Preview & Need Help Card */}
        <div className="space-y-6">
          {/* Map Preview */}
          <BusinessLocationMap
            city={data.city}
            lat={data.lat}
            lng={data.lng}
            onCoordinatesChange={(lat, lng) => onChange({ lat, lng })}
          />

          {/* Need help? card matching Image 1 */}
          <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <HelpCircle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">Need help?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our enterprise support team is available 24/7 to help you set up your business profile correctly.
              </p>
            </div>

            <button
              id="view-setup-guide-btn"
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer text-center"
            >
              View Setup Guide
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Business Setup Guide</h3>
                  <p className="text-xs text-slate-500">Fast-track your business launch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Business Identity:</strong> Enter your public brand name and official registered legal entity name for IRS 1099 reporting.
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Operating Schedule:</strong> Set granular time slots with custom intervals and buffer buffers for client turnover.
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Compliance & Verification:</strong> Have your EIN, Secretary of State certificate, and Government ID ready for instant automated checks.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
