import React, { useState } from 'react';
import {
  Search,
  Plus,
  Wind,
  Zap,
  CreditCard,
  Coffee,
  Wifi,
  Accessibility,
  DoorClosed,
  Sun,
  Car,
  Dog,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { BusinessFormData, CustomAmenity } from './types';

interface AmenitiesTabProps {
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
}

interface StandardAmenity {
  id: string;
  name: string;
  description: string;
  category: 'General & Comfort' | 'Accessibility';
  icon: React.ComponentType<{ className?: string }>;
}

const STANDARD_AMENITIES: StandardAmenity[] = [
  {
    id: 'air-conditioning',
    name: 'Air Conditioning',
    description: 'Climate-controlled indoor environment with modern air conditioning',
    category: 'General & Comfort',
    icon: Wind,
  },
  {
    id: 'ev-charging',
    name: 'EV Charging Station',
    description: 'On-site electric vehicle charging stations for patrons',
    category: 'General & Comfort',
    icon: Zap,
  },
  {
    id: 'contactless-payments',
    name: 'Card & Contactless Payments',
    description: 'Accepts major credit cards, Apple Pay, and Google Wallet',
    category: 'General & Comfort',
    icon: CreditCard,
  },
  {
    id: 'espresso-bar',
    name: 'Espresso & Coffee Bar',
    description: 'Complimentary artisan coffee, cold brew, and tea station',
    category: 'General & Comfort',
    icon: Coffee,
  },
  {
    id: 'high-speed-wifi',
    name: 'High-Speed WiFi',
    description: 'Fast optical fiber wireless internet for guests and remote work',
    category: 'General & Comfort',
    icon: Wifi,
  },
  {
    id: 'wheelchair-accessible',
    name: 'Wheelchair Accessible',
    description: 'Step-free access, wide doors, and ADA compliant entrance',
    category: 'General & Comfort',
    icon: Accessibility,
  },
  {
    id: 'private-restrooms',
    name: 'Private Restrooms',
    description: 'Clean, spacious gender-neutral restroom facilities',
    category: 'General & Comfort',
    icon: DoorClosed,
  },
  {
    id: 'outdoor-seating',
    name: 'Outdoor Seating',
    description: 'Open-air patio and garden deck seating area',
    category: 'General & Comfort',
    icon: Sun,
  },
  {
    id: 'dedicated-parking',
    name: 'Dedicated Parking',
    description: 'Free customer parking spaces available directly on premises',
    category: 'General & Comfort',
    icon: Car,
  },
  {
    id: 'pet-friendly',
    name: 'Pet Friendly',
    description: 'Welcoming pets with water bowls and outdoor seating areas',
    category: 'Accessibility',
    icon: Dog,
  },
];

export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ data, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityDesc, setNewAmenityDesc] = useState('');
  const [newAmenityCategory, setNewAmenityCategory] = useState('Custom Amenities');

  const toggleAmenity = (id: string) => {
    const set = new Set(data.selectedAmenityIds);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    onChange({ selectedAmenityIds: Array.from(set) });
  };

  const handleAddCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName.trim()) return;

    const newId = `custom-am-${Date.now()}`;
    const newCustom: CustomAmenity = {
      id: newId,
      name: newAmenityName.trim(),
      description: newAmenityDesc.trim() || 'Custom on-site feature',
      category: newAmenityCategory.trim() || 'Custom Amenities',
      checked: true,
    };

    const updatedCustoms = [...data.customAmenities, newCustom];
    const updatedSelected = [...data.selectedAmenityIds, newId];

    onChange({
      customAmenities: updatedCustoms,
      selectedAmenityIds: updatedSelected,
    });

    setNewAmenityName('');
    setNewAmenityDesc('');
    setIsAddModalOpen(false);
  };

  const filteredStandard = STANDARD_AMENITIES.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  });

  const generalItems = filteredStandard.filter((a) => a.category === 'General & Comfort');
  const accessibilityItems = filteredStandard.filter((a) => a.category === 'Accessibility');
  const customItems = data.customAmenities.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  });

  return (
    <div id="tab-content-amenities" className="space-y-7">
      {/* Top Search & Add Bar matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            id="search-amenities-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search amenities..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 transition-colors shadow-2xs"
          />
        </div>

        <button
          id="open-add-custom-amenity-modal-btn"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Custom Amenity</span>
        </button>
      </div>

      {/* Group 1: General & Comfort */}
      {generalItems.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            General & Comfort
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isChecked = data.selectedAmenityIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleAmenity(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none bg-white flex flex-col justify-between ${
                    isChecked
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-black border-black text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group 2: Accessibility */}
      {accessibilityItems.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Accessibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {accessibilityItems.map((item) => {
              const Icon = item.icon;
              const isChecked = data.selectedAmenityIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleAmenity(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none bg-white flex flex-col justify-between ${
                    isChecked
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-black border-black text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group 3: Custom Amenities */}
      {customItems.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Custom Amenities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customItems.map((item) => {
              const isChecked = data.selectedAmenityIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleAmenity(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none bg-white flex flex-col justify-between ${
                    isChecked
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-black border-black text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Amenity Modal matching Image 5 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Add Custom Amenity
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomAmenity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Amenity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  placeholder="e.g. Bike Rack, Kitchen, Lounge Area"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newAmenityDesc}
                  onChange={(e) => setNewAmenityDesc(e.target.value)}
                  placeholder="e.g. Secure outdoor bike parking"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={newAmenityCategory}
                  onChange={(e) => setNewAmenityCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-black text-white hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
