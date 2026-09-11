import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
  CreditCard,
  Percent,
  Check,
  Globe,
  Sliders,
  Building,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Shield,
  Copy,
  History,
  Activity,
  Terminal,
  Server,
} from 'lucide-react';
import {
  IconAssetRecord,
  MasterDataCategory,
  MasterDataRecord,
  GeographyCountry,
  GeographyState,
  GeographyCity,
  OperationalRegion,
  AdminConfigRecord,
  AdminConfigAuditRecord,
  INITIAL_ICON_ASSETS,
  INITIAL_MASTER_CATEGORIES,
  INITIAL_GEOGRAPHY_COUNTRIES,
  INITIAL_GEOGRAPHY_REGIONS,
  INITIAL_NMI_ADMIN_CONFIGS,
  INITIAL_NMI_ADMIN_AUDIT,
} from '../../../data/configurationData';
import { OperationalCoverageMap } from './OperationalCoverageMap';
import { useDemo } from '../../../context/DemoContext';

export type ConfigSubOption = 'reference-data' | 'icons' | 'geography' | 'configuration';
type IconViewMode = 'table' | 'grid';

export interface AdminConfigurationTabProps {
  initialSubOption?: ConfigSubOption;
  onSubOptionChange?: (sub: ConfigSubOption) => void;
}

export const AdminConfigurationTab: React.FC<AdminConfigurationTabProps> = ({
  initialSubOption = 'reference-data',
  onSubOptionChange,
}) => {
  const { platformLedger, updateCommissionRate } = useDemo();

  // Active Sub-Option (Reference Data, Icons, Geography, Configuration)
  const [activeSubOption, setActiveSubOption] = useState<ConfigSubOption>(initialSubOption);

  useEffect(() => {
    if (initialSubOption) {
      setActiveSubOption(initialSubOption);
    }
  }, [initialSubOption]);

  const handleSubOptionChange = (sub: ConfigSubOption) => {
    setActiveSubOption(sub);
    onSubOptionChange?.(sub);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to render icon by name
  const renderIconByName = (name?: string, className: string = 'w-4 h-4') => {
    switch (name) {
      case 'AirVent':
        return <AirVent className={className} />;
      case 'BatteryCharging':
        return <BatteryCharging className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'Wifi':
        return <Wifi className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'Waves':
        return <Waves className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Drama':
        return <Drama className={className} />;
      case 'CalendarClock':
        return <CalendarClock className={className} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className={className} />;
      case 'Wine':
        return <Wine className={className} />;
      case 'Bluetooth':
        return <Bluetooth className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // =========================================================================
  // 1. REFERENCE DATA STATE & LOGIC (Image 1 & 4)
  // =========================================================================
  const [categories, setCategories] = useState<MasterDataCategory[]>(INITIAL_MASTER_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-amenities');
  const [recordSearchQuery, setRecordSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [recordsPage, setRecordsPage] = useState<number>(1);
  const recordsPerPage = 5;

  // Selected Category
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    if (!activeCategory || !activeCategory.records) return [];
    return activeCategory.records.filter((rec) => {
      const matchesSearch =
        rec.name.toLowerCase().includes(recordSearchQuery.toLowerCase()) ||
        rec.code.toLowerCase().includes(recordSearchQuery.toLowerCase()) ||
        rec.id.toLowerCase().includes(recordSearchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' ? true : rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeCategory, recordSearchQuery, statusFilter]);

  // Paginated Records
  const totalRecordPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (recordsPage - 1) * recordsPerPage;
    return filteredRecords.slice(start, start + recordsPerPage);
  }, [filteredRecords, recordsPage, recordsPerPage]);

  // Toggle record status
  const handleToggleRecordStatus = (recordId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          records: cat.records.map((r) =>
            r.id === recordId
              ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' }
              : r
          ),
        };
      })
    );
  };

  // Delete Record
  const handleDeleteRecord = (recordId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        const newRecords = cat.records.filter((r) => r.id !== recordId);
        return {
          ...cat,
          recordCount: newRecords.length,
          records: newRecords,
        };
      })
    );
    showToast('Record deleted successfully.');
  };

  // Delete Category
  const handleDeleteCategory = () => {
    if (categories.length <= 1) {
      showToast('Cannot delete the last remaining category.');
      return;
    }
    const catNameToDelete = activeCategory?.name || 'Category';
    const remaining = categories.filter((c) => c.id !== selectedCategoryId);
    setCategories(remaining);
    setSelectedCategoryId(remaining[0].id);
    showToast(`Deleted category "${catNameToDelete}".`);
  };

  // Add New Record Modal State (Image 4)
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [newRecCode, setNewRecCode] = useState('');
  const [newRecName, setNewRecName] = useState('');
  const [newRecCategory, setNewRecCategory] = useState('Select...');
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecIcon, setNewRecIcon] = useState('AirVent');
  const [newRecStatus, setNewRecStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleOpenAddRecord = () => {
    setNewRecCode('');
    setNewRecName('');
    setNewRecCategory(activeCategory?.name || 'Amenities');
    setNewRecDesc('');
    setNewRecIcon('Sparkles');
    setNewRecStatus('Active');
    setIsAddRecordModalOpen(true);
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecCode.trim() || !newRecName.trim()) {
      showToast('Please fill in required fields (Code and Name).');
      return;
    }

    const cleanCode = newRecCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const newRecord: MasterDataRecord = {
      id: `#${cleanCode}`,
      code: cleanCode,
      name: newRecName.trim(),
      category: newRecCategory !== 'Select...' ? newRecCategory : activeCategory?.name,
      description: newRecDesc.trim(),
      iconName: newRecIcon,
      status: newRecStatus,
      sortOrder: (activeCategory?.records.length || 0) + 1,
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        const updatedRecords = [newRecord, ...cat.records];
        return {
          ...cat,
          recordCount: updatedRecords.length,
          records: updatedRecords,
        };
      })
    );

    setIsAddRecordModalOpen(false);
    showToast(`✓ Added record "${newRecord.name}" to ${activeCategory.name}.`);
  };

  // Add New Category Modal State
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catCode = newCategoryName.trim().toUpperCase().replace(/\s+/g, '_');
    const newCat: MasterDataCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      code: catCode,
      description: `Reference records for ${newCategoryName.trim()}.`,
      recordCount: 0,
      records: [],
    };
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
    setIsNewCategoryModalOpen(false);
    setNewCategoryName('');
    showToast(`✓ Created category "${newCat.name}".`);
  };

  // =========================================================================
  // 2. ICONS STATE & LOGIC (Image 2 & 5)
  // =========================================================================
  const [iconsList, setIconsList] = useState<IconAssetRecord[]>(INITIAL_ICON_ASSETS);
  const [iconViewMode, setIconViewMode] = useState<IconViewMode>('table');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [iconSortOrder, setIconSortOrder] = useState<'A → Z' | 'Z → A'>('A → Z');
  const [iconPage, setIconPage] = useState(1);
  const [iconsPerPage, setIconsPerPage] = useState(10);

  // Filtered & Sorted Icons
  const filteredIcons = useMemo(() => {
    let list = [...iconsList];
    if (iconSearchQuery.trim()) {
      const q = iconSearchQuery.toLowerCase();
      list = list.filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.suburb.toLowerCase().includes(q) ||
          icon.category?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (iconSortOrder === 'A → Z') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    return list;
  }, [iconsList, iconSearchQuery, iconSortOrder]);

  const totalIconPages = Math.max(1, Math.ceil(filteredIcons.length / iconsPerPage));
  const paginatedIcons = useMemo(() => {
    const start = (iconPage - 1) * iconsPerPage;
    return filteredIcons.slice(start, start + iconsPerPage);
  }, [filteredIcons, iconPage, iconsPerPage]);

  const handleDeleteIcon = (iconId: string) => {
    setIconsList((prev) => prev.filter((i) => i.id !== iconId));
    showToast('Icon asset deleted.');
  };

  // Add Icon Modal State (Image 5)
  const [isAddIconModalOpen, setIsAddIconModalOpen] = useState(false);
  const [newIconName, setNewIconName] = useState('');
  const [newIconSuburb, setNewIconSuburb] = useState('');
  const [newIconSelectedType, setNewIconSelectedType] = useState('Sparkles');

  const handleSaveNewIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIconName.trim()) {
      showToast('Please enter an icon name.');
      return;
    }
    const created: IconAssetRecord = {
      id: `icon-${Date.now()}`,
      name: newIconName.trim(),
      suburb: (newIconSuburb.trim() || newIconName.trim()).toUpperCase(),
      iconType: newIconSelectedType,
      category: 'Custom',
    };
    setIconsList((prev) => [created, ...prev]);
    setIsAddIconModalOpen(false);
    setNewIconName('');
    setNewIconSuburb('');
    showToast(`✓ Added icon "${created.name}".`);
  };

  // =========================================================================
  // 3. GEOGRAPHY STATE & LOGIC (Image 3)
  // =========================================================================
  const [countries, setCountries] = useState<GeographyCountry[]>(INITIAL_GEOGRAPHY_COUNTRIES);
  const [expandedCountryIds, setExpandedCountryIds] = useState<Record<string, boolean>>({
    'country-us': true,
  });
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoCoverageType, setGeoCoverageType] = useState<'Cities' | 'States' | 'Countries'>('Cities');
  const [geoMapStyle, setGeoMapStyle] = useState<'Street' | 'Satellite' | 'Terrain' | 'Light'>('Street');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Toggle Country Expansion
  const toggleCountryExpand = (countryId: string) => {
    setExpandedCountryIds((prev) => ({
      ...prev,
      [countryId]: !prev[countryId],
    }));
  };

  // Toggle Country Active Status
  const handleToggleCountryStatus = (countryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCountries((prev) =>
      prev.map((c) =>
        c.id === countryId
          ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' }
          : c
      )
    );
  };

  // Add State Modal State
  const [isAddStateModalOpen, setIsAddStateModalOpen] = useState(false);
  const [targetCountryIdForState, setTargetCountryIdForState] = useState<string>('country-us');
  const [newStateName, setNewStateName] = useState('');
  const [newStateCode, setNewStateCode] = useState('');

  const handleOpenAddState = (countryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetCountryIdForState(countryId);
    setNewStateName('');
    setNewStateCode('');
    setIsAddStateModalOpen(true);
  };

  const handleSaveState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    const createdState: GeographyState = {
      id: `state-${Date.now()}`,
      name: newStateName.trim(),
      code: newStateCode.trim().toUpperCase() || newStateName.slice(0, 2).toUpperCase(),
      status: 'Active',
      cities: [],
    };
    setCountries((prev) =>
      prev.map((c) =>
        c.id === targetCountryIdForState
          ? { ...c, states: [...c.states, createdState] }
          : c
      )
    );
    setIsAddStateModalOpen(false);
    showToast(`✓ State "${createdState.name}" added.`);
  };

  // Add City Modal State
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [targetStateIdForCity, setTargetStateIdForCity] = useState<string>('');
  const [newCityName, setNewCityName] = useState('');
  const [newCityLat, setNewCityLat] = useState('37.7749');
  const [newCityLng, setNewCityLng] = useState('-122.4194');

  const handleOpenAddCity = (stateId: string) => {
    setTargetStateIdForCity(stateId);
    setNewCityName('');
    setIsAddCityModalOpen(true);
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const createdCity: GeographyCity = {
      id: `city-${Date.now()}`,
      name: newCityName.trim(),
      status: 'Active',
      lat: parseFloat(newCityLat) || 37.7749,
      lng: parseFloat(newCityLng) || -122.4194,
      timezone: 'UTC',
      serviceCount: 1,
    };
    setCountries((prev) =>
      prev.map((country) => ({
        ...country,
        states: country.states.map((st) =>
          st.id === targetStateIdForCity
            ? { ...st, cities: [...st.cities, createdCity] }
            : st
        ),
      }))
    );
    setIsAddCityModalOpen(false);
    showToast(`✓ City "${createdCity.name}" added.`);
  };

  // Counts Calculation matching Image 3: 5 Countries · 14 States · 30 Cities
  const totalCountriesCount = countries.length;
  const totalStatesCount = useMemo(() => {
    return countries.reduce((acc, c) => acc + c.states.length, 0);
  }, [countries]);
  const totalCitiesCount = useMemo(() => {
    return countries.reduce(
      (acc, c) => acc + c.states.reduce((sAcc, s) => sAcc + s.cities.length, 0),
      0
    );
  }, [countries]);

  // Operational Regions for Map Pins
  const dynamicOperationalRegions: OperationalRegion[] = useMemo(() => {
    return countries.flatMap((country) =>
      country.states.flatMap((state) =>
        state.cities.map((city) => ({
          id: city.id,
          country: country.name,
          countryCode: country.code,
          state: state.name,
          city: city.name,
          status: city.status,
          lat: city.lat,
          lng: city.lng,
          timezone: city.timezone,
          serviceCount: city.serviceCount,
        }))
      )
    );
  }, [countries]);

  // Filtered Countries by search
  const filteredCountries = useMemo(() => {
    if (!geoSearchQuery.trim()) return countries;
    const q = geoSearchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.states.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.cities.some((city) => city.name.toLowerCase().includes(q))
        )
    );
  }, [countries, geoSearchQuery]);

  // =========================================================================
  // 4. PLATFORM SYSTEM CONFIGURATION & NMI GATEWAY (admin_configs & admin_config_audit)
  // =========================================================================
  const [platformCommissionInput, setPlatformCommissionInput] = useState<number>(
    platformLedger?.commissionRate ?? 10
  );
  const [backupTaxRateInput] = useState<number>(24);
  const [instantPayoutAllowed, setInstantPayoutAllowed] = useState(true);

  // NMI Configuration Variables (admin_configs under group = 'nmi')
  const [nmiConfigs, setNmiConfigs] = useState<AdminConfigRecord[]>(INITIAL_NMI_ADMIN_CONFIGS);
  const [nmiAudits, setNmiAudits] = useState<AdminConfigAuditRecord[]>(INITIAL_NMI_ADMIN_AUDIT);
  const [configSubTab, setConfigSubTab] = useState<'nmi' | 'audit' | 'fees'>('nmi');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Rotate Secret Key Modal State
  const [isRotateKeyModalOpen, setIsRotateKeyModalOpen] = useState(false);
  const [targetConfigForRotation, setTargetConfigForRotation] = useState<AdminConfigRecord | null>(null);
  const [newSecretValue, setNewSecretValue] = useState('');

  // Test Ping Gateway State
  const [isTestingNmiConnection, setIsTestingNmiConnection] = useState(false);
  const [nmiTestDiagnostic, setNmiTestDiagnostic] = useState<{
    success: boolean;
    statusText: string;
    endpoint: string;
    latencyMs: number;
    timestamp: string;
    responseBody: string;
  } | null>(null);

  // Toggle secret visibility
  const toggleSecretReveal = (key: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Open Rotate Modal
  const openRotateKeyModal = (config: AdminConfigRecord) => {
    setTargetConfigForRotation(config);
    setNewSecretValue('');
    setIsRotateKeyModalOpen(true);
  };

  // Submit Rotate Secret
  const handleRotateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetConfigForRotation || !newSecretValue.trim()) return;

    const trimmed = newSecretValue.trim();
    const newLast4 = trimmed.slice(-4);
    const mockHash = Array.from(new Uint8Array(32), () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Update config record
    setNmiConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.id === targetConfigForRotation.id) {
          return {
            ...cfg,
            valueEncrypted: `aes256gcm:iv_${Math.random().toString(36).slice(2, 6)}:tag_${Math.random().toString(36).slice(2, 6)}:enc_${trimmed}`,
            valueLast4: newLast4,
            updatedAt: new Date().toISOString(),
          };
        }
        return cfg;
      })
    );

    // Append to admin_config_audit
    const auditEntry: AdminConfigAuditRecord = {
      id: `aud-${Date.now()}`,
      configId: targetConfigForRotation.id,
      group: targetConfigForRotation.group,
      key: targetConfigForRotation.key,
      environment: targetConfigForRotation.environment,
      action: 'ROTATE',
      updatedBy: 'Super Admin (You)',
      oldValueLast4: targetConfigForRotation.valueLast4,
      newValueLast4: newLast4,
      oldValueHash: '4f8a7e2b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
      newValueHash: mockHash,
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      createdAt: new Date().toISOString(),
    };

    setNmiAudits((prev) => [auditEntry, ...prev]);
    setIsRotateKeyModalOpen(false);
    showToast(`✓ ${targetConfigForRotation.key} rotated successfully (AES-256-GCM) and logged to admin_config_audit.`);
  };

  // Run Test Ping
  const handleRunNmiTest = () => {
    setIsTestingNmiConnection(true);
    setNmiTestDiagnostic(null);

    const apiUrl = nmiConfigs.find((c) => c.key === 'api_url')?.valuePlain || 'https://sandbox.nmi.com/api/transact.php';

    setTimeout(() => {
      setIsTestingNmiConnection(false);
      const latency = Math.floor(Math.random() * 50) + 110;
      const diag = {
        success: true,
        statusText: '200 OK — Authenticated & TLS Handshake Verified',
        endpoint: apiUrl,
        latencyMs: latency,
        timestamp: new Date().toLocaleTimeString(),
        responseBody: `response=1&responsetext=SUCCESS&authcode=123456&transactionid=SIM_${Date.now()}&response_code=100`,
      };
      setNmiTestDiagnostic(diag);

      // Log to admin_config_audit
      const auditEntry: AdminConfigAuditRecord = {
        id: `aud-${Date.now()}`,
        configId: 'cfg-nmi-001',
        group: 'nmi',
        key: 'security_key',
        environment: 'sandbox',
        action: 'TEST',
        updatedBy: 'Super Admin (You)',
        oldValueLast4: '0873',
        newValueLast4: '0873',
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
        createdAt: new Date().toISOString(),
      };
      setNmiAudits((prev) => [auditEntry, ...prev]);

      showToast(`✓ Gateway ping successful: 200 OK (${latency}ms). Logged to audit.`);
    }, 750);
  };

  // Handle URL change
  const handleUpdatePlainConfig = (key: string, newVal: string) => {
    setNmiConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, valuePlain: newVal, updatedAt: new Date().toISOString() } : c))
    );
    // Log to admin_config_audit
    const auditEntry: AdminConfigAuditRecord = {
      id: `aud-${Date.now()}`,
      configId: nmiConfigs.find((c) => c.key === key)?.id || `cfg-${key}`,
      group: 'nmi',
      key,
      environment: 'sandbox',
      action: 'UPDATE',
      updatedBy: 'Super Admin (You)',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      createdAt: new Date().toISOString(),
    };
    setNmiAudits((prev) => [auditEntry, ...prev]);
    showToast(`✓ ${key} updated and logged.`);
  };

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateCommissionRate) {
      updateCommissionRate(platformCommissionInput);
    }
    showToast('✓ Platform system configuration updated successfully.');
  };

  return (
    <div id="admin-configuration-root" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 1: REFERENCE DATA (Image 1 & Image 4)                            */}
      {/* ========================================================================= */}
      {activeSubOption === 'reference-data' && (
        <div className="space-y-4">
          {/* Main Card Container with Two Columns */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* LEFT COLUMN: Master Data Category List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between p-5 bg-white shrink-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Master Data</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Select a data category to manage its reference records.
                  </p>
                </div>

                {/* Categories List matching Image 1 */}
                <div className="space-y-1 pt-1">
                  {categories.map((cat) => {
                    const isSelected = cat.id === selectedCategoryId;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setRecordsPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-slate-400 font-semibold">{cat.recordCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Category Actions matching Image 1 */}
              <div className="pt-4 mt-6 border-t border-slate-100 space-y-2.5">
                <button
                  type="button"
                  id="btn-delete-category"
                  onClick={handleDeleteCategory}
                  className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE CATEGORY</span>
                </button>

                <button
                  type="button"
                  id="btn-new-category"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW CATEGORY</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Records Table matching Image 1 */}
            <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-x-auto">
              {/* Breadcrumb & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                    <span>Configuration</span>
                    <span>›</span>
                    <span className="text-slate-600 font-semibold">Reference Data</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeCategory?.name || 'Amenities'}
                  </h1>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => showToast(`Exported ${activeCategory?.name} records to CSV.`)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    id="btn-add-new-record"
                    onClick={handleOpenAddRecord}
                    className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Record</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar matching Image 1 */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={recordSearchQuery}
                    onChange={(e) => setRecordSearchQuery(e.target.value)}
                    placeholder={`Search ${activeCategory?.name?.toLowerCase() || 'amenities'}...`}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div className="relative w-full sm:w-44">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Table matching Image 1 */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden mt-1 flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[10px] text-slate-400 font-bold tracking-wider bg-white">
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4 text-center w-16">ICON</th>
                      <th className="py-3.5 px-4">VALUE / NAME</th>
                      <th className="py-3.5 px-4 w-36">STATUS</th>
                      <th className="py-3.5 px-4 text-right w-24">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                            {rec.id}
                          </td>

                          {/* ICON */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                              {renderIconByName(rec.iconName, 'w-4 h-4')}
                            </div>
                          </td>

                          {/* VALUE / NAME */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {rec.name}
                          </td>

                          {/* STATUS (Toggle switch + Active label matching Image 1) */}
                          <td className="py-3.5 px-4">
                            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                              <div
                                onClick={() => handleToggleRecordStatus(rec.id)}
                                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                  rec.status === 'Active' ? 'bg-black' : 'bg-slate-300'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    rec.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-900">{rec.status}</span>
                            </label>
                          </td>

                          {/* ACTIONS (Pencil & Trash matching Image 1) */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => showToast(`Edit record: ${rec.name}`)}
                                className="text-slate-400 hover:text-slate-800 p-1 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer matching Image 1 */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Showing {paginatedRecords.length > 0 ? (recordsPage - 1) * recordsPerPage + 1 : 0}-
                  {Math.min(recordsPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                </span>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    disabled={recordsPage === 1}
                    onClick={() => setRecordsPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalRecordPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setRecordsPage(pNum)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                          recordsPage === pNum
                            ? 'bg-black text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={recordsPage === totalRecordPages || filteredRecords.length === 0}
                    onClick={() => setRecordsPage((p) => Math.min(totalRecordPages, p + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 2: ICONS (Image 2 & Image 5)                                    */}
      {/* ========================================================================= */}
      {activeSubOption === 'icons' && (
        <div className="space-y-5">
          {/* Header Row matching Image 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Icons</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Icons</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage icon assets used across the platform.
              </p>
            </div>

            {/* View Switcher & Add Icon */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  type="button"
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
                  type="button"
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

              <button
                type="button"
                id="btn-add-icon"
                onClick={() => setIsAddIconModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Icon</span>
              </button>
            </div>
          </div>

          {/* Filter Bar matching Image 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
                placeholder="Search icons..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => showToast(`Filtered icons: "${iconSearchQuery}"`)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setIconSortOrder((prev) => (prev === 'A → Z' ? 'Z → A' : 'A → Z'))}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              Sort: {iconSortOrder}
            </button>
          </div>

          {/* TABLE VIEW matching Image 2 */}
          {iconViewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[10px] text-slate-400 font-bold tracking-wider bg-white">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4 w-48">NAME</th>
                      <th className="py-3.5 px-4 w-28">ICON</th>
                      <th className="py-3.5 px-4">SUBURB</th>
                      <th className="py-3.5 px-4 text-right w-24">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedIcons.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No icons found.
                        </td>
                      </tr>
                    ) : (
                      paginatedIcons.map((item, idx) => {
                        const rowNum = (iconPage - 1) * iconsPerPage + idx + 1;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* # */}
                            <td className="py-4 px-4 text-center font-mono text-slate-400">
                              {rowNum}
                            </td>

                            {/* NAME */}
                            <td className="py-4 px-4 font-bold text-slate-900">
                              {item.name}
                            </td>

                            {/* ICON */}
                            <td className="py-4 px-4">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                                {renderIconByName(item.iconType, 'w-4 h-4')}
                              </div>
                            </td>

                            {/* SUBURB (Tags Capsule matching Image 2) */}
                            <td className="py-4 px-4">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded tracking-wide uppercase inline-block">
                                {item.suburb}
                              </span>
                            </td>

                            {/* ACTIONS */}
                            <td className="py-4 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => showToast(`Edit icon: ${item.name}`)}
                                  className="text-slate-400 hover:text-slate-800 p-1 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteIcon(item.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer matching Image 2 */}
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <select
                    value={iconsPerPage}
                    onChange={(e) => {
                      setIconsPerPage(Number(e.target.value));
                      setIconPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>
                    Showing {(iconPage - 1) * iconsPerPage + 1}-
                    {Math.min(iconPage * iconsPerPage, filteredIcons.length)} of {filteredIcons.length} icons
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={iconPage === 1}
                    onClick={() => setIconPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalIconPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setIconPage(pNum)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                          iconPage === pNum
                            ? 'bg-black text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={iconPage === totalIconPages || filteredIcons.length === 0}
                    onClick={() => setIconPage((p) => Math.min(totalIconPages, p + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedIcons.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      {renderIconByName(item.iconType, 'w-5 h-5')}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`Edit icon: ${item.name}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIcon(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 uppercase font-bold">
                      {item.suburb}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 3: GEOGRAPHY (Image 3)                                          */}
      {/* ========================================================================= */}
      {activeSubOption === 'geography' && (
        <div className="space-y-6">
          {/* Header Row matching Image 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Geography</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Geography Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Define and manage active operational regions including countries, states, and cities.
              </p>
            </div>
          </div>

          {/* TOP CARD: Filter, Export, Summary Counts, Search, Country Accordions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            {/* Action Bar matching Image 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Region filters opened.')}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Exported geography records to CSV.')}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
              </div>

              {/* Exact Counter matching Image 3: Showing 5 Countries · 14 States · 30 Cities */}
              <div className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-900 font-bold">{totalCountriesCount}</strong> Countries
                · <strong className="text-slate-900 font-bold">{totalStatesCount}</strong> States ·{' '}
                <strong className="text-slate-900 font-bold">{totalCitiesCount}</strong> Cities
              </div>
            </div>

            {/* Search regions... input matching Image 3 */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={geoSearchQuery}
                onChange={(e) => setGeoSearchQuery(e.target.value)}
                placeholder="Search regions..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            {/* Country Accordion Cards matching Image 3 */}
            <div className="space-y-3 pt-1">
              {filteredCountries.map((country) => {
                const isExpanded = Boolean(expandedCountryIds[country.id]);
                return (
                  <div
                    key={country.id}
                    className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white hover:border-slate-300 transition-all"
                  >
                    {/* Country Header Row matching Image 3 */}
                    <div
                      onClick={() => toggleCountryExpand(country.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base shrink-0 shadow-2xs">
                          {country.flag}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {country.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            {country.states.length} STATES
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Status Toggle matching Image 3 */}
                        <div
                          onClick={(e) => handleToggleCountryStatus(country.id, e)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {country.status}
                          </span>
                          <div
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                              country.status === 'Active' ? 'bg-black' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                country.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>

                        {/* + Add State Button matching Image 3 */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenAddState(country.id, e)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add State</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded States & Cities Tree */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        {country.states.map((state) => (
                          <div
                            key={state.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <strong className="text-xs font-bold text-slate-900">{state.name}</strong>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  ({state.code}) • {state.cities.length} cities
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenAddCity(state.id)}
                                className="text-[11px] font-bold text-slate-600 hover:text-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add City</span>
                              </button>
                            </div>

                            {/* City Chips */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {state.cities.map((city) => (
                                <span
                                  key={city.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                                >
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>{city.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({city.serviceCount})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM SECTION: Left 2/3 Map Card, Right 1/3 Quick Stats & Coverage Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT 2/3: OPERATIONAL COVERAGE MAP matching Image 3 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              {/* Map Header matching Image 3 */}
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
                    type="button"
                    onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                    className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                    title="Fullscreen map view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive OpenStreetMap Canvas */}
              <div className="min-h-[380px] w-full rounded-xl overflow-hidden border border-slate-200">
                <OperationalCoverageMap
                  regions={dynamicOperationalRegions}
                  coverageType={geoCoverageType}
                  mapStyle={geoMapStyle}
                  isFullscreen={isMapFullscreen}
                  onSelectCoordinates={(lat, lng) => {
                    setNewCityLat(String(lat));
                    setNewCityLng(String(lng));
                    showToast(`Selected coordinates: ${lat}, ${lng}`);
                  }}
                />
              </div>
            </div>

            {/* RIGHT 1/3: QUICK STATS & COVERAGE TIPS matching Image 3 */}
            <div className="space-y-4">
              {/* Quick Stats Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  QUICK STATS
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Top Region</span>
                    <strong className="font-bold text-slate-900">California</strong>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total Countries</span>
                    <strong className="font-bold text-slate-900">{totalCountriesCount}</strong>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total States</span>
                    <strong className="font-bold text-slate-900">{totalStatesCount}</strong>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Active Cities</span>
                    <strong className="font-bold text-slate-900">{totalCitiesCount}</strong>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Inactive Regions</span>
                    <strong className="font-bold text-slate-900">0</strong>
                  </div>
                </div>
              </div>

              {/* Coverage Tips Card */}
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
      {/* SUB-OPTION 4: CONFIGURATION (NMI Gateway & System Settings)               */}
      {/* ========================================================================= */}
      {activeSubOption === 'configuration' && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Configuration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Platform System Configuration
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Database variables for NMI payment gateway (<span className="font-mono font-semibold text-slate-700">admin_configs</span>), AES-256-GCM encryption keys, and change audit ledger (<span className="font-mono font-semibold text-slate-700">admin_config_audit</span>).
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleRunNmiTest}
                disabled={isTestingNmiConnection}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingNmiConnection ? 'animate-spin' : ''}`} />
                <span>{isTestingNmiConnection ? 'Testing Handshake...' : 'Test Gateway Ping'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Result Banner (when tested) */}
          {nmiTestDiagnostic && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Gateway Diagnostic: {nmiTestDiagnostic.statusText}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[10px] font-mono font-bold">
                    {nmiTestDiagnostic.latencyMs}ms latency
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">{nmiTestDiagnostic.timestamp}</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-mono break-all bg-emerald-100/60 p-2 rounded-xl">
                Payload response: {nmiTestDiagnostic.responseBody}
              </p>
            </div>
          )}

          {/* Configuration Segment Navigation Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setConfigSubTab('nmi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                configSubTab === 'nmi'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>NMI Gateway (admin_configs)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'nmi' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {nmiConfigs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                configSubTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail (admin_config_audit)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'audit' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {nmiAudits.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('fees')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                configSubTab === 'fees'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Commission & W-9 Rules</span>
            </button>
          </div>

          {/* TAB 1: NMI GATEWAY KEYS (admin_configs) */}
          {configSubTab === 'nmi' && (
            <div className="space-y-6">
              {/* Security Storage Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      <span>Database Storage: AES-256-GCM Encrypted at Rest</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                        group = 'nmi'
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Secret keys are encrypted in <code className="text-blue-300">valueEncrypted</code> with initialization vector (IV) and HMAC authentication tag. Only the last 4 characters are preserved in <code className="text-blue-300">valueLast4</code> for UI identification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400">Environment:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>sandbox</span>
                  </span>
                </div>
              </div>

              {/* Secret Keys Cards (security_key, public_key, webhook_signing_key) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span>Encrypted API & Secret Keys</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stored with <code className="text-slate-600">isSecret = true</code> in the <code className="text-slate-600">admin_configs</code> table.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {nmiConfigs
                    .filter((c) => c.isSecret)
                    .map((cfg) => {
                      const isRevealed = Boolean(revealedSecrets[cfg.key]);
                      return (
                        <div key={cfg.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {cfg.key}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">
                                AES-256-GCM
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                                {cfg.environment}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{cfg.description}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Last updated: {new Date(cfg.updatedAt).toLocaleDateString()} by {cfg.updatedBy}
                            </p>
                          </div>

                          {/* Key Display Box & Action */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/90 rounded-xl border border-slate-200/80 font-mono text-xs">
                              <span className="text-slate-700 select-all">
                                {isRevealed
                                  ? (cfg.key === 'security_key' ? '2F822rw294ED1945nc9b52kvnmx' : 'pub_live_9410385bf7291a4') + cfg.valueLast4
                                  : `••••••••••••••••••••••••${cfg.valueLast4}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSecretReveal(cfg.key)}
                                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                                title={isRevealed ? 'Hide secret' : 'Reveal masked secret'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(cfg.valueLast4 || '');
                                  showToast(`Copied ${cfg.key} reference.`);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                                title="Copy"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openRotateKeyModal(cfg)}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                              <span>Rotate Key</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Non-Secret Endpoints & Environment (api_url, query_url, environment) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>NMI Gateway URL Endpoints & Environment Mode</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stored as plaintext in <code className="text-slate-600">valuePlain</code> with <code className="text-slate-600">isSecret = false</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  {nmiConfigs
                    .filter((c) => !c.isSecret && c.key !== 'environment')
                    .map((cfg) => (
                      <div key={cfg.id} className="space-y-1.5">
                        <label className="block font-bold text-slate-700">
                          {cfg.key} ({cfg.description})
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={cfg.valuePlain || ''}
                            onBlur={(e) => {
                              if (e.target.value !== cfg.valuePlain) {
                                handleUpdatePlainConfig(cfg.key, e.target.value);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Database field: <code className="text-slate-600">admin_configs.valuePlain</code>
                        </span>
                      </div>
                    ))}
                </div>

                {/* Gateway Environment Selector */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Active Gateway Environment</span>
                    <span className="text-[11px] text-slate-500">
                      Switches transaction routing between NMI Sandbox simulator and live payment production.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdatePlainConfig('environment', 'sandbox')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nmiConfigs.find((c) => c.key === 'environment')?.valuePlain === 'sandbox'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ● Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePlainConfig('environment', 'production')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nmiConfigs.find((c) => c.key === 'environment')?.valuePlain === 'production'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ● Production
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL (admin_config_audit) */}
          {configSubTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Configuration Audit Trail (admin_config_audit)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable security log recording every create, update, rotation, and diagnostic test.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Exported audit log to CSV.')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Log</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-5">TIMESTAMP</th>
                      <th className="py-3 px-4">ACTION</th>
                      <th className="py-3 px-4">KEY</th>
                      <th className="py-3 px-4">ENV</th>
                      <th className="py-3 px-4">VALUE CHANGE</th>
                      <th className="py-3 px-4">SHA-256 HASH</th>
                      <th className="py-3 px-5">ADMIN / IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nmiAudits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(aud.createdAt).toLocaleDateString()}{' '}
                          {new Date(aud.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase ${
                              aud.action === 'ROTATE'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : aud.action === 'TEST'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : aud.action === 'UPDATE'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {aud.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {aud.key}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 uppercase">
                          {aud.environment}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                          {aud.oldValueLast4 && aud.newValueLast4 ? (
                            <span>
                              <span className="text-slate-400">•••• {aud.oldValueLast4}</span>
                              <span className="text-slate-400 mx-1">→</span>
                              <span className="font-bold text-slate-900">•••• {aud.newValueLast4}</span>
                            </span>
                          ) : aud.newValueLast4 ? (
                            <span className="font-bold text-slate-900">•••• {aud.newValueLast4}</span>
                          ) : (
                            <span className="text-slate-400">Plaintext URL</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {aud.newValueHash ? (
                            <span title={aud.newValueHash} className="cursor-help">
                              {aud.newValueHash.slice(0, 10)}...
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{aud.updatedBy}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{aud.ipAddress}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSION & W-9 PARAMETERS */}
          {configSubTab === 'fees' && (
            <form onSubmit={handleSavePlatformConfig} className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span>Marketplace Financial & Commission Parameters</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Super Admin Platform Commission Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={platformCommissionInput}
                        onChange={(e) => setPlatformCommissionInput(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Applied automatically to all new customer bookings across all business venues.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      IRS Form W-9 Non-Compliance Backup Withholding Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled
                        value={backupTaxRateInput}
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Mandated IRS statutory rate (24%) held in platform tax escrow if vendor lacks verified W-9.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Instant Withdrawal Requests</span>
                    <span className="text-[11px] text-slate-500">Allow verified vendors to request disbursements immediately upon balance availability.</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <div
                      onClick={() => setInstantPayoutAllowed(!instantPayoutAllowed)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        instantPayoutAllowed ? 'bg-black' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          instantPayoutAllowed ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW RECORD (Image 4)                                           */}
      {/* ========================================================================= */}
      {isAddRecordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddRecordModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header matching Image 4 */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Record</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage {activeCategory?.name || 'Amenities'} reference data
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRecordModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form matching Image 4 */}
            <form onSubmit={handleSaveNewRecord} className="p-6 space-y-4">
              {/* Code * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={newRecCode}
                  onChange={(e) => setNewRecCode(e.target.value)}
                  placeholder="e.g. WIFI"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  placeholder="e.g. Free WiFi"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={newRecCategory}
                    onChange={(e) => setNewRecCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    <option value="General">General</option>
                    <option value="Climate">Climate</option>
                    <option value="Transport">Transport</option>
                    <option value="Payment">Payment</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Tech">Tech</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Work">Work</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newRecDesc}
                  onChange={(e) => setNewRecDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Icon
                </label>
                <div className="relative">
                  <select
                    value={newRecIcon}
                    onChange={(e) => setNewRecIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="AirVent">AirVent (Climate / AC)</option>
                    <option value="BatteryCharging">BatteryCharging (EV Charger)</option>
                    <option value="CreditCard">CreditCard (Payments)</option>
                    <option value="Coffee">Coffee (Espresso Bar)</option>
                    <option value="Wifi">Wifi (High-Speed WiFi)</option>
                    <option value="Car">Car (Valet Parking)</option>
                    <option value="Waves">Waves (Swimming Pool)</option>
                    <option value="Briefcase">Briefcase (Conference Room)</option>
                    <option value="Sparkles">Sparkles (Fitness / Wellness)</option>
                    <option value="Drama">Drama (Pet Friendly)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={newRecStatus}
                    onChange={(e) => setNewRecStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Modal Buttons matching Image 4 */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ICON (Image 5)                                                 */}
      {/* ========================================================================= */}
      {isAddIconModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddIconModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header matching Image 5 */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Icon</h3>
              <button
                type="button"
                onClick={() => setIsAddIconModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form matching Image 5 */}
            <form onSubmit={handleSaveNewIcon} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  placeholder="e.g. Scissors"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Icon Image Drag & Drop Box matching Image 5 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Icon Image
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-slate-400 transition-colors flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer">
                  <UploadCloud className="w-7 h-7 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-800 block">
                    Drag & drop icon or browse
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    SVG, PNG, JPG · Max 2MB
                  </span>
                </div>
              </div>

              {/* Suburb / Synonyms Keywords matching Image 5 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Suburb
                </label>
                <input
                  type="text"
                  value={newIconSuburb}
                  onChange={(e) => setNewIconSuburb(e.target.value)}
                  placeholder="e.g. yoga, meditation, wellness"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Modal Buttons matching Image 5 */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddIconModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STATE (Geography)                                              */}
      {/* ========================================================================= */}
      {isAddStateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddStateModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add State / Province</h3>
              <button
                type="button"
                onClick={() => setIsAddStateModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveState} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">State Name *</label>
                <input
                  type="text"
                  required
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  placeholder="e.g. Washington"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">State Code (Optional)</label>
                <input
                  type="text"
                  value={newStateCode}
                  onChange={(e) => setNewStateCode(e.target.value)}
                  placeholder="e.g. WA"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Add State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CITY (Geography)                                               */}
      {/* ========================================================================= */}
      {isAddCityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddCityModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add City</h3>
              <button
                type="button"
                onClick={() => setIsAddCityModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City Name *</label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g. Seattle"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Latitude</label>
                  <input
                    type="text"
                    value={newCityLat}
                    onChange={(e) => setNewCityLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Longitude</label>
                  <input
                    type="text"
                    value={newCityLng}
                    onChange={(e) => setNewCityLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCityModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Add City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW CATEGORY (Master Data)                                         */}
      {/* ========================================================================= */}
      {isNewCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsNewCategoryModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Master Category</h3>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Payment Methods"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ROTATE SECRET KEY (admin_configs & admin_config_audit)              */}
      {/* ========================================================================= */}
      {isRotateKeyModalOpen && targetConfigForRotation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsRotateKeyModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Rotate Secret Key: {targetConfigForRotation.key}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update secret value encrypted with AES-256-GCM in <code className="font-mono text-slate-600">admin_configs</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRotateKeyModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRotateKeySubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Configuration Group:</span>
                  <span className="font-mono font-bold text-slate-800">{targetConfigForRotation.group}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Current Masked Value:</span>
                  <span className="font-mono font-bold text-slate-800">•••• {targetConfigForRotation.valueLast4}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Target Environment:</span>
                  <span className="font-mono font-bold text-slate-800">{targetConfigForRotation.environment}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Secret Value *
                </label>
                <input
                  type="text"
                  required
                  value={newSecretValue}
                  onChange={(e) => setNewSecretValue(e.target.value)}
                  placeholder="Paste new secret or API key..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                {newSecretValue && (
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Detected Last 4: <span className="font-bold text-blue-600">{newSecretValue.slice(-4)}</span>
                  </p>
                )}
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                <strong>AES-256-GCM Encryption Notice:</strong> This value will be securely encrypted with an initialization vector (IV) and authentication tag before insertion. A SHA-256 hash will be recorded in <code className="font-mono font-bold">admin_config_audit</code> with action <code className="font-mono font-bold">ROTATE</code>.
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRotateKeyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Encrypt Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfigurationTab;
