import React, { useState, useMemo, useRef } from 'react';
import {
  BusinessOnboardingSubmission,
  INITIAL_ONBOARDING_SUBMISSIONS,
  OrganizationRecord,
  INITIAL_ORGANIZATIONS,
  IndustryRecord,
  INITIAL_INDUSTRIES,
  IndustryCategory,
  INITIAL_INDUSTRIES_CATEGORIES,
  AssetService,
  INITIAL_SERVICES_CATALOG,
  ServiceCategoryRecord,
  INITIAL_SERVICE_CATEGORIES,
} from '../../../data/adminAssetsData';
import {
  Search,
  Eye,
  Plus,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  X,
  Building2,
  Layers,
  FileCheck2,
  Briefcase,
  Wrench,
  FolderTree,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  Activity,
  Filter,
  Image as ImageIcon,
  ArrowUpDown,
  Star,
  Check,
  Camera,
  Utensils,
  ShieldCheck,
  Coffee,
  Scissors,
  Dumbbell,
  Music,
  Heart,
  Store,
  RefreshCw,
  Calendar,
  UploadCloud,
  FileDown,
} from 'lucide-react';

export type BusinessAssetsSubTab =
  | 'onboarding'
  | 'organizations'
  | 'industries'
  | 'categories'
  | 'services'
  | 'service-categories';

export interface AdminAssetsTabProps {
  currentSubTab?: BusinessAssetsSubTab;
  onSubTabChange?: (tab: BusinessAssetsSubTab) => void;
  hideInternalNav?: boolean;
}

export const AdminAssetsTab: React.FC<AdminAssetsTabProps> = ({
  currentSubTab,
  onSubTabChange,
  hideInternalNav = false,
}) => {
  // Default opened sub-tab is 'categories' when in Super Admin categories view, or whatever is passed
  const [internalSubTab, setInternalSubTab] = useState<BusinessAssetsSubTab>('categories');
  const activeSubTab = currentSubTab !== undefined ? currentSubTab : internalSubTab;

  const setActiveSubTab = (tab: BusinessAssetsSubTab) => {
    setInternalSubTab(tab);
    onSubTabChange?.(tab);
  };

  // ==========================================
  // 1. BUSINESS ONBOARDING STATE
  // ==========================================
  const [onboardingSubmissions, setOnboardingSubmissions] = useState<BusinessOnboardingSubmission[]>(
    INITIAL_ONBOARDING_SUBMISSIONS
  );
  const [searchBusinessName, setSearchBusinessName] = useState('');
  const [statusSelect, setStatusSelect] = useState('Select...');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('Select...');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected Submission for Eye Modal
  const [inspectedSubmission, setInspectedSubmission] = useState<BusinessOnboardingSubmission | null>(null);

  const handleApplyOnboardingFilters = () => {
    setAppliedSearch(searchBusinessName);
    setAppliedStatus(statusSelect);
    setCurrentPage(1);
  };

  const handleResetOnboardingFilters = () => {
    setSearchBusinessName('');
    setStatusSelect('Select...');
    setAppliedSearch('');
    setAppliedStatus('Select...');
    setCurrentPage(1);
  };

  const filteredOnboarding = useMemo(() => {
    let list = [...onboardingSubmissions];
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (b.legalEntityName && b.legalEntityName.toLowerCase().includes(q))
      );
    }
    if (appliedStatus !== 'Select...' && appliedStatus !== 'All Statuses') {
      list = list.filter((b) => b.status.toLowerCase() === appliedStatus.toLowerCase());
    }
    return list;
  }, [onboardingSubmissions, appliedSearch, appliedStatus]);

  const paginatedOnboarding = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOnboarding.slice(start, start + rowsPerPage);
  }, [filteredOnboarding, currentPage, rowsPerPage]);

  const updateSubmissionStatus = (id: string, newStatus: 'Draft' | 'Active' | 'Inactive') => {
    setOnboardingSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (inspectedSubmission && inspectedSubmission.id === id) {
      setInspectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // ==========================================
  // 2. ORGANIZATIONS STATE
  // ==========================================
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>(INITIAL_ORGANIZATIONS);
  const [orgSearch, setOrgSearch] = useState('');
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgLegalType, setNewOrgLegalType] = useState('Limited Liability Company (LLC)');
  const [newOrgCountry, setNewOrgCountry] = useState('United States');
  const [newOrgContactName, setNewOrgContactName] = useState('');
  const [newOrgContactEmail, setNewOrgContactEmail] = useState('');

  const handleAddOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgContactEmail) return;
    const org: OrganizationRecord = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      legalType: newOrgLegalType,
      country: newOrgCountry,
      totalVenues: 1,
      contactName: newOrgContactName.trim() || 'Primary Contact',
      contactEmail: newOrgContactEmail.trim(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrganizations([org, ...organizations]);
    setIsAddOrgModalOpen(false);
    setNewOrgName('');
    setNewOrgContactName('');
    setNewOrgContactEmail('');
  };

  // ==========================================
  // 3. INDUSTRIES STATE
  // ==========================================
  const [industries, setIndustries] = useState<IndustryRecord[]>(INITIAL_INDUSTRIES);
  const [industrySearch, setIndustrySearch] = useState('');
  const [isAddIndustryModalOpen, setIsAddIndustryModalOpen] = useState(false);
  const [newIndName, setNewIndName] = useState('');
  const [newIndCode, setNewIndCode] = useState('');
  const [newIndDesc, setNewIndDesc] = useState('');

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndName) return;
    const ind: IndustryRecord = {
      id: `ind-${Date.now()}`,
      code: newIndCode.trim().toUpperCase() || `IND-${newIndName.substring(0, 4).toUpperCase()}`,
      name: newIndName.trim(),
      description: newIndDesc.trim() || 'Sector operations',
      categoryCount: 0,
      activeListings: 0,
      status: 'active',
    };
    setIndustries([...industries, ind]);
    setIsAddIndustryModalOpen(false);
    setNewIndName('');
    setNewIndCode('');
    setNewIndDesc('');
  };

  // ==========================================
  // 4. BUSINESS CATEGORIES STATE & HELPERS
  // ==========================================
  const AVAILABLE_CATEGORY_ICONS = [
    { name: 'Sparkles', label: 'Sparkles' },
    { name: 'Building2', label: 'Building' },
    { name: 'ShieldCheck', label: 'Security' },
    { name: 'Camera', label: 'Camera' },
    { name: 'Tag', label: 'Retail' },
    { name: 'Activity', label: 'Wellness' },
    { name: 'Utensils', label: 'Culinary' },
    { name: 'Layers', label: 'Storage' },
    { name: 'Briefcase', label: 'Office' },
    { name: 'Coffee', label: 'Cafe' },
    { name: 'Scissors', label: 'Salon' },
    { name: 'Dumbbell', label: 'Fitness' },
    { name: 'Music', label: 'Studio' },
    { name: 'Heart', label: 'Care' },
    { name: 'Store', label: 'Storefront' },
  ];

  const renderCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-rose-600" />;
      case 'Tag':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-sky-600" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-amber-700" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4 text-pink-600" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-red-600" />;
      case 'Music':
        return <Music className="w-4 h-4 text-violet-600" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Store':
        return <Store className="w-4 h-4 text-blue-500" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const [categories, setCategories] = useState<IndustryCategory[]>(INITIAL_INDUSTRIES_CATEGORIES);

  // Filter inputs (draft)
  const [catSearchInput, setCatSearchInput] = useState('');
  const [catIndustryFilter, setCatIndustryFilter] = useState('All Industries');
  const [catStatusFilter, setCatStatusFilter] = useState('All Status');
  const [catRecommendedFilter, setCatRecommendedFilter] = useState('All');

  // Applied filters
  const [appliedCatSearch, setAppliedCatSearch] = useState('');
  const [appliedCatIndustry, setAppliedCatIndustry] = useState('All Industries');
  const [appliedCatStatus, setAppliedCatStatus] = useState('All Status');
  const [appliedCatRecommended, setAppliedCatRecommended] = useState('All');

  // Sorting
  const [catSortOrder, setCatSortOrder] = useState<'A-Z' | 'Z-A'>('A-Z');

  // Pagination
  const [catRowsPerPage, setCatRowsPerPage] = useState<number>(10);
  const [catCurrentPage, setCatCurrentPage] = useState<number>(1);

  // Modal form state
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIndustry, setNewCatIndustry] = useState('');
  const [newCatIsRecommended, setNewCatIsRecommended] = useState(false);
  const [newCatStatus, setNewCatStatus] = useState<'Active' | 'Inactive'>('Active');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatPhotoUrl, setNewCatPhotoUrl] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const resetCategoryModal = () => {
    setEditingCatId(null);
    setNewCatName('');
    setNewCatIndustry('');
    setNewCatIsRecommended(false);
    setNewCatStatus('Active');
    setNewCatDesc('');
    setNewCatPhotoUrl('');
    setNewCatIcon('');
    setShowIconPicker(false);
  };

  const handleOpenAddCategory = () => {
    resetCategoryModal();
    setIsAddCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: IndustryCategory) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatIndustry(cat.industryGroup);
    setNewCatIsRecommended(cat.isRecommended ?? false);
    setNewCatStatus(cat.status === 'Inactive' ? 'Inactive' : 'Active');
    setNewCatDesc(cat.description || '');
    setNewCatPhotoUrl(cat.photoUrl || '');
    setNewCatIcon(cat.iconName || '');
    setShowIconPicker(false);
    setIsAddCatModalOpen(true);
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewCatPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCatId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCatId
            ? {
                ...c,
                name: newCatName.trim(),
                industryGroup: newCatIndustry || c.industryGroup,
                isRecommended: newCatIsRecommended,
                status: newCatStatus,
                description: newCatDesc.trim(),
                photoUrl: newCatPhotoUrl || c.photoUrl,
                iconName: newCatIcon || c.iconName || 'Building2',
              }
            : c
        )
      );
    } else {
      const slug = newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newCat: IndustryCategory = {
        id: `cat-${slug || Date.now()}`,
        name: newCatName.trim(),
        industryGroup: newCatIndustry || (industries[0]?.name ?? 'Flexible Office & Workspace'),
        isRecommended: newCatIsRecommended,
        status: newCatStatus,
        description: newCatDesc.trim() || 'New venue category',
        iconName: newCatIcon || 'Building2',
        photoUrl:
          newCatPhotoUrl ||
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        servicesCount: 0,
        activeListingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCategories([newCat, ...categories]);
    }

    setIsAddCatModalOpen(false);
    resetCategoryModal();
  };

  const handleApplyCatFilters = () => {
    setAppliedCatSearch(catSearchInput);
    setAppliedCatIndustry(catIndustryFilter);
    setAppliedCatStatus(catStatusFilter);
    setAppliedCatRecommended(catRecommendedFilter);
    setCatCurrentPage(1);
  };

  const handleResetCatFilters = () => {
    setCatSearchInput('');
    setCatIndustryFilter('All Industries');
    setCatStatusFilter('All Status');
    setCatRecommendedFilter('All');
    setAppliedCatSearch('');
    setAppliedCatIndustry('All Industries');
    setAppliedCatStatus('All Status');
    setAppliedCatRecommended('All');
    setCatCurrentPage(1);
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        // search
        if (appliedCatSearch.trim()) {
          const q = appliedCatSearch.toLowerCase();
          const matches =
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.industryGroup.toLowerCase().includes(q);
          if (!matches) return false;
        }
        // industry
        if (appliedCatIndustry !== 'All Industries' && c.industryGroup !== appliedCatIndustry) {
          return false;
        }
        // status
        if (appliedCatStatus !== 'All Status') {
          if (c.status !== appliedCatStatus) return false;
        }
        // recommended
        if (appliedCatRecommended === 'Recommended' && !c.isRecommended) {
          return false;
        }
        if (appliedCatRecommended === 'Not Recommended' && c.isRecommended) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (catSortOrder === 'A-Z') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [
    categories,
    appliedCatSearch,
    appliedCatIndustry,
    appliedCatStatus,
    appliedCatRecommended,
    catSortOrder,
  ]);

  const paginatedCategories = useMemo(() => {
    const start = (catCurrentPage - 1) * catRowsPerPage;
    return filteredCategories.slice(start, start + catRowsPerPage);
  }, [filteredCategories, catCurrentPage, catRowsPerPage]);

  const totalCatPages = Math.max(1, Math.ceil(filteredCategories.length / catRowsPerPage));

  // ==========================================
  // 5. SERVICES STATE & HELPERS
  // ==========================================
  const [services, setServices] = useState<AssetService[]>(INITIAL_SERVICES_CATALOG);

  // Filter inputs (draft)
  const [srvSearchInput, setSrvSearchInput] = useState('');
  const [srvCategoryFilter, setSrvCategoryFilter] = useState('All Categories');
  const [srvIndustryFilter, setSrvIndustryFilter] = useState('All Industries');
  const [srvStatusFilter, setSrvStatusFilter] = useState('All Status');

  // Applied filters
  const [appliedSrvSearch, setAppliedSrvSearch] = useState('');
  const [appliedSrvCategory, setAppliedSrvCategory] = useState('All Categories');
  const [appliedSrvIndustry, setAppliedSrvIndustry] = useState('All Industries');
  const [appliedSrvStatus, setAppliedSrvStatus] = useState('All Status');

  // Sorting
  const [srvSortOrder, setSrvSortOrder] = useState<'A-Z' | 'Z-A'>('A-Z');

  // Pagination
  const [srvRowsPerPage, setSrvRowsPerPage] = useState<number>(10);
  const [srvCurrentPage, setSrvCurrentPage] = useState<number>(1);

  // Simulated timeout toggle (can simulate the red message from the screenshot or live state)
  const [srvTimedOut, setSrvTimedOut] = useState(false);

  // Modal form state
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newServiceStatus, setNewServiceStatus] = useState<'Active' | 'Inactive'>('Active');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePhotoUrl, setNewServicePhotoUrl] = useState('');
  const servicePhotoInputRef = useRef<HTMLInputElement>(null);

  const resetServiceModal = () => {
    setEditingServiceId(null);
    setNewServiceName('');
    setNewServiceCategory('');
    setNewServiceStatus('Active');
    setNewServiceDesc('');
    setNewServicePhotoUrl('');
  };

  const handleOpenAddService = () => {
    resetServiceModal();
    setIsAddServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: AssetService) => {
    setEditingServiceId(srv.id);
    setNewServiceName(srv.name);
    setNewServiceCategory(srv.businessCategory || '');
    setNewServiceStatus(srv.status === 'Inactive' ? 'Inactive' : 'Active');
    setNewServiceDesc(srv.description || '');
    setNewServicePhotoUrl(srv.photoUrl || '');
    setIsAddServiceModalOpen(true);
  };

  const handleDeleteService = (srvId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices((prev) => prev.filter((s) => s.id !== srvId));
    }
  };

  const handleServicePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewServicePhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    // Determine parent industry from selected business category
    const matchedCategory = categories.find((c) => c.name === newServiceCategory);
    const resolvedIndustry = matchedCategory
      ? matchedCategory.industryGroup
      : industries[0]?.name || 'Health & Wellness';

    if (editingServiceId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                name: newServiceName.trim(),
                businessCategory: newServiceCategory || s.businessCategory,
                industry: resolvedIndustry,
                status: newServiceStatus,
                description: newServiceDesc.trim(),
                photoUrl: newServicePhotoUrl || s.photoUrl,
              }
            : s
        )
      );
    } else {
      const slug = newServiceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newSrv: AssetService = {
        id: `srv-${slug || Date.now()}`,
        name: newServiceName.trim(),
        businessCategory: newServiceCategory || (categories[0]?.name ?? 'Wellness Spa'),
        industry: resolvedIndustry,
        description: newServiceDesc.trim() || 'Professional service offering',
        photoUrl:
          newServicePhotoUrl ||
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80',
        status: newServiceStatus,
        billingUnit: 'Per Hour',
        standardRate: 100,
      };
      setServices([newSrv, ...services]);
    }

    setIsAddServiceModalOpen(false);
    resetServiceModal();
  };

  const handleApplySrvFilters = () => {
    setAppliedSrvSearch(srvSearchInput);
    setAppliedSrvCategory(srvCategoryFilter);
    setAppliedSrvIndustry(srvIndustryFilter);
    setAppliedSrvStatus(srvStatusFilter);
    setSrvCurrentPage(1);
    setSrvTimedOut(false);
  };

  const handleResetSrvFilters = () => {
    setSrvSearchInput('');
    setSrvCategoryFilter('All Categories');
    setSrvIndustryFilter('All Industries');
    setSrvStatusFilter('All Status');
    setAppliedSrvSearch('');
    setAppliedSrvCategory('All Categories');
    setAppliedSrvIndustry('All Industries');
    setAppliedSrvStatus('All Status');
    setSrvCurrentPage(1);
    setSrvTimedOut(false);
  };

  const filteredServices = useMemo(() => {
    if (srvTimedOut) return [];
    return services
      .filter((s) => {
        // search
        if (appliedSrvSearch.trim()) {
          const q = appliedSrvSearch.toLowerCase();
          const matches =
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            (s.businessCategory && s.businessCategory.toLowerCase().includes(q)) ||
            (s.industry && s.industry.toLowerCase().includes(q));
          if (!matches) return false;
        }
        // business category
        if (appliedSrvCategory !== 'All Categories' && s.businessCategory !== appliedSrvCategory) {
          return false;
        }
        // industry
        if (appliedSrvIndustry !== 'All Industries' && s.industry !== appliedSrvIndustry) {
          return false;
        }
        // status
        if (appliedSrvStatus !== 'All Status') {
          if (s.status !== appliedSrvStatus) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (srvSortOrder === 'A-Z') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [
    services,
    appliedSrvSearch,
    appliedSrvCategory,
    appliedSrvIndustry,
    appliedSrvStatus,
    srvSortOrder,
    srvTimedOut,
  ]);

  const paginatedServices = useMemo(() => {
    const start = (srvCurrentPage - 1) * srvRowsPerPage;
    return filteredServices.slice(start, start + srvRowsPerPage);
  }, [filteredServices, srvCurrentPage, srvRowsPerPage]);

  const totalSrvPages = Math.max(1, Math.ceil(filteredServices.length / srvRowsPerPage));

  // ==========================================
  // 6. SERVICE CATEGORIES STATE & HELPERS
  // ==========================================
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryRecord[]>(
    INITIAL_SERVICE_CATEGORIES
  );

  // Filters from Image 1:
  // STATUS (All Statuses, Active, Inactive)
  const [scatStatusFilter, setScatStatusFilter] = useState('All Statuses');
  // CREATED FROM (mm/dd/yyyy)
  const [scatCreatedFrom, setScatCreatedFrom] = useState('');
  // CREATED TO (mm/dd/yyyy)
  const [scatCreatedTo, setScatCreatedTo] = useState('');

  // Applied filter state
  const [appliedScatStatus, setAppliedScatStatus] = useState('All Statuses');
  const [appliedScatCreatedFrom, setAppliedScatCreatedFrom] = useState('');
  const [appliedScatCreatedTo, setAppliedScatCreatedTo] = useState('');

  // Skeleton loading simulation (matches the exact visual from Image 1)
  const [scatShowSkeleton, setScatShowSkeleton] = useState(false);

  // Pagination
  const [scatRowsPerPage, setScatRowsPerPage] = useState<number>(10);
  const [scatCurrentPage, setScatCurrentPage] = useState<number>(1);

  // Modal form state from Image 2
  const [isAddScatModalOpen, setIsAddScatModalOpen] = useState(false);
  const [editingScatId, setEditingScatId] = useState<string | null>(null);
  const [scatFormName, setScatFormName] = useState('');
  const [scatFormDesc, setScatFormDesc] = useState('');
  const [scatFormPhotoUrl, setScatFormPhotoUrl] = useState('');
  const [scatFormAssociations, setScatFormAssociations] = useState<string[]>([
    'Beauty',
    'Wellness',
  ]);
  const [scatFormStatus, setScatFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [scatFormIndustry, setScatFormIndustry] = useState('Health & Wellness');
  const scatPhotoInputRef = useRef<HTMLInputElement>(null);

  const AVAILABLE_ASSOCIATIONS = ['Beauty', 'Wellness', 'Fitness', 'Medical', 'Professional'];

  const resetScatModal = () => {
    setEditingScatId(null);
    setScatFormName('');
    setScatFormDesc('');
    setScatFormPhotoUrl('');
    setScatFormAssociations(['Beauty', 'Wellness']);
    setScatFormStatus('Active');
    setScatFormIndustry('Health & Wellness');
  };

  const handleOpenAddScat = () => {
    resetScatModal();
    setIsAddScatModalOpen(true);
  };

  const handleOpenEditScat = (scat: ServiceCategoryRecord) => {
    setEditingScatId(scat.id);
    setScatFormName(scat.name);
    setScatFormDesc(scat.description || '');
    setScatFormPhotoUrl(scat.photoUrl || '');
    setScatFormAssociations(
      scat.associations && scat.associations.length > 0 ? scat.associations : ['Wellness']
    );
    setScatFormStatus(scat.status);
    setScatFormIndustry(scat.industry || 'Health & Wellness');
    setIsAddScatModalOpen(true);
  };

  const toggleAssociation = (assoc: string) => {
    setScatFormAssociations((prev) =>
      prev.includes(assoc) ? prev.filter((a) => a !== assoc) : [...prev, assoc]
    );
  };

  const handleDeleteScat = (scatId: string) => {
    if (window.confirm('Are you sure you want to delete this service category?')) {
      setServiceCategories((prev) => prev.filter((s) => s.id !== scatId));
    }
  };

  const handleScatPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScatFormPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveServiceCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scatFormName.trim()) return;

    if (editingScatId) {
      setServiceCategories((prev) =>
        prev.map((sc) =>
          sc.id === editingScatId
            ? {
                ...sc,
                name: scatFormName.trim(),
                description: scatFormDesc.trim(),
                photoUrl: scatFormPhotoUrl || sc.photoUrl,
                associations: scatFormAssociations,
                status: scatFormStatus,
                industry: scatFormIndustry,
              }
            : sc
        )
      );
    } else {
      const slug = scatFormName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;

      const newRecord: ServiceCategoryRecord = {
        id: `scat-${slug || Date.now()}`,
        name: scatFormName.trim(),
        industry: scatFormIndustry,
        description: scatFormDesc.trim() || 'Service domain classification',
        servicesCount: 12,
        servicesLabel: '12 Active',
        status: scatFormStatus,
        photoUrl:
          scatFormPhotoUrl ||
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        associations: scatFormAssociations,
        linkedServices: '12 Active',
        revenueGeneration: '$42,850 (MTD)',
        createdAt: formattedDate,
      };
      setServiceCategories([newRecord, ...serviceCategories]);
    }

    setIsAddScatModalOpen(false);
    resetScatModal();
  };

  const handleApplyScatFilters = () => {
    setAppliedScatStatus(scatStatusFilter);
    setAppliedScatCreatedFrom(scatCreatedFrom);
    setAppliedScatCreatedTo(scatCreatedTo);
    setScatCurrentPage(1);
  };

  const handleResetScatFilters = () => {
    setScatStatusFilter('All Statuses');
    setScatCreatedFrom('');
    setScatCreatedTo('');
    setAppliedScatStatus('All Statuses');
    setAppliedScatCreatedFrom('');
    setAppliedScatCreatedTo('');
    setScatCurrentPage(1);
  };

  const handleExportScat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Category Name,Industry,Status,Services,Description,Created At']
        .concat(
          filteredScat.map(
            (s) =>
              `"${s.id}","${s.name}","${s.industry}","${s.status}","${s.servicesCount}","${s.description.replace(/"/g, '""')}","${s.createdAt}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `service_categories_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredScat = useMemo(() => {
    return serviceCategories.filter((sc) => {
      // Status filter
      if (appliedScatStatus !== 'All Statuses') {
        if (sc.status.toLowerCase() !== appliedScatStatus.toLowerCase()) return false;
      }
      // Date from filter
      if (appliedScatCreatedFrom) {
        const fromDate = new Date(appliedScatCreatedFrom);
        const itemDate = new Date(sc.createdAt);
        if (!isNaN(fromDate.getTime()) && !isNaN(itemDate.getTime())) {
          if (itemDate < fromDate) return false;
        }
      }
      // Date to filter
      if (appliedScatCreatedTo) {
        const toDate = new Date(appliedScatCreatedTo);
        const itemDate = new Date(sc.createdAt);
        if (!isNaN(toDate.getTime()) && !isNaN(itemDate.getTime())) {
          if (itemDate > toDate) return false;
        }
      }
      return true;
    });
  }, [serviceCategories, appliedScatStatus, appliedScatCreatedFrom, appliedScatCreatedTo]);

  const paginatedScat = useMemo(() => {
    const start = (scatCurrentPage - 1) * scatRowsPerPage;
    return filteredScat.slice(start, start + scatRowsPerPage);
  }, [filteredScat, scatCurrentPage, scatRowsPerPage]);

  const totalScatPages = Math.max(1, Math.ceil(filteredScat.length / scatRowsPerPage));

  return (
    <div id="admin-business-assets" className="space-y-6 animate-in fade-in duration-150">
      {/* 6 Sub-Navigation Tabs */}
      {!hideInternalNav && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
          {/* 1. Business Onboarding */}
          <button
            id="subtab-business-onboarding-btn"
            onClick={() => setActiveSubTab('onboarding')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'onboarding'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>Business Onboarding</span>
          </button>

          {/* 2. Organizations */}
          <button
            id="subtab-organizations-btn"
            onClick={() => setActiveSubTab('organizations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'organizations'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Organizations</span>
          </button>

          {/* 3. Industries */}
          <button
            id="subtab-industries-btn"
            onClick={() => setActiveSubTab('industries')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'industries'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Industries</span>
          </button>

          {/* 4. Business Categories */}
          <button
            id="subtab-business-categories-btn"
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Business Categories</span>
          </button>

          {/* 5. Services */}
          <button
            id="subtab-services-btn"
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'services'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Services</span>
          </button>

          {/* 6. Service Categories */}
          <button
            id="subtab-service-categories-btn"
            onClick={() => setActiveSubTab('service-categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'service-categories'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-rose-600" />
            <span>Service Categories</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BUSINESS ONBOARDING (EXACTLY MATCHING USER'S SCREENSHOT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'onboarding' && (
        <div id="business-onboarding-container" className="space-y-6">
          {/* Breadcrumb & Header */}
          <div>
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <span>Business Assets</span>
              <span>›</span>
              <span>Onboarding</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Business Onboarding
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review and approve pending business KYC submissions.
            </p>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search business name */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search business name..."
                  value={searchBusinessName}
                  onChange={(e) => setSearchBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Status Select dropdown */}
              <div className="relative">
                <select
                  value={statusSelect}
                  onChange={(e) => setStatusSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Select...">Select...</option>
                  <option value="All Statuses">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Buttons: Apply Filters & Reset */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleApplyOnboardingFilters}
                className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetOnboardingFilters}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Business Onboarding Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5">ID</th>
                    <th className="py-3.5 px-4">BUSINESS NAME</th>
                    <th className="py-3.5 px-4">OWNER</th>
                    <th className="py-3.5 px-4">SUBMITTED</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-5 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOnboarding.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No onboarding submissions found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedOnboarding.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* ID (Truncated with ellipsis) */}
                        <td className="py-4 px-5 font-mono text-slate-400 text-xs font-medium">
                          {item.id.substring(0, 8)}...
                        </td>

                        {/* BUSINESS NAME */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 text-xs block">
                            {item.businessName}
                          </span>
                        </td>

                        {/* OWNER */}
                        <td className="py-4 px-4 text-slate-400 font-mono">
                          {item.owner || '—'}
                        </td>

                        {/* SUBMITTED */}
                        <td className="py-4 px-4 text-slate-600 text-xs">
                          {item.submitted}
                        </td>

                        {/* STATUS (Pill with dot indicator) */}
                        <td className="py-4 px-4">
                          {item.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </span>
                          ) : item.status === 'Draft' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Draft</span>
                            </span>
                          ) : item.status === 'Inactive' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Inactive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>{item.status}</span>
                            </span>
                          )}
                        </td>

                        {/* ACTIONS (Eye Icon) */}
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => setInspectedSubmission(item)}
                            title="View KYC Submission"
                            className="text-slate-400 hover:text-slate-800 transition-colors p-1 cursor-pointer inline-flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Rows per page & Pagination */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 pr-6 bg-white text-xs text-slate-800 font-medium appearance-none cursor-pointer focus:outline-hidden"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>
                <span className="ml-2">
                  Showing 1–{paginatedOnboarding.length} of {filteredOnboarding.length} businesses
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    currentPage === 1
                      ? 'bg-black text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  1
                </button>
                <button
                  disabled={currentPage >= Math.ceil(filteredOnboarding.length / rowsPerPage)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Submission Inspection Modal (Eye click) */}
          {inspectedSubmission && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-150">
                <button
                  onClick={() => setInspectedSubmission(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {inspectedSubmission.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {inspectedSubmission.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-700 border-y border-slate-100 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Legal Entity Name
                      </span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">
                        {inspectedSubmission.legalEntityName || 'Pending Registration'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        EIN / Tax ID
                      </span>
                      <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                        {inspectedSubmission.einTin || 'Not Provided'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Submission Date
                      </span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {inspectedSubmission.submitted}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Jurisdiction
                      </span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {inspectedSubmission.city}, {inspectedSubmission.country}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Category
                    </span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {inspectedSubmission.category || 'Commercial Venue'}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Compliance Notes
                    </span>
                    <p className="text-slate-600 text-xs">
                      {inspectedSubmission.notes || 'No compliance flags on file.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Change Onboarding Status
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSubmissionStatus(inspectedSubmission.id, 'Active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          inspectedSubmission.status === 'Active'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        Set Active (Approve)
                      </button>
                      <button
                        onClick={() => updateSubmissionStatus(inspectedSubmission.id, 'Draft')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          inspectedSubmission.status === 'Draft'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Set Draft
                      </button>
                      <button
                        onClick={() => updateSubmissionStatus(inspectedSubmission.id, 'Inactive')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          inspectedSubmission.status === 'Inactive'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        Set Inactive
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setInspectedSubmission(null)}
                    className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORGANIZATIONS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'organizations' && (
        <div id="organizations-view-container" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                <span>Business Assets</span>
                <span>›</span>
                <span>Organizations</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Organizations</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage commercial parent companies, enterprise operators, and portfolio holdings.
              </p>
            </div>
            <button
              onClick={() => setIsAddOrgModalOpen(true)}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Organization</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Organization</th>
                  <th className="py-3.5 px-4">Structure</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4 text-center">Venues</th>
                  <th className="py-3.5 px-4">Primary Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations
                  .filter((o) => o.name.toLowerCase().includes(orgSearch.toLowerCase()))
                  .map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{org.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{org.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{org.legalType}</td>
                      <td className="py-3.5 px-4 text-slate-700">{org.country}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">{org.totalVenues}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-medium text-slate-800 block">{org.contactName}</span>
                          <span className="text-[11px] text-slate-400 block">{org.contactEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="capitalize">{org.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Organization Modal */}
          {isAddOrgModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setIsAddOrgModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-900 mb-1">Add New Organization</h3>
                <p className="text-xs text-slate-500 mb-4">Register an enterprise landlord or multi-space group</p>
                <form onSubmit={handleAddOrg} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MetroSpace Holdings"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Entity Structure</label>
                    <select
                      value={newOrgLegalType}
                      onChange={(e) => setNewOrgLegalType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                      <option value="C-Corporation">C-Corporation</option>
                      <option value="Private Limited Company (Ltd)">Private Limited Company (Ltd)</option>
                      <option value="Limited Partnership (LP)">Limited Partnership (LP)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newOrgContactName}
                        onChange={(e) => setNewOrgContactName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        required
                        placeholder="john@metrospace.com"
                        value={newOrgContactEmail}
                        onChange={(e) => setNewOrgContactEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddOrgModalOpen(false)}
                      className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Create Organization
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INDUSTRIES TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'industries' && (
        <div id="industries-view-container" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                <span>Business Assets</span>
                <span>›</span>
                <span>Industries</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Industries</h1>
              <p className="text-xs text-slate-500 mt-1">
                Define macro market sectors across which commercial venue categories are grouped.
              </p>
            </div>
            <button
              onClick={() => setIsAddIndustryModalOpen(true)}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Industry</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search industries..."
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-4">Industry Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Categories</th>
                  <th className="py-3.5 px-4 text-center">Listings</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {industries
                  .filter(
                    (i) =>
                      i.name.toLowerCase().includes(industrySearch.toLowerCase()) ||
                      i.code.toLowerCase().includes(industrySearch.toLowerCase())
                  )
                  .map((ind) => (
                    <tr key={ind.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-indigo-600 font-bold">{ind.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ind.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{ind.description}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{ind.categoryCount}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{ind.activeListings}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="capitalize">{ind.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Industry Modal */}
          {isAddIndustryModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setIsAddIndustryModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-900 mb-1">Add New Industry</h3>
                <p className="text-xs text-slate-500 mb-4">Create a global industry sector code</p>
                <form onSubmit={handleAddIndustry} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Industry Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Life Sciences & Bio Labs"
                      value={newIndName}
                      onChange={(e) => setNewIndName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Industry Code</label>
                    <input
                      type="text"
                      placeholder="e.g. IND-BIOLAB"
                      value={newIndCode}
                      onChange={(e) => setNewIndCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Short sector description..."
                      value={newIndDesc}
                      onChange={(e) => setNewIndDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddIndustryModalOpen(false)}
                      className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Save Industry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BUSINESS CATEGORIES TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div id="categories-view-container" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Business Assets</span>
                <span>›</span>
                <span className="text-slate-600">Categories</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Business Categories</h1>
              <p className="text-xs text-slate-500 mt-1">
                Organize businesses into categories and highlight recommended ones.
              </p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Categories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search Categories
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Name, ID, Description..."
                    value={catSearchInput}
                    onChange={(e) => setCatSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyCatFilters();
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Industry</label>
                <div className="relative">
                  <select
                    value={catIndustryFilter}
                    onChange={(e) => setCatIndustryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Industries">All Industries</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={catStatusFilter}
                    onChange={(e) => setCatStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Recommended */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Recommended
                </label>
                <div className="relative">
                  <select
                    value={catRecommendedFilter}
                    onChange={(e) => setCatRecommendedFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Not Recommended">Not Recommended</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filter action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyCatFilters}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetCatFilters}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setCatSortOrder((prev) => (prev === 'A-Z' ? 'Z-A' : 'A-Z'))}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sort: {catSortOrder}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categories Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-10 text-center">#</th>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">NAME</th>
                    <th className="py-3.5 px-4">INDUSTRY</th>
                    <th className="py-3.5 px-4">DESCRIPTION</th>
                    <th className="py-3.5 px-3 text-center">ICON</th>
                    <th className="py-3.5 px-3 text-center">PHOTO</th>
                    <th className="py-3.5 px-4 text-center">RECOMMENDED</th>
                    <th className="py-3.5 px-4 text-center">SERVICES</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((cat, idx) => {
                      const absoluteIndex = (catCurrentPage - 1) * catRowsPerPage + idx + 1;
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {absoluteIndex}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-[11px]">
                            {cat.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wide">
                              {cat.industryGroup}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={cat.description}>
                            {cat.description || '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mx-auto border border-slate-200/70">
                              {renderCategoryIcon(cat.iconName)}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {cat.photoUrl ? (
                              <img
                                src={cat.photoUrl}
                                alt={cat.name}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200 mx-auto shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {cat.isRecommended ? (
                              <Check className="w-5 h-5 text-emerald-600 stroke-[2.5] mx-auto" />
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                              {cat.servicesCount ?? 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {cat.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Inactive</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                title="Edit Category"
                                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                title="Delete Category"
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-slate-700 text-sm">No categories found</p>
                          <p className="text-xs text-slate-400">
                            No business categories matched your search or filters.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetCatFilters}
                            className="mt-2 text-xs font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Rows Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <div className="relative">
                  <select
                    value={catRowsPerPage}
                    onChange={(e) => {
                      setCatRowsPerPage(Number(e.target.value));
                      setCatCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 pr-6 bg-white text-xs text-slate-800 font-medium appearance-none cursor-pointer focus:outline-hidden"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>
                <span className="ml-2">
                  Showing {filteredCategories.length > 0 ? (catCurrentPage - 1) * catRowsPerPage + 1 : 0}–
                  {Math.min(catCurrentPage * catRowsPerPage, filteredCategories.length)} of{' '}
                  {filteredCategories.length} categories
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={catCurrentPage === 1}
                  onClick={() => setCatCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ‹
                </button>
                {Array.from({ length: totalCatPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCatCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer ${
                      catCurrentPage === pageNum
                        ? 'bg-black text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={catCurrentPage >= totalCatPages}
                  onClick={() => setCatCurrentPage((p) => Math.min(totalCatPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Add / Edit Category Modal (Matches Image 1) */}
          {isAddCatModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCatId ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCatModalOpen(false);
                      resetCategoryModal();
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                  {/* Category Name */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wellness Spa"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  {/* Industry with Recommended Category checkbox on the right */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-medium text-slate-700">Industry</label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newCatIsRecommended}
                          onChange={(e) => setNewCatIsRecommended(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-black focus:ring-black cursor-pointer accent-black"
                        />
                        <span className="font-medium text-slate-700">Recommended Category</span>
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={newCatIndustry}
                        onChange={(e) => setNewCatIndustry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="">Select industry</option>
                        {industries.map((ind) => (
                          <option key={ind.id} value={ind.name}>
                            {ind.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select
                        value={newCatStatus}
                        onChange={(e) => setNewCatStatus(e.target.value as 'Active' | 'Inactive')}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Short description of the category..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y transition-all"
                    />
                  </div>

                  {/* Category Photo */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Category Photo</label>
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 relative group"
                    >
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                      {newCatPhotoUrl ? (
                        <div className="relative inline-block">
                          <img
                            src={newCatPhotoUrl}
                            alt="Category preview"
                            className="w-20 h-20 object-cover rounded-xl border border-slate-200 mx-auto shadow-xs"
                          />
                          <div className="mt-2 text-xs text-slate-600 font-medium">
                            <span className="text-black font-bold underline">Click to change</span> or upload another
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewCatPhotoUrl('');
                            }}
                            className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full text-xs hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-2">
                          <div className="w-8 h-8 mx-auto mb-2 text-slate-400 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Click to upload</p>
                          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, SVG up to 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Icon */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Category Icon</label>
                    <div className="relative">
                      <div
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                      >
                        {newCatIcon ? (
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-slate-100">
                              {renderCategoryIcon(newCatIcon)}
                            </span>
                            <span className="font-semibold text-slate-900">{newCatIcon}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">No icon selected</span>
                        )}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>

                      {showIconPicker && (
                        <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-3 gap-2">
                            {AVAILABLE_CATEGORY_ICONS.map((icon) => (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => {
                                  setNewCatIcon(icon.name);
                                  setShowIconPicker(false);
                                }}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                                  newCatIcon === icon.name
                                    ? 'border-black bg-slate-50 text-black font-bold'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="shrink-0">{renderCategoryIcon(icon.name)}</span>
                                <span className="text-[11px] truncate">{icon.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddCatModalOpen(false);
                        resetCategoryModal();
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SERVICES TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'services' && (
        <div id="services-view-container" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Business Assets</span>
                <span>›</span>
                <span className="text-slate-600">Services</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Services</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage the services providers offer across business categories.
              </p>
            </div>
            <button
              onClick={handleOpenAddService}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Services */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search Services
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Name, ID, Description..."
                    value={srvSearchInput}
                    onChange={(e) => setSrvSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplySrvFilters();
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Category
                </label>
                <div className="relative">
                  <select
                    value={srvCategoryFilter}
                    onChange={(e) => setSrvCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Industry</label>
                <div className="relative">
                  <select
                    value={srvIndustryFilter}
                    onChange={(e) => setSrvIndustryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Industries">All Industries</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={srvStatusFilter}
                    onChange={(e) => setSrvStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filter action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplySrvFilters}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetSrvFilters}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                {/* Optional timeout simulation trigger for testing */}
                <button
                  type="button"
                  onClick={() => setSrvTimedOut((prev) => !prev)}
                  title="Toggle simulated timeout view"
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    srvTimedOut
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {srvTimedOut ? 'Exit Timeout Simulation' : 'Simulate Timeout'}
                </button>

                <button
                  type="button"
                  onClick={() => setSrvSortOrder((prev) => (prev === 'A-Z' ? 'Z-A' : 'A-Z'))}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sort: {srvSortOrder}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Services Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-10 text-center">#</th>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">NAME</th>
                    <th className="py-3.5 px-4">BUSINESS CATEGORY</th>
                    <th className="py-3.5 px-4">INDUSTRY</th>
                    <th className="py-3.5 px-4">DESCRIPTION</th>
                    <th className="py-3.5 px-3 text-center">PHOTO</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {srvTimedOut ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <p className="text-sm font-semibold text-rose-600 mb-1">
                          Request timed out. Please try again.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSrvTimedOut(false)}
                          className="mt-2 text-xs font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                        >
                          Retry request
                        </button>
                      </td>
                    </tr>
                  ) : paginatedServices.length > 0 ? (
                    paginatedServices.map((srv, idx) => {
                      const absoluteIndex = (srvCurrentPage - 1) * srvRowsPerPage + idx + 1;
                      return (
                        <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {absoluteIndex}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-[11px]">
                            {srv.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {srv.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px]">
                              {srv.businessCategory || '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {srv.industry || '—'}
                            </span>
                          </td>
                          <td
                            className="py-3.5 px-4 text-slate-600 max-w-xs truncate"
                            title={srv.description}
                          >
                            {srv.description || '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {srv.photoUrl ? (
                              <img
                                src={srv.photoUrl}
                                alt={srv.name}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200 mx-auto shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {srv.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Inactive</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditService(srv)}
                                title="Edit Service"
                                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(srv.id)}
                                title="Delete Service"
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-slate-700 text-sm">No services found</p>
                          <p className="text-xs text-slate-400">
                            No services matched your search or filters.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetSrvFilters}
                            className="mt-2 text-xs font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Rows Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <div className="relative">
                  <select
                    value={srvRowsPerPage}
                    onChange={(e) => {
                      setSrvRowsPerPage(Number(e.target.value));
                      setSrvCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 pr-6 bg-white text-xs text-slate-800 font-medium appearance-none cursor-pointer focus:outline-hidden"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>
                <span className="ml-2">
                  Showing{' '}
                  {srvTimedOut || filteredServices.length === 0
                    ? '0–0 of 0'
                    : `${(srvCurrentPage - 1) * srvRowsPerPage + 1}–${Math.min(
                        srvCurrentPage * srvRowsPerPage,
                        filteredServices.length
                      )} of ${filteredServices.length}`}{' '}
                  services
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={srvCurrentPage === 1 || srvTimedOut}
                  onClick={() => setSrvCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ‹
                </button>
                {Array.from({ length: totalSrvPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    disabled={srvTimedOut}
                    onClick={() => setSrvCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer ${
                      srvCurrentPage === pageNum && !srvTimedOut
                        ? 'bg-black text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={srvCurrentPage >= totalSrvPages || srvTimedOut}
                  onClick={() => setSrvCurrentPage((p) => Math.min(totalSrvPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Add / Edit Service Modal (Matches Image 2) */}
          {isAddServiceModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingServiceId ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddServiceModalOpen(false);
                      resetServiceModal();
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                  {/* Service Name */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deep Tissue Massage"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  {/* Business Category */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">
                      Business Category
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="">Select business category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select
                        value={newServiceStatus}
                        onChange={(e) =>
                          setNewServiceStatus(e.target.value as 'Active' | 'Inactive')
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Short description of the service..."
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y transition-all"
                    />
                  </div>

                  {/* Service Photo */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">Service Photo</label>
                    <div
                      onClick={() => servicePhotoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 relative group"
                    >
                      <input
                        ref={servicePhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleServicePhotoFileChange}
                        className="hidden"
                      />
                      {newServicePhotoUrl ? (
                        <div className="relative inline-block">
                          <img
                            src={newServicePhotoUrl}
                            alt="Service preview"
                            className="w-20 h-20 object-cover rounded-xl border border-slate-200 mx-auto shadow-xs"
                          />
                          <div className="mt-2 text-xs text-slate-600 font-medium">
                            <span className="text-black font-bold underline">Click to change</span>{' '}
                            or upload another
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewServicePhotoUrl('');
                            }}
                            className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full text-xs hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-2">
                          <div className="w-8 h-8 mx-auto mb-2 text-slate-400 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Click to upload</p>
                          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddServiceModalOpen(false);
                        resetServiceModal();
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SERVICE CATEGORIES TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'service-categories' && (
        <div id="service-categories-view-container" className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span>Business Assets</span>
                <span>›</span>
                <span className="text-slate-600">Cat. Requests</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Service Categories
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage service categories and their subcategories.
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleExportScat}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddScat}
                className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>
          </div>

          {/* Filter Card (Matches Image 1) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              {/* STATUS */}
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  STATUS
                </label>
                <div className="relative">
                  <select
                    value={scatStatusFilter}
                    onChange={(e) => setScatStatusFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* CREATED FROM */}
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  CREATED FROM
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={scatCreatedFrom}
                    onChange={(e) => setScatCreatedFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* CREATED TO */}
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  CREATED TO
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={scatCreatedTo}
                    onChange={(e) => setScatCreatedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Filter Results & Quick Actions */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyScatFilters}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Filter Results
                </button>
                <button
                  type="button"
                  onClick={handleResetScatFilters}
                  title="Reset filters"
                  className="bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScatShowSkeleton((prev) => !prev)}
                  title="Toggle skeleton loader preview"
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    scatShowSkeleton
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {scatShowSkeleton ? 'Live Data' : 'Skeleton'}
                </button>
              </div>
            </div>
          </div>

          {/* Table Card (Matches Image 1) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-4 w-12 text-center text-slate-400">#</th>
                    <th className="py-4 px-4 font-bold text-slate-600">CATEGORY NAME</th>
                    <th className="py-4 px-4 font-bold text-slate-600">INDUSTRY</th>
                    <th className="py-4 px-4 font-bold text-slate-600">STATUS</th>
                    <th className="py-4 px-4 font-bold text-slate-600">SERVICES</th>
                    <th className="py-4 px-4 font-bold text-slate-600">DESCRIPTION</th>
                    <th className="py-4 px-4 text-right font-bold text-slate-600">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scatShowSkeleton ? (
                    /* Exact skeleton loader rows matching Image 1 */
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="py-4 px-4 text-center">
                          <div className="h-3.5 w-6 bg-slate-200/80 rounded-md mx-auto"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div
                            className="h-3.5 bg-slate-200/80 rounded-md"
                            style={{ width: `${60 + (i % 4) * 20}px` }}
                          ></div>
                        </td>
                        <td className="py-4 px-4">
                          <div
                            className="h-3.5 bg-slate-200/80 rounded-md"
                            style={{ width: `${80 + (i % 3) * 25}px` }}
                          ></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-3.5 w-16 bg-slate-200/80 rounded-md"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div
                            className="h-3.5 bg-slate-200/80 rounded-md"
                            style={{ width: `${70 + (i % 2) * 35}px` }}
                          ></div>
                        </td>
                        <td className="py-4 px-4">
                          <div
                            className="h-3.5 bg-slate-200/80 rounded-md"
                            style={{ width: `${90 + (i % 5) * 30}px` }}
                          ></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-3.5 w-14 bg-slate-200/80 rounded-md ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedScat.length > 0 ? (
                    paginatedScat.map((scat, idx) => {
                      const absoluteIndex = (scatCurrentPage - 1) * scatRowsPerPage + idx + 1;
                      return (
                        <tr key={scat.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 text-center font-bold text-slate-400">
                            {absoluteIndex}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {scat.photoUrl && (
                                <img
                                  src={scat.photoUrl}
                                  alt={scat.name}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                />
                              )}
                              <span>{scat.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {scat.industry || 'Health & Wellness'}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {scat.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Inactive</span>
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px]">
                              {scat.servicesLabel || `${scat.servicesCount} Active`}
                            </span>
                          </td>
                          <td
                            className="py-4 px-4 text-slate-600 max-w-sm truncate"
                            title={scat.description}
                          >
                            {scat.description}
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditScat(scat)}
                                title="Edit Category"
                                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteScat(scat.id)}
                                title="Delete Category"
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-slate-700 text-sm">
                            No service categories found
                          </p>
                          <p className="text-xs text-slate-400">
                            No categories matched your status or date filters.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetScatFilters}
                            className="mt-2 text-xs font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Custom horizontal slider bar as shown in Image 1 */}
            <div className="px-4 py-1.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold tracking-widest">‹</span>
              <div className="w-full max-w-4xl mx-3 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-1/3 rounded-full"></div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest">›</span>
            </div>

            {/* Table Footer with exact pagination from Image 1 */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                Showing{' '}
                {scatShowSkeleton ? (
                  <span className="font-bold text-slate-700">0–0 of 0</span>
                ) : filteredScat.length === 0 ? (
                  '0–0 of 0'
                ) : (
                  <>
                    <span className="font-bold text-slate-700">
                      {(scatCurrentPage - 1) * scatRowsPerPage + 1}–
                      {Math.min(scatCurrentPage * scatRowsPerPage, filteredScat.length)}
                    </span>{' '}
                    of <span className="font-bold text-slate-700">{filteredScat.length}</span>
                  </>
                )}{' '}
                categories
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={scatCurrentPage === 1 || scatShowSkeleton}
                  onClick={() => setScatCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer text-xs"
                >
                  ‹
                </button>
                {Array.from({ length: totalScatPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    disabled={scatShowSkeleton}
                    onClick={() => setScatCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer ${
                      scatCurrentPage === pageNum && !scatShowSkeleton
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={scatCurrentPage >= totalScatPages || scatShowSkeleton}
                  onClick={() => setScatCurrentPage((p) => Math.min(totalScatPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer text-xs"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* New / Edit Service Category Pop-up Modal (Matches Image 2) */}
          {isAddScatModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-7 relative animate-in zoom-in-95 duration-150 my-auto">
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingScatId ? 'Edit Service Category' : 'New Service Category'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {editingScatId
                        ? 'Update service category configuration'
                        : 'Create a new service category'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddScatModalOpen(false);
                      resetScatModal();
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveServiceCategory} className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                      {/* CATEGORY NAME */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          CATEGORY NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={scatFormName}
                          onChange={(e) => setScatFormName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                      </div>

                      {/* DESCRIPTION */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          DESCRIPTION
                        </label>
                        <textarea
                          rows={4}
                          value={scatFormDesc}
                          onChange={(e) => setScatFormDesc(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y transition-all"
                        />
                      </div>

                      {/* FEATURED PHOTO */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          FEATURED PHOTO
                        </label>
                        <div
                          onClick={() => scatPhotoInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-slate-50/60 relative group"
                        >
                          <input
                            ref={scatPhotoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleScatPhotoFileChange}
                            className="hidden"
                          />
                          {scatFormPhotoUrl ? (
                            <div className="relative inline-block">
                              <img
                                src={scatFormPhotoUrl}
                                alt="Category preview"
                                className="w-24 h-24 object-cover rounded-xl border border-slate-200 mx-auto shadow-xs"
                              />
                              <div className="mt-2 text-xs text-slate-600 font-medium">
                                <span className="text-black font-bold underline">
                                  Click to change
                                </span>{' '}
                                or replace
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScatFormPhotoUrl('');
                                }}
                                className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full text-xs hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-2">
                              <UploadCloud className="w-8 h-8 text-slate-400 stroke-[1.5] mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-800">
                                Drag & drop or browse
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                JPG, PNG, WEBP · Max 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                      {/* Business Category Association Box */}
                      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-900 mb-3">
                          Business Category Association
                        </h4>
                        <div className="space-y-2.5">
                          {AVAILABLE_ASSOCIATIONS.map((assoc) => {
                            const isChecked = scatFormAssociations.includes(assoc);
                            return (
                              <label
                                key={assoc}
                                className="flex items-center gap-2.5 cursor-pointer select-none group"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAssociation(assoc)}
                                  className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black focus:ring-offset-0 cursor-pointer accent-black"
                                />
                                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                  {assoc}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-slate-400 italic mt-4 leading-relaxed">
                          Note: These associations dictate which business types can offer this
                          service category.
                        </p>
                      </div>

                      {/* USAGE ANALYTICS Dark Card */}
                      <div className="bg-[#141416] rounded-2xl p-4.5 text-white space-y-3 shadow-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          USAGE ANALYTICS
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-300">Linked Services</span>
                          <span className="font-bold text-white text-sm">12 Active</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Revenue Generation</span>
                          <span className="font-bold text-white text-sm">$42,850 (MTD)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer (Matches Image 2) */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddScatModalOpen(false);
                        resetScatModal();
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
