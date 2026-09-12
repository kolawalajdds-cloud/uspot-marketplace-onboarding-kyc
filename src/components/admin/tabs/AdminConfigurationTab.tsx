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
  MessageSquare,
  Flame,
  Phone,
  BellRing,
  Wallet,
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
  INITIAL_TWILIO_ADMIN_CONFIGS,
  INITIAL_FIREBASE_ADMIN_CONFIGS,
  INITIAL_MIDDESK_ADMIN_CONFIGS,
} from '../../../data/configurationData';
import { OperationalCoverageMap } from './OperationalCoverageMap';
import { useDemo } from '../../../context/DemoContext';

export type ConfigSubOption = 'reference-data' | 'icons' | 'geography' | 'configuration' | 'commission';
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
  // Twilio Configuration Variables (admin_configs under group = 'twilio')
  const [twilioConfigs, setTwilioConfigs] = useState<AdminConfigRecord[]>(INITIAL_TWILIO_ADMIN_CONFIGS);
  // Firebase Configuration Variables (admin_configs under group = 'firebase')
  const [firebaseConfigs, setFirebaseConfigs] = useState<AdminConfigRecord[]>(INITIAL_FIREBASE_ADMIN_CONFIGS);
  // Middesk Configuration Variables (admin_configs under group = 'middesk')
  const [middeskConfigs, setMiddeskConfigs] = useState<AdminConfigRecord[]>(INITIAL_MIDDESK_ADMIN_CONFIGS);

  const [nmiAudits, setNmiAudits] = useState<AdminConfigAuditRecord[]>(INITIAL_NMI_ADMIN_AUDIT);
  const [configSubTab, setConfigSubTab] = useState<'nmi' | 'twilio' | 'firebase' | 'middesk' | 'audit'>('nmi');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Rotate Secret Key Modal State
  const [isRotateKeyModalOpen, setIsRotateKeyModalOpen] = useState(false);
  const [targetConfigForRotation, setTargetConfigForRotation] = useState<AdminConfigRecord | null>(null);
  const [newSecretValue, setNewSecretValue] = useState('');

  // Test Ping Gateway State (NMI)
  const [isTestingNmiConnection, setIsTestingNmiConnection] = useState(false);
  const [nmiTestDiagnostic, setNmiTestDiagnostic] = useState<{
    success: boolean;
    statusText: string;
    endpoint: string;
    latencyMs: number;
    timestamp: string;
    responseBody: string;
  } | null>(null);

  // Test State (Twilio)
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [twilioTestDiagnostic, setTwilioTestDiagnostic] = useState<{
    success: boolean;
    statusText: string;
    senderPhone: string;
    recipientTest: string;
    latencyMs: number;
    timestamp: string;
    sid: string;
  } | null>(null);

  // Test State (Firebase)
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestDiagnostic, setFirebaseTestDiagnostic] = useState<{
    success: boolean;
    statusText: string;
    projectId: string;
    clientEmail: string;
    latencyMs: number;
    timestamp: string;
    tokenExpiry: string;
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

    // Update config record based on target group
    if (targetConfigForRotation.group === 'nmi') {
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
    } else if (targetConfigForRotation.group === 'twilio') {
      setTwilioConfigs((prev) =>
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
    } else if (targetConfigForRotation.group === 'firebase') {
      setFirebaseConfigs((prev) =>
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
    } else if (targetConfigForRotation.group === 'middesk') {
      setMiddeskConfigs((prev) =>
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
    }

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
    showToast(`✓ [${targetConfigForRotation.group.toUpperCase()}] ${targetConfigForRotation.key} rotated successfully (AES-256-GCM) and logged to admin_config_audit.`);
  };

  // Run Test Ping (NMI)
  const handleRunNmiTest = () => {
    setIsTestingNmiConnection(true);
    setNmiTestDiagnostic(null);

    const apiUrl = nmiConfigs.find((c) => c.key === 'api_url')?.valuePlain || 'https://secure.nmi.com/api/transact.php';

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
        environment: 'production',
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

  // Run Test Ping (Twilio)
  const handleRunTwilioTest = () => {
    setIsTestingTwilio(true);
    setTwilioTestDiagnostic(null);

    const sender = twilioConfigs.find((c) => c.key === 'sender_phone')?.valuePlain || '+18559281042';

    setTimeout(() => {
      setIsTestingTwilio(false);
      const latency = Math.floor(Math.random() * 45) + 85;
      const diag = {
        success: true,
        statusText: '200 OK — Twilio SMS Super Network Handshake Verified',
        senderPhone: sender,
        recipientTest: '+1 (555) 019-2834',
        latencyMs: latency,
        timestamp: new Date().toLocaleTimeString(),
        sid: `SM_sim_${Math.random().toString(36).slice(2, 11)}`,
      };
      setTwilioTestDiagnostic(diag);

      const auditEntry: AdminConfigAuditRecord = {
        id: `aud-${Date.now()}`,
        configId: 'cfg-twilio-002',
        group: 'twilio',
        key: 'auth_token',
        environment: 'production',
        action: 'TEST',
        updatedBy: 'Super Admin (You)',
        oldValueLast4: '0831',
        newValueLast4: '0831',
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
        createdAt: new Date().toISOString(),
      };
      setNmiAudits((prev) => [auditEntry, ...prev]);

      showToast(`✓ Twilio test SMS dispatched successfully (${latency}ms). Logged to audit.`);
    }, 750);
  };

  // Run Test Ping (Firebase)
  const handleRunFirebaseTest = () => {
    setIsTestingFirebase(true);
    setFirebaseTestDiagnostic(null);

    const projId = firebaseConfigs.find((c) => c.key === 'project_id')?.valuePlain || 'urspot-marketplace-prod';
    const clientEmail = firebaseConfigs.find((c) => c.key === 'client_email')?.valuePlain || 'firebase-adminsdk-m8192@urspot-marketplace-prod.iam.gserviceaccount.com';

    setTimeout(() => {
      setIsTestingFirebase(false);
      const latency = Math.floor(Math.random() * 40) + 95;
      const expiryDate = new Date(Date.now() + 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const diag = {
        success: true,
        statusText: '200 OK — Google OAuth2 Service Account Handshake Verified',
        projectId: projId,
        clientEmail,
        latencyMs: latency,
        timestamp: new Date().toLocaleTimeString(),
        tokenExpiry: `${expiryDate} (1 hour validity)`,
      };
      setFirebaseTestDiagnostic(diag);

      const auditEntry: AdminConfigAuditRecord = {
        id: `aud-${Date.now()}`,
        configId: 'cfg-firebase-003',
        group: 'firebase',
        key: 'private_key',
        environment: 'production',
        action: 'TEST',
        updatedBy: 'Super Admin (You)',
        oldValueLast4: '8192',
        newValueLast4: '8192',
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
        createdAt: new Date().toISOString(),
      };
      setNmiAudits((prev) => [auditEntry, ...prev]);

      showToast(`✓ Firebase FCM OAuth2 handshake verified (${latency}ms). Logged to audit.`);
    }, 750);
  };

  // Run Test Ping (Middesk)
  const [isTestingMiddesk, setIsTestingMiddesk] = useState(false);
  const [middeskTestDiagnostic, setMiddeskTestDiagnostic] = useState<{
    success: boolean;
    statusText: string;
    baseUrl: string;
    apiKeyLast4: string;
    latencyMs: number;
    timestamp: string;
    organizationId: string;
  } | null>(null);

  const handleRunMiddeskTest = () => {
    setIsTestingMiddesk(true);
    setMiddeskTestDiagnostic(null);

    const baseUrl = middeskConfigs.find((c) => c.key === 'base_url')?.valuePlain || 'https://api.middesk.com/v1';
    const apiKeyCfg = middeskConfigs.find((c) => c.key === 'api_key');

    setTimeout(() => {
      setIsTestingMiddesk(false);
      const latency = Math.floor(Math.random() * 35) + 65;
      const diag = {
        success: true,
        statusText: '200 OK — Middesk API Connection Verified',
        baseUrl,
        apiKeyLast4: apiKeyCfg?.valueLast4 || '9142',
        latencyMs: latency,
        timestamp: new Date().toLocaleTimeString(),
        organizationId: `org_test_${Math.random().toString(36).slice(2, 10)}`,
      };
      setMiddeskTestDiagnostic(diag);

      const auditEntry: AdminConfigAuditRecord = {
        id: `aud-${Date.now()}`,
        configId: 'cfg-middesk-001',
        group: 'middesk',
        key: 'api_key',
        environment: 'production',
        action: 'TEST',
        updatedBy: 'Super Admin (You)',
        oldValueLast4: apiKeyCfg?.valueLast4 || '9142',
        newValueLast4: apiKeyCfg?.valueLast4 || '9142',
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
        createdAt: new Date().toISOString(),
      };
      setNmiAudits((prev) => [auditEntry, ...prev]);

      showToast(`✓ Middesk Business Verification API ping successful (${latency}ms). Logged to audit.`);
    }, 750);
  };

  // Handle URL & Plaintext changes across groups
  const handleUpdatePlainConfig = (group: 'nmi' | 'twilio' | 'firebase' | 'middesk', key: string, newVal: string) => {
    if (group === 'nmi') {
      setNmiConfigs((prev) =>
        prev.map((c) => (c.key === key ? { ...c, valuePlain: newVal, updatedAt: new Date().toISOString() } : c))
      );
    } else if (group === 'twilio') {
      setTwilioConfigs((prev) =>
        prev.map((c) => (c.key === key ? { ...c, valuePlain: newVal, updatedAt: new Date().toISOString() } : c))
      );
    } else if (group === 'firebase') {
      setFirebaseConfigs((prev) =>
        prev.map((c) => (c.key === key ? { ...c, valuePlain: newVal, updatedAt: new Date().toISOString() } : c))
      );
    } else if (group === 'middesk') {
      setMiddeskConfigs((prev) =>
        prev.map((c) => (c.key === key ? { ...c, valuePlain: newVal, updatedAt: new Date().toISOString() } : c))
      );
    }

    // Log to admin_config_audit
    const auditEntry: AdminConfigAuditRecord = {
      id: `aud-${Date.now()}`,
      configId: `cfg-${group}-${key}`,
      group,
      key,
      environment: 'production',
      action: 'UPDATE',
      updatedBy: 'Super Admin (You)',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      createdAt: new Date().toISOString(),
    };
    setNmiAudits((prev) => [auditEntry, ...prev]);
    showToast(`✓ [${group.toUpperCase()}] ${key} updated and logged.`);
  };

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateCommissionRate) {
      updateCommissionRate(platformCommissionInput);
    }
    showToast('✓ Platform system configuration updated successfully.');
  };

  // =========================================================================
  // 5. PLATFORM COMMISSION CONFIGURATION & LIVE SIMULATOR
  // =========================================================================
  const commissionRate = platformLedger?.commissionRate ?? 10.0;
  const [commissionRateInput, setCommissionRateInput] = useState<string>(String(commissionRate));
  const [isCommissionSaved, setIsCommissionSaved] = useState(false);
  const [commissionErrorMessage, setCommissionErrorMessage] = useState<string | null>(null);
  const [sampleBookingAmount, setSampleBookingAmount] = useState<number>(100);

  useEffect(() => {
    if (platformLedger?.commissionRate !== undefined) {
      setCommissionRateInput(String(platformLedger.commissionRate));
      setPlatformCommissionInput(platformLedger.commissionRate);
    }
  }, [platformLedger?.commissionRate]);

  const handleCommissionPresetClick = (preset: number) => {
    setCommissionRateInput(preset.toString());
    setCommissionErrorMessage(null);
  };

  const handleCommissionSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(commissionRateInput);

    if (isNaN(parsed)) {
      setCommissionErrorMessage('Please enter a valid numeric percentage.');
      return;
    }

    if (parsed < 0 || parsed > 100) {
      setCommissionErrorMessage('Commission percentage must be between 0% and 100%.');
      return;
    }

    setCommissionErrorMessage(null);
    updateCommissionRate(parsed);
    setPlatformCommissionInput(parsed);
    setIsCommissionSaved(true);
    showToast(`✓ Platform commission percentage updated to ${parsed}%.`);
    setTimeout(() => {
      setIsCommissionSaved(false);
    }, 3000);
  };

  const activeCommissionRate = parseFloat(commissionRateInput) || 0;
  const calculatedPlatformFee = ((sampleBookingAmount * activeCommissionRate) / 100).toFixed(2);
  const calculatedVendorPayout = Math.max(
    0,
    sampleBookingAmount - (sampleBookingAmount * activeCommissionRate) / 100
  ).toFixed(2);
  const calculatedNoW9Payout = Math.max(
    0,
    sampleBookingAmount - (sampleBookingAmount * activeCommissionRate) / 100 - (sampleBookingAmount * 24) / 100
  ).toFixed(2);

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
                Database variables for NMI payment gateway, Twilio SMS carrier, Firebase push notifications, and Middesk business verification (<span className="font-mono font-semibold text-slate-700">admin_configs</span>), AES-256-GCM encryption keys, and change audit ledger (<span className="font-mono font-semibold text-slate-700">admin_config_audit</span>).
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {configSubTab === 'nmi' && (
                <button
                  type="button"
                  onClick={handleRunNmiTest}
                  disabled={isTestingNmiConnection}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 text-blue-400 ${isTestingNmiConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingNmiConnection ? 'Testing NMI...' : 'Test Gateway Ping'}</span>
                </button>
              )}

              {configSubTab === 'twilio' && (
                <button
                  type="button"
                  onClick={handleRunTwilioTest}
                  disabled={isTestingTwilio}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingTwilio ? 'animate-spin' : ''}`} />
                  <span>{isTestingTwilio ? 'Testing SMS Carrier...' : 'Test SMS Dispatch'}</span>
                </button>
              )}

              {configSubTab === 'firebase' && (
                <button
                  type="button"
                  onClick={handleRunFirebaseTest}
                  disabled={isTestingFirebase}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 text-amber-400 ${isTestingFirebase ? 'animate-spin' : ''}`} />
                  <span>{isTestingFirebase ? 'Testing FCM OAuth2...' : 'Test FCM Handshake'}</span>
                </button>
              )}

              {configSubTab === 'middesk' && (
                <button
                  type="button"
                  onClick={handleRunMiddeskTest}
                  disabled={isTestingMiddesk}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 text-indigo-400 ${isTestingMiddesk ? 'animate-spin' : ''}`} />
                  <span>{isTestingMiddesk ? 'Testing Middesk API...' : 'Test Middesk Ping'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Result Banner (when tested) */}
          {nmiTestDiagnostic && configSubTab === 'nmi' && (
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

          {twilioTestDiagnostic && configSubTab === 'twilio' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Twilio SMS Carrier Diagnostic: {twilioTestDiagnostic.statusText}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[10px] font-mono font-bold">
                    {twilioTestDiagnostic.latencyMs}ms latency
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">{twilioTestDiagnostic.timestamp}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-800 font-mono bg-emerald-100/60 p-2.5 rounded-xl">
                <span><strong>Sender Phone:</strong> {twilioTestDiagnostic.senderPhone}</span>
                <span><strong>Test Recipient:</strong> {twilioTestDiagnostic.recipientTest}</span>
                <span><strong>Message SID:</strong> {twilioTestDiagnostic.sid}</span>
                <span><strong>Carrier Status:</strong> <span className="text-emerald-700 font-bold uppercase">Delivered</span></span>
              </div>
            </div>
          )}

          {firebaseTestDiagnostic && configSubTab === 'firebase' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    Firebase Service Account Diagnostic: {firebaseTestDiagnostic.statusText}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[10px] font-mono font-bold">
                    {firebaseTestDiagnostic.latencyMs}ms latency
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-mono">{firebaseTestDiagnostic.timestamp}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-amber-900 font-mono bg-amber-100/60 p-2.5 rounded-xl">
                <span><strong>Project ID:</strong> {firebaseTestDiagnostic.projectId}</span>
                <span><strong>Client Email:</strong> {firebaseTestDiagnostic.clientEmail}</span>
                <span><strong>OAuth2 Handshake:</strong> <span className="text-emerald-700 font-bold uppercase">Google JWT Signed & Exchanged</span></span>
                <span><strong>Token Expiry:</strong> {firebaseTestDiagnostic.tokenExpiry}</span>
              </div>
            </div>
          )}

          {middeskTestDiagnostic && configSubTab === 'middesk' && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-indigo-900">
                    Middesk KYB Diagnostic: {middeskTestDiagnostic.statusText}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-800 text-[10px] font-mono font-bold">
                    {middeskTestDiagnostic.latencyMs}ms latency
                  </span>
                </div>
                <span className="text-[10px] text-indigo-700 font-mono">{middeskTestDiagnostic.timestamp}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-indigo-900 font-mono bg-indigo-100/60 p-2.5 rounded-xl">
                <span><strong>Base URL:</strong> {middeskTestDiagnostic.baseUrl}</span>
                <span><strong>API Key:</strong> •••• {middeskTestDiagnostic.apiKeyLast4}</span>
                <span><strong>API Connection:</strong> <span className="text-emerald-700 font-bold uppercase">Active & Verified</span></span>
                <span><strong>Mock Org:</strong> {middeskTestDiagnostic.organizationId}</span>
              </div>
            </div>
          )}

          {/* Configuration Segment Navigation Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setConfigSubTab('nmi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                configSubTab === 'nmi'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>NMI Gateway</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'nmi' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {nmiConfigs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('twilio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                configSubTab === 'twilio'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Twilio (SMS)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'twilio' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {twilioConfigs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('firebase')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                configSubTab === 'firebase'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Firebase (Push / FCM)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'firebase' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {firebaseConfigs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('middesk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                configSubTab === 'middesk'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Middesk (KYC)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'middesk' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {middeskConfigs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfigSubTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                configSubTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Trail (admin_config_audit)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                configSubTab === 'audit' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {nmiAudits.length}
              </span>
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
                    <span>production</span>
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
                    <span>NMI Gateway URL Endpoints</span>
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
                                handleUpdatePlainConfig('nmi', cfg.key, e.target.value);
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
              </div>
            </div>
          )}

          {/* TAB 2: TWILIO (SMS) CONFIGURATION (admin_configs group = 'twilio') */}
          {configSubTab === 'twilio' && (
            <div className="space-y-6">
              {/* Security Storage Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      <span>Twilio SMS Service: AES-256-GCM Encrypted Auth Token</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        group = 'twilio'
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Auth token is encrypted in <code className="text-emerald-300 font-mono">valueEncrypted</code> using AES-256-GCM with distinct IV and tag. Account SID and sender phone are stored in <code className="text-emerald-300 font-mono">valuePlain</code> for outbound SMS dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400">Carrier Mode:</span>
                  <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 border ${
                    twilioConfigs.find((c) => c.key === 'sms_log_only')?.valuePlain === 'true'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      twilioConfigs.find((c) => c.key === 'sms_log_only')?.valuePlain === 'true' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    <span>{twilioConfigs.find((c) => c.key === 'sms_log_only')?.valuePlain === 'true' ? 'Console Mock Mode' : 'Live Carrier Dispatch'}</span>
                  </span>
                </div>
              </div>

              {/* Secret Keys Cards (auth_token) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Encrypted Twilio Auth Token</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stored with <code className="text-slate-600">isSecret = true</code> in the <code className="text-slate-600">admin_configs</code> table.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {twilioConfigs
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
                                  ? `tw_live_token_7a9f41b2e8c0${cfg.valueLast4}`
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
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Rotate Key</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Non-Secret Parameters (account_sid, sender_phone, sms_log_only) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Twilio Account Parameters & E.164 Sender Phone</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stored as plaintext in <code className="text-slate-600">valuePlain</code> with <code className="text-slate-600">isSecret = false</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">
                      account_sid (Twilio Account SID)
                    </label>
                    <input
                      type="text"
                      defaultValue={twilioConfigs.find((c) => c.key === 'account_sid')?.valuePlain || ''}
                      onBlur={(e) => {
                        const cur = twilioConfigs.find((c) => c.key === 'account_sid')?.valuePlain;
                        if (e.target.value !== cur) {
                          handleUpdatePlainConfig('twilio', 'account_sid', e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      Database field: <code className="text-slate-600">admin_configs.valuePlain</code>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">
                      sender_phone (Outbound Caller/SMS Number E.164)
                    </label>
                    <input
                      type="text"
                      defaultValue={twilioConfigs.find((c) => c.key === 'sender_phone')?.valuePlain || ''}
                      onBlur={(e) => {
                        const cur = twilioConfigs.find((c) => c.key === 'sender_phone')?.valuePlain;
                        if (e.target.value !== cur) {
                          handleUpdatePlainConfig('twilio', 'sender_phone', e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      Must match a verified Twilio carrier caller ID.
                    </span>
                  </div>
                </div>

                {/* sms_log_only Toggle */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Mock Mode (sms_log_only)</span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, verification codes & SMS notifications are written to server logs only without triggering paid cellular carrier dispatches.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdatePlainConfig('twilio', 'sms_log_only', 'false')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        twilioConfigs.find((c) => c.key === 'sms_log_only')?.valuePlain === 'false'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ● Live Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePlainConfig('twilio', 'sms_log_only', 'true')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        twilioConfigs.find((c) => c.key === 'sms_log_only')?.valuePlain === 'true'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ● Log Only (Mock)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE (FCM) CONFIGURATION (admin_configs group = 'firebase') */}
          {configSubTab === 'firebase' && (
            <div className="space-y-6">
              {/* Security Storage Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      <span>Firebase Cloud Messaging: AES-256-GCM Encrypted RSA Private Key</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                        group = 'firebase'
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Service account RSA private key is encrypted in <code className="text-amber-300 font-mono">valueEncrypted</code> using AES-256-GCM with IV and tag. Project ID and client email are stored in <code className="text-amber-300 font-mono">valuePlain</code> for Google OAuth2 token signing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400">Environment:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>fcm-v1-oauth2</span>
                  </span>
                </div>
              </div>

              {/* Secret Keys Cards (private_key) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Encrypted Service Account RSA Private Key</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stored with <code className="text-slate-600">isSecret = true</code> in the <code className="text-slate-600">admin_configs</code> table.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {firebaseConfigs
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
                                  ? `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...${cfg.valueLast4}\n-----END PRIVATE KEY-----`
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
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                              <span>Rotate Key</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Non-Secret Parameters (project_id, client_email) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span>Firebase Service Account Credentials</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stored as plaintext in <code className="text-slate-600">valuePlain</code> with <code className="text-slate-600">isSecret = false</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">
                      project_id (Google Cloud Project Identifier)
                    </label>
                    <input
                      type="text"
                      defaultValue={firebaseConfigs.find((c) => c.key === 'project_id')?.valuePlain || ''}
                      onBlur={(e) => {
                        const cur = firebaseConfigs.find((c) => c.key === 'project_id')?.valuePlain;
                        if (e.target.value !== cur) {
                          handleUpdatePlainConfig('firebase', 'project_id', e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      Database field: <code className="text-slate-600">admin_configs.valuePlain</code>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">
                      client_email (GCP Service Account Email)
                    </label>
                    <input
                      type="text"
                      defaultValue={firebaseConfigs.find((c) => c.key === 'client_email')?.valuePlain || ''}
                      onBlur={(e) => {
                        const cur = firebaseConfigs.find((c) => c.key === 'client_email')?.valuePlain;
                        if (e.target.value !== cur) {
                          handleUpdatePlainConfig('firebase', 'client_email', e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      Service account with Firebase Cloud Messaging API Admin role.
                    </span>
                  </div>
                </div>

                {/* FCM Push Capability Info Box */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50">
                    <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-amber-600" />
                      <span>Booking Push Alerts</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Dispatched instantly to vendor mobile devices on new booking requests and payments.
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <span className="text-xs font-bold text-blue-900 block flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>KYC Verification Alerts</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Sends approval or document re-upload push alerts when super admin updates status.
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
                    <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Escrow Disbursement</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Notifies vendor immediately when payout funds are wired via NMI or ACH.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MIDDESK BUSINESS VERIFICATION / KYB (admin_configs) */}
          {configSubTab === 'middesk' && (
            <div className="space-y-6">
              {/* Security Storage Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      <span>Middesk Business Verification & KYB Variables</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                        group = 'middesk'
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Secret API key (<code className="text-indigo-300 font-mono">MIDDESK_API_KEY</code>) and webhook signing secret (<code className="text-indigo-300 font-mono">MIDDESK_WEBHOOK_SECRET</code>) are stored with <code className="text-indigo-300 font-mono">isSecret = true</code> using AES-256-GCM encryption. The endpoint base URL (<code className="text-indigo-300 font-mono">MIDDESK_BASE_URL</code>) is stored in <code className="text-indigo-300 font-mono">valuePlain</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Secret Keys Cards (api_key, webhook_secret) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      <span>Encrypted Middesk Secret Keys</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stored with <code className="text-slate-600">isSecret = true</code> in the <code className="text-slate-600">admin_configs</code> table with AES-256-GCM authenticated cipher.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {middeskConfigs
                    .filter((c) => c.isSecret)
                    .map((cfg) => {
                      const isRevealed = Boolean(revealedSecrets[cfg.key]);
                      return (
                        <div key={cfg.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {cfg.key === 'api_key' ? 'MIDDESK_API_KEY' : 'MIDDESK_WEBHOOK_SECRET'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">({cfg.key})</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">
                                AES-256-GCM
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
                                  ? cfg.key === 'api_key'
                                    ? `mddsk_sec_${cfg.valueLast4}8104294`
                                    : `whsec_${cfg.valueLast4}9182041`
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
                              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Rotate Key</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Non-Secret Parameters (MIDDESK_BASE_URL) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Middesk Base API Gateway URL (MIDDESK_BASE_URL)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stored as plaintext in <code className="text-slate-600">valuePlain</code> with <code className="text-slate-600">isSecret = false</code>.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <label className="block font-bold text-slate-700">
                    MIDDESK_BASE_URL (Target API Endpoint)
                  </label>
                  <input
                    type="text"
                    defaultValue={middeskConfigs.find((c) => c.key === 'base_url')?.valuePlain || 'https://api.middesk.com/v1'}
                    onBlur={(e) => {
                      const cur = middeskConfigs.find((c) => c.key === 'base_url')?.valuePlain;
                      if (e.target.value !== cur) {
                        handleUpdatePlainConfig('middesk', 'base_url', e.target.value);
                      }
                    }}
                    placeholder="https://api.middesk.com/v1"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    Database field: <code className="text-slate-600">admin_configs.valuePlain</code> (Key: <code className="text-slate-600">base_url</code>)
                  </span>
                </div>

                {/* Middesk KYB Verification Capabilities Card */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/50">
                    <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>SOS & Registration Verification</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Queries 50 state Secretaries of State in real time to verify legal business entity standing and good standing status.
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <span className="text-xs font-bold text-blue-900 block flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>TIN & EIN Match Checks</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Directly verifies Taxpayer Identification Numbers against IRS master file records to confirm vendor identity before W-9 clearance.
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50">
                    <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Watchlist & OFAC Screening</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 block">
                      Screens beneficial owners and businesses across international sanctions, OFAC lists, PEP, and adverse media registries.
                    </span>
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
                      <th className="py-3 px-3">GROUP</th>
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
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase border ${
                              aud.group === 'nmi'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : aud.group === 'twilio'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : aud.group === 'firebase'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {aud.group}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-OPTION 5: PLATFORM COMMISSION PERCENTAGE & LIVE SIMULATOR              */}
      {/* ========================================================================= */}
      {activeSubOption === 'commission' && (
        <div className="space-y-6">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Configuration</span>
                <span>›</span>
                <span className="text-slate-600 font-semibold">Platform Commission</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Platform Commission Percentage
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure the global marketplace fee percentage retained by UrSpot on every customer transaction, IRS Form W-9 backup withholding rules, and test calculations in real time with the live fee simulator.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Commission Rate: <strong className="font-mono text-sm">{commissionRate}%</strong>
              </span>
            </div>
          </div>

          {/* Quick Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Rate</span>
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{commissionRate}%</div>
              <p className="text-[11px] text-slate-500">Collected on each transaction</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">W-9 Tax Escrow</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">24.0%</div>
              <p className="text-[11px] text-slate-500">Statutory IRS backup withholding</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Instant Payouts</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {instantPayoutAllowed ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-[11px] text-slate-500">Verified vendor balance withdrawals</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gateway Sync</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">Live NMI</div>
              <p className="text-[11px] text-slate-500">Instant escrow & split ledger</p>
            </div>
          </div>

          {/* Success Banner */}
          {isCommissionSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-emerald-900 block">Commission Rate Saved Successfully!</strong>
                <span className="text-xs text-emerald-700">
                  New customer bookings will automatically calculate and retain {commissionRateInput}% as the UrSpot platform fee.
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {commissionErrorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-rose-900 block">Validation Error</strong>
                <span className="text-xs text-rose-700">{commissionErrorMessage}</span>
              </div>
            </div>
          )}

          {/* Two Columns: Left Configuration Form (2 cols) & Right Fee Simulator (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Configuration Card */}
            <div className="lg:col-span-2 space-y-6">
              <form
                onSubmit={handleCommissionSave}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6"
              >
                {/* Header with Icon and Title */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 text-white shadow-xs">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        Platform Commission Percentage
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set the global commission retained by UrSpot on every booking transaction.
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Active Rate: {activeCommissionRate}%
                  </span>
                </div>

                {/* Input Field with Percentage Symbol */}
                <div className="space-y-2">
                  <label
                    htmlFor="config-commission-percentage-input"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Percent className="w-4 h-4" />
                    </div>
                    <input
                      id="config-commission-percentage-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={commissionRateInput}
                      onChange={(e) => {
                        setCommissionRateInput(e.target.value);
                        if (commissionErrorMessage) setCommissionErrorMessage(null);
                      }}
                      placeholder="e.g. 10.0"
                      className="w-full pl-10 pr-14 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-2xs"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">
                        %
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter the commission percentage to collect from each transaction. For example, entering <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-bold">10</code> means 10% platform fee ($10 on a $100 service) and 90% allocated to the business owner balance.
                  </p>
                </div>

                {/* Quick Percentage Presets */}
                <div className="space-y-2 pt-1">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Presets
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[5, 7.5, 10, 12.5, 15, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleCommissionPresetClick(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          parseFloat(commissionRateInput) === preset
                            ? 'bg-slate-900 text-white shadow-xs scale-102'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* W-9 Backup Withholding & Instant Payouts Sub-Card */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Tax & Payout Rules
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">IRS Form W-9 Backup Withholding</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">24% Mandated</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Vendors without a verified W-9 certification have 24% withheld automatically to platform tax escrow per IRS compliance rules.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Instant Withdrawal Requests</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Allow verified businesses to request disbursements on balance availability.
                        </span>
                      </div>
                      <label className="inline-flex items-center cursor-pointer shrink-0 ml-3">
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
                </div>

                {/* Action Row with Save Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCommissionRateInput('10');
                      setCommissionErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Reset to Default (10%)
                  </button>

                  <button
                    id="btn-save-commission-settings"
                    type="submit"
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isCommissionSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCommissionSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Commission Rate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Column: Interactive Live Fee Simulator */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Live Fee Simulator
                  </h3>
                </div>

                <p className="text-xs text-slate-500">
                  Test how the configured percentage impacts booking fees and business owner payout in real time.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sample Booking Total ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={sampleBookingAmount}
                      onChange={(e) => setSampleBookingAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                {/* Split Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Customer Pays</span>
                    <strong className="text-slate-900 font-mono">${sampleBookingAmount.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs text-blue-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Percent className="w-3 h-3" /> Platform Fee ({activeCommissionRate}%)
                    </span>
                    <strong className="font-mono">+${calculatedPlatformFee}</strong>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Business Balance (W-9)
                    </span>
                    <strong className="font-mono text-sm font-black text-emerald-700">
                      ${calculatedVendorPayout}
                    </strong>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs text-amber-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Business (If No W-9: -24%)
                    </span>
                    <strong className="font-mono text-xs font-bold text-amber-700">
                      ${calculatedNoW9Payout}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <strong className="text-blue-900 block mb-0.5">Platform Escrow Notice:</strong>
                  UrSpot collects the customer payment via NMI Gateway and holds the total in escrow. Platform commission and business net proceeds are allocated automatically in the ledger.
                </div>
              </div>

              {/* IRS 1099-K Compliance Notice */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>IRS 1099-K Statutory Compliance</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Platforms with aggregate gross payments exceeding statutory reporting thresholds must file IRS Form 1099-K and issue copies to payees. Verified W-9 certifications are required prior to disbursement release.
                </p>
              </div>
            </div>
          </div>
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
