import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  MapPin,
  Calendar,
  X,
  CreditCard,
  UserCheck,
  FileCheck2,
  Sparkles,
  RefreshCw,
  Plus,
  Check,
  AlertTriangle,
  History,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import {
  ManagedBusinessRecord,
  INITIAL_MANAGED_BUSINESSES,
} from '../../../data/businessManagementData';

type BusinessSubTab = 'all' | 'kyc-requests' | 'approved' | 'non-subscription';
type ViewMode = 'table' | 'card';

export interface AdminBusinessManagementTabProps {
  initialSubTab?: BusinessSubTab;
}

export const AdminBusinessManagementTab: React.FC<AdminBusinessManagementTabProps> = ({
  initialSubTab,
}) => {
  const {
    state: demoState,
    adminApproveBusiness,
    adminRejectBusiness,
    updateCoreDetails,
    saveVendorBusiness,
    deleteBusinessById,
  } = useDemo();

  // Active Sub-Option: 'All Businesses' | 'KYC Requests' | 'Approved' | 'Non-Subscription'
  const [activeSubTab, setActiveSubTab] = useState<BusinessSubTab>(initialSubTab || 'all');

  // View Mode: 'table' | 'card'
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Dynamic synchronized businesses from DemoContext, merged with initial catalog
  const businesses = useMemo<ManagedBusinessRecord[]>(() => {
    // 1. Convert DemoContext businesses
    const mappedDemo: ManagedBusinessRecord[] = demoState.businesses.map((b) => {
      const isApproved = b.status === 'KYC Approved' || b.status === 'Live';
      const isRejected = b.status === 'KYC Rejected';
      const isPending = b.status === 'Pending KYC Review' || (!isApproved && !isRejected && Boolean(b.verification?.kycSubmitted));

      let subTab: BusinessSubTab = 'non-subscription';
      if (isApproved) {
        subTab = 'approved';
      } else if (isPending || isRejected) {
        subTab = 'kyc-requests';
      } else if (b.subTab === 'kyc-requests' || b.subTab === 'approved' || b.subTab === 'non-subscription') {
        subTab = b.subTab as BusinessSubTab;
      }

      let statusDisplay: 'Active' | 'Inactive' | 'Pending Review' | 'Setup Pending' | 'KYC Rejected' = 'Active';
      if (isRejected) {
        statusDisplay = 'KYC Rejected';
      } else if (isPending) {
        statusDisplay = 'Pending Review';
      } else if (isApproved) {
        statusDisplay = 'Active';
      } else if (b.status === 'Draft' || b.status === 'Pending Payment') {
        statusDisplay = 'Setup Pending';
      }

      return {
        id: b.id,
        name: b.coreDetails.businessName || 'Untitled Business',
        legalEntity: b.coreDetails.legalEntityName || b.verification.beneficialOwner.fullName || 'Business Entity LLC',
        category: b.coreDetails.category || 'Coworking & Office',
        status: statusDisplay,
        subTab,
        subscription: b.payment.planSelected ? (b.payment.planSelected as any) : null,
        location: `${b.coreDetails.city || 'San Francisco'}, ${b.coreDetails.state || 'CA'}`,
        city: b.coreDetails.city || 'San Francisco',
        state: b.coreDetails.state || 'CA',
        country: 'United States',
        date: b.date || 'Sep 2026',
        description: b.coreDetails.description || '',
        ein: b.verification.einVerification.einEntered || '12-3456789',
        tinType: b.verification.tinType || b.verification.einVerification.tinType || 'EIN',
        tinMasked: b.verification.tinMasked || (b.verification.einVerification.einEntered ? `**-*****${b.verification.einVerification.einEntered.replace(/\D/g, '').slice(-4) || '6789'}` : '**-*****6789'),
        entityType: b.verification.legalEntityType || 'Limited Liability Company (LLC)',
        federalTaxClassification: b.verification.federalTaxClassification,
        tinMatchStatus: b.verification.einVerification.tinMatchStatus === 'Matched' || b.verification.einVerification.tinMatchStatus === 'match' ? 'Matched' : b.verification.einVerification.tinMatchStatus === 'Mismatch' || b.verification.einVerification.tinMatchStatus === 'mismatch' ? 'Mismatch' : b.verification.einVerification.tinMatchStatus === 'unavailable' || b.verification.einVerification.tinMatchStatus === 'error' ? 'Error' : 'Pending',
        tinVerificationStatus: (b.verification.einVerification.tinMatchStatus === 'Matched' ? 'match' : (b.verification.einVerification.tinMatchStatus as any) || 'pending'),
        sanctionsStatus: b.verification.sanctionsScreening?.status || 'Clear',
        riskLevel: b.verification.riskTier || 'Low',
        stateRegistryStatus: b.verification.entityRegistration?.stateRegistryStatus || 'Active/Good Standing',
        stateRegistryFile: b.verification.entityRegistration.fileName || 'SOS_Filing.pdf',
        beneficialOwner: {
          fullName: b.verification.beneficialOwner.fullName || 'Primary Officer',
          dob: b.verification.beneficialOwner.dateOfBirth || '1988-06-14',
          ssnLast4: b.verification.beneficialOwner.ssnLast4 || '4821',
          verified: Boolean(b.verification.beneficialOwner.govIdUploaded),
        },
        bankAccount: {
          accountHolder: b.verification.bankAccount.accountHolderName || b.coreDetails.businessName,
          routingNumber: b.verification.bankAccount.routingNumber || '121000358',
          accountMasked: b.verification.bankAccount.accountNumberMasked || '•••• 9104',
          verified: Boolean(b.verification.bankAccount.verified),
        },
        rejectionCount: b.rejectionCount ?? b.verification.rejectionCount ?? 0,
        rejectionHistory: b.rejectionHistory ?? b.verification.rejectionHistory ?? [],
        rejectionReason: b.verification.rejectionReason ?? null,
        resubmittedAt: b.resubmittedAt ?? b.verification.resubmittedAt ?? null,
        kycSubmitted: Boolean(b.verification.kycSubmitted || isPending),
      };
    });

    // Return only synchronized businesses from demoState.businesses (user-added + 1-2 editable dummy businesses)
    return mappedDemo;
  }, [demoState.businesses]);

  // Filter input states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stateFilter, setStateFilter] = useState('All States');
  const [cityFilter, setCityFilter] = useState('All Cities');

  // Applied filter values (applied when user clicks "Apply Filters")
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('All Categories');
  const [appliedState, setAppliedState] = useState('All States');
  const [appliedCity, setAppliedCity] = useState('All Cities');

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Review Modal state
  const [reviewBusiness, setReviewBusiness] = useState<ManagedBusinessRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Success Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive unique categories, states, and cities for the dropdowns
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [businesses]);

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => {
      if (b.state) set.add(b.state);
    });
    return Array.from(set).sort();
  }, [businesses]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => {
      if (b.city) set.add(b.city);
    });
    return Array.from(set).sort();
  }, [businesses]);

  // Counts for tabs
  const kycCount = useMemo(
    () => businesses.filter((b) => b.subTab === 'kyc-requests').length,
    [businesses]
  );
  const approvedCount = useMemo(
    () => businesses.filter((b) => b.subTab === 'approved').length,
    [businesses]
  );
  const nonSubCount = useMemo(
    () => businesses.filter((b) => b.subTab === 'non-subscription').length,
    [businesses]
  );

  // Filter records belonging to the active sub-tab
  const currentSubTabBusinesses = useMemo(() => {
    if (activeSubTab === 'all') return businesses;
    return businesses.filter((b) => b.subTab === activeSubTab);
  }, [businesses, activeSubTab]);

  // Apply filters to current sub-tab list
  const filteredBusinesses = useMemo(() => {
    return currentSubTabBusinesses.filter((b) => {
      // Search filter
      if (appliedSearch.trim()) {
        const query = appliedSearch.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesLegal = b.legalEntity.toLowerCase().includes(query);
        if (!matchesName && !matchesLegal) return false;
      }

      // Category filter
      if (appliedCategory !== 'All Categories' && b.category !== appliedCategory) {
        return false;
      }

      // State filter
      if (appliedState !== 'All States' && b.state !== appliedState) {
        return false;
      }

      // City filter
      if (appliedCity !== 'All Cities' && b.city !== appliedCity) {
        return false;
      }

      return true;
    });
  }, [currentSubTabBusinesses, appliedSearch, appliedCategory, appliedState, appliedCity]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / rowsPerPage));
  const paginatedBusinesses = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredBusinesses.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredBusinesses, currentPage, rowsPerPage]);

  const startRecordNum = filteredBusinesses.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecordNum = Math.min(currentPage * rowsPerPage, filteredBusinesses.length);

  // Filter Actions
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategory(categoryFilter);
    setAppliedState(stateFilter);
    setAppliedCity(cityFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All Categories');
    setStateFilter('All States');
    setCityFilter('All Cities');
    setAppliedSearch('');
    setAppliedCategory('All Categories');
    setAppliedState('All States');
    setAppliedCity('All Cities');
    setCurrentPage(1);
  };

  // Open Review Modal for a business
  const handleOpenReview = (biz: ManagedBusinessRecord) => {
    setReviewBusiness({ ...biz });
    setShowRejectInput(false);
    setRejectReason('');
    setIsReviewModalOpen(true);
  };

  // Actions within the Review Modal
  const handleApproveKyc = () => {
    if (!reviewBusiness) return;
    adminApproveBusiness(reviewBusiness.id);
    setReviewBusiness((prev) =>
      prev
        ? {
            ...prev,
            subTab: 'approved',
            status: 'Active',
            subscription: 'Professional',
            tinMatchStatus: 'Matched',
          }
        : null
    );
    setIsReviewModalOpen(false);
    showToast(`KYC Approved! "${reviewBusiness.name}" verified & moved to Approved.`);
  };

  const handleRejectKyc = () => {
    if (!reviewBusiness) return;
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason for the vendor.');
      return;
    }
    const finalReason = rejectReason.trim();
    adminRejectBusiness(reviewBusiness.id, finalReason);
    setReviewBusiness((prev) =>
      prev
        ? {
            ...prev,
            status: 'KYC Rejected',
            rejectionCount: (prev.rejectionCount || 0) + 1,
            rejectionReason: finalReason,
            rejectionHistory: [
              ...(prev.rejectionHistory || []),
              {
                date:
                  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                  ' at ' +
                  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reason: finalReason,
                rejectedBy: 'Super Admin',
              },
            ],
          }
        : null
    );
    setShowRejectInput(false);
    setRejectReason('');
    setIsReviewModalOpen(false);
    showToast(`KYC Application rejected for "${reviewBusiness.name}". Notification sent with explanation to business user.`);
  };

  const handleToggleStatus = () => {
    if (!reviewBusiness) return;
    const newStatus = reviewBusiness.status === 'Active' ? 'Inactive' : 'Active';
    updateCoreDetails(reviewBusiness.id, {
      description: reviewBusiness.description || '',
    });
    setReviewBusiness((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    showToast(`Status updated to "${newStatus}" for ${reviewBusiness.name}.`);
  };

  const handleActivateSubscription = () => {
    if (!reviewBusiness) return;
    adminApproveBusiness(reviewBusiness.id);
    setReviewBusiness((prev) =>
      prev ? { ...prev, subTab: 'approved', status: 'Active', subscription: 'Professional' } : null
    );
    setIsReviewModalOpen(false);
    showToast(`Subscription activated! "${reviewBusiness.name}" moved to Approved.`);
  };

  // Seed sample KYC vendor for demo testing
  const handleAddSampleKyc = () => {
    const newBizId = `biz-kyc-${Date.now()}`;
    saveVendorBusiness({
      id: newBizId,
      status: 'Pending KYC Review',
      subTab: 'kyc-requests',
      date: 'Sep 2026',
      coreDetails: {
        businessName: 'Vogue Hair & Aesthetics Lounge',
        legalEntityName: 'Vogue Aesthetics Studio LLC',
        category: 'Beauty & Wellness',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        description: 'Full-service hair coloring, balayage, facial esthetics, and bridal makeup.',
      },
      verification: {
        kycSubmitted: true,
        rejectionCount: 0,
        rejectionReason: null,
        rejectionHistory: [],
        resubmittedAt: null,
        einVerification: {
          einEntered: '13-8910245',
          tinMatchStatus: 'Matched',
          verified: true,
        },
        entityRegistration: {
          sosState: 'NY',
          filingNumber: 'NY-849204',
          fileName: 'NY_SecState_Certificate.pdf',
          verified: true,
        },
        beneficialOwner: {
          fullName: 'Seraphina Vance',
          dateOfBirth: '1991-08-20',
          ssnLast4: '4491',
          govIdUploaded: true,
          selfieUploaded: true,
          idDocumentName: 'US_Passport_SVance.pdf',
        },
        bankAccount: {
          accountHolderName: 'Vogue Aesthetics Studio LLC',
          routingNumber: '021000021',
          accountNumberMasked: '•••• •••• 7182',
          verified: true,
        },
      },
      payment: {
        planSelected: null,
        billingCycle: 'monthly',
        cardSaved: false,
      },
    });
    setActiveSubTab('kyc-requests');
    showToast('New vendor KYC registration submitted for review!');
  };

  return (
    <div id="admin-business-management" className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Navigation: Sub Options "All Businesses", "KYC Requests", "Approved", "Drafts & Setup" */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
        {/* 0. All Businesses */}
        <button
          id="subtab-all-btn"
          onClick={() => {
            setActiveSubTab('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'all'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>All Businesses</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {businesses.length}
          </span>
        </button>

        {/* 1. KYC Requests */}
        <button
          id="subtab-kyc-requests-btn"
          onClick={() => {
            setActiveSubTab('kyc-requests');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'kyc-requests'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>KYC Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              kycCount > 0
                ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {kycCount}
          </span>
        </button>

        {/* 2. Approved */}
        <button
          id="subtab-approved-btn"
          onClick={() => {
            setActiveSubTab('approved');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'approved'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Approved</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'approved'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {approvedCount}
          </span>
        </button>

        {/* 3. Drafts & Setup Pending */}
        <button
          id="subtab-non-subscription-btn"
          onClick={() => {
            setActiveSubTab('non-subscription');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'non-subscription'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Drafts & Setup Pending</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'non-subscription'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {nonSubCount}
          </span>
        </button>
      </div>

      {/* Header Area (Breadcrumbs, Title, Subtitle, and Table/Card Toggle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb matching exact design */}
          <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
            <span>Business Management</span>
            <span>›</span>
            <span className="text-slate-600 font-semibold">
              {activeSubTab === 'all'
                ? 'All Businesses'
                : activeSubTab === 'kyc-requests'
                ? 'KYC Requests'
                : activeSubTab === 'approved'
                ? 'Approved'
                : 'Drafts & Setup Pending'}
            </span>
          </div>

          {/* Heading Title */}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeSubTab === 'all'
              ? 'All Registered Businesses'
              : activeSubTab === 'kyc-requests'
              ? 'KYC Requests'
              : activeSubTab === 'approved'
              ? 'Approved'
              : 'Drafts & Setup Pending'}
          </h1>

          {/* Subtitle description */}
          <p className="text-xs text-slate-500 mt-1">
            {activeSubTab === 'all'
              ? 'Comprehensive directory of all onboarded, draft, and pending vendor businesses.'
              : activeSubTab === 'kyc-requests'
              ? 'Newly completed vendor registrations pending compliance validation and verification.'
              : activeSubTab === 'approved'
              ? 'Active and verified businesses published on the marketplace.'
              : 'Businesses in registration draft or pending setup.'}
          </p>
        </div>

        {/* View Toggle: Table / Card (Exact styling from screenshots) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeSubTab === 'kyc-requests' && kycCount === 0 && (
            <button
              onClick={handleAddSampleKyc}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulate KYC Submission</span>
            </button>
          )}

          <div
            id="view-mode-toggle"
            className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs"
          >
            <button
              id="view-toggle-table"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
            <button
              id="view-toggle-card"
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card
            </button>
          </div>
        </div>
      </div>

      {/* Filter Card (Search by business or legal name..., All Categories, All States, All Cities, Apply Filters, Reset) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="biz-search-input"
              type="text"
              placeholder="Search by business or legal name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* All Categories Dropdown */}
          <div className="relative">
            <select
              id="biz-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* All States Dropdown */}
          <div className="relative">
            <select
              id="biz-state-select"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="All States">All States</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* All Cities Dropdown */}
          <div className="relative">
            <select
              id="biz-city-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="apply-filters-btn"
            onClick={handleApplyFilters}
            className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Apply Filters
          </button>
          <button
            id="reset-filters-btn"
            onClick={handleResetFilters}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Content: Table View OR Card View */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">BUSINESS NAME</th>
                  <th className="py-3.5 px-4">LEGAL ENTITY</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4">SUBSCRIPTION</th>
                  <th className="py-3.5 px-4">LOCATION</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4 text-left">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBusinesses.length === 0 ? (
                  /* Empty state matching Image 1: "No businesses found." */
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center text-sm font-medium text-slate-400"
                    >
                      No businesses found.
                    </td>
                  </tr>
                ) : (
                  paginatedBusinesses.map((biz, idx) => {
                    const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                    return (
                      <tr
                        key={biz.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* # */}
                        <td className="py-4 px-4 text-center font-normal text-slate-500">
                          {rowNumber}
                        </td>

                        {/* BUSINESS NAME */}
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {biz.name}
                        </td>

                        {/* LEGAL ENTITY */}
                        <td className="py-4 px-4 text-slate-600 font-normal">
                          {biz.legalEntity}
                        </td>

                        {/* CATEGORY (Capsule pill) */}
                        <td className="py-4 px-4">
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded tracking-wide uppercase inline-block">
                            {biz.category}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-start gap-1">
                            {biz.status === 'Active' && (
                              <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            )}
                            {biz.status === 'Inactive' && (
                              <span className="bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Inactive
                              </span>
                            )}
                            {biz.status === 'Setup Pending' && (
                              <span className="bg-amber-50 text-amber-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Setup Pending
                              </span>
                            )}
                            {biz.status === 'Pending Review' && (
                              <span className="bg-blue-50 text-blue-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Pending Review
                              </span>
                            )}
                            {biz.status === 'KYC Rejected' && (
                              <span className="bg-rose-50 text-rose-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                KYC Rejected
                              </span>
                            )}

                            {/* Rejection count tag */}
                            {(biz.rejectionCount || 0) > 0 && (
                              <span
                                className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                                title={biz.rejectionReason || `Rejected ${biz.rejectionCount} time(s)`}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Rejected {biz.rejectionCount}x</span>
                              </span>
                            )}

                            {/* Resubmission indicator */}
                            {biz.resubmittedAt && (
                              <span
                                className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                                title={`Resubmitted on ${biz.resubmittedAt}`}
                              >
                                <RefreshCw className="w-3 h-3 text-blue-600" />
                                <span>Resubmitted</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SUBSCRIPTION */}
                        <td className="py-4 px-4">
                          {biz.subscription ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center">
                              {biz.subscription}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal text-sm">
                              —
                            </span>
                          )}
                        </td>

                        {/* LOCATION */}
                        <td className="py-4 px-4 text-slate-600 font-normal">
                          {biz.location}
                        </td>

                        {/* DATE */}
                        <td className="py-4 px-4 text-slate-500 font-normal whitespace-nowrap">
                          {biz.date}
                        </td>

                        {/* ACTION */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {biz.status !== 'Active' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adminApproveBusiness(biz.id);
                                  showToast(`Approved & Verified KYC for "${biz.name}"! Business is now Active.`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                                title="Quick Approve & Verify KYC"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenReview(biz)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors group-hover:underline"
                            >
                              <span>Review</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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

          {/* Footer with Rows per page and Pagination controls */}
          <div className="py-3.5 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            {/* Left: Rows per page and Showing count */}
            <div className="flex items-center gap-3">
              <span className="font-normal text-slate-500">Rows per page</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value={10}>Sel...</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span className="text-slate-600">
                {filteredBusinesses.length === 0
                  ? 'Showing 0 results'
                  : `Showing ${startRecordNum}–${endRecordNum} of ${filteredBusinesses.length} results`}
              </span>
            </div>

            {/* Right: Pagination */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-black text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages || filteredBusinesses.length === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="space-y-4">
          {paginatedBusinesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-16 text-center text-slate-400 font-medium text-sm">
              No businesses found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide uppercase">
                        {biz.category}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        {biz.status === 'Active' && (
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                        {biz.status === 'Inactive' && (
                          <span className="bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                        {biz.status === 'Setup Pending' && (
                          <span className="bg-amber-50 text-amber-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Setup Pending
                          </span>
                        )}
                        {biz.status === 'Pending Review' && (
                          <span className="bg-blue-50 text-blue-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Pending Review
                          </span>
                        )}
                        {biz.status === 'KYC Rejected' && (
                          <span className="bg-rose-50 text-rose-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            KYC Rejected
                          </span>
                        )}

                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {(biz.rejectionCount || 0) > 0 && (
                            <span
                              className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                              title={biz.rejectionReason || `Rejected ${biz.rejectionCount} time(s)`}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Rejected {biz.rejectionCount}x</span>
                            </span>
                          )}

                          {biz.resubmittedAt && (
                            <span
                              className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                              title={`Resubmitted on ${biz.resubmittedAt}`}
                            >
                              <RefreshCw className="w-3 h-3 text-blue-600" />
                              <span>Resubmitted</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Name & Legal Entity */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{biz.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        {biz.legalEntity}
                      </p>
                    </div>

                    {/* Key Attributes */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Subscription
                        </span>
                        {biz.subscription ? (
                          <span className="text-emerald-700 font-bold">
                            {biz.subscription}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Date
                        </span>
                        <span className="text-slate-700 font-medium">{biz.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{biz.location}</span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {biz.id}
                    </span>
                    <div className="flex items-center gap-2">
                      {biz.status !== 'Active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            adminApproveBusiness(biz.id);
                            showToast(`Approved & Verified KYC for "${biz.name}"! Business is now Active.`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                          title="Quick Approve & Verify KYC"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenReview(biz)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Card View Pagination Footer */}
          <div className="py-3 px-1 flex items-center justify-between text-xs text-slate-500">
            <span>
              {filteredBusinesses.length === 0
                ? 'Showing 0 results'
                : `Showing ${startRecordNum}–${endRecordNum} of ${filteredBusinesses.length} results`}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages || filteredBusinesses.length === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE BUSINESS REVIEW MODAL */}
      {isReviewModalOpen && reviewBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide uppercase">
                    {reviewBusiness.category}
                  </span>
                  {reviewBusiness.status === 'Active' && (
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )}
                  {reviewBusiness.status === 'Inactive' && (
                    <span className="bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Inactive
                    </span>
                  )}
                  {reviewBusiness.status === 'Setup Pending' && (
                    <span className="bg-amber-50 text-amber-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Setup Pending
                    </span>
                  )}
                  {reviewBusiness.status === 'Pending Review' && (
                    <span className="bg-blue-50 text-blue-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Pending Review
                    </span>
                  )}
                  {reviewBusiness.status === 'KYC Rejected' && (
                    <span className="bg-rose-50 text-rose-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      KYC Rejected
                    </span>
                  )}
                  {(reviewBusiness.rejectionCount || 0) > 0 && (
                    <span className="bg-rose-100 text-rose-800 font-black text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>{reviewBusiness.rejectionCount}x Rejected</span>
                    </span>
                  )}
                  {reviewBusiness.resubmittedAt && (
                    <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      <span>Resubmitted for Review</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{reviewBusiness.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Legal Entity: <span className="font-semibold text-slate-700">{reviewBusiness.legalEntity}</span>
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Prior Rejection History Banner (Prominently visible to Super Admin) */}
              {(reviewBusiness.rejectionCount || 0) > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/90 border-2 border-rose-200/90 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                        {reviewBusiness.rejectionCount}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-950">
                          Application Previously Rejected {reviewBusiness.rejectionCount} Time{reviewBusiness.rejectionCount > 1 ? 's' : ''}
                        </h4>
                        <p className="text-[11px] text-rose-700">
                          Super Admin audit trail tracked for compliance and fraud prevention.
                        </p>
                      </div>
                    </div>
                    {reviewBusiness.resubmittedAt && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 text-blue-600 animate-spin-slow" />
                        <span>Resubmitted on: {reviewBusiness.resubmittedAt}</span>
                      </span>
                    )}
                  </div>

                  {reviewBusiness.rejectionReason && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200/90 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                        Most Recent Rejection Reason Sent to Business:
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed italic bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        "{reviewBusiness.rejectionReason}"
                      </p>
                    </div>
                  )}

                  {reviewBusiness.rejectionHistory && reviewBusiness.rejectionHistory.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Rejection Audit History ({reviewBusiness.rejectionHistory.length} logs):</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {reviewBusiness.rejectionHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded-xl border border-rose-100 text-xs flex flex-col gap-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span className="text-rose-700">Attempt #{idx + 1} Rejection • {item.date}</span>
                              <span className="text-slate-400">By: {item.rejectedBy || 'Super Admin'}</span>
                            </div>
                            <p className="text-slate-700 font-medium">"{item.reason}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Overview Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Location
                  </span>
                  <strong className="text-xs text-slate-800 block truncate">
                    {reviewBusiness.location}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Subscription
                  </span>
                  <strong className="text-xs text-emerald-700 block">
                    {reviewBusiness.subscription || 'Unpaid / None'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Date Joined
                  </span>
                  <strong className="text-xs text-slate-800 block">
                    {reviewBusiness.date}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Est. Volume
                  </span>
                  <strong className="text-xs text-slate-800 block">
                    {reviewBusiness.monthlyVolume || '$15,000'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              {reviewBusiness.description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Business Profile
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {reviewBusiness.description}
                  </p>
                </div>
              )}

              {/* KYC & Regulatory Compliance Audit (Section 8 Admin Review) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Compliance & Regulatory Verification Package
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    Admin Approval Required
                  </span>
                </div>

                {/* Important Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  <strong>Compliance Guardrail:</strong> External provider verification (Middesk) confirms IRS TIN match. Final marketplace underwriting approval is strictly controlled by UrSpot Super Admin.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. IRS TIN Verification */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">1. IRS TIN Match</span>
                      {reviewBusiness.tinMatchStatus === 'Matched' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>✓ MATCH</span>
                        </span>
                      ) : reviewBusiness.tinMatchStatus === 'Mismatch' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>✕ MISMATCH</span>
                        </span>
                      ) : reviewBusiness.tinMatchStatus === 'Error' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span>⚠ ERROR</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>⏳ PENDING</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-0.5 font-mono">
                      <p className="text-slate-900 font-bold">
                        {reviewBusiness.tinType || 'EIN'}: {reviewBusiness.tinMasked || '**-*****6789'}
                      </p>
                      <p className="text-[11px] font-sans text-slate-500">
                        Type: {reviewBusiness.entityType || 'LLC'}
                        {reviewBusiness.federalTaxClassification ? ` (${reviewBusiness.federalTaxClassification})` : ''}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Verified via backend Middesk integration • Masked for security
                    </p>
                  </div>

                  {/* 2. State Registration */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">2. State Registration</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {reviewBusiness.stateRegistryStatus || 'Active / Good Standing'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 truncate font-medium">
                      Doc: {reviewBusiness.stateRegistryFile || 'Articles_of_Organization.pdf'}
                    </p>
                    <p className="text-[10px] text-slate-400">Certified Secretary of State corporate filing</p>
                  </div>

                  {/* 3. Beneficial Owner */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">3. Beneficial Owner (UBO)</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ID & Selfie Verified
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      {reviewBusiness.beneficialOwner?.fullName || 'Primary Officer'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      DOB: {reviewBusiness.beneficialOwner?.dob || '1988-06-14'} • SSN: •••-••-{reviewBusiness.beneficialOwner?.ssnLast4 || '4821'}
                    </p>
                  </div>

                  {/* 4. Sanctions Screening & Risk Level */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">4. Sanctions & Risk</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {reviewBusiness.sanctionsStatus || 'Clear'}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Risk: {reviewBusiness.riskLevel || 'Low'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-800">
                      OFAC, UN, SDN & PEP watchlist screened
                    </p>
                    <p className="text-[10px] text-slate-400">Automated global sanctions screening</p>
                  </div>

                  {/* 5. Documents Audit */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">5. Required Documents</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Validated
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 truncate">
                      Gov ID (Passport/License) + Articles of Org
                    </p>
                    <p className="text-[10px] text-slate-400">All mandatory compliance docs present</p>
                  </div>

                  {/* 6. Payout Account */}
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">6. Payout Account</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ACH Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 truncate">
                      {reviewBusiness.bankAccount?.accountHolder || reviewBusiness.legalEntity}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Routing: {reviewBusiness.bankAccount?.routingNumber || '121000358'} • Acc: {reviewBusiness.bankAccount?.accountMasked || '•••• 9104'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection reason box if rejecting */}
              {showRejectInput && (
                <div className="p-4.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Specify Rejection Reason & Guidance for Vendor:</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold">
                      Will be sent directly to vendor's notification feed
                    </span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Preset Reasons:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'EIN and Legal Entity name mismatch with IRS records',
                        'Government ID expired, blurry, or missing backside',
                        'Articles of Organization certificate is missing or invalid',
                        'Bank account holder name does not match legal entity',
                        'Liveness selfie check incomplete or failed facial comparison',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRejectReason(preset)}
                          className="text-[10px] font-medium px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-900 hover:bg-rose-100/70 transition-colors cursor-pointer text-left"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter detailed description why the KYC was rejected so the business owner can correct it and resubmit..."
                    className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-normal leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectKyc}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Confirm & Send Rejection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* If business is not yet active/approved: always allow Approve & Verify KYC, or Reject */}
                {reviewBusiness.status !== 'Active' && (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{reviewBusiness.rejectionCount ? 'Reject Again' : 'Reject Application'}</span>
                    </button>
                    <button
                      onClick={handleApproveKyc}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify KYC</span>
                    </button>
                  </>
                )}

                {/* For Active businesses: toggle Active / Inactive */}
                {reviewBusiness.status === 'Active' && (
                  <button
                    onClick={handleToggleStatus}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Set as Inactive</span>
                  </button>
                )}

                {/* For Inactive businesses: toggle Active / Inactive */}
                {reviewBusiness.status === 'Inactive' && (
                  <button
                    onClick={handleToggleStatus}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Set as Active</span>
                  </button>
                )}

                {/* Always allow Super Admin to delete the business */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete "${reviewBusiness.name}"?`)) {
                      deleteBusinessById(reviewBusiness.id);
                      setIsReviewModalOpen(false);
                      showToast(`Business "${reviewBusiness.name}" deleted successfully.`);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Delete business record"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBusinessManagementTab;
