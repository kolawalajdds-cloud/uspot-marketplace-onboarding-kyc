import React, { useState, useMemo } from 'react';
import {
  Settings,
  Database,
  Smile,
  Globe,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  UploadCloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  MapPin,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Save,
  AirVent,
  CalendarClock,
  Drama,
  UtensilsCrossed,
  Wine,
  BatteryCharging,
  Waves,
  Bluetooth,
  Coffee,
  Briefcase,
  Wifi,
  Car,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  Lock,
} from 'lucide-react';
import {
  IconAssetRecord,
  MasterDataCategory,
  OperationalRegion,
  INITIAL_ICON_ASSETS,
  INITIAL_MASTER_CATEGORIES,
  INITIAL_GEOGRAPHY_REGIONS,
} from '../../../data/configurationData';
import { OperationalCoverageMap } from './OperationalCoverageMap';

type ConfigSubOption = 'reference-data' | 'icons' | 'geography' | 'configuration';
type IconViewMode = 'table' | 'grid';

export const AdminConfigurationTab: React.FC = () => {
  // 4 Sub Options: 'Reference data', 'Icons', 'Geography', 'configuration'
  const [activeSubOption, setActiveSubOption] = useState<ConfigSubOption>('reference-data');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // 1. REFERENCE DATA (MASTER DATA) STATE
  // ==========================================
  const [masterCategories, setMasterCategories] = useState<MasterDataCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatEndpoint, setNewCatEndpoint] = useState('');

  const selectedCategory = useMemo(() => {
    return masterCategories.find((c) => c.id === selectedCategoryId) || null;
  }, [masterCategories, selectedCategoryId]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat: MasterDataCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      code: newCatCode.trim() || newCatName.toUpperCase().replace(/\s+/g, '_'),
      description: newCatDesc.trim() || 'Custom reference dataset',
      recordCount: 0,
      apiEndpoint: newCatEndpoint.trim() || `/api/v1/master/${newCatName.toLowerCase().replace(/\s+/g, '-')}`,
      records: [],
    };
    setMasterCategories((prev) => [...prev, cat]);
    setSelectedCategoryId(cat.id);
    setIsNewCategoryModalOpen(false);
    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setNewCatEndpoint('');
    showToast(`Category "${cat.name}" created successfully.`);
  };

  const handleDeleteCategory = () => {
    if (!selectedCategoryId) {
      alert('Please select a category to delete.');
      return;
    }
    const catToDelete = masterCategories.find((c) => c.id === selectedCategoryId);
    if (!catToDelete) return;
    if (confirm(`Are you sure you want to delete category "${catToDelete.name}"?`)) {
      setMasterCategories((prev) => prev.filter((c) => c.id !== selectedCategoryId));
      setSelectedCategoryId(null);
      showToast(`Category "${catToDelete.name}" removed.`);
    }
  };

  const handleSeedSampleMasterData = () => {
    setMasterCategories(INITIAL_MASTER_CATEGORIES);
    setSelectedCategoryId(INITIAL_MASTER_CATEGORIES[0].id);
    showToast('Loaded standard master data categories.');
  };

  // ==========================================
  // 2. ICONS STATE & HANDLERS
  // ==========================================
  const [icons, setIcons] = useState<IconAssetRecord[]>(INITIAL_ICON_ASSETS);
  const [iconViewMode, setIconViewMode] = useState<IconViewMode>('table');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [appliedIconSearch, setAppliedIconSearch] = useState('');
  const [iconSortOrder, setIconSortOrder] = useState<'A-Z' | 'Z-A'>('A-Z');
  const [iconRowsPerPage, setIconRowsPerPage] = useState<number>(10);
  const [iconCurrentPage, setIconCurrentPage] = useState<number>(1);

  // Add Icon Modal state
  const [isAddIconModalOpen, setIsAddIconModalOpen] = useState(false);
  const [newIconName, setNewIconName] = useState('');
  const [newIconSuburb, setNewIconSuburb] = useState('');
  const [newIconType, setNewIconType] = useState('Scissors');
  const [newIconFileName, setNewIconFileName] = useState<string | null>(null);

  // Filtered & sorted icons
  const filteredIcons = useMemo(() => {
    return icons
      .filter((ic) => {
        if (!appliedIconSearch.trim()) return true;
        const q = appliedIconSearch.toLowerCase();
        return (
          ic.name.toLowerCase().includes(q) ||
          ic.suburb.toLowerCase().includes(q) ||
          (ic.category && ic.category.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (iconSortOrder === 'A-Z') {
          return a.name.localeCompare(b.name);
        }
        return b.name.localeCompare(a.name);
      });
  }, [icons, appliedIconSearch, iconSortOrder]);

  const iconTotalPages = Math.max(1, Math.ceil(filteredIcons.length / iconRowsPerPage));
  const paginatedIcons = useMemo(() => {
    const start = (iconCurrentPage - 1) * iconRowsPerPage;
    return filteredIcons.slice(start, start + iconRowsPerPage);
  }, [filteredIcons, iconCurrentPage, iconRowsPerPage]);

  const handleIconSearch = () => {
    setAppliedIconSearch(iconSearchQuery);
    setIconCurrentPage(1);
  };

  const handleToggleIconSort = () => {
    setIconSortOrder((prev) => (prev === 'A-Z' ? 'Z-A' : 'A-Z'));
  };

  const handleCreateIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIconName.trim()) {
      alert('Please enter an icon name.');
      return;
    }
    const createdIcon: IconAssetRecord = {
      id: `icon-${Date.now()}`,
      name: newIconName.trim(),
      suburb:
        newIconSuburb.trim() ||
        newIconName.toUpperCase().replace(/\s+/g, '_') + ', ASSET, ICON, SYSTEM',
      iconType: newIconType || 'Sparkles',
      category: 'Custom',
      addedDate: 'Today',
    };
    setIcons((prev) => [createdIcon, ...prev]);
    setIsAddIconModalOpen(false);
    setNewIconName('');
    setNewIconSuburb('');
    setNewIconFileName(null);
    showToast(`Icon "${createdIcon.name}" added successfully.`);
  };

  const handleDeleteIcon = (id: string, name: string) => {
    if (confirm(`Delete icon asset "${name}"?`)) {
      setIcons((prev) => prev.filter((ic) => ic.id !== id));
      showToast(`Icon "${name}" deleted.`);
    }
  };

  // Helper to render icon preview
  const renderIconSymbol = (iconType: string) => {
    switch (iconType) {
      case 'AirVent':
        return <AirVent className="w-5 h-5 text-slate-700" />;
      case 'CalendarClock':
        return <CalendarClock className="w-5 h-5 text-slate-700" />;
      case 'Drama':
        return <Drama className="w-5 h-5 text-slate-700" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-slate-700" />;
      case 'Wine':
        return <Wine className="w-5 h-5 text-slate-700" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5 text-slate-700" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-slate-700" />;
      case 'Bluetooth':
        return <Bluetooth className="w-5 h-5 text-slate-700" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-slate-700" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-slate-700" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-slate-700" />;
      case 'Car':
        return <Car className="w-5 h-5 text-slate-700" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-slate-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-700" />;
    }
  };

  // ==========================================
  // 3. GEOGRAPHY STATE & CONTROLS
  // ==========================================
  const [geoRegions, setGeoRegions] = useState<OperationalRegion[]>(INITIAL_GEOGRAPHY_REGIONS);
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoCoverageType, setGeoCoverageType] = useState<'Cities' | 'States' | 'Countries'>('Cities');
  const [geoMapStyle, setGeoMapStyle] = useState<'Street' | 'Satellite' | 'Terrain' | 'Light'>('Street');
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(true); // default true to match Image 4 & 5
  const [isMapExpandedModalOpen, setIsMapExpandedModalOpen] = useState(false);
  const [selectedMapCoords, setSelectedMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newState, setNewState] = useState('');
  const [newCity, setNewCity] = useState('');

  const filteredGeoRegions = useMemo(() => {
    if (!geoSearchQuery.trim()) return geoRegions;
    const q = geoSearchQuery.toLowerCase();
    return geoRegions.filter(
      (r) =>
        r.country.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
    );
  }, [geoRegions, geoSearchQuery]);

  const totalCountriesCount = useMemo(() => {
    return showSkeletonDemo ? 0 : new Set(geoRegions.map((r) => r.country)).size;
  }, [geoRegions, showSkeletonDemo]);

  const totalStatesCount = useMemo(() => {
    return showSkeletonDemo ? 0 : new Set(geoRegions.map((r) => r.state)).size;
  }, [geoRegions, showSkeletonDemo]);

  const totalCitiesCount = useMemo(() => {
    return showSkeletonDemo ? 0 : geoRegions.filter((r) => r.status === 'Active').length;
  }, [geoRegions, showSkeletonDemo]);

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newCountry.trim()) {
      alert('Country and City are required.');
      return;
    }
    const reg: OperationalRegion = {
      id: `geo-${Date.now()}`,
      country: newCountry.trim(),
      countryCode: newCountry.slice(0, 2).toUpperCase(),
      state: newState.trim() || newCity.trim(),
      city: newCity.trim(),
      status: 'Active',
      lat: selectedMapCoords ? selectedMapCoords.lat : 34.0522,
      lng: selectedMapCoords ? selectedMapCoords.lng : -118.2437,
      timezone: 'UTC',
      serviceCount: 1,
    };
    setGeoRegions((prev) => [...prev, reg]);
    setShowSkeletonDemo(false);
    setIsAddRegionModalOpen(false);
    setNewCountry('');
    setNewState('');
    setNewCity('');
    setSelectedMapCoords(null);
    showToast(`Added operational region for ${reg.city}, ${reg.country}.`);
  };

  // ==========================================
  // 4. PLATFORM CONFIGURATION STATE
  // ==========================================
  const [platformCommissionRate, setPlatformCommissionRate] = useState(12.5);
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [autoApproveKycVolume, setAutoApproveKycVolume] = useState(false);
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);
  const [supportEmail, setSupportEmail] = useState('support@platform-operations.com');
  const [webhookUrl, setWebhookUrl] = useState('https://api.platform.io/events/v1');

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform configuration changes successfully saved.');
  };

  return (
    <div id="admin-configuration-tab" className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Navigation: 4 Sub Options ("Reference data", "Icons", "Geography", "configuration") */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
        {/* 1. Reference data */}
        <button
          id="config-subtab-reference-data"
          onClick={() => setActiveSubOption('reference-data')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubOption === 'reference-data'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-500" />
          <span>Reference Data</span>
          {masterCategories.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              {masterCategories.length}
            </span>
          )}
        </button>

        {/* 2. Icons */}
        <button
          id="config-subtab-icons"
          onClick={() => setActiveSubOption('icons')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubOption === 'icons'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smile className="w-4 h-4 text-amber-500" />
          <span>Icons</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
            {icons.length}
          </span>
        </button>

        {/* 3. Geography */}
        <button
          id="config-subtab-geography"
          onClick={() => setActiveSubOption('geography')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubOption === 'geography'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-600" />
          <span>Geography</span>
        </button>

        {/* 4. Configuration */}
        <button
          id="config-subtab-configuration"
          onClick={() => setActiveSubOption('configuration')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubOption === 'configuration'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Configuration</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-OPTION 1: REFERENCE DATA (MASTER DATA - Image 1)                      */}
      {/* ========================================================================= */}
      {activeSubOption === 'reference-data' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Main Container matching Image 1: Split Master Data View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col md:flex-row">
            {/* LEFT COLUMN: Master Data Category Selector */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between p-5 bg-white">
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">Master Data</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Select a data category to manage its reference records.
                  </p>
                </div>

                {/* Category List or Empty state */}
                {masterCategories.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-xs text-slate-400 font-medium">No categories available.</p>
                    <button
                      onClick={handleSeedSampleMasterData}
                      className="mt-3 text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer block mx-auto"
                    >
                      Load Sample Categories
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                    {masterCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                          selectedCategoryId === cat.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{cat.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                              selectedCategoryId === cat.id
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-200/60 text-slate-600'
                            }`}
                          >
                            {cat.recordCount || cat.records?.length || 0}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] line-clamp-1 mt-0.5 ${
                            selectedCategoryId === cat.id ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {cat.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Buttons matching Image 1: DELETE CATEGORY & + NEW CATEGORY */}
              <div className="pt-4 mt-6 border-t border-slate-100 space-y-2">
                <button
                  id="delete-category-btn"
                  onClick={handleDeleteCategory}
                  disabled={!selectedCategoryId}
                  className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE CATEGORY</span>
                </button>

                <button
                  id="new-category-btn"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ NEW CATEGORY</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Master Data Details & Records */}
            <div className="flex-1 flex flex-col p-6 sm:p-8">
              {/* Breadcrumb & Top Title matching Image 1 */}
              <div className="border-b border-slate-100 pb-5 mb-6">
                <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                  <span>Configuration</span>
                  <span>›</span>
                  <span className="text-slate-600 font-semibold">Reference Data</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Data</h1>
              </div>

              {/* Center message or selected records */}
              {!selectedCategory ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-xs sm:text-sm text-slate-400 font-normal max-w-sm">
                    Select a category with a dedicated API to manage records.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {/* Category Details Header */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{selectedCategory.name}</h3>
                        <span className="bg-slate-200/70 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {selectedCategory.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedCategory.description}</p>
                      {selectedCategory.apiEndpoint && (
                        <p className="text-[11px] font-mono text-indigo-600 mt-1">
                          Endpoint: {selectedCategory.apiEndpoint}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Records Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-4">#</th>
                          <th className="py-2.5 px-4">CODE</th>
                          <th className="py-2.5 px-4">LABEL / NAME</th>
                          <th className="py-2.5 px-4">STATUS</th>
                          <th className="py-2.5 px-4 text-right">ORDER</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(!selectedCategory.records || selectedCategory.records.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No records maintained in this category yet.
                            </td>
                          </tr>
                        ) : (
                          selectedCategory.records.map((rec, idx) => (
                            <tr key={rec.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                                {rec.code}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">{rec.label}</td>
                              <td className="py-3 px-4">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-500">
                                {rec.sortOrder}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 2: ICONS (Image 2 & 3)                                         */}
      {/* ========================================================================= */}
      {activeSubOption === 'icons' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header Row matching Image 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Icons</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Icons</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage icon assets used across the platform.
              </p>
            </div>

            {/* Top Right: Table / Grid switch & + Add Icon button */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Table / Grid Switch */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
                <button
                  id="icon-view-table-btn"
                  onClick={() => setIconViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    iconViewMode === 'table'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Table
                </button>
                <button
                  id="icon-view-grid-btn"
                  onClick={() => setIconViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    iconViewMode === 'grid'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grid
                </button>
              </div>

              {/* + Add Icon Button */}
              <button
                id="add-icon-btn"
                onClick={() => setIsAddIconModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Icon</span>
              </button>
            </div>
          </div>

          {/* Filter Card (Search icons..., Search button, Sort: A-Z button) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="icon-search-input"
                type="text"
                placeholder="Search icons..."
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleIconSearch()}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <button
              id="icon-search-btn"
              onClick={handleIconSearch}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Search
            </button>
            <button
              id="icon-sort-btn"
              onClick={handleToggleIconSort}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              Sort: {iconSortOrder}
            </button>
          </div>

          {/* Table View matching Image 2 */}
          {iconViewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4 w-52">NAME</th>
                      <th className="py-3.5 px-4 w-32">ICON</th>
                      <th className="py-3.5 px-4">SUBURB</th>
                      <th className="py-3.5 px-4 text-right w-24">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedIcons.map((ic, idx) => {
                      const rowNum = (iconCurrentPage - 1) * iconRowsPerPage + idx + 1;
                      return (
                        <tr key={ic.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* # */}
                          <td className="py-3.5 px-4 text-center text-slate-500 font-normal">
                            {rowNum}
                          </td>

                          {/* NAME */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">{ic.name}</td>

                          {/* ICON */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0">
                                {renderIconSymbol(ic.iconType)}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[80px]">
                                {ic.name.slice(0, 8)}
                              </span>
                            </div>
                          </td>

                          {/* SUBURB (Keyword Pill) */}
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-medium px-2.5 py-1 rounded inline-block uppercase tracking-wide max-w-full truncate">
                              {ic.suburb}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-400">
                              <button
                                onClick={() => {
                                  const updated = prompt('Edit Suburb keywords:', ic.suburb);
                                  if (updated) {
                                    setIcons((prev) =>
                                      prev.map((i) => (i.id === ic.id ? { ...i, suburb: updated } : i))
                                    );
                                    showToast(`Updated "${ic.name}" keywords.`);
                                  }
                                }}
                                className="p-1 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="Edit Icon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteIcon(ic.id, ic.name)}
                                className="p-1 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Delete Icon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer matching Image 2 */}
              <div className="py-3.5 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                {/* Left: Rows per page and Showing count */}
                <div className="flex items-center gap-3">
                  <span className="font-normal text-slate-500">Rows per page</span>
                  <div className="relative">
                    <select
                      value={iconRowsPerPage}
                      onChange={(e) => {
                        setIconRowsPerPage(Number(e.target.value));
                        setIconCurrentPage(1);
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                  </div>
                  <span className="text-slate-600">
                    Showing 1–{Math.min(iconRowsPerPage, filteredIcons.length)} of{' '}
                    <strong className="text-slate-900">{filteredIcons.length}</strong> icons
                  </span>
                </div>

                {/* Right: Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={iconCurrentPage === 1}
                    onClick={() => setIconCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button className="w-7 h-7 rounded-lg text-xs font-bold bg-black text-white">
                    1
                  </button>
                  <button
                    onClick={() => setIconCurrentPage(2)}
                    className="w-7 h-7 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    2
                  </button>
                  <button
                    onClick={() => setIconCurrentPage(3)}
                    className="w-7 h-7 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    3
                  </button>
                  <span className="px-1 text-slate-400 text-xs">...</span>
                  <button className="w-7 h-7 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">
                    11
                  </button>

                  <button
                    disabled={iconCurrentPage === iconTotalPages}
                    onClick={() => setIconCurrentPage((p) => Math.min(iconTotalPages, p + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {paginatedIcons.map((ic) => (
                <div
                  key={ic.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center text-center justify-between hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                    {renderIconSymbol(ic.iconType)}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{ic.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono line-clamp-1 mt-1">
                    {ic.suburb}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-2 text-slate-400">
                    <button
                      onClick={() => handleDeleteIcon(ic.id, ic.name)}
                      className="p-1 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 3: GEOGRAPHY (Image 4 & 5)                                      */}
      {/* ========================================================================= */}
      {activeSubOption === 'geography' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Geography</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Geography Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Define and manage active operational regions including countries, states, and cities.
              </p>
            </div>

            {/* Quick action toggle between Skeleton view and active regions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowSkeletonDemo(!showSkeletonDemo)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
              >
                {showSkeletonDemo ? 'Switch to Active Regions' : 'Preview Empty Skeletons'}
              </button>
              <button
                onClick={() => setIsAddRegionModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Region</span>
              </button>
            </div>
          </div>

          {/* TOP CARD: Filter, Export, Showing counts, Search, and 4 Gray Skeleton bars */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            {/* Action Bar matching Image 4 & 5 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => showToast('Exported geography dataset to CSV.')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
              </div>

              {/* Showing 0 Countries · 0 States · 0 Cities */}
              <div className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-800 font-bold">{totalCountriesCount}</strong> Countries
                · <strong className="text-slate-800 font-bold">{totalStatesCount}</strong> States ·{' '}
                <strong className="text-slate-800 font-bold">{totalCitiesCount}</strong> Cities
              </div>
            </div>

            {/* Search regions... input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search regions..."
                value={geoSearchQuery}
                onChange={(e) => setGeoSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            {/* 4 Gray Skeleton Bars (Exact match from Image 4 & 5) OR Active Region Cards */}
            {showSkeletonDemo ? (
              <div className="space-y-3 pt-2">
                <div className="w-full h-14 bg-slate-100 rounded-xl animate-pulse" />
                <div className="w-full h-14 bg-slate-100 rounded-xl animate-pulse" />
                <div className="w-full h-14 bg-slate-100 rounded-xl animate-pulse" />
                <div className="w-full h-14 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {filteredGeoRegions.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-center">
                        {reg.countryCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {reg.city}, {reg.state}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {reg.country} • {reg.timezone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {reg.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {reg.serviceCount} active services
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Left 2/3 Map Card, Right 1/3 Quick Stats & Coverage Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT 2/3: OPERATIONAL COVERAGE MAP */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              {/* Card Header matching Image 4/5 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  OPERATIONAL COVERAGE
                </span>

                <div className="flex items-center gap-2">
                  {/* Cities dropdown */}
                  <div className="relative">
                    <select
                      value={geoCoverageType}
                      onChange={(e) => setGeoCoverageType(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="Cities">Cities</option>
                      <option value="States">States</option>
                      <option value="Countries">Countries</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>

                  {/* Street dropdown */}
                  <div className="relative">
                    <select
                      value={geoMapStyle}
                      onChange={(e) => setGeoMapStyle(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="Street">Street</option>
                      <option value="Satellite">Satellite</option>
                      <option value="Terrain">Terrain</option>
                      <option value="Light">Light</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>

                  {/* Fullscreen icon */}
                  <button
                    id="fullscreen-map-btn"
                    onClick={() => setIsMapExpandedModalOpen(true)}
                    className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                    title="Fullscreen map view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real Interactive Leaflet Map Canvas */}
              <OperationalCoverageMap
                regions={filteredGeoRegions}
                coverageType={geoCoverageType}
                mapStyle={geoMapStyle}
                onSelectCoordinates={(lat, lng) => {
                  setSelectedMapCoords({ lat, lng });
                  showToast(`Selected coordinates: ${lat}, ${lng}. Click "+ Add Region" to use them.`);
                }}
              />
            </div>

            {/* RIGHT 1/3: QUICK STATS & COVERAGE TIPS */}
            <div className="space-y-4">
              {/* Quick Stats Card matching Image 4/5 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  QUICK STATS
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Top Region</span>
                    <span className="font-bold text-slate-800">
                      {showSkeletonDemo ? '—' : 'North America / California'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total Countries</span>
                    <span className="font-bold text-slate-900">{totalCountriesCount}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total States</span>
                    <span className="font-bold text-slate-900">{totalStatesCount}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Active Cities</span>
                    <span className="font-bold text-slate-900">{totalCitiesCount}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Inactive Regions</span>
                    <span className="font-bold text-slate-900">0</span>
                  </div>
                </div>
              </div>

              {/* Coverage Tips Card matching Image 4/5 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  COVERAGE TIPS
                </h3>

                <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
                  <li>• Countries are managed under Master Data › Countries.</li>
                  <li>• Click the map inside the city modal to set exact coordinates for markers.</li>
                  <li>• States with cities cannot be deleted until their cities are removed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 4: PLATFORM CONFIGURATION                                      */}
      {/* ========================================================================= */}
      {activeSubOption === 'configuration' && (
        <form
          onSubmit={handleSavePlatformConfig}
          className="space-y-6 animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">System Configuration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                System Configuration
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Global platform variables, fee structures, security governance, and operational rules.
              </p>
            </div>

            <button
              type="submit"
              className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Financial & Marketplace Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Marketplace Fee & Payouts</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Platform Commission Fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={platformCommissionRate}
                  onChange={(e) => setPlatformCommissionRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Commission deducted from gross completed bookings across all vendor stores.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vendor Payout Frequency
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="daily">Daily Automatic Payouts</option>
                  <option value="weekly">Weekly Automated Payouts (Every Monday)</option>
                  <option value="biweekly">Bi-Weekly Automated Payouts</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto-Approve Low Volume KYC</h4>
                  <p className="text-[11px] text-slate-500">
                    Bypasses manual KYC queue for businesses projecting under $5,000/mo.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApproveKycVolume}
                  onChange={(e) => setAutoApproveKycVolume(e.target.checked)}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Security & Access Governance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Security & Access Governance</h3>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Mandate Two-Factor Auth (2FA)</h4>
                  <p className="text-[11px] text-slate-500">
                    Requires authenticator app codes for all SuperAdmin and Staff accounts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnforced}
                  onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeoutMinutes}
                  onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Platform Maintenance Mode</h4>
                  <p className="text-[11px] text-amber-700">
                    When active, client apps show maintenance banner and bookings are temporarily frozen.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Communications & Integrations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Integrations & Webhooks</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    System Escalation Support Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Stream Webhook Endpoint
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NEW MASTER DATA CATEGORY (For Reference Data)                     */}
      {/* ========================================================================= */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">New Reference Category</h3>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment Gateways, Tax Zones"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. REF_TAX_ZONES"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the purpose of this master dataset..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD ICON MODAL (Exact match from Image 3)                         */}
      {/* ========================================================================= */}
      {isAddIconModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header matching Image 3 */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Icon</h3>
              <button
                id="close-add-icon-modal"
                onClick={() => setIsAddIconModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form matching Image 3 */}
            <form onSubmit={handleCreateIcon} className="p-6 space-y-4">
              {/* Name field */}
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1.5">Name</label>
                <input
                  id="new-icon-name-input"
                  type="text"
                  required
                  placeholder="e.g. Scissors"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Icon Image Dropzone matching Image 3 */}
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1.5">
                  Icon Image
                </label>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.svg,.png,.jpg';
                    input.onchange = (ev: any) => {
                      const file = ev.target.files?.[0];
                      if (file) {
                        setNewIconFileName(file.name);
                        setNewIconType('Sparkles');
                      }
                    };
                    input.click();
                  }}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center"
                >
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-slate-600 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-800">
                    {newIconFileName ? (
                      <span className="text-emerald-600 font-bold">{newIconFileName}</span>
                    ) : (
                      'Drag & drop icon or browse'
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">SVG, PNG, JPG - Max 2MB</p>
                </div>
              </div>

              {/* Suburb (Keywords / tags) matching Image 3 */}
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1.5">Suburb</label>
                <input
                  id="new-icon-suburb-input"
                  type="text"
                  placeholder="e.g. yoga, meditation, wellness"
                  value={newIconSuburb}
                  onChange={(e) => setNewIconSuburb(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Modal Footer matching Image 3: Cancel (white) & Create (black) */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  id="cancel-add-icon-btn"
                  onClick={() => setIsAddIconModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-add-icon-btn"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD OPERATIONAL REGION (For Geography)                            */}
      {/* ========================================================================= */}
      {isAddRegionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Operational Region</h3>
              <button
                onClick={() => setIsAddRegionModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRegion} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States, India, Canada"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  placeholder="e.g. California, Ontario, Maharashtra"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Hub *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco, Toronto, Pune"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Geographic Coordinates */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    Map Coordinates
                  </span>
                  {selectedMapCoords ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMapCoords(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Clear Pin
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-normal">
                      Click map to pick
                    </span>
                  )}
                </div>
                {selectedMapCoords ? (
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lat: {selectedMapCoords.lat}, Lng: {selectedMapCoords.lng}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    You can click anywhere on the Operational Coverage map to pin exact GPS coordinates for this hub.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRegionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Add Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXPANDED OPERATIONAL COVERAGE MAP MODAL                           */}
      {/* ========================================================================= */}
      {isMapExpandedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  GLOBAL LOGISTICS & DISPATCH
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Operational Coverage Map
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Coverage Type Switcher */}
                <div className="relative">
                  <select
                    value={geoCoverageType}
                    onChange={(e) => setGeoCoverageType(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Cities">Cities</option>
                    <option value="States">States</option>
                    <option value="Countries">Countries</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Map Style Switcher */}
                <div className="relative">
                  <select
                    value={geoMapStyle}
                    onChange={(e) => setGeoMapStyle(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Street">Street</option>
                    <option value="Satellite">Satellite</option>
                    <option value="Terrain">Terrain</option>
                    <option value="Light">Light</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Close Button */}
                <button
                  id="close-expanded-map-btn"
                  onClick={() => setIsMapExpandedModalOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map Body */}
            <div className="p-4">
              <OperationalCoverageMap
                regions={filteredGeoRegions}
                coverageType={geoCoverageType}
                mapStyle={geoMapStyle}
                isFullscreen
                onSelectCoordinates={(lat, lng) => {
                  setSelectedMapCoords({ lat, lng });
                  showToast(`Pinned GPS location: ${lat}, ${lng}`);
                }}
              />
            </div>

            {/* Modal Footer with Active Regions List */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Active Coverage Hubs:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {geoRegions.map((r) => (
                    <span
                      key={r.id}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 text-[11px] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {r.city}, {r.countryCode}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMapExpandedModalOpen(false);
                  setIsAddRegionModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                + Add Operational Region
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
