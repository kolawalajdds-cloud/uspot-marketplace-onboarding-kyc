import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import {
  Business,
  UserProfile,
  PlanTier,
  BusinessHours,
  BusinessService,
  Booking,
  BookingItem,
  BookingStatus,
} from '../../types';
import {
  DAY_NAMES,
  getDefaultBusinessHours,
  minutesToTimeString,
  calculateMultiServiceAvailability,
} from '../../utils/serviceBookingUtils';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Calendar,
  Layers,
  Briefcase,
  Users,
  CreditCard,
  DollarSign,
  UsersRound,
  MessageSquare,
  BadgeCheck,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Search,
  Bell,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  UploadCloud,
  Check,
  CheckCircle2,
  X,
  Info,
  MapPin,
  Send,
  Download,
  Star,
  Heart,
  Filter,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  Trash2,
  FileUp,
  List,
  Pencil,
  SlidersHorizontal,
  TrendingUp,
  Headphones,
  Workflow,
  Zap,
  Play,
  RefreshCw,
  RotateCw,
  Sparkles,
  CalendarCheck,
  AlertCircle,
  Wallet,
  Landmark,
  Scissors,
  Copy,
  CheckCircle,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import { BusinessWizard } from './BusinessWizard';
import { BusinessMultiStepPage, DEFAULT_FORM_DATA } from './multistep/BusinessMultiStepPage';
import { BusinessFormData, MultiStepTab } from './multistep/types';
import { W9TaxCertification } from './W9TaxCertification';
import { BusinessDetailsView } from './BusinessDetailsView';
import { NmiPaymentAccountSetup } from './NmiPaymentAccountSetup';
import { BusinessReviewsManagementView } from './BusinessReviewsManagementView';
import { BusinessWorkersManagementView } from './BusinessWorkersManagementView';
import { NmiPaymentAccountData } from '../../types';
import {
  normalizeTransactionType,
  getTransactionTypeMeta,
} from '../../utils/ledgerAccounting';

type BusinessPortalTab =
  | 'dashboard'
  | 'w9-form'
  | 'my-businesses'
  | 'business-details'
  | 'followed-businesses'
  | 'bookings'
  | 'booking-management'
  | 'advanced-booking-workflow'
  | 'my-services'
  | 'service-availability'
  | 'workers'
  | 'payouts'
  | 'customers'
  | 'reviews'
  | 'subscriptions'
  | 'account'
  | 'settings';

export const BusinessPortal: React.FC = () => {
  const {
    currentUser,
    users,
    loginAsUser,
    logout,
    state,
    adminToggleBusinessStatus,
    selectBusinessForVendor,
    setActiveBusinessId,
    createNewBusiness,
    setVendorView,
    saveVendorBusiness,
    deleteBusinessById,
    allNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    saveW9Data,
    submitW9Data,
    processPayment,
    platformLedger,
    getBusinessBalance,
    requestBusinessWithdrawal,
    linkVendorBankAccount,
    resetW9Data,
    saveNmiPaymentAccount,
    getNmiPaymentAccount,
    businessServices,
    bookings,
    businessReviews,
    addBusinessService,
    updateBusinessService,
    deleteBusinessService,
    toggleBusinessServiceStatus,
    loadSalonPresets,
    loadSpaPresets,
    updateBusinessHours,
    updateBookingStatus,
    cancelBooking,
  } = useDemo();

  // Active Tab State with localStorage Persistence
  const [activeTab, setActiveTab] = useState<BusinessPortalTab>(() => {
    try {
      const saved = localStorage.getItem('uspot_vendor_active_tab') as BusinessPortalTab;
      const validTabs: BusinessPortalTab[] = [
        'dashboard',
        'w9-form',
        'my-businesses',
        'business-details',
        'followed-businesses',
        'bookings',
        'booking-management',
        'advanced-booking-workflow',
        'my-services',
        'service-availability',
        'workers',
        'payouts',
        'customers',
        'reviews',
        'subscriptions',
        'account',
        'settings',
      ];
      if (saved && validTabs.includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'dashboard';
  });

  const [isBusinessesMenuOpen, setIsBusinessesMenuOpen] = useState(
    () => ['my-businesses', 'business-details', 'followed-businesses'].includes(activeTab) || true
  );
  const [isBookingsMenuOpen, setIsBookingsMenuOpen] = useState(
    () => ['bookings', 'booking-management', 'advanced-booking-workflow'].includes(activeTab) || true
  );
  const [isMyServicesMenuOpen, setIsMyServicesMenuOpen] = useState(
    () => ['my-services', 'service-availability'].includes(activeTab) || true
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync activeTab to localStorage and auto-expand corresponding parent menus
  useEffect(() => {
    try {
      localStorage.setItem('uspot_vendor_active_tab', activeTab);
    } catch (e) {}
    if (['my-businesses', 'business-details', 'followed-businesses'].includes(activeTab)) {
      setIsBusinessesMenuOpen(true);
    }
    if (['bookings', 'booking-management', 'advanced-booking-workflow'].includes(activeTab)) {
      setIsBookingsMenuOpen(true);
    }
    if (['my-services', 'service-availability'].includes(activeTab)) {
      setIsMyServicesMenuOpen(true);
    }
  }, [activeTab]);

  // Top Nav State
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isProfileMenuOpen && !isNotificationsOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isProfileMenuOpen, isNotificationsOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // BUSINESSES TAB STATE (My Businesses 2 View Options)
  // ==========================================
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => {
    if (currentUser) {
      const userBiz = state.businesses.find(
        (b) =>
          (b.userId && b.userId === currentUser.id) ||
          (b.email && currentUser.email && b.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (userBiz) return userBiz.id;
    }
    try {
      const savedBizId = localStorage.getItem('uspot_vendor_selected_business_id');
      if (savedBizId && state.businesses.some((b) => b.id === savedBizId)) {
        return savedBizId;
      }
    } catch (e) {}
    return state.activeBusinessId || state.businesses[0]?.id || '';
  });

  // Sync selectedBusinessId to localStorage
  useEffect(() => {
    if (selectedBusinessId) {
      try {
        localStorage.setItem('uspot_vendor_selected_business_id', selectedBusinessId);
      } catch (e) {}
    }
  }, [selectedBusinessId]);

  // Keep selected business in sync with currentUser's owned business
  useEffect(() => {
    if (!currentUser) return;
    const userBiz = state.businesses.find(
      (b) =>
        (b.userId && b.userId === currentUser.id) ||
        (b.email && currentUser.email && b.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (userBiz) {
      if (selectedBusinessId !== userBiz.id) {
        setSelectedBusinessId(userBiz.id);
      }
      if (state.activeBusinessId !== userBiz.id) {
        setActiveBusinessId(userBiz.id);
      }
    } else {
      const exists = state.businesses.some((b) => b.id === selectedBusinessId);
      if (!exists && state.businesses.length > 0) {
        setSelectedBusinessId(state.businesses[0].id);
        setActiveBusinessId(state.businesses[0].id);
      }
    }
  }, [currentUser?.id, currentUser?.email, state.businesses]);

  // Filter businesses strictly for the currently logged-in vendor user
  const vendorOwnedBusinesses = useMemo(() => {
    if (!currentUser) return state.businesses;
    if (currentUser.role === 'business') {
      const matched = state.businesses.filter(
        (b) =>
          (b.userId && b.userId === currentUser.id) ||
          (b.email && currentUser.email && b.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (matched.length > 0) return matched;
      return [];
    }
    return state.businesses;
  }, [state.businesses, currentUser]);

  const defaultFallbackBusiness: Business = useMemo(() => ({
    id: 'biz-default',
    userId: currentUser?.id,
    status: 'Draft',
    coreDetails: {
      businessName: currentUser?.fullName ? `${currentUser.fullName}'s Business` : 'My Business',
      legalEntityName: currentUser?.fullName ? `${currentUser.fullName} LLC` : 'My Business LLC',
      category: 'Coworking & Office',
      description: '',
      streetAddress: '',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    operatingHours: [],
    imageGallery: [],
    amenities: [],
    feesTax: {
      businessTaxId: '',
      salesTaxRate: 8.875,
      taxExempt: false,
      currency: 'USD',
      automaticInvoicing: true,
      serviceFees: [],
    },
  }), [currentUser?.id, currentUser?.fullName]);

  const selectedBusiness: Business =
    vendorOwnedBusinesses.find((b) => b.id === selectedBusinessId) ||
    vendorOwnedBusinesses[0] ||
    state.businesses.find((b) => b.id === selectedBusinessId) ||
    state.businesses[0] ||
    defaultFallbackBusiness;

  const selectedServiceBiz = selectedBusiness;
  const selectedServiceBizId = selectedBusiness?.id || 'biz-001';

  const setSelectedServiceBizId = (id: string) => {
    setSelectedBusinessId(id);
    setActiveBusinessId(id);
  };

  // Vendor-level metrics for sidebar indicators
  const currentVendorBusiness = selectedBusiness || state.businesses.find((b) => b.id === selectedBusinessId) || state.businesses[0];
  const isVendorBankLinked = Boolean(
    currentVendorBusiness?.nmiPaymentAccount?.payoutBankDetails?.accountNumber ||
    currentVendorBusiness?.nmiPaymentAccount?.payoutBankDetails?.routingNumber
  );
  const isVendorW9Certified = Boolean(currentVendorBusiness?.w9Data?.isCertified);
  const vendorPendingWithdrawalsCount = (platformLedger?.withdrawals || []).filter(
    (w) =>
      (w.businessId === selectedBusinessId || w.businessName === currentVendorBusiness?.name) &&
      w.status === 'Pending'
  ).length;
  const vendorCurrentBalance = getBusinessBalance ? getBusinessBalance(selectedBusinessId) : { availableBalance: 0 };
  const vendorPendingBookingsCount = (bookings || []).filter((b) => {
    const matchesBiz =
      b.business_id === selectedBusinessId ||
      (b.business_name && (
        b.business_name.toLowerCase() === (currentVendorBusiness?.coreDetails?.businessName || '').toLowerCase() ||
        b.business_name.toLowerCase() === ((currentVendorBusiness as any)?.name || '').toLowerCase()
      )) ||
      vendorOwnedBusinesses.some((v) => v.id === b.business_id);
    return matchesBiz && (b.status === 'pending' || b.status === 'confirmed');
  }).length;
  const vendorUnrepliedReviewsCount = (businessReviews || []).filter(
    (r) => r.business_id === selectedBusinessId && !r.vendor_reply
  ).length;
  const isVendorKycPending = Boolean(
    currentVendorBusiness?.status === 'Draft' ||
    currentVendorBusiness?.status === 'Pending KYC Review' ||
    currentVendorBusiness?.status === 'Submitted' ||
    currentVendorBusiness?.status === 'Under Review'
  );

  // Track acknowledged / opened counts so notifications disappear once the user visits the page
  const [seenVendorPayoutsCount, setSeenVendorPayoutsCount] = useState<number>(() => {
    try {
      const val = localStorage.getItem('uspot_vendor_seen_payouts_count');
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [hasOpenedVendorBankNotice, setHasOpenedVendorBankNotice] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uspot_vendor_seen_bank_notice') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [hasOpenedVendorW9, setHasOpenedVendorW9] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uspot_vendor_seen_w9') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [seenVendorBookingsCount, setSeenVendorBookingsCount] = useState<number>(() => {
    try {
      const val = localStorage.getItem('uspot_vendor_seen_bookings_count');
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [seenVendorReviewsCount, setSeenVendorReviewsCount] = useState<number>(() => {
    try {
      const val = localStorage.getItem('uspot_vendor_seen_reviews_count');
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [hasOpenedVendorBusinesses, setHasOpenedVendorBusinesses] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uspot_vendor_seen_businesses') === 'true';
    } catch (e) {
      return false;
    }
  });

  // When user opens Payouts, clear payouts notification & bank notice
  useEffect(() => {
    if (activeTab === 'payouts') {
      setSeenVendorPayoutsCount(vendorPendingWithdrawalsCount);
      setHasOpenedVendorBankNotice(true);
      try {
        localStorage.setItem('uspot_vendor_seen_payouts_count', String(vendorPendingWithdrawalsCount));
        localStorage.setItem('uspot_vendor_seen_bank_notice', 'true');
      } catch (e) {}
    } else if (vendorPendingWithdrawalsCount === 0 && seenVendorPayoutsCount > 0) {
      setSeenVendorPayoutsCount(0);
      try {
        localStorage.setItem('uspot_vendor_seen_payouts_count', '0');
      } catch (e) {}
    }
  }, [activeTab, vendorPendingWithdrawalsCount, seenVendorPayoutsCount]);

  // When user opens W-9 Form, clear W-9 warning notification
  useEffect(() => {
    if (activeTab === 'w9-form') {
      setHasOpenedVendorW9(true);
      try {
        localStorage.setItem('uspot_vendor_seen_w9', 'true');
      } catch (e) {}
    }
  }, [activeTab]);

  // When user opens Bookings, clear bookings notification
  useEffect(() => {
    if (activeTab === 'bookings' || activeTab === 'booking-management' || activeTab === 'advanced-booking-workflow') {
      setSeenVendorBookingsCount(vendorPendingBookingsCount);
      try {
        localStorage.setItem('uspot_vendor_seen_bookings_count', String(vendorPendingBookingsCount));
      } catch (e) {}
    } else if (vendorPendingBookingsCount === 0 && seenVendorBookingsCount > 0) {
      setSeenVendorBookingsCount(0);
      try {
        localStorage.setItem('uspot_vendor_seen_bookings_count', '0');
      } catch (e) {}
    }
  }, [activeTab, vendorPendingBookingsCount, seenVendorBookingsCount]);

  // When user opens Reviews, clear reviews notification
  useEffect(() => {
    if (activeTab === 'reviews') {
      setSeenVendorReviewsCount(vendorUnrepliedReviewsCount);
      try {
        localStorage.setItem('uspot_vendor_seen_reviews_count', String(vendorUnrepliedReviewsCount));
      } catch (e) {}
    } else if (vendorUnrepliedReviewsCount === 0 && seenVendorReviewsCount > 0) {
      setSeenVendorReviewsCount(0);
      try {
        localStorage.setItem('uspot_vendor_seen_reviews_count', '0');
      } catch (e) {}
    }
  }, [activeTab, vendorUnrepliedReviewsCount, seenVendorReviewsCount]);

  // When user opens Businesses, clear KYC in review notice
  useEffect(() => {
    if (activeTab === 'my-businesses' || activeTab === 'business-details') {
      setHasOpenedVendorBusinesses(true);
      try {
        localStorage.setItem('uspot_vendor_seen_businesses', 'true');
      } catch (e) {}
    }
  }, [activeTab]);

  // Unread counts / notifications (cleared when user has opened that page)
  const unreadVendorPayoutsCount = activeTab === 'payouts' ? 0 : Math.max(0, vendorPendingWithdrawalsCount - seenVendorPayoutsCount);
  const showVendorBankNotice = !isVendorBankLinked && vendorCurrentBalance.availableBalance > 0 && !hasOpenedVendorBankNotice && activeTab !== 'payouts';
  const showVendorW9Alert = !isVendorW9Certified && !hasOpenedVendorW9 && activeTab !== 'w9-form';
  const isViewingVendorBookings = activeTab === 'bookings' || activeTab === 'booking-management' || activeTab === 'advanced-booking-workflow';
  const unreadVendorBookingsCount = isViewingVendorBookings ? 0 : Math.max(0, vendorPendingBookingsCount - seenVendorBookingsCount);
  const unreadVendorReviewsCount = activeTab === 'reviews' ? 0 : Math.max(0, vendorUnrepliedReviewsCount - seenVendorReviewsCount);
  const showVendorKycNotice = isVendorKycPending && !hasOpenedVendorBusinesses && activeTab !== 'my-businesses' && activeTab !== 'business-details';

  const [viewingBusinessId, setViewingBusinessId] = useState<string | null>(null);
  const [businessSearchFilter, setBusinessSearchFilter] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<string>('All');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('2,450.00');
  const [isLinkBankModalOpen, setIsLinkBankModalOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bankName: 'JPMorgan Chase',
    accountHolderName: '',
    routingNumber: '121000358',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: 'CHECKING' as 'CHECKING' | 'SAVINGS',
  });
  const [isNmiSetupModalOpen, setIsNmiSetupModalOpen] = useState(false);
  const [isNmiRequiredModalOpen, setIsNmiRequiredModalOpen] = useState(false);
  const [proceedToWithdrawAfterNmi, setProceedToWithdrawAfterNmi] = useState(false);

  // 2 View Options for "My Businesses": 'table' (Image 1) or 'grid' (Image 2)
  const [businessesViewMode, setBusinessesViewMode] = useState<'table' | 'grid'>('grid');
  const [myBusinessesSearch, setMyBusinessesSearch] = useState('');
  const [myBusinessesStatusFilter, setMyBusinessesStatusFilter] = useState<
    'All Statuses' | 'Active' | 'Pending' | 'Inactive'
  >('All Statuses');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Payment Flow & Plan Confirmation State (Matching Image 2)
  const [payingBusinessId, setPayingBusinessId] = useState<string | null>(null);
  const [subscriptionViewMode, setSubscriptionViewMode] = useState<'card' | 'table'>('card');
  const [isPlanConfirmModalOpen, setIsPlanConfirmModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlanForConfirmation, setSelectedPlanForConfirmation] = useState<{
    plan: PlanTier;
    name: string;
    price: number;
    billing: string;
    features: string[];
  } | null>(null);

  const handleOpenPaymentForBusiness = (bizId: string) => {
    setPayingBusinessId(bizId);
    setSelectedBusinessId(bizId);
    setActiveTab('subscriptions');
  };

  const handleSelectPlan = (
    plan: PlanTier,
    price: number,
    features: string[]
  ) => {
    setSelectedPlanForConfirmation({
      plan,
      name: plan,
      price,
      billing: 'Monthly',
      features,
    });
    setIsPlanConfirmModalOpen(true);
  };

  const handleConfirmPlanPayment = async () => {
    if (!selectedPlanForConfirmation) return;
    const targetId = payingBusinessId || selectedBusinessId;
    const targetBiz = state.businesses.find((b) => b.id === targetId);
    if (!targetBiz) {
      showToast('Please select a valid business to subscribe.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      await processPayment(
        targetBiz.id,
        selectedPlanForConfirmation.plan,
        selectedPlanForConfirmation.price
      );
      const bizDisplayName = targetBiz.coreDetails?.businessName || (targetBiz as any).businessName || 'Business';
      showToast(
        targetBiz.status === 'KYC Approved'
          ? `🎉 Payment confirmed! "${bizDisplayName}" is now active and Live.`
          : `🎉 Subscription confirmed for "${bizDisplayName}"! Your business will activate once KYC is approved.`
      );
      setIsPlanConfirmModalOpen(false);
      setSelectedPlanForConfirmation(null);
      setPayingBusinessId(null);
      setActiveTab('my-businesses');
    } catch (err) {
      console.error(err);
      showToast('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };



  // Synchronized directly with DemoContext so changes in Business User reflect in Super Admin and vice versa!
  const myBusinessesList = useMemo(() => {
    return vendorOwnedBusinesses.map((b) => {
      let status: 'Active' | 'Pending' | 'Inactive' = 'Active';
      if (b.status === 'Pending KYC Review') {
        status = 'Pending';
      } else if (b.status === 'KYC Rejected' || b.status === 'Draft' || b.status === 'Pending Payment') {
        status = 'Inactive';
      } else {
        status = 'Active';
      }

      const isKycApproved =
        b.status === 'KYC Approved' ||
        b.subTab === 'approved' ||
        b.verification?.status === 'Approved' ||
        (b.status === 'Active' && !b.payment?.paidAt && Boolean(b.verification?.reviewedBy));

      const hasPaid = Boolean(b.payment?.paidAt);
      const isAwaitingPayment = isKycApproved && !hasPaid;

      const isKycRejected =
        !isKycApproved &&
        b.status !== 'Live' &&
        (b.status === 'KYC Rejected' ||
          b.verification?.status === 'Rejected' ||
          Boolean(b.rejectionReason || b.verification?.rejectionReason));

      const rejectionReason = isKycRejected
        ? (b.rejectionReason || b.verification?.rejectionReason || null)
        : null;
      const rejectionCount = b.rejectionCount ?? b.verification?.rejectionCount ?? 0;

      const bizName = b.coreDetails?.businessName || (b as any).businessName || (b as any).name || 'Untitled Business';
      const bizCategory = b.coreDetails?.category || (b as any).category || 'Coworking & Office';
      const bizCity = b.coreDetails?.city || (b as any).city || 'San Francisco';

      return {
        id: b.id,
        name: bizName,
        category: bizCategory,
        city: bizCity,
        status,
        rawStatus: b.status,
        isKycRejected,
        isAwaitingPayment,
        payment: b.payment,
        rejectionReason,
        rejectionCount,
        services: b.servicesCount ?? 8,
        workers: b.workersCount ?? 4,
        isActive: b.status === 'Live' || (b.status === 'KYC Approved' && hasPaid),
        avatarChar: b.avatarChar || bizName.charAt(0).toUpperCase(),
      };
    });
  }, [vendorOwnedBusinesses]);

  // Modals for CRUD operations & details
  const [multistepMode, setMultistepMode] = useState<'create' | 'edit' | null>(null);
  const [multistepInitialTab, setMultistepInitialTab] = useState<MultiStepTab>('business-setup');
  const [multistepInitialData, setMultistepInitialData] = useState<Partial<BusinessFormData> | undefined>(undefined);

  // Persistent Business Details Store across all tabs & sessions (images, operating hours, etc.)
  const [businessDetailsStore, setBusinessDetailsStore] = useState<
    Record<string, Partial<BusinessFormData>>
  >(() => {
    try {
      const cached = localStorage.getItem('booked_vendor_business_details');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to load business details from cache', e);
    }
    return {
      'mbiz-1': {
        id: 'mbiz-1',
        businessName: 'Urban Roast Coffee',
        legalEntityName: 'Urban Roast Hospitality LLC',
        category: 'Beverages',
        phone: '14192354219',
        description: 'Artisanal roastery and workspace offering single-origin brews, high-speed fiber internet, and quiet lounge zones.',
        streetAddress: '450 Mission Street, Floor 2',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        lat: 37.7903,
        lng: -122.4014,
        images: [
          {
            id: 'img-ur-1',
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
            label: 'Main Espresso Counter',
            isCover: true,
          },
          {
            id: 'img-ur-2',
            url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
            label: 'Artisan Pour Over Station',
            isCover: false,
          },
          {
            id: 'img-ur-3',
            url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
            label: 'Sunlit Lounge Area',
            isCover: false,
          },
        ],
        selectedAmenityIds: ['air-conditioning', 'high-speed-wifi', 'contactless-payments', 'valet-parking'],
      },
      'mbiz-2': {
        id: 'mbiz-2',
        businessName: 'Tech Supply Co.',
        legalEntityName: 'Tech Supply Hardware Corp',
        category: 'IT',
        phone: '15129381920',
        description: 'Specialized technology hardware distribution, server equipment, and testing labs in Austin.',
        streetAddress: '780 Congress Ave, Suite 300',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        lat: 30.2711,
        lng: -97.7437,
        images: [
          {
            id: 'img-ts-1',
            url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
            label: 'Electronics Workbench',
            isCover: true,
          },
          {
            id: 'img-ts-2',
            url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            label: 'Server Testing Rig',
            isCover: false,
          },
        ],
        selectedAmenityIds: ['high-speed-wifi', 'wheelchair-accessible', 'security-surveillance'],
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('booked_vendor_business_details', JSON.stringify(businessDetailsStore));
    } catch (e) {
      // ignore
    }
  }, [businessDetailsStore]);
  const [isCreateBusinessModalOpen, setIsCreateBusinessModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('Beverages');
  const [newBizCity, setNewBizCity] = useState('');
  const [newBizServices, setNewBizServices] = useState(10);
  const [newBizWorkers, setNewBizWorkers] = useState(6);
  const [newBizStatus, setNewBizStatus] = useState<'Draft'>('Draft');

  const [isEditBusinessModalOpen, setIsEditBusinessModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<{
    id: string;
    name: string;
    category: string;
    city: string;
    status: 'Active' | 'Pending' | 'Inactive';
    services: number;
    workers: number;
    isActive: boolean;
    avatarChar: string;
  } | null>(null);

  const [isViewBusinessModalOpen, setIsViewBusinessModalOpen] = useState(false);
  const [viewingBiz, setViewingBiz] = useState<{
    id: string;
    name: string;
    category: string;
    city: string;
    status: 'Active' | 'Pending' | 'Inactive';
    services: number;
    workers: number;
    isActive: boolean;
    avatarChar: string;
  } | null>(null);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const convertBusinessToFormData = (b: Business): BusinessFormData => {
    const cd = b.coreDetails || (b as any);
    const bName = cd?.businessName || (b as any).name || 'Untitled Business';
    return {
      ...DEFAULT_FORM_DATA,
      id: b.id,
      businessName: bName,
      legalEntityName: cd?.legalEntityName || bName,
      category: cd?.category || 'Coworking & Office',
      phone: b.phone || '+1 (415) 555-0199',
      description: cd?.description || '',
      streetAddress: cd?.streetAddress || '',
      city: cd?.city || 'San Francisco',
      state: cd?.state || 'CA',
      zipCode: cd?.zipCode || '94105',
      lat: 37.7749,
      lng: -122.4194,
      schedule: b.operatingHours.map((h, hIdx) => ({
        day: h.day,
        isOpen: h.isOpen,
        slots: [{ id: `slot-${hIdx}`, start: h.openTime || '08:00', end: h.closeTime || '19:00' }],
      })),
      images: (b.imageGallery || []).map((img, idx) => ({
        id: img.id || `img-${idx}`,
        url:
          (img as any).url ||
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        label: img.label,
        isCover: Boolean(img.isCover),
      })),
      selectedAmenityIds: (b.amenities || []).flatMap((cat) =>
        cat.items.filter((i) => i.checked).map((i) => i.id || i.name.toLowerCase().replace(/\s+/g, '-'))
      ),
      maxCapacity: b.holidaysRules?.businessRules?.maxCapacity ?? 50,
      petFriendly: b.holidaysRules?.businessRules?.petFriendly ?? false,
      ageRequirement: b.holidaysRules?.businessRules?.ageRequirement ?? '18+',
      byobAllowed: b.holidaysRules?.businessRules?.byobAllowed ?? false,
      holidays: (b.holidaysRules?.holidayClosures || []).map((hc) => ({
        id: hc.id,
        name: hc.name,
        date: hc.date,
        enabled: hc.enabled,
      })),
      taxId: b.feesTax?.businessTaxId || '',
      salesTaxRate: b.feesTax?.salesTaxRate ?? 8.5,
      taxExempt: b.feesTax?.taxExempt ?? false,
      currency: b.feesTax?.currency || 'USD',
      automaticInvoicing: b.feesTax?.automaticInvoicing ?? true,
      serviceFees: b.feesTax?.serviceFees || [],
      entityType: b.verification?.legalEntityType || 'Limited Liability Company (LLC)',
      federalTaxClassification: b.verification?.federalTaxClassification || (b.verification?.legalEntityType?.includes('LLC') ? 'Limited Liability Company (LLC)' : 'C Corporation'),
      llcTaxClassification: b.verification?.llcTaxClassification || 'C',
      tinType: b.verification?.tinType || 'EIN',
      tinRaw: b.verification?.einVerification?.tinRaw || b.verification?.einVerification?.einEntered || '',
      tinMasked: b.verification?.einVerification?.tinMasked || '',
      tinStatus: (b.verification?.einVerification?.tinVerificationStatus || (b.verification?.einVerification?.tinMatchStatus === 'Matched' ? 'match' : 'not_verified')) as any,
      ein: b.verification?.einVerification?.einEntered || '',
      einMatched: b.verification?.einVerification?.tinMatchStatus === 'Matched',
      sosDocUploaded: Boolean(b.verification?.entityRegistration?.documentUploaded),
      sosDocName: b.verification?.entityRegistration?.fileName || '',
      stateRegistryActive: b.verification?.entityRegistration?.stateRegistryStatus === 'Active/Good Standing',
      uboFullName: b.verification?.beneficialOwner?.fullName || '',
      uboDob: b.verification?.beneficialOwner?.dateOfBirth || '',
      uboSsn: b.verification?.beneficialOwner?.ssnLast4 || '',
      govIdUploaded: Boolean(b.verification?.beneficialOwner?.govIdUploaded),
      selfieUploaded: Boolean(b.verification?.beneficialOwner?.selfieUploaded),
      sanctionsClear: b.verification?.sanctionsScreening?.status === 'Clear',
      kycSubmitted:
        b.status === 'Pending KYC Review' ||
        (b.status !== 'KYC Rejected' && b.status !== 'KYC Approved' && b.status !== 'Live' && Boolean(b.verification?.kycSubmitted)),
      kycStatus:
        b.status === 'KYC Approved' || b.status === 'Live'
          ? 'Verified'
          : b.status === 'Pending KYC Review'
          ? 'Pending Review'
          : b.status === 'KYC Rejected'
          ? 'Rejected'
          : 'Draft',
      status: b.status,
      rejectionReason: b.rejectionReason || b.verification?.rejectionReason || undefined,
      rejectionCount: b.rejectionCount ?? b.verification?.rejectionCount ?? 0,
      rejectionHistory: (b.rejectionHistory ?? b.verification?.rejectionHistory ?? []).map((rh) => ({
        date: rh.date,
        reason: rh.reason,
        rejectedBy: rh.rejectedBy || 'Super Admin',
      })),
      resubmittedAt: b.resubmittedAt ?? b.verification?.resubmittedAt ?? undefined,
      signature: b.verification?.signature || (b as any).signature || '',
      signatureDate: b.verification?.signatureDate || (b as any).signatureDate || '',
    };
  };

  const toggleBusinessActive = (bizId: string) => {
    if (currentUser?.role !== 'super_admin') {
      showToast('Business active/inactive status can only be managed by Super Admin.');
      return;
    }
    const biz = state.businesses.find((b) => b.id === bizId);
    if (!biz) return;
    const isNowActive = biz.status === 'KYC Approved' || biz.status === 'Live';
    adminToggleBusinessStatus(bizId, !isNowActive);
    const bName = biz.coreDetails?.businessName || (biz as any).name || 'Business';
    showToast(
      `${bName} is now ${
        !isNowActive ? 'Active and accepting orders' : 'Paused / Inactive'
      }.`
    );
  };

  const handleDeleteBusiness = (bizId: string) => {
    const target = state.businesses.find((b) => b.id === bizId);
    if (target) {
      deleteBusinessById(bizId);
      const tName = target.coreDetails?.businessName || (target as any).name || 'Business';
      showToast(`Removed "${tName}" from your businesses.`);
    }
  };

  const handleCreateBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    const newId = `biz-${Date.now()}`;
    const newBiz = saveVendorBusiness({
      id: newId,
      userId: currentUser?.id || 'user-business',
      businessName: newBizName.trim(),
      category: newBizCategory,
      city: newBizCity.trim() || 'San Francisco',
      status: 'Draft',
      kycSubmitted: false,
      servicesCount: Number(newBizServices) || 1,
      workersCount: Number(newBizWorkers) || 1,
    });
    setSelectedBusinessId(newBiz.id);
    setActiveBusinessId(newBiz.id);
    setPayingBusinessId(newBiz.id);
    setIsCreateBusinessModalOpen(false);
    setNewBizName('');
    setNewBizCity('');
    const createdName = newBiz.coreDetails?.businessName || newBizName.trim();
    showToast(`Successfully registered "${createdName}" as Draft. Submit KYC for admin approval.`);
  };

  const handleEditBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;
    const biz = state.businesses.find((b) => b.id === editingBiz.id);
    saveVendorBusiness({
      ...(biz ? convertBusinessToFormData(biz) : {}),
      id: editingBiz.id,
      businessName: editingBiz.name,
      category: editingBiz.category,
      city: editingBiz.city,
      status: biz?.status || 'Draft',
      kycSubmitted: Boolean(biz?.verification?.kycSubmitted),
      servicesCount: editingBiz.services,
      workersCount: editingBiz.workers,
    });
    setIsEditBusinessModalOpen(false);
    showToast(`Saved updates for "${editingBiz.name}".`);
  };

  const handleSaveMultiStepBusiness = (formData: BusinessFormData) => {
    const targetId =
      formData.id || (multistepMode === 'edit' ? multistepInitialData?.id : `biz-${Date.now()}`);
    const dataWithId: BusinessFormData = {
      ...formData,
      id: targetId,
    };

    // Save directly to global DemoContext (persisting to localStorage & syncing to Super Admin)
    const savedBiz = saveVendorBusiness(dataWithId);

    // Cache in businessDetailsStore
    setBusinessDetailsStore((prev) => ({
      ...prev,
      [savedBiz.id]: dataWithId,
    }));

    const savedName = savedBiz.coreDetails?.businessName || (savedBiz as any).name || 'Business';
    if (multistepMode === 'create') {
      showToast(`Business "${savedName}" created and synced to Super Admin!`);
      setMultistepMode(null);
    } else {
      setMultistepInitialData(dataWithId);
      showToast(`Saved changes for "${savedName}".`);
    }
  };

  const handleOpenEditMultiStep = (
    biz: {
      id: string;
      name?: string;
      category?: string;
      city?: string;
      coreDetails?: any;
    },
    initialTab: MultiStepTab = 'business-setup'
  ) => {
    setMultistepInitialTab(initialTab);
    const existingStore = businessDetailsStore[biz.id];
    const contextBiz = state.businesses.find((b) => b.id === biz.id);

    if (contextBiz) {
      const converted = convertBusinessToFormData(contextBiz);
      const effectiveSig =
        existingStore?.signature ||
        contextBiz.verification?.signature ||
        (contextBiz as any).signature ||
        converted.signature ||
        '';
      const effectiveSigDate =
        existingStore?.signatureDate ||
        contextBiz.verification?.signatureDate ||
        (contextBiz as any).signatureDate ||
        converted.signatureDate ||
        '';

      setMultistepInitialData({
        ...DEFAULT_FORM_DATA,
        ...(existingStore || {}),
        ...converted,
        id: biz.id,
        businessName: biz.name || contextBiz.coreDetails?.businessName || 'Business',
        category: biz.category || contextBiz.coreDetails?.category || 'Coworking & Office',
        city: biz.city || contextBiz.coreDetails?.city || 'San Francisco',
        signature: effectiveSig,
        signatureDate: effectiveSigDate,
      });
    } else if (existingStore) {
      setMultistepInitialData({
        ...DEFAULT_FORM_DATA,
        ...existingStore,
        id: biz.id,
        businessName: biz.name,
        category: biz.category,
        city: biz.city,
        signature: existingStore.signature || '',
        signatureDate: existingStore.signatureDate || '',
      });
    } else {
      setMultistepInitialData({
        ...DEFAULT_FORM_DATA,
        id: biz.id,
        businessName: biz.name,
        category: biz.category,
        city: biz.city,
        phone: '+1 (415) 555-0199',
        streetAddress: '123 Enterprise Way, Suite 400',
        state: 'CA',
        zipCode: '94105',
        description: `${biz.name} offers premium hospitality, workspace and services in ${biz.city}.`,
      });
    }
    setMultistepMode('edit');
    setActiveTab('my-businesses');
    setIsViewBusinessModalOpen(false);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSupportModalOpen(false);
    setSupportMessage('');
    showToast('Support ticket dispatched! An advisor will reach out within 15 minutes.');
  };

  // ==========================================
  // UNIFIED SCHEMA SERVICES, WORKING HOURS & BOOKINGS STATE
  // ==========================================
  const [isServiceBizDropdownOpen, setIsServiceBizDropdownOpen] = useState(false);

  // Service View Mode: 'list' (Catalog Image 1) vs 'create' | 'edit' (Form Images 2 & 3)
  const [serviceViewMode, setServiceViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [serviceSortPriceAsc, setServiceSortPriceAsc] = useState<boolean | null>(null);
  const [serviceCurrentPage, setServiceCurrentPage] = useState<number>(1);
  const [previewingService, setPreviewingService] = useState<BusinessService | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [assigningWorkersService, setAssigningWorkersService] = useState<BusinessService | null>(null);
  const SERVICE_ITEMS_PER_PAGE = 5;

  // Service Form Inputs (Images 2 & 3)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BusinessService | null>(null);
  const [serviceNameInput, setServiceNameInput] = useState('');
  const [serviceCategoryInput, setServiceCategoryInput] = useState('Haircuts & Styling');
  const [serviceBusinessIdInput, setServiceBusinessIdInput] = useState('');
  const [servicePriceInput, setServicePriceInput] = useState('65.00');
  const [serviceHourlyRateInput, setServiceHourlyRateInput] = useState('85.00');
  const [serviceDurationInput, setServiceDurationInput] = useState('45');
  const [serviceMinBillingDurationInput, setServiceMinBillingDurationInput] = useState('30');
  const [serviceRoundingRuleInput, setServiceRoundingRuleInput] = useState('Round up to nearest 15 min');
  const [servicePricingType, setServicePricingType] = useState<'fixed' | 'time_based'>('fixed');
  const [serviceRequiresApprovalInput, setServiceRequiresApprovalInput] = useState(false);
  const [serviceDescriptionInput, setServiceDescriptionInput] = useState('');
  const [serviceImageInput, setServiceImageInput] = useState('');
  const [serviceGalleryImagesInput, setServiceGalleryImagesInput] = useState<string[]>([]);
  const [serviceAvailabilitySchedule, setServiceAvailabilitySchedule] = useState<BusinessHours[]>([]);
  const serviceGalleryFileInputRef = useRef<HTMLInputElement>(null);

  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  // Service Availability / Working Hours Editing State
  const [editingScheduleHours, setEditingScheduleHours] = useState<BusinessHours[]>([]);
  const [hoursSaveSuccess, setHoursSaveSuccess] = useState(false);

  // Booking Management State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'confirmed' | 'visited' | 'cancelled'>('all');
  const [bookingLocationFilter, setBookingLocationFilter] = useState<string>('all');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Live Slot Preview / Simulator State for Availability Tab
  const [simDate, setSimDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Default Service Hours Weekday schedule helper
  const DEFAULT_SERVICE_SCHEDULE: BusinessHours[] = [
    { day_of_week: 1, open_time: '09:00', close_time: '17:00', is_closed: false },
    { day_of_week: 2, open_time: '09:00', close_time: '17:00', is_closed: false },
    { day_of_week: 3, open_time: '09:00', close_time: '17:00', is_closed: false },
    { day_of_week: 4, open_time: '09:00', close_time: '17:00', is_closed: false },
    { day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false },
    { day_of_week: 6, open_time: '10:00', close_time: '18:00', is_closed: false },
    { day_of_week: 0, open_time: '10:00', close_time: '16:00', is_closed: true },
  ];

  const WEEKDAYS_CONFIG = [
    { day_of_week: 1, name: 'Monday' },
    { day_of_week: 2, name: 'Tuesday' },
    { day_of_week: 3, name: 'Wednesday' },
    { day_of_week: 4, name: 'Thursday' },
    { day_of_week: 5, name: 'Friday' },
    { day_of_week: 6, name: 'Saturday' },
    { day_of_week: 0, name: 'Sunday' },
  ];

  const TIME_PICKER_OPTIONS = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM'
  ];

  const serviceImageFileInputRef = useRef<HTMLInputElement>(null);

  const formatTime24To12 = (time24?: string): string => {
    if (!time24) return '09:00 AM';
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const formatTime12To24 = (time12: string): string => {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return time12;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Thumbnail file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setServiceImageInput(reader.result);
          showToast('Service thumbnail attached!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    const availableSlots = 10 - serviceGalleryImagesInput.length;
    if (availableSlots <= 0) {
      showToast('Maximum 10 gallery photos reached. Remove an existing photo to upload new ones.');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      showToast(`Only ${availableSlots} more photo${availableSlots === 1 ? '' : 's'} can be added (limit is 10).`);
    }

    let loadedCount = 0;
    const newPhotos: string[] = [];

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Skipped "${file.name}" (exceeds 5MB limit).`);
        loadedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newPhotos.push(reader.result);
        }
        loadedCount++;
        if (loadedCount === filesToProcess.length && newPhotos.length > 0) {
          setServiceGalleryImagesInput((prev) => {
            const merged = [...prev, ...newPhotos].slice(0, 10);
            return merged;
          });
          showToast(`Added ${newPhotos.length} gallery photo${newPhotos.length > 1 ? 's' : ''}!`);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setServiceGalleryImagesInput((prev) => prev.filter((_, i) => i !== index));
    showToast('Gallery photo removed.');
  };

  // Sync editingScheduleHours whenever selected business changes
  useEffect(() => {
    if (selectedBusiness) {
      if (selectedBusiness.business_hours && selectedBusiness.business_hours.length > 0) {
        setEditingScheduleHours(selectedBusiness.business_hours);
      } else {
        setEditingScheduleHours(getDefaultBusinessHours(selectedBusiness.id));
      }
    }
  }, [selectedBusiness?.id, selectedBusiness?.business_hours]);

  const servicesForSelectedBiz = useMemo(() => {
    if (!selectedBusiness?.id) return [];
    return businessServices.filter((s) => s.business_id === selectedBusiness.id);
  }, [businessServices, selectedBusiness?.id]);

  // Filtered and Sorted list for Image 1 Catalog
  const filteredServicesForSelectedBiz = useMemo(() => {
    let list = servicesForSelectedBiz.filter((s) => {
      const matchCat = serviceCategoryFilter === 'All' || s.category_name === serviceCategoryFilter;
      const matchSearch =
        !serviceSearchTerm.trim() ||
        s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
        (s.category_name && s.category_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()));
      const matchStatus =
        serviceStatusFilter === 'all' || s.status === serviceStatusFilter;
      return matchCat && matchSearch && matchStatus;
    });

    if (serviceSortPriceAsc !== null) {
      list = [...list].sort((a, b) => {
        const priceA = a.pricing_type === 'time_based' ? (a.hourly_rate || a.base_price) : a.base_price;
        const priceB = b.pricing_type === 'time_based' ? (b.hourly_rate || b.base_price) : b.base_price;
        return serviceSortPriceAsc ? priceA - priceB : priceB - priceA;
      });
    }

    return list;
  }, [servicesForSelectedBiz, serviceCategoryFilter, serviceSearchTerm, serviceStatusFilter, serviceSortPriceAsc]);

  // Paginated services for Image 1 Catalog
  const paginatedServicesForSelectedBiz = useMemo(() => {
    const startIndex = (serviceCurrentPage - 1) * SERVICE_ITEMS_PER_PAGE;
    return filteredServicesForSelectedBiz.slice(startIndex, startIndex + SERVICE_ITEMS_PER_PAGE);
  }, [filteredServicesForSelectedBiz, serviceCurrentPage]);

  const totalServicePages = Math.max(1, Math.ceil(filteredServicesForSelectedBiz.length / SERVICE_ITEMS_PER_PAGE));

  // Preview slot computation for Availability tab live simulator
  const previewSlots = useMemo(() => {
    if (!editingScheduleHours.length || !selectedBusiness) return [];
    const sampleService: BusinessService = servicesForSelectedBiz[0] || {
      id: 'preview-sample',
      business_id: selectedBusiness.id,
      name: 'Sample Appointment',
      base_price: 50,
      duration_minutes: 45,
      pricing_type: 'fixed',
      requires_approval: false,
      status: 'active',
    };
    const result = calculateMultiServiceAvailability({
      businessId: selectedBusiness.id,
      selectedServices: [sampleService],
      dateStr: simDate,
      businessHours: editingScheduleHours,
      existingBookings: bookings.filter((b) => b.business_id === selectedBusiness.id),
      slotIntervalMinutes: selectedBusiness.slotIntervalMinutes || 30,
      bufferMinutes: selectedBusiness.bufferMinutes || 0,
    });
    return result.slots.filter((s) => s.isAvailable);
  }, [editingScheduleHours, servicesForSelectedBiz, selectedBusiness, simDate, bookings]);

  const handleDeleteService = (serviceId: string) => {
    deleteBusinessService(serviceId);
    showToast('Service removed from catalog.');
  };

  const bookingsForSelectedBiz = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Business / Location Matching
      let matchBiz = false;
      if (bookingLocationFilter === 'all') {
        // If viewing all: match any business associated with this vendor (or all bookings if viewing all)
        const vendorBizIds = vendorOwnedBusinesses.map((bz) => bz.id);
        const vendorBizNames = vendorOwnedBusinesses.map((bz) => (bz.coreDetails?.businessName || (bz as any)?.name || '').toLowerCase());
        const matchesVendor =
          vendorBizIds.includes(b.business_id) ||
          vendorBizNames.includes(b.business_name?.toLowerCase());

        matchBiz =
          matchesVendor ||
          b.business_id === selectedBusiness?.id ||
          (b.business_name && b.business_name.toLowerCase() === (selectedBusiness?.coreDetails?.businessName || '').toLowerCase());
      } else {
        matchBiz =
          b.business_id === bookingLocationFilter ||
          (b.business_name &&
            state.businesses.some(
              (bz) =>
                bz.id === bookingLocationFilter &&
                (bz.coreDetails?.businessName?.toLowerCase() === b.business_name.toLowerCase() ||
                  (bz as any)?.name?.toLowerCase() === b.business_name.toLowerCase())
            ));
      }

      // 2. Status matching
      const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;

      // 3. Search text matching
      const matchSearch =
        !bookingSearchTerm.trim() ||
        (b.customer_name && b.customer_name.toLowerCase().includes(bookingSearchTerm.toLowerCase())) ||
        (b.items && b.items.some((i) => i.service_name && i.service_name.toLowerCase().includes(bookingSearchTerm.toLowerCase()))) ||
        (b.business_name && b.business_name.toLowerCase().includes(bookingSearchTerm.toLowerCase())) ||
        (b.id && b.id.toLowerCase().includes(bookingSearchTerm.toLowerCase()));

      return matchBiz && matchStatus && matchSearch;
    });
  }, [bookings, vendorOwnedBusinesses, selectedBusiness?.id, selectedBusiness?.coreDetails?.businessName, bookingLocationFilter, bookingStatusFilter, bookingSearchTerm, state.businesses]);

  // Handlers for Reference Images 2 & 3 Full-Page Form
  const handleOpenCreateServiceView = () => {
    setEditingService(null);
    setServiceNameInput('');
    setServiceCategoryInput('Haircuts & Styling');
    setServiceBusinessIdInput(selectedBusiness?.id || 'biz-001');
    setServicePriceInput('65.00');
    setServiceHourlyRateInput('85.00');
    setServiceDurationInput('45');
    setServiceMinBillingDurationInput('30');
    setServiceRoundingRuleInput('Round up to nearest 15 min');
    setServicePricingType('fixed');
    setServiceRequiresApprovalInput(false);
    setServiceDescriptionInput('');
    setServiceImageInput('');
    setServiceGalleryImagesInput([]);
    setServiceAvailabilitySchedule(DEFAULT_SERVICE_SCHEDULE);
    setServiceViewMode('create');
  };

  const handleOpenEditServiceView = (svc: BusinessService) => {
    setEditingService(svc);
    setServiceNameInput(svc.name);
    setServiceCategoryInput(svc.category_name || 'Haircuts & Styling');
    setServiceBusinessIdInput(svc.business_id);
    setServicePriceInput(svc.base_price.toString());
    setServiceHourlyRateInput(svc.hourly_rate ? svc.hourly_rate.toString() : svc.base_price.toString());
    setServiceDurationInput(svc.duration_minutes.toString());
    setServiceMinBillingDurationInput((svc.min_billing_duration_minutes || 30).toString());
    setServiceRoundingRuleInput(svc.rounding_rule || 'Round up to nearest 15 min');
    setServicePricingType(svc.pricing_type === 'time_based' ? 'time_based' : 'fixed');
    setServiceRequiresApprovalInput(!!svc.requires_approval);
    setServiceDescriptionInput(svc.description || '');
    setServiceImageInput(svc.photo_url || svc.thumbnail_url || '');
    setServiceGalleryImagesInput(svc.gallery_photos || []);
    if (svc.service_hours && svc.service_hours.length > 0) {
      setServiceAvailabilitySchedule(svc.service_hours);
    } else {
      setServiceAvailabilitySchedule(DEFAULT_SERVICE_SCHEDULE);
    }
    setServiceViewMode('edit');
  };

  const handleCancelServiceForm = () => {
    setServiceViewMode('list');
  };

  const handleSaveFullServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceNameInput.trim()) {
      showToast('Please enter a service name.');
      return;
    }

    const fixedPrice = parseFloat(servicePriceInput) || 25;
    const hourlyRate = parseFloat(serviceHourlyRateInput) || 50;
    const duration = parseInt(serviceDurationInput, 10) || 30;
    const minBilling = parseInt(serviceMinBillingDurationInput, 10) || 30;
    const targetBizId = serviceBusinessIdInput || selectedBusiness.id;

    const payload: Partial<BusinessService> = {
      name: serviceNameInput.trim(),
      category_name: serviceCategoryInput,
      business_id: targetBizId,
      description: serviceDescriptionInput.trim() || undefined,
      photo_url: serviceImageInput.trim() || undefined,
      thumbnail_url: serviceImageInput.trim() || undefined,
      gallery_photos: serviceGalleryImagesInput,
      pricing_type: servicePricingType,
      base_price: servicePricingType === 'fixed' ? fixedPrice : hourlyRate,
      hourly_rate: servicePricingType === 'time_based' ? hourlyRate : undefined,
      duration_minutes: duration,
      min_billing_duration_minutes: servicePricingType === 'time_based' ? minBilling : undefined,
      rounding_rule: servicePricingType === 'time_based' ? serviceRoundingRuleInput : undefined,
      requires_approval: serviceRequiresApprovalInput,
      status: editingService?.status || 'active',
      assigned_workers_count: editingService?.assigned_workers_count ?? 4,
      service_hours: serviceAvailabilitySchedule,
    };

    if (editingService) {
      updateBusinessService(editingService.id, payload);
      showToast(`Updated service "${serviceNameInput}".`);
    } else {
      addBusinessService({
        ...(payload as any),
        business_id: targetBizId,
        service_category_id: `scat-${serviceCategoryInput.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        category_name: serviceCategoryInput,
        name: serviceNameInput.trim(),
        base_price: servicePricingType === 'fixed' ? fixedPrice : hourlyRate,
        duration_minutes: duration,
        pricing_type: servicePricingType,
        requires_approval: serviceRequiresApprovalInput,
        status: 'active',
      });
      showToast(`Created new service "${serviceNameInput}".`);
    }
    setServiceViewMode('list');
  };

  // Helper to toggle weekday availability
  const handleToggleWeekdayAvailability = (dayOfWeek: number) => {
    setServiceAvailabilitySchedule((prev) => {
      const existing = prev.find((h) => h.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map((h) =>
          h.day_of_week === dayOfWeek ? { ...h, is_closed: !h.is_closed } : h
        );
      }
      return [
        ...prev,
        { day_of_week: dayOfWeek, open_time: '09:00', close_time: '17:00', is_closed: false },
      ];
    });
  };

  const handleUpdateWeekdayTime = (
    dayOfWeek: number,
    field: 'open_time' | 'close_time',
    val: string
  ) => {
    setServiceAvailabilitySchedule((prev) => {
      const existing = prev.find((h) => h.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map((h) =>
          h.day_of_week === dayOfWeek ? { ...h, [field]: val } : h
        );
      }
      return [
        ...prev,
        {
          day_of_week: dayOfWeek,
          open_time: field === 'open_time' ? val : '09:00',
          close_time: field === 'close_time' ? val : '17:00',
          is_closed: false,
        },
      ];
    });
  };

  // Legacy modal open helpers redirecting to new full-page form
  const handleOpenAddServiceModal = () => {
    handleOpenCreateServiceView();
  };

  const handleOpenEditServiceModal = (svc: BusinessService) => {
    handleOpenEditServiceView(svc);
  };

  const handleSaveServiceSubmit = (e: React.FormEvent) => {
    handleSaveFullServiceForm(e);
  };

  const handleSaveHours = () => {
    updateBusinessHours(selectedServiceBiz.id, editingScheduleHours);
    setHoursSaveSuccess(true);
    const bName = selectedServiceBiz?.coreDetails?.businessName || (selectedServiceBiz as any)?.name || 'Business';
    showToast(`Working hours updated for "${bName}".`);
    setTimeout(() => setHoursSaveSuccess(false), 3000);
  };

  const handleToggleDayClosed = (dayOfWeek: number) => {
    setEditingScheduleHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, is_closed: !h.is_closed } : h))
    );
  };

  const handleUpdateDayTime = (dayOfWeek: number, field: 'open_time' | 'close_time', val: string) => {
    setEditingScheduleHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: val } : h))
    );
  };

  const handleCopyDayToAll = (sourceDay: number) => {
    const src = editingScheduleHours.find((h) => h.day_of_week === sourceDay);
    if (!src) return;
    setEditingScheduleHours((prev) =>
      prev.map((h) => ({
        ...h,
        open_time: src.open_time,
        close_time: src.close_time,
        is_closed: src.is_closed,
      }))
    );
    showToast(`Copied ${DAY_NAMES[sourceDay]} hours to all days.`);
  };

  // Followed Businesses dataset
  const [followedBusinesses, setFollowedBusinesses] = useState([
    {
      id: 'fol-1',
      name: 'SoundStage Media Labs',
      category: 'Recording & Audio Studio',
      location: 'Los Angeles, CA',
      rating: 4.9,
      reviewsCount: 42,
      isFollowing: true,
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
      description: 'Acoustically tuned sound stages and production suites for commercial audio engineering.',
      partnershipStatus: 'Active Partner',
    },
    {
      id: 'fol-2',
      name: 'Skyline Rooftop Lounge & Pavilion',
      category: 'Event Venue & Hospitality',
      location: 'Chicago, IL',
      rating: 4.85,
      reviewsCount: 78,
      isFollowing: true,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&auto=format&fit=crop&q=80',
      description: 'Panoramic skyline event space with heated terrace, full liquor license, and catering kitchen.',
      partnershipStatus: 'Co-Host Network',
    },
    {
      id: 'fol-3',
      name: 'The Design Foundry & Cowork',
      category: 'Creative Hub & Flex Office',
      location: 'Austin, TX',
      rating: 4.95,
      reviewsCount: 115,
      isFollowing: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80',
      description: 'Maker spaces, industrial 3D print labs, and flex hot-desks for hardware and digital creators.',
      partnershipStatus: 'Vendor Affiliate',
    },
    {
      id: 'fol-4',
      name: 'Harbor View Meeting Suites',
      category: 'Corporate Meeting Spaces',
      location: 'Boston, MA',
      rating: 4.7,
      reviewsCount: 36,
      isFollowing: false,
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&fit=crop&q=80',
      description: 'Executive boardrooms equipped with enterprise video conference hardware on Boston Harbor.',
      partnershipStatus: 'Available',
    },
  ]);

  const toggleFollow = (id: string) => {
    setFollowedBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFollowing: !b.isFollowing } : b))
    );
    const target = followedBusinesses.find((b) => b.id === id);
    if (target) {
      showToast(`${target.isFollowing ? 'Unfollowed' : 'Now following'} ${target.name}`);
    }
  };

  const currentBusinessBalance = getBusinessBalance(selectedBusiness?.id || '');
  const isSelectedBizW9Certified = Boolean(
    selectedBusiness?.w9 &&
      (selectedBusiness.w9.status === 'submitted' || selectedBusiness.w9.status === 'verified')
  );
  const selectedBizBankAccount = selectedBusiness?.verification?.bankAccount;
  const isBankLinked = Boolean(
    selectedBizBankAccount?.routingNumber &&
      (selectedBizBankAccount?.accountNumberMasked || selectedBizBankAccount?.accountNumber)
  );

  const handleOpenWithdrawalModal = () => {
    // 1. Mandatory bank check: vendor must have a linked commercial bank account before requesting payout
    if (!isBankLinked) {
      setBankFormData((prev) => ({
        ...prev,
        accountHolderName:
          selectedBusiness?.coreDetails?.legalEntityName ||
          selectedBusiness?.coreDetails?.businessName ||
          prev.accountHolderName,
        bankName: selectedBizBankAccount?.bankName || prev.bankName || 'JPMorgan Chase',
        routingNumber: selectedBizBankAccount?.routingNumber || prev.routingNumber || '121000358',
      }));
      setIsLinkBankModalOpen(true);
      return;
    }

    const bal = getBusinessBalance(selectedBusiness?.id || '');
    setPayoutAmount(bal.availableBalance > 0 ? bal.availableBalance.toFixed(2) : '0.00');
    setIsPayoutModalOpen(true);
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormData.routingNumber || bankFormData.routingNumber.length !== 9) {
      showToast('Please enter a valid 9-digit Routing Number.');
      return;
    }
    if (!bankFormData.accountNumber || bankFormData.accountNumber.length < 4) {
      showToast('Please enter a valid Account Number.');
      return;
    }
    if (bankFormData.confirmAccountNumber && bankFormData.confirmAccountNumber !== bankFormData.accountNumber) {
      showToast('Account Numbers do not match.');
      return;
    }

    linkVendorBankAccount(selectedBusiness.id, {
      bankName: bankFormData.bankName || 'Commercial Bank',
      accountHolderName: bankFormData.accountHolderName || selectedBusiness?.coreDetails?.businessName || 'Business',
      routingNumber: bankFormData.routingNumber,
      accountNumber: bankFormData.accountNumber,
      accountType: bankFormData.accountType,
    });

    setIsLinkBankModalOpen(false);
    showToast(`✓ Bank account (${bankFormData.bankName}) linked successfully!`);

    const bal = getBusinessBalance(selectedBusiness.id);
    if (bal.availableBalance > 0) {
      setPayoutAmount(bal.availableBalance.toFixed(2));
      setIsPayoutModalOpen(true);
    }
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(payoutAmount.replace(/,/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      showToast('Please enter a valid withdrawal amount.');
      return;
    }
    if (parsed > currentBusinessBalance.availableBalance) {
      showToast(
        `Cannot withdraw more than available balance ($${currentBusinessBalance.availableBalance.toFixed(2)}).`
      );
      return;
    }
    const res = requestBusinessWithdrawal(selectedBusiness.id, parsed);
    if (res.success) {
      setIsPayoutModalOpen(false);
      const destBank = selectedBusiness.verification?.bankAccount?.bankName || 'Commercial Bank';
      const destAcc = selectedBusiness.verification?.bankAccount?.accountNumberMasked || '•••• 9382';
      showToast(
        `✓ Payout request for $${parsed.toFixed(2)} submitted to ${destBank} (${destAcc})! Awaiting Super Admin review.`
      );
    } else {
      if (res.error === 'BANK_NOT_LINKED') {
        setIsPayoutModalOpen(false);
        setIsLinkBankModalOpen(true);
        showToast('Please link your commercial bank account before requesting a payout.');
      } else {
        showToast(res.error || 'Failed to submit withdrawal request.');
      }
    }
  };

  const payingBiz = payingBusinessId
    ? state.businesses.find((b) => b.id === payingBusinessId)
    : selectedBusiness;

  const filteredBusinesses = vendorOwnedBusinesses.filter((b) => {
    const bName = (b.coreDetails?.businessName || (b as any).businessName || (b as any).name || '').toLowerCase();
    const bCity = (b.coreDetails?.city || (b as any).city || '').toLowerCase();
    const bCat = (b.coreDetails?.category || (b as any).category || '').toLowerCase();
    const q = businessSearchFilter.toLowerCase();
    const matchesSearch = bName.includes(q) || bCity.includes(q) || bCat.includes(q);
    const matchesStatus =
      businessStatusFilter === 'All' || b.status === businessStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMyBusinesses = myBusinessesList.filter((b) => {
    const query = myBusinessesSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.name.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.city.toLowerCase().includes(query);
    const matchesStatus =
      myBusinessesStatusFilter === 'All Statuses' || b.status === myBusinessesStatusFilter;
    const matchesCategory =
      categoryFilter === 'All' || b.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // If in wizard mode, render the BusinessWizard component
  if (state.vendorView === 'wizard') {
    return (
      <div className="h-full w-full overflow-y-auto overscroll-contain">
        <BusinessWizard />
      </div>
    );
  }

  return (
    <div id="business-portal-container" className="h-full w-full bg-[#F8FAFC] flex text-slate-900 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Charcoal Theme matching Image 2)                    */}
      {/* ========================================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#0A0E17] text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-200 border-r border-slate-800/80 z-30 h-full overflow-hidden select-none`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0 overscroll-contain scrollbar-none">
          {/* Brand Logo Header */}
          <div
            className={`border-b border-slate-800/80 transition-all ${
              isSidebarCollapsed
                ? 'py-3.5 px-2 flex flex-col items-center gap-2.5'
                : 'p-5 flex items-center justify-between'
            }`}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'} overflow-hidden`}>
              <div
                onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
                className={`w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs transition-colors ${
                  isSidebarCollapsed ? 'cursor-pointer hover:bg-blue-500' : ''
                }`}
                title={isSidebarCollapsed ? 'Click to expand sidebar' : 'UrSpot'}
              >
                U
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div className="flex items-center">
                    <span className="text-white font-extrabold text-base tracking-tight font-sans">Ur</span>
                    <span className="text-blue-500 font-extrabold text-base tracking-tight font-sans">SPOT</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-0.5">
                    BUSINESS PORTAL
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-7 h-7 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-xs shrink-0"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {/* 1. Dashboard */}
            <button
              id="sidebar-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Dashboard' : undefined}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* 2. Businesses (Dropdown with 3 sub-options) */}
            <div>
              <button
                id="sidebar-tab-businesses-toggle"
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    setIsBusinessesMenuOpen(true);
                  } else {
                    setIsBusinessesMenuOpen(!isBusinessesMenuOpen);
                  }
                  if (activeTab !== 'my-businesses' && activeTab !== 'business-details' && activeTab !== 'followed-businesses') {
                    setActiveTab('my-businesses');
                  }
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-businesses' ||
                  activeTab === 'business-details' ||
                  activeTab === 'followed-businesses'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={isSidebarCollapsed ? (showVendorKycNotice ? 'Businesses (KYC In Review)' : 'Businesses') : undefined}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className="relative flex items-center justify-center">
                    <Building2 className="w-4 h-4 shrink-0" />
                    {isSidebarCollapsed && showVendorKycNotice && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && <span>Businesses</span>}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {showVendorKycNotice && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        In Review
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isBusinessesMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Sub-options: "My Businesses", "Business Details", "followed businesses" */}
              {isBusinessesMenuOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-my-businesses"
                    onClick={() => {
                      setActiveTab('my-businesses');
                      setMultistepMode(null);
                      setViewingBusinessId(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'my-businesses' && !viewingBusinessId
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>My Businesses</span>
                  </button>

                  <button
                    id="sidebar-subtab-business-details"
                    onClick={() => {
                      setActiveTab('business-details');
                      setMultistepMode(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'business-details' || (activeTab === 'my-businesses' && Boolean(viewingBusinessId))
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Business Details</span>
                  </button>

                  <button
                    id="sidebar-subtab-followed-businesses"
                    onClick={() => setActiveTab('followed-businesses')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'followed-businesses'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>followed businesses</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Bookings (Dropdown with 2 sub-menus: "Booking Management" and "Advanced Booking Workflow") */}
            <div>
              <button
                id="sidebar-tab-bookings-toggle"
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    setIsBookingsMenuOpen(true);
                  } else {
                    setIsBookingsMenuOpen(!isBookingsMenuOpen);
                  }
                  if (
                    activeTab !== 'bookings' &&
                    activeTab !== 'booking-management' &&
                    activeTab !== 'advanced-booking-workflow'
                  ) {
                    setActiveTab('booking-management');
                  }
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookings' ||
                  activeTab === 'booking-management' ||
                  activeTab === 'advanced-booking-workflow'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={isSidebarCollapsed ? (unreadVendorBookingsCount > 0 ? `Bookings (${unreadVendorBookingsCount} Pending)` : 'Bookings') : undefined}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className="relative flex items-center justify-center">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {isSidebarCollapsed && unreadVendorBookingsCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 text-[8px] font-black text-white items-center justify-center">
                          {unreadVendorBookingsCount > 9 ? '9+' : unreadVendorBookingsCount}
                        </span>
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && <span>Bookings</span>}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {unreadVendorBookingsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white shadow-2xs">
                        {unreadVendorBookingsCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isBookingsMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Sub-options: "Booking Management" and "Advanced Booking Workflow" */}
              {isBookingsMenuOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-booking-management"
                    onClick={() => setActiveTab('booking-management')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'booking-management' || activeTab === 'bookings'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span>Booking Management</span>
                    </div>
                    {unreadVendorBookingsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {unreadVendorBookingsCount}
                      </span>
                    )}
                  </button>

                  <button
                    id="sidebar-subtab-advanced-booking-workflow"
                    onClick={() => setActiveTab('advanced-booking-workflow')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'advanced-booking-workflow'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Advanced Booking Workflow</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. My Services (Dropdown with sub-option "Service Availability") */}
            <div>
              <button
                id="sidebar-tab-my-services-toggle"
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    setIsMyServicesMenuOpen(true);
                  } else {
                    setIsMyServicesMenuOpen(!isMyServicesMenuOpen);
                  }
                  if (activeTab !== 'my-services' && activeTab !== 'service-availability') {
                    setActiveTab('my-services');
                  }
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-services' || activeTab === 'service-availability'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={isSidebarCollapsed ? 'My Services' : undefined}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Layers className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>My Services</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isMyServicesMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-options: "Services Catalog" and "Service Availability" */}
              {isMyServicesMenuOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-my-services"
                    onClick={() => setActiveTab('my-services')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'my-services'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'my-services' ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                    <span>Services Catalog</span>
                  </button>

                  <button
                    id="sidebar-subtab-service-availability"
                    onClick={() => setActiveTab('service-availability')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'service-availability'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'service-availability' ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                    <span>Service Availability</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Workers */}
            <button
              onClick={() => setActiveTab('workers')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Workers' : undefined}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Workers</span>}
            </button>

            {/* 7. Payouts */}
            <button
              id="sidebar-tab-payouts"
              onClick={() => setActiveTab('payouts')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'payouts'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? (unreadVendorPayoutsCount > 0 ? `Payouts (${unreadVendorPayoutsCount} Pending Payouts)` : 'Payouts') : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative flex items-center justify-center">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  {isSidebarCollapsed && (
                    unreadVendorPayoutsCount > 0 ? (
                      <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 text-[8px] font-black text-slate-950 items-center justify-center">
                          {unreadVendorPayoutsCount > 9 ? '9+' : unreadVendorPayoutsCount}
                        </span>
                      </span>
                    ) : showVendorBankNotice ? (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                    ) : null
                  )}
                </div>
                {!isSidebarCollapsed && <span>Payouts</span>}
              </div>
              {!isSidebarCollapsed && (
                unreadVendorPayoutsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    {unreadVendorPayoutsCount} Pending
                  </span>
                ) : showVendorBankNotice ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Link Bank
                  </span>
                ) : null
              )}
            </button>

            {/* W-9 Tax Certification */}
            <button
              id="sidebar-tab-w9-form"
              onClick={() => setActiveTab('w9-form')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'w9-form'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? (isVendorW9Certified ? 'W-9 Form (Certified)' : showVendorW9Alert ? 'W-9 Form (Action Required - 24% Backup Withholding)' : 'W-9 Form') : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4 shrink-0" />
                  {isSidebarCollapsed && (
                    showVendorW9Alert ? (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    ) : isVendorW9Certified ? (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    ) : null
                  )}
                </div>
                {!isSidebarCollapsed && <span>W-9 Tax Form</span>}
              </div>
              {!isSidebarCollapsed && (
                isVendorW9Certified ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Certified
                  </span>
                ) : showVendorW9Alert ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    24% Tax Alert
                  </span>
                ) : null
              )}
            </button>

            {/* 8. Customers */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Customers' : undefined}
            >
              <UsersRound className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Customers</span>}
            </button>

            {/* 9. Reviews */}
            <button
              id="sidebar-tab-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? (unreadVendorReviewsCount > 0 ? `Reviews (${unreadVendorReviewsCount} New)` : 'Reviews') : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {isSidebarCollapsed && unreadVendorReviewsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600 text-[8px] font-black text-white items-center justify-center">
                        {unreadVendorReviewsCount > 9 ? '9+' : unreadVendorReviewsCount}
                      </span>
                    </span>
                  )}
                </div>
                {!isSidebarCollapsed && <span>Reviews</span>}
              </div>
              {!isSidebarCollapsed && unreadVendorReviewsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadVendorReviewsCount} New
                </span>
              )}
            </button>

            {/* 10. Subscriptions */}
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Subscriptions' : undefined}
            >
              <BadgeCheck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Subscriptions</span>}
            </button>

            {/* 11. Account */}
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Account' : undefined}
            >
              <User className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Account</span>}
            </button>

            {/* 12. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 shrink-0 bg-[#0A0E17]">
          {/* + Create Payout Request Button */}
          {!isSidebarCollapsed ? (
            <button
              id="sidebar-create-payout-btn"
              onClick={handleOpenWithdrawalModal}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold py-2.5 px-3 rounded-full transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Payout Request</span>
            </button>
          ) : (
            <button
              onClick={handleOpenWithdrawalModal}
              className="w-10 h-10 mx-auto rounded-full bg-white text-slate-900 flex items-center justify-center font-bold cursor-pointer hover:bg-slate-100 transition-colors"
              title="Create Payout Request"
            >
              +
            </button>
          )}

          {/* Help Center */}
          <button
            onClick={() => showToast('Connecting to 24/7 Merchant Support Help Center...')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer`}
            title={isSidebarCollapsed ? 'Help Center' : undefined}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Help Center</span>}
          </button>

          {/* Logout */}
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer`}
            title={isSidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW CONTAINER (Navbar + Dynamic Active Tab Content)              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overscroll-contain">
        {/* Top Header Bar matching Image 1 & 2 */}
        <header className={`bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 ${isProfileMenuOpen || isNotificationsOpen ? 'z-50' : 'z-20'} shadow-2xs`}>
          {/* Left: Breadcrumbs / Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-900 text-sm">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'w9-form' && 'W9 Form'}
              {activeTab === 'my-businesses' && 'Businesses'}
              {activeTab === 'business-details' && 'Businesses'}
              {activeTab === 'followed-businesses' && 'Businesses'}
              {(activeTab === 'bookings' || activeTab === 'booking-management' || activeTab === 'advanced-booking-workflow') && 'Bookings'}
              {(activeTab === 'my-services' || activeTab === 'service-availability') && 'My Services'}
              {activeTab === 'workers' && 'Workers'}
              {activeTab === 'payouts' && 'Payouts'}
              {activeTab === 'customers' && 'Customers'}
              {activeTab === 'reviews' && 'Reviews'}
              {activeTab === 'subscriptions' && 'Subscriptions'}
              {activeTab === 'account' && 'Account'}
              {activeTab === 'settings' && 'Settings'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              {activeTab === 'dashboard' && 'Overview / Merchant Profile'}
              {activeTab === 'w9-form' && 'Account / W9 Tax Form'}
              {activeTab === 'my-businesses' && 'My Businesses'}
              {activeTab === 'business-details' && 'Business Details'}
              {activeTab === 'followed-businesses' && 'Followed Businesses'}
              {activeTab === 'booking-management' && 'Booking Management'}
              {activeTab === 'advanced-booking-workflow' && 'Advanced Booking Workflow'}
              {activeTab === 'bookings' && 'Booking Management'}
              {(activeTab === 'my-services' || activeTab === 'service-availability') && 'Service Availability'}
              {activeTab === 'workers' && 'Workers & On-site Specialists'}
              {activeTab === 'payouts' && 'Disbursements & Invoicing'}
              {activeTab === 'customers' && 'Client Directory'}
              {activeTab === 'reviews' && 'Customer Ratings'}
              {activeTab === 'subscriptions' && 'Plan Tier & Invoicing'}
              {activeTab === 'account' && 'Merchant Profile'}
              {activeTab === 'settings' && 'System Preferences'}
            </span>
          </div>


          {/* Center: Search Bar matching Image 1 & 2 */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search businesses, vendors, or invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Right: Notifications, App Launcher Grid, User Profile Badge */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                id="portal-notif-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute top-2 right-2" />
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsNotificationsOpen(false)}
                    onPointerDown={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold text-sm">Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {unreadNotificationCount} unread
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5 divide-y divide-slate-100">
                    {allNotifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        <Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        <p className="text-xs">No notifications yet</p>
                      </div>
                    ) : (
                      allNotifications.map((notif) => {
                        const isKycReject =
                          notif.type === 'warning' ||
                          (notif.message && notif.message.toLowerCase().includes('reject'));
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.businessId) {
                                const target =
                                  myBusinessesList.find((b) => b.id === notif.businessId) ||
                                  state.businesses.find((b) => b.id === notif.businessId);
                                if (target) {
                                  setActiveTab('my-businesses');
                                  handleOpenEditMultiStep(target, 'verification');
                                  setIsNotificationsOpen(false);
                                }
                              }
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isKycReject
                                ? 'bg-rose-50/90 border-rose-200 hover:bg-rose-100/80 text-rose-950'
                                : notif.read
                                ? 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100/60'
                                : 'bg-blue-50/70 border-blue-100 text-slate-900 hover:bg-blue-100/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                                {isKycReject ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                ) : (
                                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                                <span className={isKycReject ? 'text-rose-900' : 'text-slate-900'}>
                                  {isKycReject ? 'KYC Action Required' : 'Notification'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {notif.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] mt-1 leading-snug font-medium">
                              {notif.message}
                            </p>
                            {isKycReject && notif.businessId && (
                              <div className="mt-2 flex items-center justify-between pt-1 border-t border-rose-200/60 text-[11px]">
                                <span className="text-[10px] text-rose-700 font-semibold">
                                  Click to review & fix verification
                                </span>
                                <span className="font-bold text-rose-800 flex items-center gap-0.5 underline">
                                  <span>Fix KYC</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
            </div>

            {/* App Grid Launcher */}
            <button
              onClick={() => showToast('USPOT Suite: Marketplace, Payouts, Dispatch, KYC Verification.')}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="USPOT Suite Launcher"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Profile User Chip matching Image 1 & 2 */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="portal-user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-xs text-slate-900 leading-tight">
                    {currentUser?.fullName || 'Alex Vance'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">
                    {currentUser?.role || 'business'}
                  </p>
                </div>
                {/* Silhouette avatar circle */}
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentUser?.avatarInitials || 'A'}
                </div>
              </button>

              {/* Role Switcher & Profile Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileMenuOpen(false)}
                    onPointerDown={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                  <div className="pb-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{currentUser?.fullName || 'Alex Vance'}</p>
                        <p className="text-slate-400 text-[11px]">{currentUser?.email || 'alex.vance@uspot.com'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                        {currentUser?.roleLabel || currentUser?.role || 'business'}
                      </span>
                    </div>
                  </div>

                  {/* Switch Demo Role */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                      Switch Demo User Account
                    </span>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                      {users.map((u) => {
                        const isCurrent = u.id === currentUser?.id;
                        const userBiz = state.businesses.find(
                          (b) =>
                            (b.userId && b.userId === u.id) ||
                            (b.email && u.email && b.email.toLowerCase() === u.email.toLowerCase())
                        );
                        const isNmiActive = userBiz?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE';

                        return (
                          <button
                            key={u.id}
                            id={`profile-switch-user-${u.id}`}
                            onClick={() => {
                              loginAsUser(u.id);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-100 font-bold text-slate-900 ring-1 ring-slate-300'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCurrent
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {u.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold truncate">{u.fullName}</span>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {u.roleLabel || u.role}
                                  </span>
                                </div>
                                {userBiz && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-[140px]">
                                      {userBiz.coreDetails?.businessName || (userBiz as any)?.name || 'Business'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                        isNmiActive
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}
                                    >
                                      {isNmiActive ? 'NMI Active' : 'NMI Skipped'}
                                    </span>
                                  </div>
                                )}
                                <span className="text-[10px] text-slate-400 font-mono block truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                            {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-1">
          {/* =================================================================== */}
          {/* VIEW 1: DASHBOARD (Exact pixel-perfect match to Image 1)            */}
          {/* =================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-150 space-y-6">
              {/* KYC Rejection Attention Banner */}
              {myBusinessesList.some((b) => b.isKycRejected) && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
                        <span>KYC Verification Action Required</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-200/80 text-rose-900">
                          {myBusinessesList.filter((b) => b.isKycRejected).length} Rejected
                        </span>
                      </h2>
                      <p className="text-xs text-rose-800 mt-1">
                        Super Admin reviewed and rejected the KYC verification for your business submission.
                        Please review the feedback reason below and update your documents to resubmit.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-rose-200/60">
                    {myBusinessesList
                      .filter((b) => b.isKycRejected)
                      .map((biz) => (
                        <div
                          key={biz.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-rose-200/80 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {biz.name}
                              </span>
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-rose-200">
                                REJECTED
                              </span>
                            </div>
                            <p className="text-xs text-rose-700 mt-1">
                              <span className="font-bold text-rose-900">Reason:</span> "{biz.rejectionReason || 'Please review compliance documents and update details.'}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('my-businesses');
                              handleOpenEditMultiStep(biz, 'verification');
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Fix KYC Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Primary Profile Card matching Image 1 */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 md:p-10 space-y-8">
                {/* Header: Large circular "A" avatar + "Welcome, Alex Vance!" */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center font-bold text-3xl shrink-0 shadow-md">
                    {currentUser?.avatarInitials || 'A'}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      Welcome, {currentUser?.fullName || 'Alex Vance'}!
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {currentUser?.email || 'alex.vance@uspot.com'}
                    </p>
                  </div>
                </div>

                {/* 4 Clean Rounded Info Tiles (2x2 Grid) matching Image 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tile 1: ROLE */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      ROLE
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {currentUser?.role || 'business'}
                    </span>
                  </div>

                  {/* Tile 2: STATUS */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      STATUS
                    </span>
                    <span className="text-base font-bold text-slate-900 lowercase">
                      {currentUser?.status || 'active'}
                    </span>
                  </div>

                  {/* Tile 3: USERNAME */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      USERNAME
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {currentUser?.username || 'alexvance_biz'}
                    </span>
                  </div>

                  {/* Tile 4: PHONE */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      PHONE
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {currentUser?.phone || '+1 (555) 234-5678'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert Banner if NMI Setup is required or active */}
              {selectedBusiness && (
                selectedBusiness.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE' ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">Payment Account Connected</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Direct NMI Gateway: <span className="font-mono font-bold text-slate-800">{selectedBusiness.nmiPaymentAccount.nmiGatewayId}</span> • Automated ACH balance disbursements are active.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btn-update-nmi-account"
                      onClick={() => {
                        setProceedToWithdrawAfterNmi(false);
                        setIsNmiSetupModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      Account Details
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">Payment Account Setup Required</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            {selectedBusiness.nmiPaymentAccount?.nmiOnboardingStatus || 'SKIPPED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Set up your NMI merchant sub-account to receive direct ACH payouts. Withdrawals remain locked until connected.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btn-complete-dashboard-nmi"
                      onClick={() => {
                        setProceedToWithdrawAfterNmi(false);
                        setIsNmiSetupModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>Complete Setup</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              )}

              {/* Quick Navigation Cards (4 Grid Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: W9 Tax Form CTA */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">W-9 Tax Form</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tax certification status:{' '}
                      <strong className="text-amber-600 font-semibold">
                        {selectedBusiness?.w9?.status || 'Pending'}
                      </strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('w9-form')}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open W-9 Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card 2: NMI Payout Account */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs border ${
                        selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-amber-50 border-amber-200 text-amber-600'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus || 'SKIPPED'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Payout Account</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE' ? (
                        <>NMI Sub-Account <strong className="font-mono text-slate-800">{selectedBusiness.nmiPaymentAccount.nmiGatewayId}</strong> connected.</>
                      ) : (
                        <>Direct settlement via NMI. Setup required for withdrawals.</>
                      )}
                    </p>
                  </div>
                  <button
                    id="btn-card-payout-setup"
                    onClick={() => {
                      setProceedToWithdrawAfterNmi(false);
                      setIsNmiSetupModalOpen(true);
                    }}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE' ? 'Manage Account' : 'Set Up Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card 3: Manage My Businesses */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3 shadow-2xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Businesses</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong className="text-slate-900 font-semibold">{vendorOwnedBusinesses.length} commercial venue(s)</strong> active on the marketplace.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('my-businesses')}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Venues</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card 4: Payout Balance */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      {currentBusinessBalance.pendingWithdrawal > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          ${currentBusinessBalance.pendingWithdrawal.toFixed(2)} pending
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Available Balance</h3>
                    <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                      ${currentBusinessBalance.availableBalance.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                      Bank: ••••{selectedBusiness?.nmiPaymentAccount?.bankAccountNumber ? selectedBusiness.nmiPaymentAccount.bankAccountNumber.slice(-4) : (selectedBusiness.verification?.bankAccount?.accountNumberMasked?.slice(-4) || '9382')}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenWithdrawalModal}
                    className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Withdraw Funds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW: W9 TAX CERTIFICATION (Production IRS W-9 with eKYC Prefill)   */}
          {/* =================================================================== */}
          {activeTab === 'w9-form' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150 pb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  id="btn-back-to-my-businesses"
                  onClick={() => setActiveTab('my-businesses')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Back to My Businesses</span>
                </button>

                {/* Business Selector Dropdown */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Managing Business:</span>
                  <select
                    id="select-w9-business"
                    value={selectedBusiness.id}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    {vendorOwnedBusinesses.map((biz) => {
                      const isW9Done = Boolean(biz.w9 && (biz.w9.status === 'submitted' || biz.w9.status === 'verified'));
                      const bName = biz.coreDetails?.businessName || (biz as any).name || 'Business';
                      return (
                        <option key={biz.id} value={biz.id}>
                          {bName} {isW9Done ? '(✓ W-9 Certified: 0% Tax)' : '(⚠️ W-9 Missing: 24% Tax)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <W9TaxCertification
                business={selectedBusiness}
                onSaveDraft={(w9Data) => {
                  saveW9Data(selectedBusiness.id, w9Data);
                  showToast('W-9 draft saved successfully.');
                }}
                onSubmitW9={async (w9Data) => {
                  await submitW9Data(selectedBusiness.id, w9Data);
                  showToast('W-9 tax certification submitted and certified successfully!');
                }}
                onResetW9={resetW9Data}
                onNavigateToEkyc={() => {
                  const biz = selectedBusiness;
                  if (biz) {
                    handleOpenEditMultiStep(
                      {
                        id: biz.id,
                        name: biz.coreDetails?.businessName || (biz as any).name || 'Business',
                        category: biz.coreDetails?.category || (biz as any).category || 'Coworking & Office',
                        city: biz.coreDetails?.city || (biz as any).city || 'San Francisco',
                      },
                      'verification'
                    );
                  }
                }}
                onPlanSelectSuccess={async (plan, amount) => {
                  await processPayment(selectedBusiness.id, plan, amount);
                  showToast(`Plan "${plan}" activated successfully! Step 3 (W-9) is unlocked.`);
                }}
              />
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 3A: BUSINESSES -> MY BUSINESSES (2 View Options: Table & Grid) */}
          {/* =================================================================== */}
          {activeTab === 'my-businesses' && (
            multistepMode ? (
              <BusinessMultiStepPage
                key={`${multistepInitialData?.id || multistepMode}-${multistepInitialTab}`}
                isEditMode={multistepMode === 'edit'}
                initialData={multistepInitialData}
                initialTab={multistepInitialTab}
                onSave={handleSaveMultiStepBusiness}
                onDiscard={() => setMultistepMode(null)}
                onNavigateToPayment={(bizId) => {
                  setMultistepMode(null);
                  handleOpenPaymentForBusiness(bizId);
                }}
              />
            ) : viewingBusinessId ? (
              <BusinessDetailsView
                business={state.businesses.find((b) => b.id === viewingBusinessId) || selectedBusiness}
                onBack={() => setViewingBusinessId(null)}
                onOpenW9={() => {
                  const target = state.businesses.find((b) => b.id === viewingBusinessId) || selectedBusiness;
                  setSelectedBusinessId(target.id);
                  setActiveTab('w9-form');
                }}
                onEdit={() => {
                  const target = state.businesses.find((b) => b.id === viewingBusinessId) || selectedBusiness;
                  handleOpenEditMultiStep(target);
                }}
              />
            ) : (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Header matching Image 1 & Image 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Businesses</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Manage and monitor your multi-location business ecosystem.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                  <button
                    id="create-new-business-btn"
                    onClick={() => {
                      setMultistepInitialData(undefined);
                      setMultistepMode('create');
                    }}
                    className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Business</span>
                  </button>
                </div>
              </div>

              {/* Controls Bar matching Image 1 & Image 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Left: Filter Button and Show Dropdown */}
                <div className="flex items-center gap-3">
                  <button
                    id="filter-toggle-btn"
                    onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                      isFilterDrawerOpen || categoryFilter !== 'All'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {categoryFilter !== 'All' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>

                  <div className="h-4 w-px bg-slate-200" />

                  <div className="flex items-center gap-2 relative">
                    <span className="text-xs text-slate-500 font-medium">Show:</span>
                    <div className="relative">
                      <button
                        id="status-filter-dropdown-btn"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{myBusinessesStatusFilter}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 text-xs">
                          {(['All Statuses', 'Active', 'Pending', 'Inactive'] as const).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  setMyBusinessesStatusFilter(st);
                                  setIsStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                  myBusinessesStatusFilter === st
                                    ? 'font-bold text-slate-900 bg-slate-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>{st}</span>
                                {myBusinessesStatusFilter === st && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Viewing count and View Mode Switcher */}
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  <span className="text-xs text-slate-500 font-medium">
                    Viewing 1-{filteredMyBusinesses.length} of {myBusinessesList.length} businesses
                  </span>

                  {/* Segmented View Mode Toggle */}
                  <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white shadow-2xs">
                    {/* Grid View Option */}
                    <button
                      id="view-mode-grid-btn"
                      title="Grid View"
                      onClick={() => setBusinessesViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        businessesViewMode === 'grid'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>

                    {/* Table / List View Option */}
                    <button
                      id="view-mode-table-btn"
                      title="Table View"
                      onClick={() => setBusinessesViewMode('table')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        businessesViewMode === 'table'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Filter Options drawer */}
              {isFilterDrawerOpen && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Filter by Category
                    </span>
                    <button
                      onClick={() => {
                        setCategoryFilter('All');
                        setMyBusinessesStatusFilter('All Statuses');
                        setMyBusinessesSearch('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Beverages', 'IT', 'Design', 'Supply Chain'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Bar matching Image 1 & Image 2 */}
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={myBusinessesSearch}
                  onChange={(e) => setMyBusinessesSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              {/* VIEW OPTION 1: Table / List View matching Image 1 */}
              {businessesViewMode === 'table' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-3.5 px-6 font-bold">BUSINESS NAME</th>
                          <th className="py-3.5 px-6 font-bold">CATEGORY</th>
                          <th className="py-3.5 px-6 font-bold">CITY</th>
                          <th className="py-3.5 px-6 font-bold">STATUS</th>
                          <th className="py-3.5 px-6 font-bold">SERVICES</th>
                          <th className="py-3.5 px-6 font-bold">WORKERS</th>
                          <th className="py-3.5 px-6 font-bold">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredMyBusinesses.map((biz) => (
                          <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Business Name with square letter avatar */}
                            <td className="py-4 px-6">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shrink-0 mt-0.5">
                                  {biz.avatarChar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {biz.name}
                                    </span>
                                    {biz.isKycRejected && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                        <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                        <span>REJECTED</span>
                                      </span>
                                    )}
                                  </div>
                                  {biz.isKycRejected && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-700 bg-rose-50/90 px-2 py-0.5 rounded-md border border-rose-200/60 max-w-sm">
                                      <span className="font-bold shrink-0">Reason:</span>
                                      <span className="truncate italic">"{biz.rejectionReason || 'Requires compliance document update'}"</span>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditMultiStep(biz, 'verification')}
                                        className="text-rose-800 hover:text-rose-950 font-bold underline cursor-pointer shrink-0 ml-1"
                                      >
                                        Fix KYC
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-6 text-slate-600 font-medium">
                              {biz.category}
                            </td>

                            {/* City */}
                            <td className="py-4 px-6 text-slate-600 font-medium">{biz.city}</td>

                            {/* Status Pill */}
                            <td className="py-4 px-6">
                              {biz.isKycRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                  <span>KYC Rejected</span>
                                </span>
                              ) : biz.isAwaitingPayment ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span>KYC Approved</span>
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    biz.status === 'Active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                      : biz.status === 'Pending'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      biz.status === 'Active'
                                        ? 'bg-emerald-500'
                                        : biz.status === 'Pending'
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                  />
                                  <span>{biz.status}</span>
                                </span>
                              )}
                            </td>

                            {/* Services */}
                            <td className="py-4 px-6 font-semibold text-slate-800">
                              {biz.services}
                            </td>

                            {/* Workers */}
                            <td className="py-4 px-6 font-semibold text-slate-800">
                              {biz.workers}
                            </td>

                            {/* Actions (Eye, Pencil, Trash2, Toggle Switch OR Eye + Pay Now) */}
                            <td className="py-4 px-6">
                              {!biz.payment?.paidAt ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    id={`view-biz-btn-${biz.id}`}
                                    onClick={() => {
                                      setSelectedBusinessId(biz.id);
                                      setViewingBusinessId(biz.id);
                                    }}
                                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`pay-now-btn-${biz.id}`}
                                    onClick={() => handleOpenPaymentForBusiness(biz.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                                      biz.isAwaitingPayment
                                        ? 'bg-black text-white hover:bg-slate-800'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                    title={biz.isAwaitingPayment ? 'Pay Now to activate your business' : 'Select Subscription Plan & Pay'}
                                  >
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{biz.isAwaitingPayment ? 'Pay Now' : 'Select Plan'}</span>
                                  </button>
                                  <button
                                    id={`edit-biz-btn-${biz.id}`}
                                    onClick={() => {
                                      const fullBiz = state.businesses.find((b) => b.id === biz.id);
                                      if (fullBiz) {
                                        handleOpenEditMultiStep(fullBiz);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
                                    title="Edit Business"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`delete-biz-btn-${biz.id}`}
                                    onClick={() => handleDeleteBusiness(biz.id)}
                                    className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-rose-50"
                                    title="Delete Business"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    id={`view-biz-btn-${biz.id}`}
                                    onClick={() => {
                                      setSelectedBusinessId(biz.id);
                                      setViewingBusinessId(biz.id);
                                    }}
                                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditMultiStep(biz)}
                                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="Edit Business"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBusiness(biz.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                    title="Delete Business"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                  {/* Interactive Toggle Switch - Super Admin Only */}
                                  {currentUser?.role === 'super_admin' && (
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={biz.isActive}
                                      onClick={() => toggleBusinessActive(biz.id)}
                                      title={
                                        biz.isActive
                                          ? 'Active - click to pause'
                                          : 'Inactive - click to activate'
                                      }
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        biz.isActive ? 'bg-black' : 'bg-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                          biz.isActive ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW OPTION 2: Grid / Card View matching Image 2 */}
              {businessesViewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredMyBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between hover:shadow-sm transition-all"
                    >
                      <div>
                        {/* Top Row: Avatar, Name & Category, Status Pill */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0">
                              {biz.avatarChar}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {biz.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {biz.category}
                              </p>
                            </div>
                          </div>

                          {/* Status Pill */}
                          {biz.isKycRejected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              <span>KYC Rejected</span>
                            </span>
                          ) : biz.isAwaitingPayment ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>KYC Approved</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                                biz.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : biz.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  biz.status === 'Active'
                                    ? 'bg-emerald-500'
                                    : biz.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              <span>{biz.status}</span>
                            </span>
                          )}
                        </div>

                        {/* Rejection Alert Box if KYC Rejected */}
                        {biz.isKycRejected && (
                          <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl text-left space-y-1">
                            <div className="flex items-center justify-between text-rose-950 font-bold text-[11px]">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Verification Action Required</span>
                              </span>
                              {biz.rejectionCount > 0 && (
                                <span className="text-[10px] bg-rose-200/70 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                                  #{biz.rejectionCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-rose-800 font-medium line-clamp-2">
                              "{biz.rejectionReason || 'Please review compliance documents and update details.'}"
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenEditMultiStep(biz, 'verification')}
                              className="text-[11px] font-bold text-rose-800 hover:text-rose-950 underline flex items-center gap-1 cursor-pointer pt-0.5"
                            >
                              <span>Fix KYC Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Middle Metrics Row: 3 columns in tinted container */}
                        <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-2.5 my-3.5 grid grid-cols-3 text-center divide-x divide-slate-200/60">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{biz.services}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Services</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{biz.workers}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Workers</p>
                          </div>
                          <div className="px-1 overflow-hidden">
                            <p className="font-bold text-slate-900 text-xs truncate" title={biz.city}>
                              {biz.city}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">City</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Actions (Eye + Pay Now OR Eye, Pencil, Trash & Toggle Switch) */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        {!biz.payment?.paidAt ? (
                          <div className="flex items-center justify-between w-full">
                            <button
                              id={`grid-view-biz-btn-${biz.id}`}
                              onClick={() => {
                                setSelectedBusinessId(biz.id);
                                setViewingBusinessId(biz.id);
                              }}
                              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              id={`grid-pay-now-btn-${biz.id}`}
                              onClick={() => handleOpenPaymentForBusiness(biz.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                                biz.isAwaitingPayment
                                  ? 'bg-black text-white hover:bg-slate-800'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                              title={biz.isAwaitingPayment ? 'Pay Now to activate your business' : 'Select Subscription Plan & Pay'}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{biz.isAwaitingPayment ? 'Pay Now' : 'Select Plan'}</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5">
                              <button
                                id={`grid-view-biz-btn-${biz.id}`}
                                onClick={() => {
                                  setSelectedBusinessId(biz.id);
                                  setViewingBusinessId(biz.id);
                                }}
                                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditMultiStep(biz)}
                                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Edit Business"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBusiness(biz.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Business"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Toggle Switch - Super Admin Only */}
                            {currentUser?.role === 'super_admin' && (
                              <button
                                type="button"
                                role="switch"
                                aria-checked={biz.isActive}
                                onClick={() => toggleBusinessActive(biz.id)}
                                title={
                                  biz.isActive
                                    ? 'Active - click to deactivate'
                                    : 'Inactive - click to activate'
                                }
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  biz.isActive ? 'bg-black' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                    biz.isActive ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when no businesses match */}
              {filteredMyBusinesses.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-xs text-slate-700">No businesses found</p>
                  <p className="text-[11px] text-slate-400">
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={() => {
                      setMyBusinessesSearch('');
                      setMyBusinessesStatusFilter('All Statuses');
                      setCategoryFilter('All');
                    }}
                    className="text-xs text-slate-900 font-bold underline mt-2 inline-block cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Bottom 3 Feature Cards matching Image 1 & Image 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* Card 1: Growth Metric */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-3">Growth Metric</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Your businesses have seen a{' '}
                      <strong className="text-emerald-600 font-bold">14%</strong> increase in
                      service bookings compared to last month.
                    </p>
                  </div>
                </div>

                {/* Card 2: New: Enterprise Insights */}
                <div className="bg-[#0F172A] rounded-2xl text-white p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="relative z-10">
                    <h3 className="font-bold text-sm text-white">New: Enterprise Insights</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Get detailed analytics for all your branches in a single unified view.
                    </p>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="text-xs font-bold text-white underline hover:text-slate-200 cursor-pointer inline-block mt-4 transition-colors"
                    >
                      Explore Dashboard
                    </button>
                  </div>
                  {/* Subtle decorative circular accent */}
                  <div className="w-24 h-24 rounded-full bg-slate-800/40 absolute -bottom-6 -right-6 pointer-events-none" />
                </div>

                {/* Card 3: Support Desk */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-3">Support Desk</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Need help managing your locations?
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="mt-4 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer self-start shadow-2xs"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
            )
          )}          {/* =================================================================== */}
          {/* VIEW 3B: BUSINESSES -> BUSINESS DETAILS                             */}
          {/* =================================================================== */}
          {activeTab === 'business-details' && (
            <BusinessDetailsView
              business={selectedBusiness}
              onBack={() => {
                setActiveTab('my-businesses');
                setViewingBusinessId(null);
              }}
              onOpenW9={() => setActiveTab('w9-form')}
              onEdit={() => handleOpenEditMultiStep(selectedBusiness)}
            />
          )}

          {/* =================================================================== */}
          {/* VIEW 3C: BUSINESSES -> FOLLOWED BUSINESSES                          */}
          {/* =================================================================== */}
          {activeTab === 'followed-businesses' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Followed Businesses</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Partner venues, affiliated studios, and collaborative service providers in your merchant network.
                </p>
              </div>

              {/* Grid of Followed Businesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {followedBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                        <img
                          src={biz.image}
                          alt={biz.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => toggleFollow(biz.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                              biz.isFollowing
                                ? 'bg-black text-white hover:bg-slate-800'
                                : 'bg-white/95 text-slate-900 hover:bg-white'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                biz.isFollowing ? 'fill-red-500 text-red-500' : 'text-slate-700'
                              }`}
                            />
                            <span>{biz.isFollowing ? 'Following' : 'Follow'}</span>
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{biz.rating} ({biz.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase font-mono">
                            {biz.category}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{biz.location}</span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900">{biz.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{biz.description}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">
                        Network: <strong className="text-indigo-600">{biz.partnershipStatus}</strong>
                      </span>
                      <button
                        onClick={() => showToast(`Collaboration request sent to ${biz.name} team.`)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                      >
                        Collaborate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* =================================================================== */}
          {/* VIEW 4A: BOOKING MANAGEMENT                                         */}
          {/* =================================================================== */}
          {(activeTab === 'bookings' || activeTab === 'booking-management') && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-6xl mx-auto pb-16">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Management</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Monitor incoming appointments, multi-service bookings, and manage customer check-ins.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setBookingStatusFilter('all');
                      setBookingSearchTerm('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Location Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Viewing Location</span>
                    <p className="text-xs font-extrabold text-slate-900">
                      {bookingLocationFilter === 'all'
                        ? `All Locations & Venues (${bookingsForSelectedBiz.length} ${bookingsForSelectedBiz.length === 1 ? 'booking' : 'bookings'})`
                        : (state.businesses.find((b) => b.id === bookingLocationFilter)?.coreDetails?.businessName ||
                            selectedBusiness?.coreDetails?.businessName ||
                            (selectedBusiness as any)?.name ||
                            'Selected Venue')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Filter Location:</span>
                  <select
                    id="select-booking-biz"
                    value={bookingLocationFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingLocationFilter(val);
                      if (val !== 'all') {
                        setSelectedServiceBizId(val);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer max-w-[280px] truncate"
                  >
                    <option value="all">
                      🌐 All Locations / Venues ({bookings.length} total)
                    </option>
                    {state.businesses.map((biz) => {
                      const count = bookings.filter(
                        (b) =>
                          b.business_id === biz.id ||
                          (b.business_name &&
                            b.business_name.toLowerCase() ===
                              (biz.coreDetails?.businessName || '').toLowerCase())
                      ).length;
                      const isOwner = vendorOwnedBusinesses.some((v) => v.id === biz.id);
                      return (
                        <option key={biz.id} value={biz.id}>
                          {biz.coreDetails?.businessName || (biz as any)?.name} {isOwner ? '(My Venue)' : ''} ({count} {count === 1 ? 'booking' : 'bookings'})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{bookingsForSelectedBiz.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">All scheduled reservations</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed</span>
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-700 mt-2">
                    {bookingsForSelectedBiz.filter((b) => b.status === 'confirmed').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upcoming visits</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Visited</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-black text-indigo-700 mt-2">
                    {bookingsForSelectedBiz.filter((b) => b.status === 'visited').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Completed appointments</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Value</span>
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    $
                    {bookingsForSelectedBiz
                      .filter((b) => b.status !== 'cancelled')
                      .reduce((acc, b) => acc + (b.total_amount ?? b.total_price ?? 0), 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active booking volume</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by customer, phone, or booking ID..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'confirmed', label: 'Confirmed' },
                      { id: 'visited', label: 'Visited' },
                      { id: 'cancelled', label: 'Cancelled' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setBookingStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        bookingStatusFilter === st.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              {bookingsForSelectedBiz.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    There are no bookings matching your selected filters for this location. New customer reservations will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingsForSelectedBiz.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Info */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              #{b.id.toUpperCase().slice(0, 10)}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : b.status === 'visited'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-500" />
                              <span>
                                {b.business_name ||
                                  state.businesses.find((bz) => bz.id === b.business_id)?.coreDetails?.businessName ||
                                  'Venue'}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Booked on {new Date(b.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.customer_name}</span>
                            </div>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600">{b.customer_email}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-mono">{b.customer_phone}</span>
                          </div>

                          {/* Date & Slot */}
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{b.booking_date || b.scheduled_date || 'Upcoming'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                {b.scheduled_time_slot ||
                                  (b.scheduled_start_time ? `${b.scheduled_start_time} - ${b.scheduled_end_time}` : 'Scheduled Slot')}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">
                              ({b.total_duration_minutes} mins total)
                            </span>
                          </div>

                          {/* Line items (Booked Services) */}
                          <div className="pt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                              Services:
                            </span>
                            {(b.items || []).map((it) => (
                              <span
                                key={it.id}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1"
                              >
                                <Scissors className="w-3 h-3 text-indigo-600" />
                                <span>{it.service_name}</span>
                                <span className="text-indigo-400 font-normal">
                                  ({it.duration_minutes}m • ${(it.price_charged ?? it.price ?? 0).toFixed(2)})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right: Payment & Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                          <div className="text-left lg:text-right">
                            <p className="text-lg font-black text-slate-900">
                              ${(b.total_amount ?? b.total_price ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 flex items-center lg:justify-end gap-1">
                              <span>
                                {b.payment_method === 'credit_card' ? 'Online Card (NMI)' : 'Pay on Arrival (Cash)'}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-extrabold ${
                                  b.payment_status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.payment_status}
                              </span>
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateBookingStatus(b.id, 'visited');
                                    showToast(`Booking #${b.id.toUpperCase().slice(0, 8)} marked as Visited.`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Visited</span>
                                </button>
                                <button
                                  onClick={() => {
                                    cancelBooking(b.id, 'Cancelled by salon');
                                    showToast(`Booking #${b.id.toUpperCase().slice(0, 8)} has been cancelled.`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                                >
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setSelectedBookingDetails(b)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 4B: ADVANCED BOOKING WORKFLOW                                  */}
          {/* =================================================================== */}
          {activeTab === 'advanced-booking-workflow' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto pb-16">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Booking Workflow</h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Configure slot generation logic, multi-service buffer rules, and auto-dispatch policies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Multi-Service Slot Stacking</h3>
                      <p className="text-xs text-slate-400">Consecutive appointment aggregation</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When customers select multiple services (e.g. Haircut + Beard Trim + Hair Wash), duration is combined into a contiguous block. The system ensures the aggregate duration fits within open hours without colliding with other bookings.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Multi-Service Aggregator</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active (DBML Standard)
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Slot Granularity & Buffer</h3>
                      <p className="text-xs text-slate-400">Turnaround interval between bookings</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Available slots are generated on 30-minute intervals. Change buffer time to add sanitation and turnaround minutes between client visits.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Slot Interval</span>
                      <span className="text-slate-900 font-extrabold text-sm">30 Minutes</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Turnaround Buffer</span>
                      <span className="text-slate-900 font-extrabold text-sm">0 Minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Payment Gateways</h3>
                      <p className="text-xs text-slate-400">NMI Gateway Card Processing & Cash</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Online card payments process directly through the platform NMI merchant sub-account ledger. In-person pay-at-salon reservations create pending ledger entries confirmed on visit.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">NMI Gateway Integration</span>
                    <span className="text-indigo-600 font-extrabold">Active</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Notifications & Reminders</h3>
                      <p className="text-xs text-slate-400">Automated dispatch upon booking</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instant confirmation receipts and SMS/email notifications are generated for every multi-service reservation.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Auto-Confirmation</span>
                    <span className="text-emerald-600 font-extrabold">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 5A: MY SERVICES (SERVICES CATALOG & DETAILS FORM)              */}
          {/* =================================================================== */}
          {activeTab === 'my-services' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-6xl mx-auto pb-16">
              {serviceViewMode === 'list' ? (
                /* ============================================================= */
                /* MODE A: CATALOG VIEW (Matches Reference Image 1)             */
                /* ============================================================= */
                <div className="space-y-6">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Services</h1>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Manage your catalog of professional services across all business locations.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                      {selectedServiceBiz.id === 'biz-002' ? (
                        <button
                          id="load-spa-presets-btn"
                          onClick={() => {
                            loadSpaPresets(selectedServiceBiz.id);
                            showToast(`Loaded spa service presets for "${selectedServiceBiz.coreDetails?.businessName || (selectedServiceBiz as any)?.name}"!`);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Load Spa Presets</span>
                        </button>
                      ) : (
                        <button
                          id="load-salon-presets-btn"
                          onClick={() => {
                            loadSalonPresets(selectedServiceBiz.id);
                            showToast(`Loaded salon service presets for "${selectedServiceBiz.coreDetails?.businessName || (selectedServiceBiz as any)?.name}"!`);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Load Salon Presets</span>
                        </button>
                      )}

                      <button
                        id="create-service-btn"
                        onClick={handleOpenCreateServiceView}
                        className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Service</span>
                      </button>
                    </div>
                  </div>

                  {/* Business Location Selector Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Location</span>
                        <p className="text-xs font-extrabold text-slate-900">
                          {selectedBusiness?.coreDetails?.businessName || (selectedBusiness as any)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {vendorOwnedBusinesses.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Location:</span>
                          <select
                            value={selectedBusiness.id}
                            onChange={(e) => setSelectedServiceBizId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                          >
                            {vendorOwnedBusinesses.map((biz) => (
                              <option key={biz.id} value={biz.id}>
                                {biz.coreDetails?.businessName || (biz as any)?.name} ({biz.coreDetails?.city || 'CA'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setServiceViewMode('list')}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-2xs cursor-pointer"
                        >
                          Services Catalog
                        </button>
                        <button
                          onClick={() => setActiveTab('service-availability')}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          Working Hours
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filter Toolbar (Search, Status Dropdown, Sort by Price, Refresh) */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-96">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter services by name or category..."
                        value={serviceSearchTerm}
                        onChange={(e) => {
                          setServiceSearchTerm(e.target.value);
                          setServiceCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={serviceStatusFilter}
                          onChange={(e) => {
                            setServiceStatusFilter(e.target.value as any);
                            setServiceCurrentPage(1);
                          }}
                          className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Sort by Price Button */}
                      <button
                        onClick={() => {
                          setServiceSortPriceAsc((prev) =>
                            prev === null ? true : prev === true ? false : null
                          );
                          setServiceCurrentPage(1);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                          serviceSortPriceAsc !== null
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>
                          {serviceSortPriceAsc === true
                            ? 'Price: Low to High'
                            : serviceSortPriceAsc === false
                            ? 'Price: High to Low'
                            : 'Sort by Price'}
                        </span>
                      </button>

                      {/* Refresh Button */}
                      <button
                        onClick={() => {
                          setServiceSearchTerm('');
                          setServiceCategoryFilter('All');
                          setServiceStatusFilter('all');
                          setServiceSortPriceAsc(null);
                          setServiceCurrentPage(1);
                          showToast('Services view refreshed.');
                        }}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                        title="Reset filters & refresh"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 9-Column Services Table */}
                  {filteredServicesForSelectedBiz.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs py-16 px-6 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                        <Scissors className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No services found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                        No services matched your search and filter criteria. Adjust your filters or click Create Service to add one.
                      </p>
                      <button
                        onClick={handleOpenCreateServiceView}
                        className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Service</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                              <th className="py-3.5 px-5">NAME</th>
                              <th className="py-3.5 px-5">BUSINESS</th>
                              <th className="py-3.5 px-5">CATEGORY</th>
                              <th className="py-3.5 px-5">PRICING TYPE</th>
                              <th className="py-3.5 px-5">PRICE</th>
                              <th className="py-3.5 px-5">DURATION</th>
                              <th className="py-3.5 px-5 text-center"># WORKERS</th>
                              <th className="py-3.5 px-5">STATUS</th>
                              <th className="py-3.5 px-5 text-right">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {paginatedServicesForSelectedBiz.map((srv) => {
                              const bizName =
                                selectedBusiness?.coreDetails?.businessName ||
                                (selectedBusiness as any)?.name ||
                                'The Grand Salon & Spa';
                              const isHourly = srv.pricing_type === 'time_based';
                              const displayPrice = isHourly
                                ? `$${(srv.hourly_rate || srv.base_price).toFixed(2)}/hr`
                                : `$${srv.base_price.toFixed(2)}`;
                              const pricingLabel = isHourly ? 'Hourly' : 'Fixed Fee';

                              return (
                                <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                                  {/* NAME */}
                                  <td className="py-4 px-5">
                                    <div>
                                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                                        {srv.name}
                                      </span>
                                      {srv.description && (
                                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs">
                                          {srv.description}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* BUSINESS */}
                                  <td className="py-4 px-5">
                                    <span className="text-slate-600 font-medium text-xs block max-w-xs truncate">
                                      {bizName}
                                    </span>
                                  </td>

                                  {/* CATEGORY */}
                                  <td className="py-4 px-5">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block whitespace-nowrap ${
                                        srv.category_name?.includes('Haircut')
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : srv.category_name?.includes('Color')
                                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                          : srv.category_name?.includes('Beard') || srv.category_name?.includes('Grooming')
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : srv.category_name?.includes('Massage') || srv.category_name?.includes('Spa')
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                                      }`}
                                    >
                                      {srv.category_name || 'General'}
                                    </span>
                                  </td>

                                  {/* PRICING TYPE */}
                                  <td className="py-4 px-5 text-slate-600 font-medium">
                                    {pricingLabel}
                                  </td>

                                  {/* PRICE */}
                                  <td className="py-4 px-5 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                    {displayPrice}
                                  </td>

                                  {/* DURATION */}
                                  <td className="py-4 px-5 text-slate-600 font-medium">
                                    {srv.duration_minutes} min
                                  </td>

                                  {/* # WORKERS */}
                                  <td className="py-4 px-5 text-center font-bold text-slate-800">
                                    {srv.assigned_workers_count ?? 4}
                                  </td>

                                  {/* STATUS */}
                                  <td className="py-4 px-5">
                                    <button
                                      onClick={() => toggleBusinessServiceStatus(srv.id)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                        srv.status === 'active'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          srv.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}
                                      />
                                      <span>{srv.status === 'active' ? 'Active' : 'Inactive'}</span>
                                    </button>
                                  </td>

                                  {/* ACTIONS (Edit, View, Assign Workers, Delete) */}
                                  <td className="py-4 px-5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleOpenEditServiceView(srv)}
                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Service"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setPreviewingService(srv)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                        title="View Service Details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setAssigningWorkersService(srv)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Assign Workers"
                                      >
                                        <UsersRound className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteService(srv.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Service"
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

                      {/* Pagination Bar */}
                      <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                          Showing{' '}
                          <span className="font-bold text-slate-900">
                            {filteredServicesForSelectedBiz.length === 0
                              ? 0
                              : (serviceCurrentPage - 1) * SERVICE_ITEMS_PER_PAGE + 1}
                          </span>{' '}
                          to{' '}
                          <span className="font-bold text-slate-900">
                            {Math.min(
                              serviceCurrentPage * SERVICE_ITEMS_PER_PAGE,
                              filteredServicesForSelectedBiz.length
                            )}
                          </span>{' '}
                          of{' '}
                          <span className="font-bold text-slate-900">
                            {filteredServicesForSelectedBiz.length}
                          </span>{' '}
                          services
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            disabled={serviceCurrentPage <= 1}
                            onClick={() => setServiceCurrentPage((p) => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          {Array.from({ length: totalServicePages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setServiceCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                                serviceCurrentPage === pageNum
                                  ? 'bg-black text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            disabled={serviceCurrentPage >= totalServicePages}
                            onClick={() => setServiceCurrentPage((p) => Math.min(totalServicePages, p + 1))}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3 Metric Cards at Bottom (Image 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: TOTAL REVENUE */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        TOTAL REVENUE
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">$14,280.00</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <TrendingUp className="w-3 h-3" />
                          <span>+12.5%</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">from last month</p>
                    </div>

                    {/* Card 2: AVG. DURATION */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        AVG. DURATION
                      </span>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {servicesForSelectedBiz.length
                          ? Math.round(
                              servicesForSelectedBiz.reduce((a, b) => a + b.duration_minutes, 0) /
                                servicesForSelectedBiz.length
                            )
                          : 58}{' '}
                        min
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Across {new Set(servicesForSelectedBiz.map((s) => s.category_name || 'General')).size} service categories
                      </p>
                    </div>

                    {/* Card 3: POPULARITY INDEX */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        POPULARITY INDEX
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">8.4 / 10</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full w-[84%]" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Top 5% of marketplace vendors</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ============================================================= */
                /* MODE B: FULL-PAGE SERVICE FORM (Matches Reference Images 2 & 3) */
                /* ============================================================= */
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Breadcrumbs Navigation */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <button
                      onClick={() => setActiveTab('my-businesses')}
                      className="hover:text-slate-900 transition font-semibold cursor-pointer"
                    >
                      My Businesses
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <button
                      onClick={handleCancelServiceForm}
                      className="hover:text-slate-900 transition font-semibold cursor-pointer"
                    >
                      Services
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">
                      {serviceViewMode === 'create' ? 'New Service' : `Edit: ${serviceNameInput || 'Service'}`}
                    </span>
                  </div>

                  {/* Header Title */}
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Details</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Define the specifics of your offering to start receiving bookings.
                    </p>
                  </div>

                  <form onSubmit={handleSaveFullServiceForm} className="space-y-6">
                    {/* CARD 1: SERVICE DETAILS (Image 2) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                      {/* Row 1: Service Name & Service Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Service Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Executive Consultation"
                            value={serviceNameInput}
                            onChange={(e) => setServiceNameInput(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Service Category <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={serviceCategoryInput}
                            onChange={(e) => setServiceCategoryInput(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                          >
                            <option value="Haircuts & Styling">Haircuts & Styling</option>
                            <option value="Color & Treatments">Color & Treatments</option>
                            <option value="Grooming & Beard">Grooming & Beard</option>
                            <option value="Spa & Wash">Spa & Wash</option>
                            <option value="Massage Therapy">Massage Therapy</option>
                            <option value="Skincare & Facial">Skincare & Facial</option>
                            <option value="Nail Care">Nail Care</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Business Assignment */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Business <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={serviceBusinessIdInput}
                          onChange={(e) => setServiceBusinessIdInput(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                        >
                          {vendorOwnedBusinesses.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.coreDetails?.businessName || (b as any)?.name || b.id} ({b.coreDetails?.city || 'CA'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Row 3: Description */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Description <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe the value of this service, what's included, and any prerequisites..."
                          value={serviceDescriptionInput}
                          onChange={(e) => setServiceDescriptionInput(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                        />
                      </div>

                      {/* Row 4: 2-Part Service Media Upload (Thumbnail + Max 10 Gallery Photos) */}
                      <div className="space-y-4 pt-1 pb-1 border-y border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Service Media & Visuals
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Configure 1 primary thumbnail for service catalogs, plus up to 10 showcase photos for the customer service details gallery.
                            </p>
                          </div>
                          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            2-Part Media Deployment
                          </span>
                        </div>

                        {/* PART 1: Service Thumbnail (Strictly 1 image) */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-900">
                                  Part 1: Service Thumbnail
                                </label>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Strictly 1 Image
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Primary cover image displayed on service cards and catalog listings.
                              </p>
                            </div>
                            {serviceImageInput && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 1/1 Attached
                              </span>
                            )}
                          </div>

                          <input
                            type="file"
                            ref={serviceImageFileInputRef}
                            accept="image/*"
                            multiple={false}
                            onChange={handleImageFileChange}
                            className="hidden"
                          />

                          {serviceImageInput ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white p-3 flex items-center gap-4 shadow-2xs">
                              <img
                                src={serviceImageInput}
                                alt="Service Thumbnail"
                                className="w-20 h-16 object-cover rounded-xl border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">Service Thumbnail Uploaded</p>
                                <p className="text-[11px] text-slate-400">Primary single image for marketplace catalog</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => serviceImageFileInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setServiceImageInput('')}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                  title="Remove Thumbnail"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => serviceImageFileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2"
                            >
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shadow-2xs">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  Drag and drop or <span className="text-indigo-600 underline">Browse files</span>
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Recommended: 1200 × 800px (Max 5MB • 1 file)</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PART 2: Service Gallery (Max 10 images) */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-900">
                                  Part 2: Service Gallery & Details Photos
                                </label>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  serviceGalleryImagesInput.length >= 10
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {serviceGalleryImagesInput.length} / 10 Photos Uploaded
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Showcase photos displayed in the interactive customer service details modal (Maximum 10 files).
                              </p>
                            </div>

                            {serviceGalleryImagesInput.length > 0 && serviceGalleryImagesInput.length < 10 && (
                              <button
                                type="button"
                                onClick={() => serviceGalleryFileInputRef.current?.click()}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Photos</span>
                              </button>
                            )}
                          </div>

                          <input
                            type="file"
                            ref={serviceGalleryFileInputRef}
                            accept="image/*"
                            multiple
                            onChange={handleGalleryFilesChange}
                            className="hidden"
                          />

                          {/* Gallery Photos Grid or Empty Dropzone */}
                          {serviceGalleryImagesInput.length > 0 ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {serviceGalleryImagesInput.map((imgUrl, idx) => (
                                  <div
                                    key={idx}
                                    className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Gallery photo ${idx + 1}`}
                                      className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                                    />
                                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold">
                                      #{idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(idx)}
                                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition shadow-sm cursor-pointer"
                                      title="Remove this photo"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}

                                {serviceGalleryImagesInput.length < 10 && (
                                  <button
                                    type="button"
                                    onClick={() => serviceGalleryFileInputRef.current?.click()}
                                    className="aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600 flex flex-col items-center justify-center transition cursor-pointer gap-1 p-2 shadow-2xs"
                                  >
                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                    <span className="text-[11px] font-bold">Add Photo</span>
                                    <span className="text-[9px] text-slate-400">({10 - serviceGalleryImagesInput.length} remaining)</span>
                                  </button>
                                )}
                              </div>

                              {serviceGalleryImagesInput.length >= 10 && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                  Maximum 10 gallery photos reached. Remove an existing photo to upload new ones.
                                </p>
                              )}
                            </div>
                          ) : (
                            <div
                              onClick={() => serviceGalleryFileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2"
                            >
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shadow-2xs">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  Drag and drop or <span className="text-indigo-600 underline">Browse gallery photos</span>
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Upload up to 10 photos • Multiple selection enabled (Max 5MB each)</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 5: Pricing Type Radio Cards */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Pricing Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Fixed Price Card */}
                          <div
                            onClick={() => setServicePricingType('fixed')}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              servicePricingType === 'fixed'
                                ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="mt-0.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  servicePricingType === 'fixed'
                                    ? 'border-slate-900'
                                    : 'border-slate-300'
                                }`}
                              >
                                {servicePricingType === 'fixed' && (
                                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">Fixed Price</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                Charge a single flat fee for the entire session duration.
                              </p>
                            </div>
                          </div>

                          {/* Time-Based Card */}
                          <div
                            onClick={() => setServicePricingType('time_based')}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              servicePricingType === 'time_based'
                                ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="mt-0.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  servicePricingType === 'time_based'
                                    ? 'border-slate-900'
                                    : 'border-slate-300'
                                }`}
                              >
                                {servicePricingType === 'time_based' && (
                                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">Time-Based</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                Calculate the price based on an hourly rate multiplier.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 6: Conditional Inputs (Fixed vs Time-Based) */}
                      {servicePricingType === 'fixed' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              TOTAL SERVICE PRICE <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                required
                                value={servicePriceInput}
                                onChange={(e) => setServicePriceInput(e.target.value)}
                                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              SERVICE DURATION (MINUTES) <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={serviceDurationInput}
                              onChange={(e) => setServiceDurationInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                            >
                              <option value="15">15 min</option>
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min (1 hr)</option>
                              <option value="75">75 min (1 hr 15m)</option>
                              <option value="90">90 min (1.5 hrs)</option>
                              <option value="120">120 min (2 hrs)</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              HOURLY RATE <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                required
                                value={serviceHourlyRateInput}
                                onChange={(e) => setServiceHourlyRateInput(e.target.value)}
                                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              SERVICE DURATION (MINUTES) <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={serviceDurationInput}
                              onChange={(e) => setServiceDurationInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                            >
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min (1 hr)</option>
                              <option value="75">75 min (1 hr 15m)</option>
                              <option value="90">90 min (1.5 hrs)</option>
                              <option value="120">120 min (2 hrs)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              MINIMUM BILLING DURATION
                            </label>
                            <select
                              value={serviceMinBillingDurationInput}
                              onChange={(e) => setServiceMinBillingDurationInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                            >
                              <option value="15">15 min</option>
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              ROUNDING RULES
                            </label>
                            <select
                              value={serviceRoundingRuleInput}
                              onChange={(e) => setServiceRoundingRuleInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                            >
                              <option value="Round up to nearest 15 min">Round up to nearest 15 min</option>
                              <option value="Round up to nearest 30 min">Round up to nearest 30 min</option>
                              <option value="Exact time (no rounding)">Exact time (no rounding)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Row 7: Info Callout Banner */}
                      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                          Changing the price will only affect new bookings. Existing scheduled appointments will maintain their original rates.
                        </p>
                      </div>

                      {/* Row 8: Requires Approval Switch */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">Requires Approval</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Manual confirmation needed for every booking</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={serviceRequiresApprovalInput}
                          onClick={() => setServiceRequiresApprovalInput((prev) => !prev)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            serviceRequiresApprovalInput ? 'bg-black' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              serviceRequiresApprovalInput ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* CARD 2: SERVICE AVAILABILITY (Image 3) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Service Availability</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Define the weekly schedule and time slots for: <span className="font-bold text-slate-800">{serviceNameInput || 'New Service'}</span>
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                              <th className="py-3 px-4">WEEKDAY</th>
                              <th className="py-3 px-4">START TIME</th>
                              <th className="py-3 px-4">END TIME</th>
                              <th className="py-3 px-4 text-center">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {WEEKDAYS_CONFIG.map((day) => {
                              const schedule =
                                serviceAvailabilitySchedule.find((s) => s.day_of_week === day.day_of_week) || {
                                  day_of_week: day.day_of_week,
                                  open_time: '09:00',
                                  close_time: '17:00',
                                  is_closed: day.day_of_week === 0,
                                };
                              const isClosed = !!schedule.is_closed;

                              return (
                                <tr key={day.day_of_week} className="hover:bg-slate-50/60 transition-colors">
                                  {/* WEEKDAY */}
                                  <td className="py-3.5 px-4 font-bold text-slate-900 w-44">
                                    {day.name}
                                  </td>

                                  {/* START TIME */}
                                  <td className="py-3.5 px-4">
                                    {isClosed ? (
                                      <span className="text-slate-400 font-medium text-xs">Closed / Unavailable</span>
                                    ) : (
                                      <select
                                        value={formatTime24To12(schedule.open_time)}
                                        onChange={(e) =>
                                          handleUpdateWeekdayTime(
                                            day.day_of_week,
                                            'open_time',
                                            formatTime12To24(e.target.value)
                                          )
                                        }
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                      >
                                        {TIME_PICKER_OPTIONS.map((timeStr) => (
                                          <option key={timeStr} value={timeStr}>
                                            {timeStr}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </td>

                                  {/* END TIME */}
                                  <td className="py-3.5 px-4">
                                    {isClosed ? (
                                      <span className="text-slate-400 font-medium text-xs">—</span>
                                    ) : (
                                      <select
                                        value={formatTime24To12(schedule.close_time)}
                                        onChange={(e) =>
                                          handleUpdateWeekdayTime(
                                            day.day_of_week,
                                            'close_time',
                                            formatTime12To24(e.target.value)
                                          )
                                        }
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                      >
                                        {TIME_PICKER_OPTIONS.map((timeStr) => (
                                          <option key={timeStr} value={timeStr}>
                                            {timeStr}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </td>

                                  {/* STATUS TOGGLE */}
                                  <td className="py-3.5 px-4 text-center">
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={!isClosed}
                                      onClick={() => handleToggleWeekdayAvailability(day.day_of_week)}
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        !isClosed ? 'bg-black' : 'bg-slate-200'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                          !isClosed ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={handleCancelServiceForm}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Save Service
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 5B: SERVICE AVAILABILITY (WORKING HOURS)                       */}
          {/* =================================================================== */}
          {activeTab === 'service-availability' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-6xl mx-auto pb-16">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Availability & Hours</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Configure weekly business operating hours. Customer appointment slots are generated strictly within these open hours.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    id="save-working-hours-btn"
                    onClick={handleSaveHours}
                    className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                      hoursSaveSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black hover:bg-slate-800 text-white'
                    }`}
                  >
                    {hoursSaveSuccess ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span>{hoursSaveSuccess ? 'Saved Hours!' : 'Save Working Hours'}</span>
                  </button>
                </div>
              </div>

              {/* Location Switcher & View Switcher Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Location</span>
                    <p className="text-xs font-extrabold text-slate-900">
                      {selectedBusiness?.coreDetails?.businessName || (selectedBusiness as any)?.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {vendorOwnedBusinesses.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Switch:</span>
                      <select
                        value={selectedBusiness.id}
                        onChange={(e) => setSelectedServiceBizId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        {vendorOwnedBusinesses.map((biz) => (
                          <option key={biz.id} value={biz.id}>
                            {biz.coreDetails?.businessName || (biz as any)?.name} ({biz.coreDetails?.city || 'CA'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveTab('my-services')}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      Services Catalog
                    </button>
                    <button
                      onClick={() => setActiveTab('service-availability')}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-2xs cursor-pointer"
                    >
                      Working Hours
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Grid: Weekly Schedule + Live Slot Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Hours Editor */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Weekly Operating Schedule</h3>
                        <p className="text-xs text-slate-400 mt-0.5">DBML schema `business_hours` (0 = Sunday to 6 = Saturday)</p>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        7 Days Active
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                        const daySchedule =
                          editingScheduleHours.find((h) => h.day_of_week === dayIdx) || {
                            id: `bh-preview-${dayIdx}`,
                            business_id: selectedServiceBiz.id,
                            day_of_week: dayIdx,
                            open_time: '09:00',
                            close_time: '19:00',
                            is_closed: dayIdx === 0,
                          };

                        const isClosed = Boolean(daySchedule.is_closed);

                        return (
                          <div
                            key={dayIdx}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isClosed
                                ? 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                            }`}
                          >
                            {/* Day Title & Toggle */}
                            <div className="flex items-center gap-3 w-40 shrink-0">
                              <button
                                onClick={() => handleToggleDayClosed(dayIdx)}
                                className={`w-8 h-5 rounded-full transition-colors relative cursor-pointer ${
                                  !isClosed ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={!isClosed ? 'Click to mark Closed' : 'Click to mark Open'}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                                    !isClosed ? 'left-4' : 'left-0.75'
                                  }`}
                                />
                              </button>
                              <div>
                                <span className={`text-xs font-extrabold ${!isClosed ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {DAY_NAMES[dayIdx]}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-medium">
                                  {dayIdx === 0 || dayIdx === 6 ? 'Weekend' : 'Weekday'}
                                </span>
                              </div>
                            </div>

                            {/* Hours Dropdowns or Closed Notice */}
                            <div className="flex-1 flex items-center gap-2">
                              {!isClosed ? (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="text-slate-400 font-medium text-[11px]">Open:</span>
                                  <select
                                    value={daySchedule.open_time}
                                    onChange={(e) => handleUpdateDayTime(dayIdx, 'open_time', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                  >
                                    {[
                                      '07:00',
                                      '07:30',
                                      '08:00',
                                      '08:30',
                                      '09:00',
                                      '09:30',
                                      '10:00',
                                      '10:30',
                                      '11:00',
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {minutesToTimeString(
                                          parseInt(t.split(':')[0], 10) * 60 + parseInt(t.split(':')[1], 10)
                                        )}
                                      </option>
                                    ))}
                                  </select>

                                  <span className="text-slate-400 font-medium text-[11px]">to</span>

                                  <select
                                    value={daySchedule.close_time}
                                    onChange={(e) => handleUpdateDayTime(dayIdx, 'close_time', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                  >
                                    {[
                                      '16:00',
                                      '16:30',
                                      '17:00',
                                      '17:30',
                                      '18:00',
                                      '18:30',
                                      '19:00',
                                      '19:30',
                                      '20:00',
                                      '20:30',
                                      '21:00',
                                      '22:00',
                                    ].map((t) => (
                                      <option key={t} value={t}>
                                        {minutesToTimeString(
                                          parseInt(t.split(':')[0], 10) * 60 + parseInt(t.split(':')[1], 10)
                                        )}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-slate-400 italic">
                                  Closed all day. No slots will be offered to customers.
                                </span>
                              )}
                            </div>

                            {/* Copy to All Button */}
                            {!isClosed && (
                              <button
                                onClick={() => handleCopyDayToAll(dayIdx)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                title="Copy these hours to all days"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy to All</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom action */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">
                        Changes will immediately apply to customer availability calculations.
                      </p>
                      <button
                        onClick={handleSaveHours}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                      >
                        {hoursSaveSuccess ? 'Saved!' : 'Save Hours'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Companion: Live Slot Simulator Preview */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Live Slot Simulator</h3>
                        <p className="text-[11px] text-slate-400">Preview what customers see in real-time</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Test Date:</label>
                      <input
                        type="date"
                        value={simDate}
                        onChange={(e) => setSimDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/80 text-xs text-indigo-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        Dynamic Slot Generation
                      </p>
                      <p className="text-[11px] text-indigo-700 leading-relaxed">
                        Calculated for a 45 min appointment using your configured hours for{' '}
                        <strong>
                          {new Date(`${simDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })}
                        </strong>
                        .
                      </p>
                    </div>

                    {/* Preview Results */}
                    {previewSlots.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                        <p className="text-xs font-bold text-amber-800">Closed or No Slots Available</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          The business is closed or fully booked on this date.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Generated Slots</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                            {previewSlots.length} available
                          </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                          <div className="grid grid-cols-3 gap-1.5">
                            {previewSlots.map((s) => (
                              <div
                                key={s.slotId || s.startTime}
                                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-mono font-bold text-slate-800"
                              >
                                {s.startTime}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 6: PAYOUTS                                                     */}
          {/* =================================================================== */}
          {/* VIEW 6: PAYOUTS & DISBURSEMENTS                                     */}
          {/* =================================================================== */}
          {activeTab === 'payouts' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto pb-16">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payouts & Disbursements</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your commercial balance, request withdrawals to your verified bank account, and track ledger history.
                  </p>
                </div>
                <button
                  id="btn-open-withdrawal-modal"
                  onClick={handleOpenWithdrawalModal}
                  disabled={currentBusinessBalance.availableBalance <= 0}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto ${
                    currentBusinessBalance.availableBalance > 0
                      ? 'bg-black hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Withdraw ${currentBusinessBalance.availableBalance.toFixed(2)}</span>
                </button>
              </div>

              {/* Business Selector Bar for Payouts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Selected Business:</span>
                  <span className="text-xs font-extrabold text-slate-900">{selectedBusiness?.coreDetails?.businessName || (selectedBusiness as any)?.name || 'Business'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Switch Business:</span>
                  <select
                    id="select-payout-business"
                    value={selectedBusiness.id}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    {vendorOwnedBusinesses.map((biz) => {
                      const isW9Done = Boolean(biz.w9 && (biz.w9.status === 'submitted' || biz.w9.status === 'verified'));
                      const bizBal = getBusinessBalance(biz.id);
                      const bName = biz.coreDetails?.businessName || (biz as any).name || 'Business';
                      return (
                        <option key={biz.id} value={biz.id}>
                          {bName} — Avail: ${bizBal.availableBalance.toFixed(2)} {isW9Done ? '(0% Tax)' : '(24% Tax)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* W-9 Warning Alert if not submitted */}
              {!isSelectedBizW9Certified && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <AlertCircle className="w-4 h-4 text-slate-950" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Form W-9 Missing — 24% IRS Backup Withholding Active
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Federal tax regulations require 24% backup withholding on all payments until your Form W-9 is submitted and certified.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('w9-form')}
                    className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
                  >
                    Complete Form W-9
                  </button>
                </div>
              )}

              {/* Bank Account Status Banner */}
              {!isBankLinked ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Commercial Bank Account Required — Payouts Locked
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Before requesting a payout, you must link your commercial bank account. Funds are transferred via direct ACH upon Super Admin authorization.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBankFormData((prev) => ({
                        ...prev,
                        accountHolderName: selectedBusiness?.coreDetails?.legalEntityName || selectedBusiness?.coreDetails?.businessName || '',
                      }));
                      setIsLinkBankModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Link Commercial Bank</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-emerald-950">
                          {selectedBusiness.verification?.bankAccount?.bankName || 'Commercial Bank'} Linked
                        </h4>
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          Ready for ACH Payouts
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                        Account: {selectedBusiness.verification?.bankAccount?.accountNumberMasked || '•••• 9382'} • Routing: {selectedBusiness.verification?.bankAccount?.routingNumber || '121000358'} ({selectedBusiness.verification?.bankAccount?.accountHolderName || selectedBusiness?.coreDetails?.businessName || 'Business'})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBankFormData((prev) => ({
                        ...prev,
                        accountHolderName: selectedBusiness?.verification?.bankAccount?.accountHolderName || selectedBusiness?.coreDetails?.businessName || '',
                        bankName: selectedBusiness?.verification?.bankAccount?.bankName || 'JPMorgan Chase',
                        routingNumber: selectedBusiness?.verification?.bankAccount?.routingNumber || '121000358',
                      }));
                      setIsLinkBankModalOpen(true);
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto whitespace-nowrap cursor-pointer"
                  >
                    Change Bank Details
                  </button>
                </div>
              )}

              {/* 4 Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Available Balance */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Balance</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                    ${currentBusinessBalance.availableBalance.toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Ready to withdraw</span>
                </div>

                {/* Pending Withdrawal */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Approval</span>
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
                    ${currentBusinessBalance.pendingWithdrawal.toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">In Super Admin queue</span>
                </div>

                {/* Total Earned */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Earnings</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                    ${currentBusinessBalance.totalEarned.toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Successfully withdrawn</span>
                </div>

                {/* IRS Tax Withheld */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">IRS Withheld (24%)</span>
                    <div className={`w-2 h-2 rounded-full ${currentBusinessBalance.totalWithheldTax > 0 ? 'bg-rose-500' : 'bg-slate-300'}`} />
                  </div>
                  <p className={`text-2xl font-black mt-1 font-mono ${currentBusinessBalance.totalWithheldTax > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    ${currentBusinessBalance.totalWithheldTax.toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {isSelectedBizW9Certified ? 'W-9 Certified (0% active)' : 'Pending W-9 certification'}
                  </span>
                </div>
              </div>

              {/* Registered Destination Bank Account Card */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black">
                    <Landmark className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {selectedBusiness.verification?.bankAccount?.bankName || 'Commercial Bank'}
                      </span>
                      {isBankLinked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Destination
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Unlinked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {isBankLinked
                        ? `Account: ${selectedBusiness.verification?.bankAccount?.accountNumberMasked || '•••• 9382'} • Routing: ${selectedBusiness.verification?.bankAccount?.routingNumber || '121000358'} • ${selectedBusiness.verification?.bankAccount?.accountHolderName || selectedBusiness?.coreDetails?.businessName || 'Business'}`
                        : 'No bank account linked. Payout requests require a destination bank.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBankFormData((prev) => ({
                        ...prev,
                        accountHolderName: selectedBusiness?.verification?.bankAccount?.accountHolderName || selectedBusiness?.coreDetails?.businessName || '',
                        bankName: selectedBusiness?.verification?.bankAccount?.bankName || 'JPMorgan Chase',
                        routingNumber: selectedBusiness?.verification?.bankAccount?.routingNumber || '121000358',
                      }));
                      setIsLinkBankModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{isBankLinked ? 'Change Bank' : 'Link Bank Account'}</span>
                  </button>
                </div>
              </div>

              {/* Tabbed / Segmented History Tables */}
              <div className="space-y-6">
                {/* 1. Withdrawal Requests History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Withdrawal Request History</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Recent payout requests, withholding deductions, and authorization status</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                      {platformLedger.withdrawals.filter((w) => w.businessId === selectedBusiness.id).length} record(s)
                    </span>
                  </div>

                  {(() => {
                    const bizWithdrawals = platformLedger.withdrawals.filter(
                      (w) => w.businessId === selectedBusiness.id
                    );
                    if (bizWithdrawals.length === 0) {
                      return (
                        <div className="p-12 text-center text-xs text-slate-400">
                          No withdrawal requests submitted yet. Click "Withdraw Funds" above to disburse available balance.
                        </div>
                      );
                    }
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                              <th className="py-3 px-4">ID</th>
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4">Gross Amount</th>
                              <th className="py-3 px-4">Commission</th>
                              <th className="py-3 px-4">Tax Withheld</th>
                              <th className="py-3 px-4">Net Payout</th>
                              <th className="py-3 px-4">Destination Bank</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bizWithdrawals.map((w) => {
                              const wComm = w.commissionAmount !== undefined ? w.commissionAmount : (w.amount * ((w.commissionRate || 10) / 100));
                              const wTax = w.w9WithholdingAmount || 0;
                              const wNet = w.netPayoutAmount !== undefined ? w.netPayoutAmount : (w.amount - wComm - wTax);
                              return (
                                <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.id}</td>
                                  <td className="py-3.5 px-4 text-slate-600">
                                    {new Date(w.requestDate).toLocaleDateString()}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono font-black text-slate-900">${w.amount.toFixed(2)}</td>
                                  <td className="py-3.5 px-4 font-mono text-violet-700 font-bold">
                                    -${wComm.toFixed(2)} ({w.commissionRate || 10}%)
                                  </td>
                                  <td className="py-3.5 px-4 font-mono">
                                    {wTax > 0 ? (
                                      <span className="text-rose-600 font-bold">-${wTax.toFixed(2)} (24%)</span>
                                    ) : (
                                      <span className="text-slate-400">$0.00 (0%)</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono font-black text-emerald-600">
                                    ${wNet.toFixed(2)}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                                    {w.bankName || 'Bank'} ({w.maskedBankAccount})
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                        w.status === 'Completed'
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                          : w.status === 'Rejected'
                                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                                          : 'bg-amber-100 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      {w.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                    {w.status === 'Rejected'
                                      ? `Declined: ${w.rejectionReason || 'Restored to balance'}`
                                      : w.status === 'Completed'
                                      ? `Approved by ${w.processedBy || 'Super Admin'}`
                                      : 'Awaiting Super Admin review'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Transaction & Earnings Ledger */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Earnings & Transaction Ledger</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Line-item financial ledger of customer bookings and allocations</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                      {platformLedger.transactions.filter((t) => t.businessId === selectedBusiness.id).length} record(s)
                    </span>
                  </div>

                  {(() => {
                    const bizTxs = platformLedger.transactions.filter(
                      (t) => t.businessId === selectedBusiness.id
                    );
                    if (bizTxs.length === 0) {
                      return (
                        <div className="p-12 text-center text-xs text-slate-400">
                          No transactions recorded yet. Switch to Customer view to book appointments.
                        </div>
                      );
                    }
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                              <th className="py-3 px-5">Booking / Tx</th>
                              <th className="py-3 px-5">Type</th>
                              <th className="py-3 px-5">Service</th>
                              <th className="py-3 px-5">Customer</th>
                              <th className="py-3 px-5">Gross Paid</th>
                              <th className="py-3 px-5">Platform Fee</th>
                              <th className="py-3 px-5">W-9 Withheld</th>
                              <th className="py-3 px-5">Net Earnings</th>
                              <th className="py-3 px-5">Gateway</th>
                              <th className="py-3 px-5">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bizTxs.map((tx) => {
                              const normType = normalizeTransactionType(tx.type, tx.paymentStatus);
                              const typeMeta = getTransactionTypeMeta(tx.type, tx.paymentStatus);
                              const isPayout = normType === 'BUSINESS_PAYOUT';
                              const isFailed = normType === 'PAYOUT_FAILED';
                              const isReversal = normType === 'PAYOUT_REVERSAL';

                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                                    <div>{tx.bookingId}</div>
                                    {tx.id !== tx.bookingId && (
                                      <div className="text-[10px] text-slate-400 font-mono font-normal">Tx: {tx.id}</div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-5 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badgeBg}`}
                                      title={typeMeta.description}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${typeMeta.dotBg}`} />
                                      {typeMeta.label}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-5 font-medium text-slate-800">{tx.serviceName}</td>
                                  <td className="py-3.5 px-5 text-slate-600">{tx.customerName}</td>
                                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900">${tx.grossAmount.toFixed(2)}</td>
                                  <td className="py-3.5 px-5 font-mono text-slate-500">
                                    {tx.platformCommission > 0 ? `-$${tx.platformCommission.toFixed(2)} (${tx.commissionRate}%)` : '—'}
                                  </td>
                                  <td className="py-3.5 px-5 font-mono">
                                    {tx.w9WithholdingAmount > 0 ? (
                                      <span className="text-rose-600 font-bold">
                                        -${tx.w9WithholdingAmount.toFixed(2)} (24%)
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">$0.00</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-5 font-mono font-black">
                                    {isPayout ? (
                                      <span className="text-blue-700">-${tx.businessAmount.toFixed(2)}</span>
                                    ) : isReversal ? (
                                      <span className="text-amber-700">+${tx.businessAmount.toFixed(2)}</span>
                                    ) : isFailed ? (
                                      <span className="text-slate-400">$0.00</span>
                                    ) : (
                                      <span className="text-emerald-600">+${tx.businessAmount.toFixed(2)}</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-5">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                                      {tx.paymentGateway}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW: REVIEWS MANAGEMENT (Matching User Reference Image)            */}
          {/* =================================================================== */}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-150 pb-16">
              <BusinessReviewsManagementView businessId={selectedBusinessId} />
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW: SUBSCRIPTION PLANS (Matching Image 2)                         */}
          {/* =================================================================== */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in duration-150 pb-16">
              {/* Context banner if opened for a specific business */}
              {payingBiz && (() => {
                const payingName = payingBiz.coreDetails?.businessName || (payingBiz as any).name || 'Business';
                const payingCat = payingBiz.coreDetails?.category || (payingBiz as any).category || 'Coworking & Office';
                const payingCity = payingBiz.coreDetails?.city || (payingBiz as any).city || 'San Francisco';
                return (
                <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-emerald-400 shrink-0">
                      {payingBiz.avatarChar || payingName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-white">
                          {payingName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          payingBiz.status === 'KYC Approved' || payingBiz.status === 'Live'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {payingBiz.status === 'KYC Approved' ? 'KYC Approved' : payingBiz.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {payingCat} • {payingCity} • {
                          payingBiz.status === 'KYC Approved'
                            ? 'Select a tier below to activate and go live on the marketplace.'
                            : 'Select a tier below. Your subscription will be confirmed and your business will activate once KYC is approved.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {vendorOwnedBusinesses.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Business:</span>
                        <select
                          value={payingBiz.id}
                          onChange={(e) => {
                            setPayingBusinessId(e.target.value);
                            setSelectedBusinessId(e.target.value);
                          }}
                          className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        >
                          {vendorOwnedBusinesses.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.coreDetails?.businessName || (b as any).name || 'Business'} ({b.status})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setPayingBusinessId(null);
                        setActiveTab('my-businesses');
                      }}
                      className="text-xs text-slate-300 hover:text-white font-medium underline cursor-pointer shrink-0"
                    >
                      ← Back to My Businesses
                    </button>
                  </div>
                </div>
                );
              })()}

              {/* Main Top Header matching Image 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Subscription Plans
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Configure and manage tier-based access for service providers.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {/* Segmented View Mode Toggle: Card vs Table matching Image 2 */}
                  <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white shadow-2xs">
                    <button
                      id="sub-view-card-btn"
                      onClick={() => setSubscriptionViewMode('card')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        subscriptionViewMode === 'card'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      id="sub-view-table-btn"
                      onClick={() => setSubscriptionViewMode('table')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        subscriptionViewMode === 'table'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                  </div>

                  {/* Button matching Image 2 top right */}
                  <button
                    id="create-plan-btn"
                    onClick={() => {
                      if (payingBusinessId) {
                        setPayingBusinessId(null);
                        setActiveTab('my-businesses');
                      } else {
                        showToast('Custom tier request received! An account executive will follow up.');
                      }
                    }}
                    className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Plan</span>
                  </button>
                </div>
              </div>

              {/* CARD VIEW: 3 Tier Cards matching Image 2 */}
              {subscriptionViewMode === 'card' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
                  {/* 1. Essential Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-7 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow relative">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                          BASIC TIER
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-5 tracking-tight">
                        Essential
                      </h3>
                      <div className="flex items-baseline mt-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">$19.99</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-500 ml-1.5">/month</span>
                      </div>

                      {/* Feature Checklist matching Image 2 */}
                      <div className="space-y-4 my-8 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>Max Workers: <strong className="text-slate-900 font-bold">3</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>Unlimited Bookings</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Allow Cash Payment</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Custom Branding</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="select-plan-essential-btn"
                      onClick={() => handleSelectPlan('Essential', 19.99, ['Max Workers: 3', 'Unlimited Bookings'])}
                      className="w-full py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>Select Plan</span>
                    </button>
                  </div>

                  {/* 2. Professional Card (MOST POPULAR - Dark Card matching Image 2) */}
                  <div className="bg-[#0B0F19] text-white rounded-3xl border border-slate-800 p-7 flex flex-col justify-between shadow-2xl relative ring-1 ring-white/10 lg:-translate-y-2">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                          MOST POPULAR
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Active</span>
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-2xl sm:text-3xl font-black text-white mt-5 tracking-tight">
                        Professional
                      </h3>
                      <div className="flex items-baseline mt-2">
                        <span className="text-4xl font-black text-white tracking-tight">$49.99</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-400 ml-1.5">/month</span>
                      </div>

                      {/* Feature Checklist matching Image 2 */}
                      <div className="space-y-4 my-8 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-white shrink-0" />
                          <span>Max Workers: <strong className="text-white font-bold">15</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-white shrink-0" />
                          <span>Unlimited Bookings</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-white shrink-0" />
                          <span>Allow Cash Payment</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                          <X className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Custom Branding</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="select-plan-professional-btn"
                      onClick={() => handleSelectPlan('Professional', 49.99, ['Max Workers: 15', 'Unlimited Bookings', 'Allow Cash Payment'])}
                      className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-white/20 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                      <span>Select Plan</span>
                    </button>
                  </div>

                  {/* 3. Enterprise Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-7 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow relative">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                          CORPORATE
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-5 tracking-tight">
                        Enterprise
                      </h3>
                      <div className="flex items-baseline mt-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">$149.99</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-500 ml-1.5">/month</span>
                      </div>

                      {/* Feature Checklist matching Image 2 */}
                      <div className="space-y-4 my-8 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>Max Workers: <strong className="text-slate-900 font-bold">Unlimited</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>Allow Cash Payment</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>White-label Portal</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                          <Check className="w-4 h-4 text-slate-900 shrink-0" />
                          <span>Dedicated Account Manager</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="select-plan-enterprise-btn"
                      onClick={() => handleSelectPlan('Enterprise', 149.99, ['Max Workers: Unlimited', 'Allow Cash Payment', 'White-label Portal', 'Dedicated Account Manager'])}
                      className="w-full py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>Select Plan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE VIEW: Comparison View */}
              {subscriptionViewMode === 'table' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-4 px-6">PLAN FEATURES</th>
                          <th className="py-4 px-6">ESSENTIAL ($19.99/mo)</th>
                          <th className="py-4 px-6 bg-slate-900 text-white">PROFESSIONAL ($49.99/mo)</th>
                          <th className="py-4 px-6">ENTERPRISE ($149.99/mo)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">Max Workers</td>
                          <td className="py-3.5 px-6 font-medium text-slate-600">3 Workers</td>
                          <td className="py-3.5 px-6 font-bold text-slate-900 bg-slate-50">15 Workers</td>
                          <td className="py-3.5 px-6 font-medium text-slate-600">Unlimited</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">Bookings</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">Unlimited</td>
                          <td className="py-3.5 px-6 font-bold text-emerald-600 bg-slate-50">Unlimited</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">Unlimited</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">Allow Cash Payment</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400">✕ No</td>
                          <td className="py-3.5 px-6 font-bold text-emerald-600 bg-slate-50">✓ Yes</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">✓ Yes</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">Custom Branding</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400">✕ No</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400 bg-slate-50">✕ No</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">✓ Yes</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">White-label Portal</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400">✕ No</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400 bg-slate-50">✕ No</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">✓ Yes</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">Account Manager</td>
                          <td className="py-3.5 px-6 font-medium text-slate-400">Community</td>
                          <td className="py-3.5 px-6 font-medium text-slate-600 bg-slate-50">Priority Support</td>
                          <td className="py-3.5 px-6 font-medium text-emerald-600">Dedicated VIP</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="py-4 px-6 font-bold text-slate-900">Select Plan</td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleSelectPlan('Essential', 19.99, ['Max Workers: 3', 'Unlimited Bookings'])}
                              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Choose Essential
                            </button>
                          </td>
                          <td className="py-4 px-6 bg-slate-100">
                            <button
                              onClick={() => handleSelectPlan('Professional', 49.99, ['Max Workers: 15', 'Unlimited Bookings', 'Allow Cash Payment'])}
                              className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                            >
                              Choose Professional
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleSelectPlan('Enterprise', 149.99, ['Max Workers: Unlimited', 'Allow Cash Payment', 'White-label Portal', 'Dedicated Account Manager'])}
                              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Choose Enterprise
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 9: WORKERS & SPECIALISTS MANAGEMENT                            */}
          {/* =================================================================== */}
          {activeTab === 'workers' && (
            <BusinessWorkersManagementView
              business={selectedBusiness}
              allBusinesses={state.businesses}
              bookings={bookings}
              onSelectBooking={(b) => setSelectedBookingDetails(b)}
            />
          )}

          {/* Fallback for other sidebar items */}
          {['customers', 'reviews', 'account', 'settings'].includes(activeTab) && (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 animate-in fade-in">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h2 className="text-lg font-extrabold text-slate-900 capitalize">{activeTab} Section</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Comprehensive module for managing {activeTab} for {currentUser?.fullName || 'Alex Vance'}.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: WITHDRAWAL REQUEST                                                 */}
      {/* ========================================================================= */}
      {isPayoutModalOpen && (() => {
        const parsedAmount = parseFloat(payoutAmount.replace(/,/g, '')) || 0;
        const activeCommRate = platformLedger?.commissionRate ?? 10.0;
        const calcCommission = Number(((parsedAmount * activeCommRate) / 100).toFixed(2));
        const calcTaxRate = isSelectedBizW9Certified ? 0 : 24.0;
        const calcTaxWithheld = isSelectedBizW9Certified ? 0 : Number(((parsedAmount * 0.24).toFixed(2)));
        const calcNetTransfer = Math.max(0, Number((parsedAmount - calcCommission - calcTaxWithheld).toFixed(2)));
        const destBankName = selectedBusiness.verification?.bankAccount?.bankName || 'Commercial Bank';
        const destMasked = selectedBusiness.verification?.bankAccount?.accountNumberMasked || '•••• 9382';
        const destRouting = selectedBusiness.verification?.bankAccount?.routingNumber || '121000358';
        const destHolder = selectedBusiness?.verification?.bankAccount?.accountHolderName || selectedBusiness?.coreDetails?.businessName || 'Business';

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Withdrawal Request</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Disburse available earnings to verified commercial bank</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
                {/* Available Balance Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available to Withdraw</label>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-semibold">Current Available Balance</span>
                    <span className="font-mono font-black text-emerald-700 text-base">
                      ${currentBusinessBalance.availableBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Withdrawal Amount ($ USD) *</label>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(currentBusinessBalance.availableBalance.toFixed(2))}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Withdraw All (${currentBusinessBalance.availableBalance.toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentBusinessBalance.availableBalance}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {parseFloat(payoutAmount) > currentBusinessBalance.availableBalance && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      Amount cannot exceed available balance of ${currentBusinessBalance.availableBalance.toFixed(2)}.
                    </p>
                  )}
                </div>

                {/* Destination Bank Account Card */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Destination Commercial Bank</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPayoutModalOpen(false);
                        setBankFormData((prev) => ({
                          ...prev,
                          accountHolderName: destHolder,
                          bankName: destBankName,
                          routingNumber: destRouting,
                        }));
                        setIsLinkBankModalOpen(true);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Landmark className="w-3 h-3" />
                      <span>Change Bank</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                      <span>{destBankName} • {destHolder}</span>
                      <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Linked & Verified
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                      <span>Routing: {destRouting} • Account: {destMasked}</span>
                      <span className="text-[10px] font-sans text-slate-400 font-medium">Direct ACH Disbursement</span>
                    </div>
                  </div>
                </div>

                {/* Transparent Deduction Breakdown Card */}
                {parsedAmount > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between pb-2 border-b border-slate-200">
                      <span>Disbursement Calculation Preview</span>
                      <span className="text-[10px] font-medium text-slate-500">Super Admin Deductions</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Gross Requested Amount</span>
                        <span className="font-mono font-bold text-slate-900">${parsedAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Platform Commission ({activeCommRate}%)</span>
                        <span className="font-mono font-bold text-violet-700">-${calcCommission.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>IRS Backup Withholding</span>
                          {isSelectedBizW9Certified ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                              0% W-9 Certified
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                              24% W-9 Missing
                            </span>
                          )}
                        </span>
                        <span className={`font-mono font-bold ${calcTaxWithheld > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {calcTaxWithheld > 0 ? `-$${calcTaxWithheld.toFixed(2)}` : '$0.00'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">Estimated Net Payout</span>
                        <span className="font-mono font-black text-emerald-600 text-base">
                          ${calcNetTransfer.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* W-9 Form Warning Banner if not certified */}
                {!isSelectedBizW9Certified && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-amber-950">
                        Form W-9 Missing — 24% tax ($${calcTaxWithheld.toFixed(2)}) will be withheld!
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Complete your Form W-9 tax certification to eliminate the 24% backup withholding tax and receive full net earnings.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPayoutModalOpen(false);
                          setActiveTab('w9-form');
                        }}
                        className="text-[11px] font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer pt-0.5"
                      >
                        Complete Form W-9 Now (0% Tax) ›
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      currentBusinessBalance.availableBalance <= 0 ||
                      parsedAmount <= 0 ||
                      parsedAmount > currentBusinessBalance.availableBalance ||
                      isNaN(parsedAmount)
                    }
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
                      currentBusinessBalance.availableBalance > 0 &&
                      parsedAmount > 0 &&
                      parsedAmount <= currentBusinessBalance.availableBalance
                        ? 'bg-black text-white hover:bg-slate-800 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Submit Payout Request (${calcNetTransfer.toFixed(2)} Net)
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: LINK COMMERCIAL BANK ACCOUNT                                       */}
      {/* ========================================================================= */}
      {isLinkBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Link Commercial Bank</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Required for direct ACH payout disbursements</p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkBankModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankAccount} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Direct ACH Settlement</span>
                  <span className="text-[11px] text-blue-800">
                    When Super Admin authorizes your payouts, funds will transfer directly to this verified commercial bank account.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Financial Institution *</label>
                <select
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="JPMorgan Chase">JPMorgan Chase Bank</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo Bank</option>
                  <option value="Citibank">Citibank, N.A.</option>
                  <option value="PNC Bank">PNC Bank</option>
                  <option value="US Bank">U.S. Bank National Association</option>
                  <option value="Capital One">Capital One</option>
                  <option value="Silicon Valley Bank">Silicon Valley Bank</option>
                  <option value="Other Commercial Bank">Other Commercial Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={bankFormData.accountHolderName}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountHolderName: e.target.value })}
                  placeholder="Legal Entity or Business DBA Name"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Type *</label>
                  <select
                    value={bankFormData.accountType}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="CHECKING">Business Checking</option>
                    <option value="SAVINGS">Business Savings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Routing Number (9 Digits) *</label>
                  <input
                    type="text"
                    maxLength={9}
                    required
                    value={bankFormData.routingNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                    placeholder="e.g. 121000358"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number *</label>
                <input
                  type="password"
                  required
                  value={bankFormData.accountNumber}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter commercial account number"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankFormData.confirmAccountNumber}
                  onChange={(e) => setBankFormData({ ...bankFormData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Re-enter commercial account number"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-slate-800 cursor-pointer transition-all shadow-xs"
                >
                  Save & Link Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BUSINESS MODAL */}
      {isCreateBusinessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Create Business Location</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register a new branch or facility to your multi-location network.
                </p>
              </div>
              <button
                onClick={() => setIsCreateBusinessModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBusinessSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Workspace Studio"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry / Category
                  </label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="IT">IT & Tech</option>
                    <option value="Design">Design & Media</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Coworking">Coworking</option>
                    <option value="Fitness">Fitness & Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seattle, WA"
                    value={newBizCity}
                    onChange={(e) => setNewBizCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Services
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBizServices}
                    onChange={(e) => setNewBizServices(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Team Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBizWorkers}
                    onChange={(e) => setNewBizWorkers(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Draft (Pending KYC & Admin Approval)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBusinessModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Business</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BUSINESS MODAL */}
      {isEditBusinessModalOpen && editingBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Edit Business Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update location information, services, and operational parameters.
                </p>
              </div>
              <button
                onClick={() => setIsEditBusinessModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditBusinessSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingBiz.name}
                  onChange={(e) => setEditingBiz({ ...editingBiz, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingBiz.category}
                    onChange={(e) => setEditingBiz({ ...editingBiz, category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editingBiz.city}
                    onChange={(e) => setEditingBiz({ ...editingBiz, city: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Services</label>
                  <input
                    type="number"
                    min="0"
                    value={editingBiz.services}
                    onChange={(e) =>
                      setEditingBiz({ ...editingBiz, services: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workers</label>
                  <input
                    type="number"
                    min="0"
                    value={editingBiz.workers}
                    onChange={(e) =>
                      setEditingBiz({ ...editingBiz, workers: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{editingBiz.status}</span>
                    <span className="text-[10px] text-slate-400 font-medium">(Super Admin managed)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditBusinessModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BUSINESS DETAILS MODAL */}
      {isViewBusinessModalOpen && viewingBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                  {viewingBiz.avatarChar}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{viewingBiz.name}</h3>
                  <p className="text-xs text-slate-500">{viewingBiz.category}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewBusinessModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Services
                  </span>
                  <span className="text-sm font-black text-slate-900">{viewingBiz.services}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Workers
                  </span>
                  <span className="text-sm font-black text-slate-900">{viewingBiz.workers}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    City
                  </span>
                  <span className="text-sm font-black text-slate-900">{viewingBiz.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Status State</span>
                  <span className="text-slate-500 text-[11px]">Accepting bookings</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewingBiz.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : viewingBiz.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      viewingBiz.status === 'Active'
                        ? 'bg-emerald-500'
                        : viewingBiz.status === 'Pending'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span>{viewingBiz.status}</span>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditMultiStep(viewingBiz)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Edit Business
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewBusinessModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT DESK MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Contact Support Desk</h3>
                  <p className="text-xs text-slate-500">24/7 dedicated enterprise partner assistance</p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Topic</label>
                <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>Multi-branch synchronization</option>
                  <option>KYC verification assistance</option>
                  <option>Payout & billing inquiry</option>
                  <option>Custom API integration</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe Your Issue *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide details about the issue or location inquiry..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Send Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* MODAL: CONFIRM SUBSCRIPTION PLAN & PAYMENT                                */}
      {/* ========================================================================= */}
      {isPlanConfirmModalOpen && selectedPlanForConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Confirm Subscription Plan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your tier details before confirming marketplace activation
                  </p>
                </div>
              </div>
              <button
                id="close-plan-confirm-modal-btn"
                onClick={() => {
                  if (!isProcessingPayment) {
                    setIsPlanConfirmModalOpen(false);
                  }
                }}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Target Business Card */}
              {payingBiz && (() => {
                const payingName = payingBiz.coreDetails?.businessName || (payingBiz as any).name || 'Business';
                const payingCat = payingBiz.coreDetails?.category || (payingBiz as any).category || 'Coworking & Office';
                const payingCity = payingBiz.coreDetails?.city || (payingBiz as any).city || 'San Francisco';
                return (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shrink-0 shadow-2xs">
                      {payingBiz.avatarChar || payingName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target Business
                      </span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {payingName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {payingCat} • {payingCity}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    payingBiz.status === 'KYC Approved' || payingBiz.status === 'Live'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                  }`}>
                    {payingBiz.status === 'KYC Approved' ? 'KYC Verified' : payingBiz.status}
                  </span>
                </div>
                );
              })()}

              {/* Plan Summary Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50/70 to-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {selectedPlanForConfirmation.name} Plan
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-1.5">
                      ${selectedPlanForConfirmation.price.toFixed(2)}{' '}
                      <span className="text-xs font-medium text-slate-500">/month</span>
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    Monthly Billing
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Plan Inclusions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {selectedPlanForConfirmation.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Method / Verification summary */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Payment Instrument</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Instant ACH</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Apex Media Group Inc. (•••• 5519)</span>
                  <span className="font-mono text-slate-500 text-[11px]">Next billing: Oct 10, 2026</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  🔒 256-bit encrypted checkout. Your business will go Live on the marketplace immediately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setIsPlanConfirmModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="confirm-pay-btn"
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPlanPayment}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm & Pay ${selectedPlanForConfirmation.price.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAYMENT ACCOUNT SETUP REQUIRED (Withdrawal Intercept Prompt)       */}
      {/* ========================================================================= */}
      {isNmiRequiredModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-2xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Payment Account Setup Required</h3>
                  <p className="text-xs text-slate-500 mt-0.5">NMI Sub-Account Verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsNmiRequiredModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 text-sm leading-relaxed">
                To withdraw funds, please complete your payment account setup. You must configure your direct settlement account with NMI Gateway to receive marketplace earnings.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold flex items-center gap-1.5 text-xs text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Withdrawal Currently Locked
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    {selectedBusiness?.nmiPaymentAccount?.nmiOnboardingStatus || 'SKIPPED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Connecting an NMI vendor sub-account enables automated ACH settlement and unlocks transfers immediately.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNmiRequiredModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-complete-nmi-setup"
                  onClick={() => {
                    setIsNmiRequiredModalOpen(false);
                    setProceedToWithdrawAfterNmi(true);
                    setIsNmiSetupModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Set Up Payment Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NMI PAYMENT ACCOUNT SETUP MODAL                                    */}
      {/* ========================================================================= */}
      {isNmiSetupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-8">
            <NmiPaymentAccountSetup
              businessId={selectedBusiness?.id || 'biz-001'}
              initialData={selectedBusiness?.nmiPaymentAccount || {
                companyName: selectedBusiness?.coreDetails?.legalEntityName || selectedBusiness?.coreDetails?.businessName,
                email: selectedBusiness?.email || currentUser?.email,
                firstName: currentUser?.fullName?.split(' ')[0] || 'Alex',
                lastName: currentUser?.fullName?.split(' ').slice(1).join(' ') || 'Vance',
                federalTaxId: '12-3456789',
                bankRoutingNumber: '',
                bankAccountNumber: '',
                accountType: 'checking',
                accountHolderType: 'business',
              }}
              allowSkip={!proceedToWithdrawAfterNmi}
              isModal={true}
              onSuccess={(accountData) => {
                saveNmiPaymentAccount(selectedBusiness.id, accountData);
                showToast('✓ Payment Account connected successfully via NMI Gateway!');
                setIsNmiSetupModalOpen(false);
                if (proceedToWithdrawAfterNmi) {
                  setProceedToWithdrawAfterNmi(false);
                  const bal = getBusinessBalance(selectedBusiness?.id || '');
                  setPayoutAmount(bal.availableBalance > 0 ? bal.availableBalance.toFixed(2) : '0.00');
                  setIsPayoutModalOpen(true);
                }
              }}
              onSkip={() => {
                saveNmiPaymentAccount(selectedBusiness.id, { nmiOnboardingStatus: 'SKIPPED' });
                setIsNmiSetupModalOpen(false);
                setProceedToWithdrawAfterNmi(false);
              }}
              onCancel={() => {
                setIsNmiSetupModalOpen(false);
                setProceedToWithdrawAfterNmi(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW SERVICE DETAILS MODAL (Eye Action)                            */}
      {/* ========================================================================= */}
      {previewingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{previewingService.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedBusiness?.coreDetails?.businessName || (selectedBusiness as any)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingService(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Media Section: Thumbnail + Showcase Gallery */}
              {(() => {
                const mediaImages = [
                  ...(previewingService.photo_url || previewingService.thumbnail_url
                    ? [previewingService.photo_url || previewingService.thumbnail_url!]
                    : []),
                  ...(previewingService.gallery_photos || []),
                ].filter(Boolean);

                if (mediaImages.length === 0) return null;

                const activeMediaUrl = mediaImages[previewImageIndex] || mediaImages[0];
                const isThumbnail = previewImageIndex === 0 && (previewingService.photo_url || previewingService.thumbnail_url);

                return (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 w-full bg-slate-900 shadow-2xs">
                      <img
                        src={activeMediaUrl}
                        alt={previewingService.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>
                          {isThumbnail ? 'Service Thumbnail' : `Gallery Photo #${previewImageIndex}`}
                        </span>
                        <span className="text-slate-400">({previewImageIndex + 1}/{mediaImages.length})</span>
                      </div>
                    </div>

                    {/* Interactive Thumbnail Strip for Gallery */}
                    {mediaImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {mediaImages.map((url, idx) => {
                          const isSelected = previewImageIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewImageIndex(idx)}
                              className={`relative w-14 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105 shadow-xs'
                                  : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                              }`}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black px-1 rounded bg-black/70 text-white">
                                {idx === 0 ? 'T' : `#${idx}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Badges & Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {previewingService.category_name || 'General'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pricing</span>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    {previewingService.pricing_type === 'time_based' ? 'Hourly Rate' : 'Fixed Fee'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate / Price</span>
                  <span className="font-extrabold text-slate-900 text-xs font-mono block">
                    ${(previewingService.hourly_rate || previewingService.base_price).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    {previewingService.duration_minutes} mins
                  </span>
                </div>
              </div>

              {/* Description */}
              {previewingService.description && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{previewingService.description}</p>
                </div>
              )}

              {/* Status & Workers */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Assigned Staff:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200 text-xs">
                    {previewingService.assigned_workers_count ?? 4} Workers
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      previewingService.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        previewingService.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>{previewingService.status === 'active' ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>
              </div>

              {/* Weekly Operating Hours Summary */}
              {previewingService.service_hours && previewingService.service_hours.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Weekly Availability Hours
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {previewingService.service_hours.map((h) => {
                      const dayName =
                        h.day_of_week === 1
                          ? 'Mon'
                          : h.day_of_week === 2
                          ? 'Tue'
                          : h.day_of_week === 3
                          ? 'Wed'
                          : h.day_of_week === 4
                          ? 'Thu'
                          : h.day_of_week === 5
                          ? 'Fri'
                          : h.day_of_week === 6
                          ? 'Sat'
                          : 'Sun';
                      return (
                        <div
                          key={h.day_of_week}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-700">{dayName}</span>
                          <span className="text-slate-500 font-medium text-[10px]">
                            {h.is_closed ? 'Closed' : `${formatTime24To12(h.open_time)} - ${formatTime24To12(h.close_time)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = previewingService;
                    setPreviewingService(null);
                    handleOpenEditServiceView(target);
                  }}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN WORKERS MODAL (Users Action)                                */}
      {/* ========================================================================= */}
      {assigningWorkersService && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                  <UsersRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Assign Service Staff</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{assigningWorkersService.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAssigningWorkersService(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Define the count of available professional staff qualified to perform{' '}
                <span className="font-bold text-slate-900">"{assigningWorkersService.name}"</span>. Customer booking slots adjust capacity according to worker availability.
              </p>

              {/* Worker Count Adjuster */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Qualified Staff Count
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {assigningWorkersService.assigned_workers_count ?? 4} Specialists
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const current = assigningWorkersService.assigned_workers_count ?? 4;
                      const nextVal = Math.max(1, current - 1);
                      updateBusinessService(assigningWorkersService.id, { assigned_workers_count: nextVal });
                      setAssigningWorkersService({ ...assigningWorkersService, assigned_workers_count: nextVal });
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      const current = assigningWorkersService.assigned_workers_count ?? 4;
                      const nextVal = current + 1;
                      updateBusinessService(assigningWorkersService.id, { assigned_workers_count: nextVal });
                      setAssigningWorkersService({ ...assigningWorkersService, assigned_workers_count: nextVal });
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sample Staff Roster */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Designated Staff Roster
                </span>
                <div className="space-y-1.5">
                  {[
                    { name: 'Marco Ross', role: 'Master Stylist & Barber', status: 'Available' },
                    { name: 'Elena Vance', role: 'Color Specialist', status: 'Available' },
                    { name: 'David Kim', role: 'Grooming & Beard Specialist', status: 'On Shift' },
                    { name: 'Sofia Mendes', role: 'Licensed Esthetician', status: 'Available' },
                  ].map((staff, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                          {staff.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{staff.name}</p>
                          <p className="text-[10px] text-slate-400">{staff.role}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {staff.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Staff assignments saved.');
                    setAssigningWorkersService(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BOOKING DETAILS MODAL                                              */}
      {/* ========================================================================= */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Booking #{selectedBookingDetails.id.toUpperCase().slice(0, 10)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedBookingDetails.business_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Customer Contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{selectedBookingDetails.customer_name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      selectedBookingDetails.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedBookingDetails.status === 'visited'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedBookingDetails.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <span className="font-medium">{selectedBookingDetails.customer_email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <span className="font-mono font-medium">{selectedBookingDetails.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Appointment Slot</span>
                <div className="flex items-center justify-between text-slate-900">
                  <span className="font-extrabold text-sm">
                    {selectedBookingDetails.booking_date || selectedBookingDetails.scheduled_date}
                  </span>
                  <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-2xs">
                    {selectedBookingDetails.scheduled_time_slot ||
                      (selectedBookingDetails.scheduled_start_time
                        ? `${selectedBookingDetails.scheduled_start_time} - ${selectedBookingDetails.scheduled_end_time}`
                        : 'Scheduled')}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  Total duration: <strong>{selectedBookingDetails.total_duration_minutes} minutes</strong>
                </p>
              </div>

              {/* Line-item service breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Booked Services ({selectedBookingDetails.items?.length || 0})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {(selectedBookingDetails.items || []).map((it) => (
                    <div key={it.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{it.service_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {it.duration_minutes} mins • Slot: {it.scheduled_start} - {it.scheduled_end}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-slate-900">
                        ${(it.price_charged ?? it.price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Total Amount</span>
                    <span className="text-sm font-black font-mono text-slate-900">
                      ${(selectedBookingDetails.total_amount ?? selectedBookingDetails.total_price ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Payment Method: </span>
                  <strong className="text-slate-900">
                    {selectedBookingDetails.payment_method === 'credit_card' ? 'Online Card (NMI)' : 'Pay at Venue'}
                  </strong>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    selectedBookingDetails.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedBookingDetails.payment_status}
                </span>
              </div>

              {/* Worker Assignment & Dispatch Widget */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                    <UsersRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Assign Specialist Worker</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Live Shift Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Check specialist staff on shift for this venue on {selectedBookingDetails.booking_date || 'scheduled appointment date'} and dispatch the appointment.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookingDetails(null);
                    setActiveTab('workers');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Check Worker Availability & Dispatch</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {selectedBookingDetails.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        cancelBooking(selectedBookingDetails.id, 'Cancelled by salon');
                        showToast(`Booking cancelled.`);
                        setSelectedBookingDetails(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateBookingStatus(selectedBookingDetails.id, 'visited');
                        showToast(`Marked appointment as Visited.`);
                        setSelectedBookingDetails(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Visited</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBookingDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
