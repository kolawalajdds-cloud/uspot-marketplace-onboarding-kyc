import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Business,
  BusinessCoreDetails,
  BusinessStatus,
  DEFAULT_WEEK_HOURS,
  FeesTax,
  GalleryImage,
  HolidaysRules,
  INITIAL_AMENITIES,
  NotificationItem,
  OperatingDay,
  PlanTier,
  UserProfile,
  UserRole,
  VerificationData,
  computeRiskTier,
  W9Data,
  MarketplaceTransaction,
  WithdrawalRequest,
  BusinessBalance,
  PlatformLedgerState,
  NmiPaymentAccountData,
  NmiOnboardingStatus,
  BusinessHours,
  BusinessService,
  Booking,
  BookingItem,
  BookingStatus,
  BookingPaymentStatus,
  BookingPaymentMethod,
  BusinessReview,
  CustomerSavedCard,
  SupportTicket,
  TicketMessage,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  WorkerAvailabilityStatus,
  WorkerDocument,
  WorkerJob,
  WorkerJobStatus,
} from '../types';
import {
  getSeedBusinesses,
  getSeedBusinessServices,
  getSeedBookings,
  getSeedBusinessReviews,
  getSeedCustomerSavedCards,
  getSalonPresetServices,
  getSpaPresetServices,
  getPresetServicesForBusiness,
  getSeedServiceCategories,
} from '../data/seedData';
import { getSeedUsers } from '../data/seedUsers';
import { calculateLedgerBalances, normalizeTransactionType } from '../utils/ledgerAccounting';
import { timeToMinutes, minutesToTimeString } from '../utils/serviceBookingUtils';
import {
  businessService,
  bookingService,
  cardService,
  reviewService,
  complianceService,
  userService,
  serviceCatalogService,
} from '../services/api/marketplaceApi';

const LOCAL_STORAGE_KEY = 'uspot_marketplace_dynamic_v2';
const PAYMENT_RATE_STORAGE_KEY = 'urspot_superadmin_payment_rate';

export function sanitizeBusiness(b: any): Business {
  if (!b || typeof b !== 'object') return b;
  const name = b.coreDetails?.businessName || b.businessName || b.name || 'Untitled Business';
  return {
    ...b,
    id: b.id || `biz-${Date.now()}`,
    status: b.status || 'Draft',
    coreDetails: {
      businessName: name,
      legalEntityName: b.coreDetails?.legalEntityName || b.legalEntityName || name,
      category: b.coreDetails?.category || b.category || 'Coworking & Office',
      description: b.coreDetails?.description || b.description || '',
      streetAddress: b.coreDetails?.streetAddress || b.streetAddress || '',
      city: b.coreDetails?.city || b.city || 'San Francisco',
      state: b.coreDetails?.state || b.state || 'CA',
      zipCode: b.coreDetails?.zipCode || b.zipCode || '94105',
    },
    operatingHours: Array.isArray(b.operatingHours) ? b.operatingHours : [],
    imageGallery: Array.isArray(b.imageGallery) ? b.imageGallery : [],
    amenities: Array.isArray(b.amenities) ? b.amenities : [],
  };
}

export const DEFAULT_LEDGER_STATE: PlatformLedgerState = {
  platformCommissionBalance: 0,
  platformTaxWithholdingBalance: 0,
  totalPlatformBalance: 0,
  businessBalances: {},
  superAdminBank: {
    bankName: 'JPMorgan Chase Treasury',
    accountHolder: 'URSPOT Platform Operations LLC',
    accountMasked: '•••• •••• 5678',
    routingNumber: '021000021',
  },
  transactions: [],
  withdrawals: [],
  commissionRate: 10.0,
};

interface StoredState {
  businesses: Business[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  activeRole: 'vendor' | 'admin';
  activeBusinessId: string | null;
  vendorView: 'list' | 'wizard';
  adminView: 'queue' | 'all' | 'detail';
  adminSelectedBusinessId: string | null;
  wizardTab:
    | 'Core Details'
    | 'Operating Hours'
    | 'Image Gallery'
    | 'Amenities'
    | 'Holidays & Rules'
    | 'Fees & Tax'
    | 'Verification';
  isAuthModalOpen: boolean;
  hasExplicitLogin?: boolean;
  notifications?: NotificationItem[];
  platformLedger: PlatformLedgerState;
  // Unified Relational Schema State
  businessServices: BusinessService[];
  bookings: Booking[];
  businessReviews: BusinessReview[];
  customerSavedCards: CustomerSavedCard[];
  supportTickets?: SupportTicket[];
}

interface DemoContextType {
  state: StoredState;
  currentUser: UserProfile | null;
  users: UserProfile[];
  activeBusiness: Business | null;
  adminSelectedBusiness: Business | null;
  unreadNotificationCount: number;
  allNotifications: NotificationItem[];
  isApiConnected: boolean;
  apiError: string | null;
  isLoadingDynamicData: boolean;
  refreshDynamicData: () => Promise<void>;
  // User & Auth
  loginAsUser: (identifier: string, password?: string) => Promise<{ success: boolean; user?: UserProfile; business?: any; error?: string }>;
  logout: () => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createUser: (newUser: UserProfile) => void;
  registerUser: (payload: {
    accountType: 'personal' | 'business' | 'worker' | 'specialist';
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
    nickname?: string;
    username?: string;
    primaryServiceCategory?: string;
    yearsOfExperience?: number | string;
    hourlyRate?: number | string;
    marketingOptIn?: boolean;
  }) => Promise<{ user: UserProfile; business?: any }>;
  updateUserById: (userId: string, updates: Partial<UserProfile>) => void;
  deleteUserById: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  updateBusinessPlan: (businessId: string, plan: PlanTier) => void;
  // Role & Navigation
  setActiveRole: (role: 'vendor' | 'admin') => void;
  setVendorView: (view: 'list' | 'wizard') => void;
  setAdminView: (view: 'queue' | 'all' | 'detail') => void;
  setWizardTab: (tab: StoredState['wizardTab']) => void;
  selectBusinessForVendor: (businessId: string, tab?: StoredState['wizardTab']) => void;
  setActiveBusinessId: (businessId: string) => void;
  selectBusinessForAdmin: (businessId: string) => void;
  resetDemoData: () => void;
  // Business CRUD
  createNewBusiness: () => string;
  updateCoreDetails: (id: string, details: Partial<BusinessCoreDetails>) => void;
  updateOperatingHours: (id: string, hours: OperatingDay[]) => void;
  applyMondayHoursToAll: (id: string) => void;
  addImage: (id: string, customLabel?: string) => void;
  removeImage: (id: string, imageId: string) => void;
  setCoverImage: (id: string, imageId: string) => void;
  toggleAmenity: (id: string, categoryName: string, amenityName: string) => void;
  addCustomAmenity: (
    id: string,
    categoryName: 'General & Comfort' | 'Tech & Workspace' | 'Accessibility',
    name: string,
    description: string
  ) => void;
  updateHolidaysRules: (id: string, updates: Partial<HolidaysRules>) => void;
  addHolidayClosure: (id: string, closure: { name: string; date: string; fullDayClosure: boolean }) => void;
  removeHolidayClosure: (id: string, closureId: string) => void;
  updateFeesTax: (id: string, updates: Partial<FeesTax>) => void;
  addServiceFee: (id: string, fee: { name: string; type: 'Fixed' | 'Percentage'; amount: number }) => void;
  removeServiceFee: (id: string, feeId: string) => void;
  updateVerification: (id: string, updates: Partial<VerificationData>) => void;
  // Simulated KYC Actions
  simulateTinVerification: (id: string, forceStatus?: 'Matched' | 'Mismatch') => Promise<void>;
  simulateStateRegistryCheck: (id: string, fakeFileName?: string) => Promise<void>;
  simulateBeneficialOwnerUpload: (id: string, field: 'govIdUploaded' | 'selfieUploaded') => void;
  simulateSanctionsCheck: (id: string) => Promise<void>;
  simulateBankVerification: (id: string, shouldFail?: boolean) => Promise<void>;
  submitForKycReview: (id: string) => void;
  resubmitKyc: (id: string, updatedData?: any) => void;
  // Payment Flow
  processPayment: (id: string, plan: PlanTier, amount: number) => Promise<void>;
  // Lifecycle & Admin
  adminApproveBusiness: (id: string) => void;
  adminRejectBusiness: (id: string, reason: string) => void;
  adminToggleBusinessStatus: (id: string, active?: boolean) => void;
  publishAndGoLive: (id: string) => void;
  deleteBusinessById: (id: string) => void;
  saveVendorBusiness: (formData: any) => Business;
  saveW9Data: (businessId: string, w9Data: Partial<W9Data>) => void;
  submitW9Data: (businessId: string, w9Data: W9Data) => Promise<void>;
  resetW9Data: (businessId: string) => void;
  // NMI Payment Account
  saveNmiPaymentAccount: (businessId: string, accountData: Partial<NmiPaymentAccountData>) => void;
  getNmiPaymentAccount: (businessId: string) => NmiPaymentAccountData | undefined;
  // Marketplace Ledger, Balances & Withdrawals
  platformLedger: PlatformLedgerState;
  getBusinessBalance: (businessId: string) => BusinessBalance;
  bookServiceWithNmi: (params: {
    businessId: string;
    serviceName: string;
    amount: number;
    customerName: string;
    customerEmail?: string;
  }) => Promise<{ success: boolean; transaction: MarketplaceTransaction; message: string }>;
  requestBusinessWithdrawal: (
    businessId: string,
    amount?: number
  ) => { success: boolean; error?: string; withdrawal?: WithdrawalRequest };
  linkVendorBankAccount: (
    businessId: string,
    bankData: {
      bankName: string;
      accountHolderName: string;
      routingNumber: string;
      accountNumber: string;
      accountType?: 'checking' | 'savings';
    }
  ) => { success: boolean; error?: string };
  approveWithdrawal: (
    withdrawalId: string,
    adminUserId?: string
  ) => { success: boolean; error?: string };
  rejectWithdrawal: (
    withdrawalId: string,
    reason: string,
    adminUserId?: string
  ) => { success: boolean; error?: string };
  requestSuperAdminWithdrawal: (
    amount?: number
  ) => { success: boolean; error?: string; withdrawal?: WithdrawalRequest };
  updateCommissionRate: (newRate: number) => void;
  // Helpers
  prefillWizardWithDummyData: (id: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  // Unified Schema Service & Booking Management
  businessServices: BusinessService[];
  bookings: Booking[];
  addBusinessService: (service: Omit<BusinessService, 'id'>) => BusinessService;
  updateBusinessService: (serviceId: string, updates: Partial<BusinessService>) => void;
  deleteBusinessService: (serviceId: string) => void;
  toggleBusinessServiceStatus: (serviceId: string) => void;
  loadSalonPresets: (businessId: string) => void;
  loadSpaPresets: (businessId: string) => void;
  updateBusinessHours: (businessId: string, hours: BusinessHours[]) => void;
  createBooking: (params: {
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    businessId: string;
    selectedServiceIds: string[];
    dateStr: string;
    startTime: string;
    paymentMethod: BookingPaymentMethod;
    paymentMethodDisplay?: string;
    notes?: string;
    totalAmount?: number;
    taxAmount?: number;
    referenceNumber?: string;
  }) => Promise<{ success: boolean; booking: Booking; message: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  submitBookingReview: (
    bookingId: string,
    serviceId: string,
    reviewData: {
      service_name: string;
      rating: number;
      review_text: string;
      media?: string[];
    }
  ) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newStartTime: string) => void;
  businessReviews: BusinessReview[];
  addVendorReviewReply: (reviewId: string, replyText: string) => void;
  // Customer Saved Cards & Settings
  customerSavedCards: CustomerSavedCard[];
  addCustomerSavedCard: (card: Omit<CustomerSavedCard, 'id' | 'created_at'>) => void;
  removeCustomerSavedCard: (cardId: string) => void;
  setDefaultCustomerSavedCard: (cardId: string) => void;
  // Support Tickets & Chat
  supportTickets: SupportTicket[];
  createSupportTicket: (
    ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>,
    initialMessage: string
  ) => SupportTicket;
  replyToSupportTicket: (
    ticketId: string,
    content: string,
    senderOverride?: Partial<TicketMessage>
  ) => void;
  updateSupportTicketStatus: (ticketId: string, status: TicketStatus) => void;
  // Worker Specific Management
  updateWorkerStatus: (workerId: string, status: WorkerAvailabilityStatus, note?: string) => void;
  updateWorkerJobLifecycle: (jobId: string, newStatus: WorkerJobStatus, meta?: Partial<WorkerJob>) => void;
  addWorkerDocument: (workerId: string, doc: Omit<WorkerDocument, 'id' | 'createdAt'>) => void;
  deleteWorkerDocument: (workerId: string, docId: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const RANDOM_IMAGE_SAMPLES = [
  { label: 'Exterior Plaza & Signage', color: '#3b82f6' },
  { label: 'High-Ceiling Atrium', color: '#10b981' },
  { label: 'Conference Pod Alpha', color: '#8b5cf6' },
  { label: 'Espresso & Networking Bar', color: '#f59e0b' },
  { label: 'Private Executive Suite', color: '#ec4899' },
  { label: 'Open Workspace Loft', color: '#06b6d4' },
  { label: 'Outdoor Garden Terrace', color: '#84cc16' },
  { label: 'Presentation Auditorium', color: '#6366f1' },
];

export function getSeedSupportTickets(): SupportTicket[] {
  return [
    {
      id: 'tick-001',
      ticketNumber: 'TICK-8021',
      userId: 'user-specialist',
      userName: 'Morgan Blake',
      userRole: 'worker',
      userEmail: 'morgan.blake@uspot.com',
      businessId: 'biz-salon-01',
      businessName: 'Glow Salon & Hair Studio',
      jobId: 'job-wrk-001',
      jobTitle: 'Salon Equipment Electrical Calibration',
      title: 'HVAC Air Balancing Tools Calibration on Site',
      category: 'Job & Site Issue',
      priority: 'medium',
      status: 'open',
      createdAt: '2026-09-21T09:30:00Z',
      updatedAt: '2026-09-22T14:15:00Z',
      messages: [
        {
          id: 'msg-001',
          ticketId: 'tick-001',
          senderId: 'user-specialist',
          senderName: 'Morgan Blake',
          senderRole: 'worker',
          content: 'Hi Support Team, while performing HVAC air balancing at Glow Salon today, our digital manometer required calibration verification for the site report. Host management requested we log an additional 30 minutes. Could you confirm shift adjustment?',
          timestamp: '2026-09-21T09:30:00Z',
        },
        {
          id: 'msg-002',
          ticketId: 'tick-001',
          senderId: 'user-superadmin',
          senderName: 'Super Admin Support',
          senderRole: 'super_admin',
          content: 'Hello Morgan, we contacted Glow Salon operations. They confirmed the 30-minute extension is approved and will be reflected on your shift sign-off without deduction.',
          timestamp: '2026-09-22T14:15:00Z',
        },
      ],
    },
    {
      id: 'tick-002',
      ticketNumber: 'TICK-7994',
      userId: 'user-specialist',
      userName: 'Morgan Blake',
      userRole: 'worker',
      userEmail: 'morgan.blake@uspot.com',
      title: 'Annual EPA Section 608 Universal Certification Renewal',
      category: 'Account & KYC',
      priority: 'low',
      status: 'resolved',
      createdAt: '2026-09-15T11:00:00Z',
      updatedAt: '2026-09-16T16:00:00Z',
      messages: [
        {
          id: 'msg-003',
          ticketId: 'tick-002',
          senderId: 'user-specialist',
          senderName: 'Morgan Blake',
          senderRole: 'worker',
          content: 'Uploaded my renewed EPA 608 Universal technician license card to my profile documents. Please review and update my verified badge.',
          timestamp: '2026-09-15T11:00:00Z',
        },
        {
          id: 'msg-004',
          ticketId: 'tick-002',
          senderId: 'user-superadmin',
          senderName: 'Super Admin Compliance',
          senderRole: 'super_admin',
          content: 'Your EPA credential has been inspected and verified against the national registry. All compliance badges updated.',
          timestamp: '2026-09-16T16:00:00Z',
        },
      ],
    },
    {
      id: 'tick-003',
      ticketNumber: 'TICK-8055',
      userId: 'user-specialist',
      userName: 'Morgan Blake',
      userRole: 'worker',
      userEmail: 'morgan.blake@uspot.com',
      title: 'Mobile GPS Check-In Geo-Fence Accuracy',
      category: 'App Bug & Technical',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2026-09-22T18:00:00Z',
      updatedAt: '2026-09-23T08:30:00Z',
      messages: [
        {
          id: 'msg-005',
          ticketId: 'tick-003',
          senderId: 'user-specialist',
          senderName: 'Morgan Blake',
          senderRole: 'worker',
          content: 'When clocking into underground basement facilities at Onyx Luxury Spa, the mobile browser GPS occasionally detects a 40-meter drift. Adding a 100m geo-fence tolerance would prevent manual override flags.',
          timestamp: '2026-09-22T18:00:00Z',
        },
        {
          id: 'msg-006',
          ticketId: 'tick-003',
          senderId: 'user-superadmin',
          senderName: 'Super Admin Tech Ops',
          senderRole: 'super_admin',
          content: 'Engineering has verified the subterranean venue signal issue. We are applying a 150m buffer radius for Onyx Spa basement suites.',
          timestamp: '2026-09-23T08:30:00Z',
        },
      ],
    },
  ];
}

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isApiConnected, setIsApiConnected] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState<boolean>(false);

  const [state, setState] = useState<StoredState>(() => {
    try {
      // Clean up previous localStorage keys that had duplicate test registrations or static mock data
      try {
        localStorage.removeItem('uspot_demo_state');
        localStorage.removeItem('uspot_marketplace_state_v2');
        localStorage.removeItem('uspot_nmi_vendor_accounts');
        localStorage.removeItem('uspot_marketplace_demo_v5');
        localStorage.removeItem('uspot_marketplace_demo_v6');
        localStorage.removeItem('uspot_marketplace_demo_v7');
        localStorage.removeItem('uspot_marketplace_demo_v8');
        localStorage.removeItem('uspot_marketplace_dynamic_v1');
      } catch (e) {}

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            businesses: Array.isArray(parsed.businesses) ? parsed.businesses.map(sanitizeBusiness) : [],
            users: Array.isArray(parsed.users) ? parsed.users : [],
            currentUser: parsed.hasExplicitLogin && parsed.currentUser ? parsed.currentUser : null,
            activeRole: parsed.activeRole || 'vendor',
            activeBusinessId: parsed.activeBusinessId || null,
            vendorView: parsed.vendorView || 'list',
            adminView: parsed.adminView || 'queue',
            adminSelectedBusinessId: parsed.adminSelectedBusinessId || null,
            wizardTab: parsed.wizardTab || 'Core Details',
            isAuthModalOpen: false,
            hasExplicitLogin: Boolean(parsed.hasExplicitLogin && parsed.currentUser),
            platformLedger: parsed.platformLedger || {
              ...DEFAULT_LEDGER_STATE,
              commissionRate: 10.0,
            },
            businessServices: Array.isArray(parsed.businessServices) ? parsed.businessServices : [],
            bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
            businessReviews: Array.isArray(parsed.businessReviews) ? parsed.businessReviews : [],
            customerSavedCards: Array.isArray(parsed.customerSavedCards) ? parsed.customerSavedCards : [],
            supportTickets:
              Array.isArray(parsed.supportTickets) && parsed.supportTickets.length > 0
                ? parsed.supportTickets
                : getSeedSupportTickets(),
          };
        }
      }
    } catch (e) {
      console.error('Failed to load local demo state:', e);
    }

    const savedRate = localStorage.getItem(PAYMENT_RATE_STORAGE_KEY);
    const initialRate = savedRate !== null && !isNaN(parseFloat(savedRate)) ? parseFloat(savedRate) : 10.0;
    return {
      businesses: [],
      users: [],
      currentUser: null,
      activeRole: 'vendor',
      activeBusinessId: null,
      vendorView: 'list',
      adminView: 'queue',
      adminSelectedBusinessId: null,
      wizardTab: 'Core Details',
      isAuthModalOpen: false,
      hasExplicitLogin: false,
      platformLedger: {
        ...DEFAULT_LEDGER_STATE,
        commissionRate: initialRate,
      },
      businessServices: [],
      bookings: [],
      businessReviews: [],
      customerSavedCards: [],
      supportTickets: getSeedSupportTickets(),
    };
  });

  // Persist state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist local demo state:', e);
    }
  }, [state]);

  // Live Neon PostgreSQL synchronization function
  const syncWithNeon = async () => {
    setIsLoadingDynamicData(true);
    try {
      const [bizList, bookingsList, cardsList, usersList, servicesList, reviewsList] = await Promise.allSettled([
        businessService.getBusinesses(),
        bookingService.getBookings(),
        cardService.getAllCards(),
        userService.getUsers(),
        serviceCatalogService.getAllServices(),
        reviewService.getAllReviews(),
      ]);

      const anySuccess = [bizList, bookingsList, cardsList, usersList, servicesList, reviewsList].some(
        (r) => r.status === 'fulfilled'
      );

      if (!anySuccess) {
        setIsApiConnected(false);
        setApiError('Unable to connect to backend database API. Everything is dynamic and requires a running server.');
      } else {
        setIsApiConnected(true);
        setApiError(null);
      }

      setState((prev) => {
        const next = { ...prev };
        let changed = false;

        if (usersList.status === 'fulfilled' && Array.isArray(usersList.value)) {
          next.users = usersList.value;
          if (prev.currentUser) {
            const matchedCur = usersList.value.find(
              (u) =>
                u.id === prev.currentUser?.id ||
                (u.email && prev.currentUser?.email && u.email.toLowerCase() === prev.currentUser.email.toLowerCase())
            );
            if (matchedCur) {
              next.currentUser = matchedCur;
            } else if (prev.currentUser && !prev.hasExplicitLogin) {
              next.currentUser = null;
            }
          }
          changed = true;
        }

        if (bizList.status === 'fulfilled' && Array.isArray(bizList.value)) {
          const sanitized = bizList.value.map(sanitizeBusiness);
          next.businesses = sanitized;
          const cur = next.currentUser || prev.currentUser;
          if (cur && cur.role !== 'super_admin' && cur.role !== 'customer') {
            const userBiz = bizList.value.find(
              (b) =>
                (b.userId && b.userId === cur.id) ||
                (b.email && cur.email && b.email.toLowerCase() === cur.email.toLowerCase())
            );
            if (userBiz) {
              next.activeBusinessId = userBiz.id;
              try {
                localStorage.setItem('uspot_vendor_selected_business_id', userBiz.id);
              } catch (e) {}
            }
          } else if (!next.activeBusinessId && bizList.value.length > 0) {
            next.activeBusinessId = bizList.value[0].id;
          }
          changed = true;
        }

        if (servicesList.status === 'fulfilled' && Array.isArray(servicesList.value)) {
          next.businessServices = servicesList.value;
          changed = true;
        }

        if (bookingsList.status === 'fulfilled' && Array.isArray(bookingsList.value)) {
          next.bookings = bookingsList.value;
          changed = true;
        }

        if (reviewsList.status === 'fulfilled' && Array.isArray(reviewsList.value)) {
          next.businessReviews = reviewsList.value;
          changed = true;
        }

        if (cardsList.status === 'fulfilled' && Array.isArray(cardsList.value)) {
          next.customerSavedCards = cardsList.value;
          changed = true;
        }

        return changed ? next : prev;
      });
    } catch (err: any) {
      console.error('Neon synchronization error:', err);
      setIsApiConnected(false);
      setApiError(err?.message || 'Database synchronization failed.');
    } finally {
      setIsLoadingDynamicData(false);
    }
  };

  // Only synchronize application data from Neon DB when a user is authenticated
  useEffect(() => {
    if (state.currentUser) {
      syncWithNeon();
    }
  }, [state.currentUser?.id]);

  const activeBusiness = state.businesses.find((b) => b.id === state.activeBusinessId) || null;
  const adminSelectedBusiness =
    state.businesses.find((b) => b.id === state.adminSelectedBusinessId) || null;

  // Flatten notifications across all businesses + global for vendor
  const allNotifications = [
    ...(state.notifications || []),
    ...state.businesses.flatMap((b) => b.notifications || []),
  ]
    .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
    .sort((a, b) => {
      return (b.timestamp || '').localeCompare(a.timestamp || '');
    });

  const unreadNotificationCount = allNotifications.filter((n) => !n.read).length;

  const loginAsUser = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserProfile; business?: any; error?: string }> => {
    const trimmed = (identifier || '').trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email or username.' };
    }

    try {
      // 1. Dynamic authentication via backend API (Neon PostgreSQL)
      const res = await userService.login(trimmed, password);
      if (res && res.success && res.user) {
        const loggedUser: UserProfile = res.user;
        const loggedBiz = res.business;

        setState((prev) => {
          const updatedUsers = [
            loggedUser,
            ...prev.users.filter(
              (u) => u.id !== loggedUser.id && u.email?.toLowerCase() !== loggedUser.email?.toLowerCase()
            ),
          ];

          let updatedBusinesses = prev.businesses;
          let targetBizId = prev.activeBusinessId;

          let normalizedBiz = loggedBiz ? sanitizeBusiness(loggedBiz) : null;

          if (normalizedBiz) {
            const bizIndex = prev.businesses.findIndex((b) => b.id === normalizedBiz.id);
            if (bizIndex >= 0) {
              updatedBusinesses = prev.businesses.map((b) => (b.id === normalizedBiz.id ? { ...b, ...normalizedBiz } : b));
            } else {
              updatedBusinesses = [normalizedBiz, ...prev.businesses];
            }
            targetBizId = normalizedBiz.id;
          } else {
            const foundBiz = prev.businesses.find(
              (b) =>
                (b.userId && b.userId === loggedUser.id) ||
                (b.email && loggedUser.email && b.email.toLowerCase() === loggedUser.email.toLowerCase())
            );
            if (foundBiz) {
              targetBizId = foundBiz.id;
            }
          }

          if (targetBizId) {
            try {
              localStorage.setItem('uspot_vendor_selected_business_id', targetBizId);
            } catch (e) {}
          }

          const newRole: 'vendor' | 'admin' =
            loggedUser.role === 'super_admin' || loggedUser.role === 'specialist' ? 'admin' : 'vendor';

          return {
            ...prev,
            users: updatedUsers,
            businesses: updatedBusinesses,
            currentUser: loggedUser,
            activeRole: newRole,
            activeBusinessId: targetBizId,
            isAuthModalOpen: false,
            hasExplicitLogin: true,
          };
        });

        return { success: true, user: loggedUser, business: loggedBiz };
      }

      return {
        success: false,
        error: (res as any)?.error || 'Invalid credentials or user not found in database.',
      };
    } catch (apiErr: any) {
      console.error('Backend login query failed:', apiErr);
      return {
        success: false,
        error: apiErr?.message || 'Login API failed. Unable to authenticate with the database server.',
      };
    }
  };

  const setActiveBusinessId = (businessId: string) => {
    setState((prev) => ({
      ...prev,
      activeBusinessId: businessId,
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isAuthModalOpen: false,
      hasExplicitLogin: false,
      businesses: [],
      businessServices: [],
      bookings: [],
      businessReviews: [],
      customerSavedCards: [],
    }));
    try {
      localStorage.removeItem('uspot_vendor_active_tab');
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (e) {
      // Ignore
    }
  };

  const setCurrentUser = (user: UserProfile | null) => {
    setState((prev) => ({
      ...prev,
      currentUser: user,
      hasExplicitLogin: !!user,
    }));
  };

  const setAuthModalOpen = (open: boolean) => {
    setState((prev) => ({ ...prev, isAuthModalOpen: open }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedCurrent = { ...prev.currentUser, ...updates };
      return {
        ...prev,
        currentUser: updatedCurrent,
        users: prev.users.map((u) => (u.id === updatedCurrent.id ? updatedCurrent : u)),
      };
    });
  };

  const createUser = (newUser: UserProfile) => {
    setState((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
    }));
  };

  const registerUser = async (payload: {
    accountType: 'personal' | 'business' | 'worker' | 'specialist';
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
    nickname?: string;
    username?: string;
    primaryServiceCategory?: string;
    yearsOfExperience?: number | string;
    hourlyRate?: number | string;
    marketingOptIn?: boolean;
  }): Promise<{ user: UserProfile; business?: any }> => {
    try {
      const res = await userService.register(payload);
      if (res && res.success && res.user) {
        const newUser: UserProfile = res.user;
        const newBusiness = res.business;

        setState((prev) => {
          const updatedUsers = [newUser, ...prev.users.filter((u) => u.email !== newUser.email)];
          let updatedBusinesses = prev.businesses;
          let newActiveBizId = prev.activeBusinessId;

          if (newBusiness) {
            const fullBiz: Business = {
              id: newBusiness.id,
              userId: newUser.id,
              status: newBusiness.status || 'Draft',
              business_services: [],
              email: newBusiness.email,
              phone: newBusiness.phone,
              avatarChar: newBusiness.avatarChar || 'B',
              coreDetails: {
                businessName: newBusiness.businessName,
                legalEntityName: newBusiness.legalEntityName,
                category: newBusiness.category || 'Coworking & Creative Hub',
                description: newBusiness.description || '',
                streetAddress: newBusiness.streetAddress || '',
                city: newBusiness.city || 'San Francisco',
                state: newBusiness.state || 'CA',
                zipCode: newBusiness.zipCode || '94105',
              },
              operatingHours: DEFAULT_WEEK_HOURS,
              imageGallery: [],
              amenities: JSON.parse(JSON.stringify(INITIAL_AMENITIES)),
              holidaysRules: {
                holidayClosures: [],
                businessRules: {
                  maxCapacity: 50,
                  petFriendly: false,
                  ageRequirement: 'All Ages',
                  byobAllowed: false,
                },
              },
              feesTax: {
                businessTaxId: '',
                salesTaxRate: 8.87,
                taxExempt: false,
                currency: 'USD',
                automaticInvoicing: true,
                serviceFees: [],
              },
              verification: {
                legalEntityType: 'Limited Liability Company (LLC)',
                einVerification: {
                  einEntered: '',
                  tinRaw: '',
                  tinMasked: '',
                  tinVerificationStatus: 'not_verified',
                  tinMatchStatus: 'Not Started',
                  verifiedAt: null,
                },
                entityRegistration: {
                  documentUploaded: false,
                  stateRegistryStatus: 'Not Checked',
                },
                beneficialOwner: {
                  fullName: newUser.fullName,
                  dateOfBirth: '',
                  ssnLast4: '',
                  govIdUploaded: false,
                  selfieUploaded: false,
                },
                sanctionsScreening: { status: 'Not Started' },
                bankAccount: {
                  accountHolderName: '',
                  routingNumber: '',
                  accountNumberMasked: '',
                  verificationMethod: 'Instant',
                  verified: false,
                },
                riskTier: 'Low',
                submittedAt: null,
                reviewedAt: null,
                reviewedBy: null,
                rejectionReason: null,
              },
              payment: {
                planSelected: 'Starter',
                amount: 49,
                paidAt: new Date().toISOString(),
              },
              notifications: [],
            };

            updatedBusinesses = [fullBiz, ...prev.businesses.filter((b) => b.id !== fullBiz.id)];
            newActiveBizId = fullBiz.id;
          }

          if (newActiveBizId) {
            try {
              localStorage.setItem('uspot_vendor_selected_business_id', newActiveBizId);
            } catch (e) {}
          }

          return {
            ...prev,
            users: updatedUsers,
            businesses: updatedBusinesses,
            currentUser: newUser,
            activeRole: newUser.role === 'business' ? 'vendor' : 'admin',
            activeBusinessId: newActiveBizId,
            hasExplicitLogin: true,
            isAuthModalOpen: false,
          };
        });

        return res;
      }
      throw new Error('Registration did not return a valid user');
    } catch (err: any) {
      console.error('Registration API error:', err);
      throw new Error(err.message || 'Registration failed on server. Please try again.');
    }
  };

  const updateUserById = (userId: string, updates: Partial<UserProfile>) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
      const updatedCurrent = prev.currentUser && prev.currentUser.id === userId
        ? { ...prev.currentUser, ...updates }
        : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });
  };

  const deleteUserById = (userId: string) => {
    setState((prev) => {
      if (prev.currentUser && prev.currentUser.id === userId) {
        // Prevent deleting active user directly
        return prev;
      }
      return {
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      };
    });
  };

  const toggleUserStatus = (userId: string) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === userId) {
          const nextStatus: 'active' | 'inactive' = u.status === 'active' ? 'inactive' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      });
      const updatedCurrent = prev.currentUser && prev.currentUser.id === userId
        ? { ...prev.currentUser, status: prev.currentUser.status === 'active' ? 'inactive' : 'active' }
        : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });
  };

  const updateBusinessPlan = (businessId: string, plan: PlanTier) => {
    const fee = plan === 'Starter' ? 0 : plan === 'Pro' ? 149 : 499;
    updateBusinessInState(businessId, (b) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `Plan upgraded to ${plan} ($${fee}/mo) for ${b.coreDetails.businessName}`,
        type: 'info',
        read: false,
        timestamp: 'Just now',
        businessId,
      };
      return {
        ...b,
        payment: {
          ...b.payment,
          planSelected: plan,
          amount: fee,
        },
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const setActiveRole = (role: 'vendor' | 'admin') => {
    setState((prev) => ({ ...prev, activeRole: role }));
  };

  const setVendorView = (view: 'list' | 'wizard') => {
    setState((prev) => ({ ...prev, vendorView: view }));
  };

  const setAdminView = (view: 'queue' | 'all' | 'detail') => {
    setState((prev) => ({ ...prev, adminView: view }));
  };

  const setWizardTab = (tab: StoredState['wizardTab']) => {
    setState((prev) => ({ ...prev, wizardTab: tab }));
  };

  const selectBusinessForVendor = (businessId: string, tab?: StoredState['wizardTab']) => {
    setState((prev) => ({
      ...prev,
      activeBusinessId: businessId,
      vendorView: 'wizard',
      wizardTab: tab || 'Core Details',
    }));
  };

  const selectBusinessForAdmin = (businessId: string) => {
    setState((prev) => ({
      ...prev,
      adminSelectedBusinessId: businessId,
      adminView: 'detail',
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const seeds = getSeedBusinesses();
    const seedUsers = getSeedUsers();
    const savedRate = localStorage.getItem(PAYMENT_RATE_STORAGE_KEY);
    const initialRate = savedRate !== null && !isNaN(parseFloat(savedRate)) ? parseFloat(savedRate) : 10.0;
    setState({
      businesses: seeds,
      users: seedUsers,
      currentUser: null,
      activeRole: 'vendor',
      activeBusinessId: seeds[0].id,
      vendorView: 'list',
      adminView: 'queue',
      adminSelectedBusinessId: null,
      wizardTab: 'Core Details',
      isAuthModalOpen: false,
      hasExplicitLogin: false,
      platformLedger: {
        ...DEFAULT_LEDGER_STATE,
        commissionRate: initialRate,
      },
    });
  };

  const createNewBusiness = (): string => {
    const newId = `biz-${Date.now().toString().slice(-4)}`;
    const newBiz: Business = {
      id: newId,
      userId: state.currentUser?.id,
      email: state.currentUser?.email || 'vendor@uspot.com',
      status: 'Draft',
      coreDetails: {
        businessName: 'Untitled Venture Space',
        legalEntityName: '',
        category: 'Workspace / Venue',
        description: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
      },
      operatingHours: JSON.parse(JSON.stringify(DEFAULT_WEEK_HOURS)),
      imageGallery: [],
      amenities: JSON.parse(JSON.stringify(INITIAL_AMENITIES)),
      holidaysRules: {
        holidayClosures: [
          { id: 'hol-new-1', name: 'New Year Day', date: '2026-01-01', fullDayClosure: true, enabled: true },
        ],
        businessRules: {
          maxCapacity: 50,
          petFriendly: false,
          ageRequirement: '18+',
          byobAllowed: false,
        },
      },
      feesTax: {
        businessTaxId: '',
        salesTaxRate: 8.0,
        taxExempt: false,
        currency: 'USD',
        automaticInvoicing: true,
        serviceFees: [],
      },
      verification: {
        legalEntityType: 'LLC',
        einVerification: {
          einEntered: '',
          tinMatchStatus: 'Not Started',
          verifiedAt: null,
        },
        entityRegistration: {
          documentUploaded: false,
          fileName: undefined,
          stateRegistryStatus: 'Not Checked',
        },
        beneficialOwner: {
          fullName: '',
          dateOfBirth: '',
          ssnLast4: '',
          govIdUploaded: false,
          selfieUploaded: false,
        },
        sanctionsScreening: {
          status: 'Not Started',
        },
        bankAccount: {
          accountHolderName: '',
          routingNumber: '',
          accountNumberMasked: '',
          verificationMethod: 'Instant',
          verified: false,
        },
        riskTier: 'Low',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
      payment: {
        planSelected: 'Starter',
        amount: 29,
        paidAt: null,
      },
      notifications: [
        {
          id: `notif-${Date.now()}`,
          message: 'Draft initialized. Complete your listing details, select a plan, and submit for KYC verification.',
          type: 'info',
          read: false,
          timestamp: 'Just now',
          businessId: newId,
        },
      ],
    };

    setState((prev) => ({
      ...prev,
      businesses: [newBiz, ...prev.businesses],
      activeBusinessId: newId,
      vendorView: 'wizard',
      wizardTab: 'Core Details',
    }));

    return newId;
  };

  const updateBusinessInState = (
    id: string,
    updater: (biz: Business) => Business
  ) => {
    setState((prev) => ({
      ...prev,
      businesses: prev.businesses.map((b) => (b.id === id ? updater(b) : b)),
    }));
  };

  const updateCoreDetails = (id: string, details: Partial<BusinessCoreDetails>) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      coreDetails: { ...b.coreDetails, ...details },
    }));
  };

  const updateOperatingHours = (id: string, hours: OperatingDay[]) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      operatingHours: hours,
    }));
  };

  const applyMondayHoursToAll = (id: string) => {
    updateBusinessInState(id, (b) => {
      const mon = b.operatingHours.find((h) => h.day === 'Monday') || b.operatingHours[0];
      const newHours = b.operatingHours.map((item) => {
        // Apply Monday hours to Tuesday through Friday; leave Saturday and Sunday as user set
        if (['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(item.day)) {
          return {
            ...item,
            isOpen: mon.isOpen,
            openTime: mon.openTime,
            closeTime: mon.closeTime,
          };
        }
        return item;
      });
      return { ...b, operatingHours: newHours };
    });
  };

  const addImage = (id: string, customLabel?: string) => {
    updateBusinessInState(id, (b) => {
      if (b.imageGallery.length >= 20) return b;
      const pick =
        RANDOM_IMAGE_SAMPLES[Math.floor(Math.random() * RANDOM_IMAGE_SAMPLES.length)];
      const isFirst = b.imageGallery.length === 0;
      const newImage: GalleryImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label: customLabel || pick.label,
        color: pick.color,
        isCover: isFirst,
      };
      return {
        ...b,
        imageGallery: [...b.imageGallery, newImage],
      };
    });
  };

  const removeImage = (id: string, imageId: string) => {
    updateBusinessInState(id, (b) => {
      const remaining = b.imageGallery.filter((img) => img.id !== imageId);
      // If deleted image was cover, reassign cover to first remaining
      if (remaining.length > 0 && !remaining.some((img) => img.isCover)) {
        remaining[0].isCover = true;
      }
      return { ...b, imageGallery: remaining };
    });
  };

  const setCoverImage = (id: string, imageId: string) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      imageGallery: b.imageGallery.map((img) => ({
        ...img,
        isCover: img.id === imageId,
      })),
    }));
  };

  const toggleAmenity = (id: string, categoryName: string, amenityName: string) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      amenities: b.amenities.map((cat) => {
        if (cat.category !== categoryName) return cat;
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.name === amenityName ? { ...item, checked: !item.checked } : item
          ),
        };
      }),
    }));
  };

  const addCustomAmenity = (
    id: string,
    categoryName: 'General & Comfort' | 'Tech & Workspace' | 'Accessibility',
    name: string,
    description: string
  ) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      amenities: b.amenities.map((cat) => {
        if (cat.category !== categoryName) return cat;
        return {
          ...cat,
          items: [
            ...cat.items,
            { id: `amenity-${Date.now()}`, name, description, checked: true },
          ],
        };
      }),
    }));
  };

  const updateHolidaysRules = (id: string, updates: Partial<HolidaysRules>) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      holidaysRules: { ...b.holidaysRules, ...updates },
    }));
  };

  const addHolidayClosure = (
    id: string,
    closure: { name: string; date: string; fullDayClosure: boolean }
  ) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      holidaysRules: {
        ...b.holidaysRules,
        holidayClosures: [
          ...b.holidaysRules.holidayClosures,
          {
            id: `hol-${Date.now()}`,
            name: closure.name,
            date: closure.date,
            fullDayClosure: closure.fullDayClosure,
            enabled: true,
          },
        ],
      },
    }));
  };

  const removeHolidayClosure = (id: string, closureId: string) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      holidaysRules: {
        ...b.holidaysRules,
        holidayClosures: b.holidaysRules.holidayClosures.filter((h) => h.id !== closureId),
      },
    }));
  };

  const updateFeesTax = (id: string, updates: Partial<FeesTax>) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      feesTax: { ...b.feesTax, ...updates },
    }));
  };

  const addServiceFee = (
    id: string,
    fee: { name: string; type: 'Fixed' | 'Percentage'; amount: number }
  ) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      feesTax: {
        ...b.feesTax,
        serviceFees: [
          ...b.feesTax.serviceFees,
          { id: `fee-${Date.now()}`, name: fee.name, type: fee.type, amount: fee.amount },
        ],
      },
    }));
  };

  const removeServiceFee = (id: string, feeId: string) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      feesTax: {
        ...b.feesTax,
        serviceFees: b.feesTax.serviceFees.filter((f) => f.id !== feeId),
      },
    }));
  };

  const updateVerification = (id: string, updates: Partial<VerificationData>) => {
    updateBusinessInState(id, (b) => {
      const mergedVerification = { ...b.verification, ...updates };
      const risk = computeRiskTier(
        mergedVerification.legalEntityType,
        mergedVerification.sanctionsScreening.status,
        mergedVerification.einVerification.tinMatchStatus
      );
      return {
        ...b,
        verification: { ...mergedVerification, riskTier: risk },
      };
    });
  };

  // Simulated KYC Actions with real loading timeouts
  const simulateTinVerification = async (
    id: string,
    forcedStatus?: 'Matched' | 'Mismatch'
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(id, (b) => {
          const einVal = b.verification.einVerification.einEntered || b.feesTax.businessTaxId || '12-3456789';
          const outcome = forcedStatus || 'Matched';
          return {
            ...b,
            verification: {
              ...b.verification,
              einVerification: {
                ...b.verification.einVerification,
                einEntered: einVal,
                tinMatchStatus: outcome,
                verifiedAt: outcome === 'Matched' ? new Date().toISOString() : null,
              },
            },
          };
        });
        resolve();
      }, 1500);
    });
  };

  const simulateStateRegistryCheck = async (id: string, fakeFileName?: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(id, (b) => ({
          ...b,
          verification: {
            ...b.verification,
            entityRegistration: {
              documentUploaded: true,
              fileName: fakeFileName || `${b.coreDetails.state || 'State'}_Certificate_Of_Good_Standing.pdf`,
              stateRegistryStatus: 'Active/Good Standing',
            },
          },
        }));
        resolve();
      }, 1500);
    });
  };

  const simulateBeneficialOwnerUpload = (id: string, field: 'govIdUploaded' | 'selfieUploaded') => {
    updateBusinessInState(id, (b) => ({
      ...b,
      verification: {
        ...b.verification,
        beneficialOwner: {
          ...b.verification.beneficialOwner,
          [field]: true,
        },
      },
    }));
  };

  const simulateSanctionsCheck = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(id, (b) => ({
          ...b,
          verification: {
            ...b.verification,
            sanctionsScreening: {
              status: 'Clear',
            },
          },
        }));
        resolve();
      }, 1500);
    });
  };

  const simulateBankVerification = async (
    id: string,
    shouldFail?: boolean
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(id, (b) => {
          const failed = Boolean(shouldFail);
          return {
            ...b,
            verification: {
              ...b.verification,
              bankAccount: {
                ...b.verification.bankAccount,
                verified: !failed,
                verificationFailed: failed,
                verificationMethod: 'Instant',
                accountNumberMasked: b.verification.bankAccount.accountNumberMasked || '•••• •••• 8842',
              },
            },
          };
        });
        resolve();
      }, 1500);
    });
  };

  const submitForKycReview = (id: string) => {
    updateBusinessInState(id, (b) => {
      const now = new Date().toISOString();
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: 'Your verification has been submitted and is under review.',
        type: 'info',
        read: false,
        timestamp: 'Just now',
        businessId: id,
      };

      return {
        ...b,
        status: 'Pending KYC Review',
        verification: {
          ...b.verification,
          submittedAt: now,
          rejectionReason: null,
        },
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const resubmitKyc = (id: string, updatedData?: any) => {
    updateBusinessInState(id, (b) => {
      const now = new Date().toISOString();
      const formattedDate =
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `🔄 KYC Application for "${b.coreDetails.businessName}" was updated and resubmitted for Super Admin review.`,
        type: 'info',
        read: false,
        timestamp: 'Just now',
        businessId: id,
      };

      // Merge any updated form data into business details
      const updatedCore = { ...b.coreDetails };
      const updatedVerif = { ...b.verification };

      if (updatedData) {
        if (updatedData.businessName || updatedData.coreDetails?.businessName) {
          updatedCore.businessName = updatedData.businessName || updatedData.coreDetails?.businessName;
        }
        if (updatedData.legalEntityName || updatedData.legalName) {
          updatedCore.legalEntityName = updatedData.legalEntityName || updatedData.legalName;
        }
        if (updatedData.category) updatedCore.category = updatedData.category;
        if (updatedData.description) updatedCore.description = updatedData.description;
        if (updatedData.streetAddress) updatedCore.streetAddress = updatedData.streetAddress;
        if (updatedData.city) updatedCore.city = updatedData.city;
        if (updatedData.state) updatedCore.state = updatedData.state;
        if (updatedData.zipCode) updatedCore.zipCode = updatedData.zipCode;

        if (updatedData.ein) {
          updatedVerif.einVerification = {
            ...updatedVerif.einVerification,
            einEntered: updatedData.ein,
            tinMatchStatus: 'Matched',
            verifiedAt: now,
          };
        }
        if (updatedData.entityType) {
          updatedVerif.legalEntityType = updatedData.entityType;
        }
        if (updatedData.sosDocUploaded) {
          updatedVerif.entityRegistration = {
            ...updatedVerif.entityRegistration,
            documentUploaded: true,
            fileName: updatedData.sosDocName || 'Updated_SOS_Registration.pdf',
            stateRegistryStatus: 'Active/Good Standing',
          };
        }
        if (updatedData.uboFullName) {
          updatedVerif.beneficialOwner = {
            ...updatedVerif.beneficialOwner,
            fullName: updatedData.uboFullName,
            dateOfBirth: updatedData.uboDob || updatedVerif.beneficialOwner.dateOfBirth,
            ssnLast4: updatedData.uboSsn ? updatedData.uboSsn.slice(-4) : updatedVerif.beneficialOwner.ssnLast4,
            govIdUploaded: updatedData.govIdUploaded ?? true,
            selfieUploaded: updatedData.selfieUploaded ?? true,
          };
        }
      }

      return {
        ...b,
        status: 'Pending KYC Review',
        subTab: 'kyc-requests',
        rejectionReason: null,
        resubmittedAt: formattedDate,
        coreDetails: updatedCore,
        verification: {
          ...updatedVerif,
          status: 'Pending',
          submittedAt: now,
          resubmittedAt: formattedDate,
          rejectionReason: null,
          kycSubmitted: true,
        },
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const processPayment = async (id: string, plan: PlanTier, amount: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(id, (b) => {
          const now = new Date().toISOString();
          const isApproved =
            b.status === 'KYC Approved' ||
            b.status === 'Live' ||
            b.subTab === 'approved' ||
            b.verification?.status === 'Approved';

          // Check if verification is already 100% complete
          const v = b.verification;
          const kycComplete =
            v.einVerification.tinMatchStatus === 'Matched' &&
            v.entityRegistration.stateRegistryStatus === 'Active/Good Standing' &&
            v.beneficialOwner.govIdUploaded &&
            v.beneficialOwner.selfieUploaded &&
            v.sanctionsScreening.status === 'Clear' &&
            v.bankAccount.verified;

          const nextStatus = isApproved
            ? 'Live'
            : kycComplete
            ? 'Pending KYC Review'
            : (b.status === 'Draft' ? 'Draft' : 'Pending Payment');

          // Sync status and payment info with Neon PostgreSQL
          businessService
            .updateBusiness(id, {
              status: nextStatus,
              subscription: plan,
              payment: {
                planSelected: plan,
                amount,
                paidAt: now,
              },
            })
            .catch((err) => console.warn('Neon DB payment update failed:', err));

          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            message: isApproved
              ? `🎉 Payment of $${amount} for ${plan} plan confirmed! Your business "${b.coreDetails.businessName}" is now active and Live on the platform.`
              : `Payment of $${amount} for ${plan} plan successful! Your subscription is confirmed and will activate automatically when KYC is approved by Super Admin.`,
            type: 'success',
            read: false,
            timestamp: 'Just now',
            businessId: id,
          };

          return {
            ...b,
            status: nextStatus,
            subscription: plan,
            subTab: isApproved ? 'approved' : b.subTab,
            payment: {
              planSelected: plan,
              amount,
              paidAt: now,
            },
            verification: {
              ...b.verification,
              submittedAt: kycComplete ? now : b.verification.submittedAt,
            },
            notifications: [newNotif, ...b.notifications],
          };
        });
        resolve();
      }, 1000);
    });
  };

  const adminApproveBusiness = (id: string) => {
    updateBusinessInState(id, (b) => {
      const now = new Date().toISOString();
      const hasPaid = Boolean(b.payment?.paidAt);
      const targetStatus = hasPaid ? 'Live' : 'KYC Approved';

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: hasPaid
          ? `🎉 Your business "${b.coreDetails.businessName}" KYC has been approved by the Super Admin! Your subscription is active and your business is now Live on the marketplace.`
          : `🎉 Your business "${b.coreDetails.businessName}" KYC has been approved by the Super Admin! Please choose a subscription plan and complete payment to go live.`,
        type: 'success',
        read: false,
        timestamp: 'Just now',
        businessId: id,
        actionRequired: hasPaid ? undefined : 'go_live',
      };

      // Sync status change with Neon PostgreSQL
      businessService
        .updateBusiness(id, { status: targetStatus })
        .catch((err) => console.warn('Neon DB admin approve sync failed:', err));

      return {
        ...b,
        status: targetStatus,
        subTab: 'approved',
        rejectionReason: null,
        verification: {
          ...b.verification,
          status: 'Approved',
          reviewedAt: now,
          reviewedBy: state.currentUser?.fullName || 'Super Admin',
          rejectionReason: null,
          kycSubmitted: true,
        },
        payment: b.payment || {
          planSelected: 'Starter',
          amount: 29,
          paidAt: null,
        },
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const adminRejectBusiness = (id: string, reason: string) => {
    const now = new Date().toISOString();
    const formattedDate =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
      const targetBiz = prev.businesses.find((b) => b.id === id);
      const targetName = targetBiz?.coreDetails.businessName || 'Business';
      const currentRejectionCount = ((targetBiz?.verification.rejectionCount ?? targetBiz?.rejectionCount) || 0) + 1;
      const historyEntry = {
        date: formattedDate,
        reason: reason.trim(),
        rejectedBy: prev.currentUser?.fullName || 'Super Admin',
      };
      const updatedHistory = [...(targetBiz?.verification.rejectionHistory || targetBiz?.rejectionHistory || []), historyEntry];

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `⚠️ KYC Verification Rejected for "${targetName}": ${reason.trim()}`,
        type: 'warning',
        read: false,
        timestamp: 'Just now',
        businessId: id,
        actionRequired: 'edit_kyc',
      };

      const nextBusinesses = prev.businesses.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          status: 'KYC Rejected' as const,
          subTab: 'kyc-requests' as const,
          rejectionReason: reason.trim(),
          rejectionCount: currentRejectionCount,
          rejectionHistory: updatedHistory,
          verification: {
            ...b.verification,
            status: 'Rejected',
            reviewedAt: now,
            reviewedBy: prev.currentUser?.fullName || 'Super Admin',
            rejectionReason: reason.trim(),
            rejectionCount: currentRejectionCount,
            rejectionHistory: updatedHistory,
            kycSubmitted: false,
          },
          notifications: [newNotif, ...(b.notifications || [])],
        };
      });

      return {
        ...prev,
        businesses: nextBusinesses,
        notifications: [newNotif, ...(prev.notifications || [])],
      };
    });
  };

  const deleteBusinessById = (id: string) => {
    setState((prev) => {
      const nextBiz = prev.businesses.filter((b) => b.id !== id);
      const nextActiveId = prev.activeBusinessId === id ? (nextBiz[0]?.id ?? null) : prev.activeBusinessId;
      return {
        ...prev,
        businesses: nextBiz,
        activeBusinessId: nextActiveId,
      };
    });
  };

  const adminToggleBusinessStatus = (id: string, active?: boolean) => {
    updateBusinessInState(id, (b) => {
      const isCurrentlyActive = b.status === 'Live' || b.status === 'KYC Approved';
      const shouldBeActive = active !== undefined ? active : !isCurrentlyActive;
      const nextStatus: BusinessStatus = shouldBeActive ? 'Live' : 'Draft';

      // Sync status change with Neon PostgreSQL
      businessService.updateBusiness(id, { status: nextStatus }).catch((err) =>
        console.warn('Neon DB business status sync failed:', err)
      );

      return {
        ...b,
        status: nextStatus,
        subTab: shouldBeActive ? 'approved' : 'non-subscription',
        updated_at: new Date().toISOString(),
      };
    });
  };

  const saveVendorBusiness = (formData: any): Business => {
    const businessId = formData.id || `biz-${Date.now()}`;
    const now = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const existing = state.businesses.find((b) => b.id === businessId);
    const kycSub = Boolean(formData.kycSubmitted);
    const initialStatus = kycSub ? 'Pending KYC Review' : (existing?.status || 'Draft');

    const core: BusinessCoreDetails = {
      businessName: formData.businessName || existing?.coreDetails.businessName || 'Untitled Business',
      legalEntityName:
        formData.legalEntityName || formData.legalName || existing?.coreDetails.legalEntityName || 'Business Entity LLC',
      category: formData.category || existing?.coreDetails.category || 'General Business',
      description: formData.description || existing?.coreDetails.description || '',
      streetAddress: formData.streetAddress || existing?.coreDetails.streetAddress || '',
      city: formData.city || existing?.coreDetails.city || 'San Francisco',
      state: formData.state || existing?.coreDetails.state || 'CA',
      zipCode: formData.zipCode || existing?.coreDetails.zipCode || '94105',
    };

    const verification: VerificationData = {
      legalEntityType: (formData.entityType as any) || existing?.verification.legalEntityType || 'Limited Liability Company (LLC)',
      federalTaxClassification: formData.federalTaxClassification || existing?.verification.federalTaxClassification,
      llcTaxClassification: formData.llcTaxClassification || existing?.verification.llcTaxClassification,
      tinType: formData.tinType || existing?.verification.tinType || 'EIN',
      einVerification: {
        einEntered: formData.tinRaw || formData.ein || existing?.verification.einVerification.einEntered || '',
        tinRaw: formData.tinRaw || existing?.verification.einVerification.tinRaw || '',
        tinMasked: formData.tinMasked || existing?.verification.einVerification.tinMasked || '',
        tinVerificationStatus: formData.tinStatus || (formData.einMatched ? 'match' : (existing?.verification.einVerification.tinVerificationStatus || 'not_verified')),
        tinMatchStatus: (formData.tinStatus === 'match' || formData.einMatched)
          ? 'Matched'
          : (formData.tinStatus === 'mismatch' ? 'Mismatch' : (existing?.verification.einVerification.tinMatchStatus || 'Not Started')),
        verifiedAt: (formData.tinStatus === 'match' || formData.einMatched) ? now : (existing?.verification.einVerification.verifiedAt || null),
        cp575DocUploaded: existing?.verification.einVerification.cp575DocUploaded,
        cp575FileName: existing?.verification.einVerification.cp575FileName,
      },
      entityRegistration: {
        documentUploaded: Boolean(formData.sosDocUploaded || existing?.verification.entityRegistration.documentUploaded),
        fileName: formData.sosDocName || existing?.verification.entityRegistration.fileName || 'SOS_Registration.pdf',
        stateRegistryStatus: formData.stateRegistryActive
          ? 'Active/Good Standing'
          : (existing?.verification.entityRegistration.stateRegistryStatus || 'Not Checked'),
      },
      beneficialOwner: {
        fullName: formData.uboFullName || existing?.verification.beneficialOwner.fullName || '',
        dateOfBirth: formData.uboDob || existing?.verification.beneficialOwner.dateOfBirth || '',
        ssnLast4: formData.uboSsn ? formData.uboSsn.slice(-4) : (existing?.verification.beneficialOwner.ssnLast4 || ''),
        govIdUploaded: Boolean(formData.govIdUploaded || existing?.verification.beneficialOwner.govIdUploaded),
        selfieUploaded: Boolean(formData.selfieUploaded || existing?.verification.beneficialOwner.selfieUploaded),
      },
      sanctionsScreening: {
        status: formData.sanctionsClear
          ? 'Clear'
          : (existing?.verification.sanctionsScreening.status || 'Not Started'),
      },
      bankAccount: existing?.verification.bankAccount || {
        accountHolderName: core.legalEntityName,
        routingNumber: '121000358',
        accountNumberMasked: '•••• •••• 4829',
        verificationMethod: 'Instant',
        verified: true,
      },
      riskTier: existing?.verification.riskTier || 'Low',
      submittedAt: kycSub ? (existing?.verification.submittedAt || now) : null,
      reviewedAt: existing?.verification.reviewedAt || null,
      reviewedBy: existing?.verification.reviewedBy || null,
      rejectionReason:
        formData.status === 'Pending KYC Review' || formData.kycStatus === 'Pending Review'
          ? null
          : (formData.rejectionReason !== undefined ? formData.rejectionReason : (existing?.verification.rejectionReason || null)),
      rejectionCount:
        formData.rejectionCount !== undefined
          ? formData.rejectionCount
          : (existing?.verification.rejectionCount || existing?.rejectionCount || 0),
      rejectionHistory:
        formData.rejectionHistory !== undefined
          ? formData.rejectionHistory
          : (existing?.verification.rejectionHistory || existing?.rejectionHistory || []),
      resubmittedAt:
        formData.resubmittedAt !== undefined
          ? formData.resubmittedAt
          : (existing?.verification.resubmittedAt || existing?.resubmittedAt || null),
      kycSubmitted: kycSub,
      signature: formData.signature || existing?.verification?.signature || (existing as any)?.signature || undefined,
      signatureDate: formData.signatureDate || existing?.verification?.signatureDate || (existing as any)?.signatureDate || undefined,
    };

    let resultBiz: Business;

    const parsedOperatingHours =
      formData.schedule && Array.isArray(formData.schedule)
        ? formData.schedule.map((s: any) => ({
            day: s.day,
            isOpen: s.isOpen,
            openTime: s.slots?.[0]?.start || '08:00',
            closeTime: s.slots?.[0]?.end || '19:00',
          }))
        : formData.operatingHours || existing?.operatingHours || DEFAULT_WEEK_HOURS;

    const parsedImageGallery =
      formData.images && Array.isArray(formData.images)
        ? formData.images.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            label: img.label || `Image ${idx + 1}`,
            color: img.color || '#3b82f6',
            isCover: Boolean(img.isCover),
            url: img.url,
          }))
        : formData.imageGallery || existing?.imageGallery || [];

    const computedStatus: BusinessStatus = existing
      ? (formData.status
          ? (formData.status as BusinessStatus)
          : (formData.kycStatus === 'Verified' || existing.status === 'KYC Approved' || existing.status === 'Live')
          ? (existing.status === 'Live' ? 'Live' : 'KYC Approved')
          : (formData.kycStatus === 'Rejected' || existing.status === 'KYC Rejected')
          ? 'KYC Rejected'
          : (formData.kycStatus === 'Pending Review' || kycSub)
          ? 'Pending KYC Review'
          : (existing.status || initialStatus))
      : (formData.status && formData.status !== 'KYC Approved' && formData.status !== 'Live' && (formData.status as any) !== 'Active'
          ? (formData.status as BusinessStatus)
          : kycSub
          ? 'Pending KYC Review'
          : 'Draft');

    const computedSubTab = formData.subTab
      ? formData.subTab
      : (computedStatus === 'KYC Approved' || computedStatus === 'Live')
      ? 'approved'
      : computedStatus === 'KYC Rejected'
      ? 'rejected'
      : (computedStatus === 'Pending KYC Review' || kycSub)
      ? 'kyc-requests'
      : (existing?.subTab || 'non-subscription');

    if (existing) {
      const existingBizServices = existing.business_services || [];
      const hasServices = existingBizServices.length > 0 || state.businessServices.some((s) => s.business_id === businessId);
      const presetServices = hasServices && existingBizServices.length > 0 ? existingBizServices : getPresetServicesForBusiness(businessId, core.category);

      resultBiz = {
        ...existing,
        business_services: presetServices.length > 0 ? presetServices : existing.business_services,
        userId: existing.userId || state.currentUser?.id,
        coreDetails: core,
        verification,
        status: computedStatus,
        subTab: computedSubTab,
        rejectionReason:
          computedStatus === 'KYC Approved' || computedStatus === 'Live'
            ? null
            : verification.rejectionReason,
        rejectionCount: verification.rejectionCount,
        rejectionHistory: verification.rejectionHistory,
        operatingHours: parsedOperatingHours,
        imageGallery: parsedImageGallery,
        servicesCount: formData.servicesCount ?? (formData.services ?? existing.servicesCount ?? 8),
        workersCount: formData.workersCount ?? (formData.workers ?? existing.workersCount ?? 4),
        avatarChar: (core.businessName || 'B').charAt(0).toUpperCase(),
        phone: formData.phone || existing.phone,
        email: formData.email || existing.email,
        website: formData.website || existing.website,
        signature: verification.signature,
        signatureDate: verification.signatureDate,
      };
      setState((prev) => {
        const hasServicesInState = prev.businessServices.some((s) => s.business_id === businessId);
        const updatedServices = hasServicesInState
          ? prev.businessServices
          : [...presetServices, ...prev.businessServices];
        return {
          ...prev,
          businesses: prev.businesses.map((b) => (b.id === businessId ? resultBiz : b)),
          businessServices: updatedServices,
          activeBusinessId: businessId,
        };
      });
    } else {
      const presetServices = getPresetServicesForBusiness(businessId, core.category);
      resultBiz = {
        id: businessId,
        business_services: presetServices,
        userId: state.currentUser?.id,
        email: formData.email || state.currentUser?.email || 'vendor@uspot.com',
        status: computedStatus,
        subTab: computedSubTab,
        coreDetails: core,
        operatingHours: parsedOperatingHours,
        imageGallery: parsedImageGallery,
        servicesCount: formData.servicesCount ?? (formData.services ?? 8),
        workersCount: formData.workersCount ?? (formData.workers ?? 4),
        avatarChar: (core.businessName || 'B').charAt(0).toUpperCase(),
        amenities: formData.amenities || JSON.parse(JSON.stringify(INITIAL_AMENITIES)),
        holidaysRules: formData.holidaysRules || {
          holidayClosures: [],
          businessRules: {
            maxCapacity: formData.maxCapacity ?? 50,
            petFriendly: Boolean(formData.petFriendly),
            ageRequirement: formData.ageRequirement || 'All Ages',
            byobAllowed: Boolean(formData.byobAllowed),
          },
        },
        feesTax: {
          businessTaxId: formData.taxId || '',
          salesTaxRate: formData.salesTaxRate || 8.5,
          taxExempt: Boolean(formData.taxExempt),
          currency: formData.currency || 'USD',
          automaticInvoicing: Boolean(formData.automaticInvoicing),
          serviceFees: formData.serviceFees || [],
        },
        verification,
        payment: {
          planSelected: 'Starter',
          amount: 29,
          paidAt: null,
        },
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `Business profile for "${core.businessName}" created successfully.`,
            type: 'info',
            read: false,
            timestamp: 'Just now',
            businessId,
          },
        ],
        phone: formData.phone || '+1 (415) 555-0199',
        website: formData.website || '',
        date: formattedDate,
        rejectionCount: 0,
        rejectionHistory: [],
        signature: verification.signature,
        signatureDate: verification.signatureDate,
      };
      setState((prev) => {
        const existingIds = new Set(prev.businessServices.map((s) => s.id));
        const newServices = presetServices.filter((s) => !existingIds.has(s.id));
        return {
          ...prev,
          businesses: [resultBiz, ...prev.businesses],
          businessServices: [...newServices, ...prev.businessServices],
          activeBusinessId: businessId,
        };
      });
    }

    return resultBiz;
  };

  const publishAndGoLive = (id: string) => {
    updateBusinessInState(id, (b) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `🚀 ${b.coreDetails.businessName} is now officially LIVE on the USPOT Marketplace!`,
        type: 'success',
        read: false,
        timestamp: 'Just now',
        businessId: id,
      };

      return {
        ...b,
        status: 'Live',
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const prefillWizardWithDummyData = (id: string) => {
    updateBusinessInState(id, (b) => ({
      ...b,
      coreDetails: {
        businessName: b.coreDetails.businessName || 'Vanguard Tech Loft & Event Studio',
        legalEntityName: b.coreDetails.legalEntityName || 'Vanguard Studios Group LLC',
        category: 'Coworking & Event Venue',
        description:
          'High-ceiling industrial loft featuring ergonomic sit-stand workstations, 4K fiber video broadcast rooms, and designer lounge spaces in the heart of downtown.',
        streetAddress: '100 King Street West, Suite 3200',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98104',
      },
      imageGallery:
        b.imageGallery.length > 0
          ? b.imageGallery
          : [
              { id: 'img-pf-1', label: 'Main Collaborative Commons', color: '#2563eb', isCover: true },
              { id: 'img-pf-2', label: 'Executive Boardroom', color: '#059669', isCover: false },
              { id: 'img-pf-3', label: 'Private Phone Booths', color: '#7c3aed', isCover: false },
            ],
      feesTax: {
        businessTaxId: '91-4820199',
        salesTaxRate: 8.8,
        taxExempt: false,
        currency: 'USD',
        automaticInvoicing: true,
        serviceFees: [
          { id: 'pf-fee-1', name: 'Cleaning & Janitorial', type: 'Fixed', amount: 50 },
        ],
      },
      verification: {
        ...b.verification,
        legalEntityType: 'LLC',
        einVerification: {
          einEntered: '91-4820199',
          tinMatchStatus: 'Not Started',
          verifiedAt: null,
        },
        entityRegistration: {
          documentUploaded: false,
          fileName: undefined,
          stateRegistryStatus: 'Not Checked',
        },
        beneficialOwner: {
          fullName: 'Sophia Montgomery',
          dateOfBirth: '1986-07-21',
          ssnLast4: '5512',
          govIdUploaded: false,
          selfieUploaded: false,
        },
        sanctionsScreening: {
          status: 'Not Started',
        },
        bankAccount: {
          accountHolderName: 'Vanguard Studios Group LLC',
          routingNumber: '125000024',
          accountNumberMasked: '•••• •••• 9921',
          verificationMethod: 'Instant',
          verified: false,
        },
      },
    }));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      businesses: prev.businesses.map((b) => ({
        ...b,
        notifications: (b.notifications || []).map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      })),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) => ({ ...n, read: true })),
      businesses: prev.businesses.map((b) => ({
        ...b,
        notifications: (b.notifications || []).map((n) => ({ ...n, read: true })),
      })),
    }));
  };

  const saveW9Data = (businessId: string, w9Data: Partial<W9Data>) => {
    updateBusinessInState(businessId, (b) => {
      const existingW9 = b.w9;
      const merged: W9Data = {
        ...(existingW9 || {
          businessId,
          legalName: '',
          federalTaxClassification: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          tinType: 'EIN',
          tinMasked: '',
          tinVerified: false,
          tinMatchStatus: 'idle',
          reusedEkycTin: false,
          certifications: {
            correctTin: false,
            noBackupWithholding: false,
            usPerson: false,
            fatcaCorrect: false,
          },
          signatureName: '',
          agreedPerjury: false,
          status: 'draft',
        }),
        ...w9Data,
      };
      return {
        ...b,
        w9: merged,
      };
    });
  };

  const submitW9Data = async (businessId: string, w9Data: W9Data): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateBusinessInState(businessId, (b) => {
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            message: `✓ Form W-9 for "${b.coreDetails.businessName}" has been certified and verified with IRS records.`,
            type: 'success',
            read: false,
            timestamp: 'Just now',
            businessId,
          };
          return {
            ...b,
            w9: {
              ...w9Data,
              status: 'verified',
            },
            notifications: [newNotif, ...b.notifications],
          };
        });
        resolve();
      }, 500);
    });
  };

  const resetW9Data = (businessId: string) => {
    updateBusinessInState(businessId, (b) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `ℹ Form W-9 for "${b.coreDetails.businessName}" has been reset to uncertified (Test Mode).`,
        type: 'warning',
        read: false,
        timestamp: 'Just now',
        businessId,
      };
      return {
        ...b,
        w9: undefined,
        notifications: [newNotif, ...b.notifications],
      };
    });
  };

  const saveNmiPaymentAccount = (businessId: string, accountData: Partial<NmiPaymentAccountData>) => {
    updateBusinessInState(businessId, (b) => {
      const existing: NmiPaymentAccountData = b.nmiPaymentAccount || {
        vendorId: businessId,
        nmiOnboardingStatus: 'NOT_STARTED' as NmiOnboardingStatus,
        nmiGatewayId: null,
        companyName: b.coreDetails?.legalEntityName || b.coreDetails?.businessName || '',
        federalTaxId: b.verification?.einVerification?.einEntered || '',
        firstName: b.verification?.beneficialOwner?.fullName?.split(' ')[0] || '',
        lastName: b.verification?.beneficialOwner?.fullName?.split(' ').slice(1).join(' ') || '',
        email: b.email || '',
        bankRoutingNumber: b.verification?.bankAccount?.routingNumber || '',
        bankAccountNumber: '',
        accountType: 'checking' as const,
        accountHolderType: 'business' as const,
      };
      const updatedAccount: NmiPaymentAccountData = {
        ...existing,
        ...accountData,
        vendorId: businessId,
      };

      try {
        const backup = JSON.parse(localStorage.getItem('uspot_nmi_vendor_accounts') || '{}');
        backup[businessId] = updatedAccount;
        localStorage.setItem('uspot_nmi_vendor_accounts', JSON.stringify(backup));
      } catch (e) {}

      const newNotif: NotificationItem | null =
        updatedAccount.nmiOnboardingStatus === 'ACTIVE'
          ? {
              id: `notif-${Date.now()}`,
              message: `✓ NMI Payment Account connected successfully (Gateway ID: ${updatedAccount.nmiGatewayId}). Balance withdrawals and payouts are now active.`,
              type: 'success',
              read: false,
              timestamp: 'Just now',
              businessId,
            }
          : null;

      return {
        ...b,
        nmiPaymentAccount: updatedAccount,
        notifications: newNotif ? [newNotif, ...b.notifications] : b.notifications,
      };
    });
  };

  const getNmiPaymentAccount = (businessId: string): NmiPaymentAccountData | undefined => {
    const biz = state.businesses.find((b) => b.id === businessId);
    return biz?.nmiPaymentAccount;
  };

  // Helper to compute total platform balance
  const computeTotalPlatformBalance = (
    commBal: number,
    taxBal: number,
    bizBalances: Record<string, BusinessBalance>
  ): number => {
    const sumBiz = Object.values(bizBalances || {}).reduce(
      (acc, b) => acc + (b.availableBalance || 0) + (b.pendingWithdrawal || 0),
      0
    );
    return Number((commBal + taxBal + sumBiz).toFixed(2));
  };

  // Helper to get business balance dynamically from ledger
  const getBusinessBalance = (businessId: string): BusinessBalance => {
    const balances = calculateLedgerBalances(
      state.platformLedger?.transactions || [],
      state.platformLedger?.withdrawals || []
    );
    const b = balances.businessBreakdown[businessId];
    if (b) {
      return {
        availableBalance: b.availableBalance,
        pendingWithdrawal: b.pendingWithdrawal,
        totalEarned: b.totalEarned,
        totalWithdrawn: b.totalWithdrawn,
        totalWithheldTax: b.totalWithheldTax,
        grossEarned: b.grossEarned,
      };
    }
    return {
      availableBalance: 0,
      pendingWithdrawal: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalWithheldTax: 0,
      grossEarned: 0,
    };
  };

  // 1. Customer Booking Payment via NMI Gateway
  const bookServiceWithNmi = async (params: {
    businessId: string;
    serviceName: string;
    amount: number;
    customerName: string;
    customerEmail?: string;
  }): Promise<{ success: boolean; transaction: MarketplaceTransaction; message: string }> => {
    const { businessId, serviceName, amount, customerName, customerEmail } = params;
    if (!amount || amount <= 0) {
      return { success: false, transaction: null as any, message: 'Invalid payment amount.' };
    }

    const biz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    if (!biz) {
      return { success: false, transaction: null as any, message: 'Target business not found.' };
    }

    // 1. Customer Booking Payment via NMI Gateway (received by Main Platform Account)
    const currentCommissionRate = state.platformLedger?.commissionRate ?? 10.0;
    const isW9Certified = Boolean(biz.w9 && (biz.w9.status === 'submitted' || biz.w9.status === 'verified'));

    const newTx: MarketplaceTransaction = {
      id: `TX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: `BK-${Date.now().toString().slice(-6)}`,
      type: 'BOOKING_PAYMENT',
      customerName: customerName || 'Marketplace Customer',
      customerEmail: customerEmail || 'alex.taylor@example.com',
      businessId: biz.id,
      businessName: biz.coreDetails.businessName,
      serviceName: serviceName || 'Standard Service Appointment',
      grossAmount: amount,
      commissionRate: currentCommissionRate,
      platformCommission: 0, // Commission retained at payout time upon Super Admin approval
      w9Submitted: isW9Certified,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: amount, // Full customer payment credited to vendor balance in Main Account
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'none',
      paymentGateway: 'NMI Gateway (Main Platform Account)',
      maskedBankAccount: biz.verification?.bankAccount?.accountNumberMasked || 'Main Platform Vault',
      notes: `Customer service charge of $${amount.toFixed(2)} received into Main Platform Account. Funds available for vendor payout request.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      const updatedTxs = [newTx, ...(prevLedger.transactions || [])];
      const updatedWds = prevLedger.withdrawals || [];
      const newBalances = calculateLedgerBalances(updatedTxs, updatedWds);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `💰 Customer paid $${amount.toFixed(2)} via Main Account for "${serviceName}". Funds credited to available balance for withdrawal request.`,
        type: 'success',
        read: false,
        timestamp: 'Just now',
        businessId: biz.id,
      };

      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          platformCommissionBalance: newBalances.superAdminBalance,
          platformTaxWithholdingBalance: newBalances.totalTaxWithheld,
          totalPlatformBalance: newBalances.totalPlatformBalance,
          businessBalances: newBalances.businessBreakdown,
          transactions: updatedTxs,
          withdrawals: updatedWds,
        },
        businesses: prev.businesses.map((b) =>
          b.id === biz.id ? { ...b, notifications: [newNotif, ...b.notifications] } : b
        ),
      };
    });

    return {
      success: true,
      transaction: newTx,
      message: `Payment of $${amount.toFixed(2)} processed successfully into Main Platform Account.`,
    };
  };

  // 1.5. Link Vendor Bank Account
  const linkVendorBankAccount = (
    businessId: string,
    bankData: {
      bankName: string;
      accountHolderName: string;
      routingNumber: string;
      accountNumber: string;
      accountType?: 'checking' | 'savings';
    }
  ): { success: boolean; error?: string } => {
    const cleanRouting = (bankData.routingNumber || '').trim().replace(/\D/g, '');
    const cleanAccount = (bankData.accountNumber || '').trim().replace(/\D/g, '');

    if (cleanRouting.length !== 9) {
      return { success: false, error: 'Routing number must be exactly 9 digits.' };
    }
    if (cleanAccount.length < 4) {
      return { success: false, error: 'Account number must be at least 4 digits.' };
    }
    if (!bankData.accountHolderName.trim()) {
      return { success: false, error: 'Account holder name is required.' };
    }

    const last4 = cleanAccount.slice(-4);
    const masked = `•••• •••• ${last4}`;
    const now = new Date().toISOString();

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      message: `✓ Commercial bank account linked: ${bankData.bankName || 'Bank'} (${masked}). You can now request payouts to this account.`,
      type: 'success',
      read: false,
      timestamp: 'Just now',
      businessId,
    };

    setState((prev) => ({
      ...prev,
      businesses: prev.businesses.map((b) => {
        if (b.id !== businessId) return b;
        return {
          ...b,
          verification: {
            ...b.verification,
            bankAccount: {
              accountHolderName: bankData.accountHolderName.trim(),
              routingNumber: cleanRouting,
              accountNumber: cleanAccount,
              accountNumberMasked: masked,
              bankName: bankData.bankName.trim() || 'Commercial Bank',
              accountType: bankData.accountType || 'checking',
              verificationMethod: 'Instant',
              verified: true,
              linkedAt: now,
            },
          },
          nmiPaymentAccount: {
            vendorId: b.id,
            nmiOnboardingStatus: 'ACTIVE',
            nmiGatewayId: b.nmiPaymentAccount?.nmiGatewayId || `NMI-${Math.floor(10000000 + Math.random() * 90000000)}`,
            companyName: bankData.accountHolderName.trim(),
            federalTaxId: b.verification?.einVerification?.einEntered || '12-3456789',
            firstName: bankData.accountHolderName.split(' ')[0] || 'Merchant',
            lastName: bankData.accountHolderName.split(' ').slice(1).join(' ') || 'Account',
            email: b.email || 'merchant@uspot.com',
            bankRoutingNumber: cleanRouting,
            bankAccountNumber: cleanAccount,
            accountType: bankData.accountType || 'checking',
            accountHolderType: 'business',
            activatedAt: now,
          },
          notifications: [newNotif, ...(b.notifications || [])],
        };
      }),
    }));

    return { success: true };
  };

  // 2. Business Withdrawal / Payout Request
  const requestBusinessWithdrawal = (
    businessId: string,
    requestedAmount?: number
  ): { success: boolean; error?: string; withdrawal?: WithdrawalRequest } => {
    const biz = state.businesses.find((b) => b.id === businessId);
    if (!biz) {
      return { success: false, error: 'Business account not found.' };
    }

    const currentBal = getBusinessBalance(businessId);
    const amount =
      typeof requestedAmount === 'number' && requestedAmount > 0
        ? Number(requestedAmount.toFixed(2))
        : currentBal.availableBalance;

    if (amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than $0.00.' };
    }

    if (amount > currentBal.availableBalance) {
      return {
        success: false,
        error: `Insufficient available balance ($${currentBal.availableBalance.toFixed(2)}). You cannot withdraw more than your available balance.`,
      };
    }

    // Step 1: Pre-requisite Check - Is Bank Account Linked?
    const bankAcc = biz.verification?.bankAccount;
    const isBankLinked = Boolean(
      (bankAcc?.routingNumber && (bankAcc?.accountNumberMasked || bankAcc?.accountNumber)) ||
      (biz.nmiPaymentAccount?.bankRoutingNumber && biz.nmiPaymentAccount?.bankAccountNumber)
    );

    if (!isBankLinked) {
      return {
        success: false,
        error: 'BANK_NOT_LINKED',
      };
    }

    const maskedBank =
      bankAcc?.accountNumberMasked ||
      (biz.nmiPaymentAccount?.bankAccountNumber ? `•••• •••• ${biz.nmiPaymentAccount.bankAccountNumber.slice(-4)}` : '•••• •••• 9382');
    const bankHolder =
      bankAcc?.accountHolderName ||
      biz.nmiPaymentAccount?.companyName ||
      biz.coreDetails.legalEntityName ||
      biz.coreDetails.businessName;
    const bankName = bankAcc?.bankName || 'Linked Commercial Bank';

    // Step 2: Form W-9 Verification & Tax Deductions
    // If W-9 is NOT filled: 24% backup withholding + platform commission
    // If W-9 IS filled: only platform commission is charged
    const isW9Certified = Boolean(biz.w9 && (biz.w9.status === 'submitted' || biz.w9.status === 'verified'));
    const currentCommissionRate = state.platformLedger?.commissionRate ?? 10.0;
    const commissionAmount = Number(((amount * currentCommissionRate) / 100).toFixed(2));
    const w9WithholdingRate = isW9Certified ? 0 : 24.0;
    const w9WithholdingAmount = isW9Certified ? 0 : Number(((amount * 24.0) / 100).toFixed(2));
    const netPayoutAmount = Number((amount - commissionAmount - w9WithholdingAmount).toFixed(2));

    const newWithdrawalId = `WD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newWithdrawal: WithdrawalRequest = {
      id: newWithdrawalId,
      type: 'business',
      businessId: biz.id,
      businessName: biz.coreDetails.businessName,
      requestedByUserId: state.currentUser?.id || 'user-business',
      requestedByUserName: state.currentUser?.fullName || biz.coreDetails.businessName,
      amount, // Gross requested amount
      commissionRate: currentCommissionRate,
      commissionAmount,
      w9Status: isW9Certified ? 'verified' : 'unfiled',
      w9WithholdingRate,
      w9WithholdingAmount,
      netPayoutAmount,
      maskedBankAccount: maskedBank,
      bankAccountHolder: bankHolder,
      bankName,
      status: 'Pending',
      requestDate: new Date().toISOString(),
    };

    const ledgerEntry: MarketplaceTransaction = {
      id: `TX-WD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: newWithdrawal.id,
      type: 'BUSINESS_PAYOUT',
      customerName: 'Platform Settlement',
      businessId: biz.id,
      businessName: biz.coreDetails.businessName,
      serviceName: `Payout to ${bankName} (${maskedBank})`,
      grossAmount: amount,
      commissionRate: currentCommissionRate,
      platformCommission: commissionAmount,
      w9Submitted: isW9Certified,
      w9WithholdingRate,
      w9WithholdingAmount,
      businessAmount: netPayoutAmount,
      currency: 'USD',
      paymentStatus: 'pending',
      withdrawalStatus: 'pending',
      paymentGateway: 'ACH / Direct Deposit',
      maskedBankAccount: maskedBank,
      notes: isW9Certified
        ? `Payout request submitted. Form W-9 verified: 0% tax withheld. Fixed ${currentCommissionRate}% commission will be deducted upon Super Admin approval.`
        : `Payout request submitted. Form W-9 missing: 24% backup withholding tax ($${w9WithholdingAmount.toFixed(2)}) + ${currentCommissionRate}% commission will be deducted upon Super Admin approval.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      const updatedWds = [newWithdrawal, ...(prevLedger.withdrawals || [])];
      const updatedTxs = [ledgerEntry, ...(prevLedger.transactions || [])];
      const newBalances = calculateLedgerBalances(updatedTxs, updatedWds);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `Withdrawal request for $${amount.toFixed(2)} submitted to ${maskedBank}. ${isW9Certified ? 'W-9 certified (0% tax).' : 'W-9 missing (24% backup withholding applies).'} Status: Pending Super Admin approval.`,
        type: 'info',
        read: false,
        timestamp: 'Just now',
        businessId: biz.id,
      };

      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          platformCommissionBalance: newBalances.superAdminBalance,
          platformTaxWithholdingBalance: newBalances.totalTaxWithheld,
          totalPlatformBalance: newBalances.totalPlatformBalance,
          businessBalances: newBalances.businessBreakdown,
          withdrawals: updatedWds,
          transactions: updatedTxs,
        },
        businesses: prev.businesses.map((b) =>
          b.id === biz.id ? { ...b, notifications: [newNotif, ...b.notifications] } : b
        ),
      };
    });

    return { success: true, withdrawal: newWithdrawal };
  };

  // 3. Super Admin Approve Withdrawal
  const approveWithdrawal = (
    withdrawalId: string,
    adminUserId?: string
  ): { success: boolean; error?: string } => {
    const withdrawal = state.platformLedger?.withdrawals?.find((w) => w.id === withdrawalId);
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal request not found.' };
    }
    if (withdrawal.status !== 'Pending') {
      return { success: false, error: `Withdrawal request is already '${withdrawal.status}'.` };
    }

    const now = new Date().toISOString();
    const processedBy = adminUserId || state.currentUser?.fullName || 'Super Admin';

    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      const updatedWithdrawals = prevLedger.withdrawals.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status: 'Completed' as const,
              processedDate: now,
              processedBy,
            }
          : w
      );

      const updatedTransactions = prevLedger.transactions.map((tx) =>
        tx.bookingId === withdrawal.id
          ? {
              ...tx,
              type: 'BUSINESS_PAYOUT' as const,
              paymentStatus: 'paid' as const,
              withdrawalStatus: 'completed' as const,
              notes: `Disbursement approved by ${processedBy}. Sent to ${withdrawal.maskedBankAccount}.`,
              updatedAt: now,
            }
          : tx
      );

      const newBalances = calculateLedgerBalances(updatedTransactions, updatedWithdrawals);

      const netAmount = withdrawal.netPayoutAmount !== undefined ? withdrawal.netPayoutAmount : withdrawal.amount;
      const taxAmount = withdrawal.w9WithholdingAmount || 0;
      const commAmount = withdrawal.commissionAmount || 0;

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `✓ Super Admin approved your payout of $${withdrawal.amount.toFixed(2)}! Transferred: $${netAmount.toFixed(2)} to ${withdrawal.maskedBankAccount}${commAmount > 0 ? ` ($${commAmount.toFixed(2)} commission deducted)` : ''}${taxAmount > 0 ? ` ($${taxAmount.toFixed(2)} 24% tax withheld - W9 missing)` : ''}.`,
        type: 'success',
        read: false,
        timestamp: 'Just now',
        businessId: withdrawal.businessId,
      };

      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          platformCommissionBalance: newBalances.superAdminBalance,
          platformTaxWithholdingBalance: newBalances.totalTaxWithheld,
          totalPlatformBalance: newBalances.totalPlatformBalance,
          businessBalances: newBalances.businessBreakdown,
          withdrawals: updatedWithdrawals,
          transactions: updatedTransactions,
        },
        businesses: prev.businesses.map((b) =>
          b.id === withdrawal.businessId
            ? { ...b, notifications: [newNotif, ...(b.notifications || [])] }
            : b
        ),
      };
    });

    return { success: true };
  };

  // 4. Super Admin Reject Withdrawal (Restores reserved funds to available balance with duplicate protection)
  const rejectWithdrawal = (
    withdrawalId: string,
    reason: string,
    adminUserId?: string
  ): { success: boolean; error?: string } => {
    const withdrawal = state.platformLedger?.withdrawals?.find((w) => w.id === withdrawalId);
    if (!withdrawal) {
      return { success: false, error: 'Withdrawal request not found.' };
    }
    if (withdrawal.status !== 'Pending') {
      return { success: false, error: `Withdrawal request is already '${withdrawal.status}'.` };
    }

    // DUPLICATE REVERSAL PROTECTION: Ensure a reversal cannot be applied multiple times
    const alreadyReversed = (state.platformLedger?.transactions || []).some(
      (t) =>
        t.bookingId === withdrawalId &&
        normalizeTransactionType(t.type, t.paymentStatus) === 'PAYOUT_REVERSAL'
    );
    if (alreadyReversed) {
      return { success: false, error: 'A payout reversal has already been processed for this withdrawal.' };
    }

    const now = new Date().toISOString();
    const processedBy = adminUserId || state.currentUser?.fullName || 'Super Admin';
    const rejectionReason = reason || 'Declined by platform compliance';

    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      const updatedWithdrawals = prevLedger.withdrawals.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status: 'Rejected' as const,
              rejectionReason,
              processedDate: now,
              processedBy,
            }
          : w
      );

      const updatedTransactions = prevLedger.transactions.map((tx) =>
        tx.bookingId === withdrawal.id
          ? {
              ...tx,
              type: 'PAYOUT_FAILED' as const,
              paymentStatus: 'failed' as const,
              withdrawalStatus: 'rejected' as const,
              notes: `Withdrawal rejected by ${processedBy}. Reason: ${rejectionReason}. Funds restored to available balance.`,
              updatedAt: now,
            }
          : tx
      );

      // Ledger reversal entry referencing the original withdrawal
      const refundTx: MarketplaceTransaction = {
        id: `TX-REV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        bookingId: withdrawal.id,
        type: 'PAYOUT_REVERSAL',
        customerName: 'Platform Escrow Restoration',
        businessId: withdrawal.businessId || '',
        businessName: withdrawal.businessName,
        serviceName: 'Withdrawal Restoration to Available Balance',
        grossAmount: withdrawal.amount,
        commissionRate: 0,
        platformCommission: 0,
        w9Submitted: true,
        w9WithholdingRate: 0,
        w9WithholdingAmount: 0,
        businessAmount: withdrawal.amount,
        currency: 'USD',
        paymentStatus: 'paid',
        withdrawalStatus: 'rejected',
        paymentGateway: 'Internal Ledger Reversal',
        relatedTransactionId: withdrawal.id,
        notes: `Restored $${withdrawal.amount.toFixed(2)} to available balance following rejection: ${rejectionReason}`,
        createdAt: now,
        updatedAt: now,
      };

      const finalTransactions = [refundTx, ...updatedTransactions];
      const newBalances = calculateLedgerBalances(finalTransactions, updatedWithdrawals);

      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          platformCommissionBalance: newBalances.superAdminBalance,
          platformTaxWithholdingBalance: newBalances.totalTaxWithheld,
          totalPlatformBalance: newBalances.totalPlatformBalance,
          businessBalances: newBalances.businessBreakdown,
          withdrawals: updatedWithdrawals,
          transactions: finalTransactions,
        },
      };
    });

    return { success: true };
  };

  // 5. Super Admin Commission Withdrawal
  const requestSuperAdminWithdrawal = (
    requestedAmount?: number
  ): { success: boolean; error?: string; withdrawal?: WithdrawalRequest } => {
    const currentBalances = calculateLedgerBalances(
      state.platformLedger?.transactions || [],
      state.platformLedger?.withdrawals || []
    );
    const currentCommBal = currentBalances.superAdminBalance;
    const amount =
      typeof requestedAmount === 'number' && requestedAmount > 0
        ? Number(requestedAmount.toFixed(2))
        : currentCommBal;

    if (amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than $0.00.' };
    }

    if (amount > currentCommBal) {
      return {
        success: false,
        error: `Insufficient platform commission balance ($${currentCommBal.toFixed(2)}).`,
      };
    }

    const superAdminBank = state.platformLedger?.superAdminBank || {
      bankName: 'JPMorgan Chase Treasury',
      accountHolder: 'URSPOT Platform Operations LLC',
      accountMasked: '•••• •••• 5678',
      routingNumber: '021000021',
    };

    const newWithdrawal: WithdrawalRequest = {
      id: `WD-ADM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'super_admin',
      businessName: 'URSPOT Platform Treasury',
      requestedByUserId: state.currentUser?.id || 'user-superadmin',
      requestedByUserName: state.currentUser?.fullName || 'Super Admin',
      amount,
      maskedBankAccount: superAdminBank.accountMasked,
      bankAccountHolder: superAdminBank.accountHolder,
      status: 'Completed',
      requestDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      processedBy: state.currentUser?.fullName || 'Super Admin',
    };

    const ledgerEntry: MarketplaceTransaction = {
      id: `TX-ADM-WD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: newWithdrawal.id,
      type: 'ADMIN_WITHDRAWAL',
      customerName: 'Platform Treasury Payout',
      businessId: 'super-admin-treasury',
      businessName: 'URSPOT Platform Operations',
      serviceName: `Admin Commission Withdrawal (${superAdminBank.accountMasked})`,
      grossAmount: amount,
      commissionRate: 0,
      platformCommission: amount,
      w9Submitted: true,
      w9WithholdingRate: 0,
      w9WithholdingAmount: 0,
      businessAmount: 0,
      currency: 'USD',
      paymentStatus: 'paid',
      withdrawalStatus: 'completed',
      paymentGateway: 'ACH Direct Deposit',
      maskedBankAccount: superAdminBank.accountMasked,
      notes: `Super Admin commission disbursement to ${superAdminBank.accountMasked} completed.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      const updatedWds = [newWithdrawal, ...(prevLedger.withdrawals || [])];
      const updatedTxs = [ledgerEntry, ...(prevLedger.transactions || [])];
      const newBalances = calculateLedgerBalances(updatedTxs, updatedWds);

      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          platformCommissionBalance: newBalances.superAdminBalance,
          platformTaxWithholdingBalance: newBalances.totalTaxWithheld,
          totalPlatformBalance: newBalances.totalPlatformBalance,
          businessBalances: newBalances.businessBreakdown,
          withdrawals: updatedWds,
          transactions: updatedTxs,
        },
      };
    });

    return { success: true, withdrawal: newWithdrawal };
  };

  // 6. Update Platform Commission Rate
  const updateCommissionRate = (newRate: number) => {
    if (isNaN(newRate) || newRate < 0 || newRate > 100) return;
    localStorage.setItem(PAYMENT_RATE_STORAGE_KEY, newRate.toString());
    setState((prev) => {
      const prevLedger = prev.platformLedger || DEFAULT_LEDGER_STATE;
      return {
        ...prev,
        platformLedger: {
          ...prevLedger,
          commissionRate: newRate,
        },
      };
    });
  };

  // --------------------------------------------------------------------------
  // UNIFIED RELATIONAL SCHEMA: SERVICE & BOOKING ACTIONS
  // --------------------------------------------------------------------------

  const addBusinessService = (serviceData: Omit<BusinessService, 'id'>): BusinessService => {
    const newService: BusinessService = {
      ...serviceData,
      id: `srv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    };

    setState((prev) => ({
      ...prev,
      businessServices: [newService, ...prev.businessServices],
      businesses: prev.businesses.map((b) =>
        b.id === newService.business_id
          ? {
              ...b,
              business_services: [newService, ...(b.business_services || [])],
              servicesCount: (b.servicesCount || 0) + 1,
            }
          : b
      ),
    }));

    return newService;
  };

  const updateBusinessService = (serviceId: string, updates: Partial<BusinessService>) => {
    setState((prev) => ({
      ...prev,
      businessServices: prev.businessServices.map((s) =>
        s.id === serviceId ? { ...s, ...updates } : s
      ),
      businesses: prev.businesses.map((b) => ({
        ...b,
        business_services: (b.business_services || []).map((s) =>
          s.id === serviceId ? { ...s, ...updates } : s
        ),
      })),
    }));
  };

  const deleteBusinessService = (serviceId: string) => {
    setState((prev) => ({
      ...prev,
      businessServices: prev.businessServices.filter((s) => s.id !== serviceId),
      businesses: prev.businesses.map((b) => ({
        ...b,
        business_services: (b.business_services || []).filter((s) => s.id !== serviceId),
        servicesCount: Math.max(0, (b.servicesCount || 1) - 1),
      })),
    }));
  };

  const toggleBusinessServiceStatus = (serviceId: string) => {
    setState((prev) => ({
      ...prev,
      businessServices: prev.businessServices.map((s) =>
        s.id === serviceId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      ),
      businesses: prev.businesses.map((b) => ({
        ...b,
        business_services: (b.business_services || []).map((s) =>
          s.id === serviceId
            ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
            : s
        ),
      })),
    }));
  };

  const loadSalonPresets = (businessId: string) => {
    const presets = getSalonPresetServices(businessId);
    setState((prev) => {
      const otherServices = prev.businessServices.filter((s) => s.business_id !== businessId);
      return {
        ...prev,
        businessServices: [...presets, ...otherServices],
        businesses: prev.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                business_services: presets,
                servicesCount: presets.length,
              }
            : b
        ),
      };
    });
  };

  const loadSpaPresets = (businessId: string) => {
    const presets = getSpaPresetServices(businessId);
    setState((prev) => {
      const otherServices = prev.businessServices.filter((s) => s.business_id !== businessId);
      return {
        ...prev,
        businessServices: [...presets, ...otherServices],
        businesses: prev.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                business_services: presets,
                servicesCount: presets.length,
              }
            : b
        ),
      };
    });
  };

  const updateBusinessHours = (businessId: string, hours: BusinessHours[]) => {
    setState((prev) => ({
      ...prev,
      businesses: prev.businesses.map((b) =>
        b.id === businessId
          ? {
              ...b,
              business_hours: hours,
            }
          : b
      ),
    }));
  };

  const createBooking = async (params: {
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    businessId: string;
    selectedServiceIds: string[];
    dateStr: string;
    startTime: string;
    paymentMethod: BookingPaymentMethod;
    paymentMethodDisplay?: string;
    notes?: string;
    totalAmount?: number;
    taxAmount?: number;
    referenceNumber?: string;
  }): Promise<{ success: boolean; booking: Booking; message: string }> => {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      businessId,
      selectedServiceIds,
      dateStr,
      startTime,
      paymentMethod,
      paymentMethodDisplay,
      notes,
      totalAmount: paramTotalAmount,
      taxAmount: paramTaxAmount,
      referenceNumber: paramReferenceNumber,
    } = params;

    const targetBiz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    const presetServices = getPresetServicesForBusiness(targetBiz.id, targetBiz.coreDetails?.category);
    const catalogServices = [
      ...state.businessServices,
      ...(targetBiz.business_services || []),
      ...presetServices,
      ...getSalonPresetServices(targetBiz.id),
      ...getSpaPresetServices(targetBiz.id),
      ...getSeedBusinessServices(),
    ];

    let effectiveServiceIds = (selectedServiceIds || []).filter(Boolean);
    if (effectiveServiceIds.length === 0) {
      const bizFirst = catalogServices.find((s) => s.business_id === targetBiz.id) || presetServices[0];
      if (bizFirst) {
        effectiveServiceIds = [bizFirst.id];
      }
    }

    let bizServices = effectiveServiceIds
      .map((id) => catalogServices.find((s) => s.id === id))
      .filter((s): s is BusinessService => Boolean(s));

    if (bizServices.length === 0 && presetServices.length > 0) {
      bizServices = [presetServices[0]];
    }

    if (bizServices.length === 0) {
      throw new Error('At least one service must be selected.');
    }

    const bookingId = `BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const startMins = timeToMinutes(startTime);

    let runningMins = startMins;
    const items: BookingItem[] = bizServices.map((s, idx) => {
      const itemStartMins = runningMins;
      const itemEndMins = itemStartMins + s.duration_minutes;
      runningMins = itemEndMins;
      const priceVal = typeof s.base_price === 'number' ? s.base_price : parseFloat(s.base_price as any) || 0;

      return {
        id: `bki-${Date.now()}-${idx + 1}`,
        booking_id: bookingId,
        business_service_id: s.id,
        service_name: s.name,
        scheduled_start: `${dateStr}T${minutesToTimeString(itemStartMins)}`,
        scheduled_end: `${dateStr}T${minutesToTimeString(itemEndMins)}`,
        price_charged: priceVal,
        price: priceVal,
        duration_minutes: s.duration_minutes,
      };
    });

    const totalDuration = items.reduce((sum, item) => sum + item.duration_minutes, 0);
    const calculatedItemsTotal = Number(items.reduce((sum, item) => sum + item.price_charged, 0).toFixed(2));
    const totalAmount = paramTotalAmount !== undefined ? Number(paramTotalAmount.toFixed(2)) : calculatedItemsTotal;
    const taxAmount = paramTaxAmount !== undefined ? Number(paramTaxAmount.toFixed(2)) : 0;
    const endTime = minutesToTimeString(startMins + totalDuration);

    const isPaidOnline = paymentMethod === 'credit_card';

    const newBooking: Booking = {
      id: bookingId,
      reference_number: paramReferenceNumber || `#UR-${bookingId.slice(-5)}`,
      customer_id: customerId || state.currentUser?.id || 'user-customer',
      customer_name: customerName || state.currentUser?.fullName || 'Valued Customer',
      customer_email: customerEmail || state.currentUser?.email || 'customer@uspot.com',
      customer_phone: customerPhone || state.currentUser?.phone || '+1 (555) 019-2831',
      business_id: targetBiz.id,
      business_name: targetBiz.coreDetails?.businessName || (targetBiz as any).name || 'Business',
      total_amount: totalAmount,
      total_price: totalAmount,
      discount_amount: 0,
      tax_amount: taxAmount,
      net_amount: totalAmount,
      status: 'confirmed',
      payment_status: isPaidOnline ? 'paid' : 'unpaid',
      payment_method: paymentMethod,
      payment_method_display: paymentMethodDisplay || (isPaidOnline ? 'Mastercard •••• 4242' : 'Cash on Arrival'),
      booking_date: dateStr,
      scheduled_date: dateStr,
      scheduled_start_time: startTime,
      scheduled_end_time: endTime,
      scheduled_time_slot: `${startTime} - ${endTime} (${totalDuration}m)`,
      total_duration_minutes: totalDuration,
      items,
      notes,
      created_at: new Date().toISOString(),
    };

    // If paying online with NMI card gateway, trigger financial ledger transaction
    if (isPaidOnline) {
      await bookServiceWithNmi({
        businessId: targetBiz.id,
        serviceName: items.map((i) => i.service_name).join(' + '),
        amount: totalAmount,
        customerName: newBooking.customer_name,
        customerEmail: newBooking.customer_email,
      });
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      message: `📅 New service booking! ${newBooking.customer_name} booked ${items.length} service(s) (${items.map((i) => i.service_name).join(', ')}) on ${dateStr} at ${startTime}.`,
      type: 'success',
      read: false,
      timestamp: 'Just now',
      businessId: targetBiz.id,
    };

    setState((prev) => {
      const hasServicesInState = prev.businessServices.some((s) => s.business_id === targetBiz.id);
      const updatedBusinessServices = hasServicesInState
        ? prev.businessServices
        : [...presetServices, ...prev.businessServices];

      return {
        ...prev,
        businessServices: updatedBusinessServices,
        bookings: [newBooking, ...prev.bookings],
        businesses: prev.businesses.map((b) =>
          b.id === targetBiz.id
            ? {
                ...b,
                business_services: b.business_services && b.business_services.length > 0 ? b.business_services : presetServices,
                notifications: [newNotif, ...(b.notifications || [])],
              }
            : b
        ),
      };
    });

    // Sync with Neon database in background
    bookingService.createBooking({
      customerId: newBooking.customer_id,
      customerName: newBooking.customer_name,
      customerEmail: newBooking.customer_email,
      customerPhone: newBooking.customer_phone,
      businessId: targetBiz.id,
      items,
      dateStr,
      startTime,
      paymentMethod,
      paymentMethodDisplay,
      totalAmount,
      taxAmount,
      referenceNumber: newBooking.reference_number,
      notes,
    }).then((res) => {
      if (res?.booking) {
        setState((prev) => ({
          ...prev,
          bookings: prev.bookings.map((b) => (b.id === bookingId ? { ...b, ...res.booking } : b)),
        }));
      }
    }).catch((e) => console.warn('Neon DB booking sync failed:', e));

    return {
      success: true,
      booking: newBooking,
      message: `Appointment ${bookingId} successfully confirmed!`,
    };
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    bookingService.updateStatus(bookingId, status).catch((e) => console.warn('Neon DB status sync failed:', e));
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    }));
  };

  const cancelBooking = (bookingId: string) => {
    bookingService.updateStatus(bookingId, 'cancelled').catch((e) => console.warn('Neon DB cancel sync failed:', e));
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled' as const,
              payment_status: 'refunded' as const,
              refund_status: 'refunded' as const,
              refund_id: b.refund_id || `RF-${Date.now().toString().slice(-7)}-NMI`,
              refund_estimated_date: 'Instant / 1-2 business days',
            }
          : b
      ),
    }));
  };

  const submitBookingReview = (
    bookingId: string,
    serviceId: string,
    reviewData: {
      service_name: string;
      rating: number;
      review_text: string;
      media?: string[];
    }
  ) => {
    setState((prev) => {
      const targetBooking = prev.bookings.find((b) => b.id === bookingId);
      const updatedBookings = prev.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const existingReviews = b.reviews || {};
        return {
          ...b,
          reviews: {
            ...existingReviews,
            [serviceId]: {
              booking_id: bookingId,
              service_id: serviceId,
              service_name: reviewData.service_name,
              rating: reviewData.rating,
              review_text: reviewData.review_text,
              media: reviewData.media || [],
              submitted: true,
              submitted_at: new Date().toISOString(),
            },
          },
        };
      });

      // Also create a business review item visible in the business reviews management section
      const newBusinessRev: BusinessReview = {
        id: `rev-${Date.now()}`,
        business_id: targetBooking?.business_id || 'biz-001',
        business_name: targetBooking?.business_name || 'Luxe Hotel & Lounge',
        booking_id: bookingId,
        service_id: serviceId,
        service_name: reviewData.service_name,
        customer_id: targetBooking?.customer_id || 'user-customer',
        customer_name: targetBooking?.customer_name || 'Alex Taylor',
        customer_avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        media: reviewData.media || [],
        created_at: new Date().toISOString(),
        time_ago: 'Just now',
        response_deadline: 'Response needed within 24 hours to maintain "Fast Responder" badge.',
      };

      reviewService.addReview({
        businessId: targetBooking?.business_id || 'biz-001',
        bookingId,
        serviceId,
        serviceName: reviewData.service_name,
        customerName: targetBooking?.customer_name || 'Alex Taylor',
        rating: reviewData.rating,
        reviewText: reviewData.review_text,
        media: reviewData.media || [],
      }).catch((e) => console.warn('Neon DB review sync failed:', e));

      return {
        ...prev,
        bookings: updatedBookings,
        businessReviews: [newBusinessRev, ...(prev.businessReviews || [])],
      };
    });
  };

  const addVendorReviewReply = (reviewId: string, replyText: string) => {
    reviewService.replyToReview(reviewId, replyText).catch((e) => console.warn('Neon DB review reply sync failed:', e));
    setState((prev) => ({
      ...prev,
      businessReviews: (prev.businessReviews || []).map((r) =>
        r.id === reviewId
          ? {
              ...r,
              response: {
                text: replyText,
                responded_at: new Date().toISOString(),
                responded_time_ago: 'Just now',
                author_name: 'Alex Rivera (Management)',
              },
              response_deadline: undefined,
            }
          : r
      ),
    }));
  };

  const addCustomerSavedCard = (cardData: Omit<CustomerSavedCard, 'id' | 'created_at'>) => {
    cardService.addCard(cardData).catch((e) => console.warn('Neon DB card add sync failed:', e));
    setState((prev) => {
      const newCard: CustomerSavedCard = {
        ...cardData,
        id: `card-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      let updatedCards = [...(prev.customerSavedCards || [])];
      if (newCard.is_default) {
        updatedCards = updatedCards.map((c) => ({ ...c, is_default: false }));
      }
      return {
        ...prev,
        customerSavedCards: [newCard, ...updatedCards],
      };
    });
  };

  const removeCustomerSavedCard = (cardId: string) => {
    cardService.removeCard(cardId).catch((e) => console.warn('Neon DB card remove sync failed:', e));
    setState((prev) => {
      const remaining = (prev.customerSavedCards || []).filter((c) => c.id !== cardId);
      if (remaining.length > 0 && !remaining.some((c) => c.is_default)) {
        remaining[0] = { ...remaining[0], is_default: true };
      }
      return {
        ...prev,
        customerSavedCards: remaining,
      };
    });
  };

  const setDefaultCustomerSavedCard = (cardId: string) => {
    cardService.setDefaultCard(cardId, 'user-customer').catch((e) => console.warn('Neon DB card default sync failed:', e));
    setState((prev) => ({
      ...prev,
      customerSavedCards: (prev.customerSavedCards || []).map((c) => ({
        ...c,
        is_default: c.id === cardId,
      })),
    }));
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newStartTime: string) => {
    bookingService.reschedule(bookingId, newDate, newStartTime).catch((e) => console.warn('Neon DB reschedule sync failed:', e));
    setState((prev) => {
      const updatedBookings = prev.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          scheduled_date: newDate,
          booking_date: newDate,
          scheduled_start_time: newStartTime,
          scheduled_time_slot: `${newStartTime} (Rescheduled)`,
          status: 'confirmed' as BookingStatus,
        };
      });
      return { ...prev, bookings: updatedBookings };
    });
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...notif,
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])],
    }));
  };

  const updateWorkerStatus = (workerId: string, status: WorkerAvailabilityStatus, note?: string) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === workerId) {
          return {
            ...u,
            availabilityStatus: status,
            statusNote: note !== undefined ? note : u.statusNote,
          };
        }
        return u;
      });
      const updatedCurrent =
        prev.currentUser?.id === workerId
          ? {
              ...prev.currentUser,
              availabilityStatus: status,
              statusNote: note !== undefined ? note : prev.currentUser.statusNote,
            }
          : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });

    addNotification({
      message: `Worker status changed to ${status.toUpperCase()}${note ? `: "${note}"` : ''}.`,
      type: status === 'available' ? 'success' : 'info',
      read: false,
    });
  };

  const updateWorkerJobLifecycle = (
    jobId: string,
    newStatus: WorkerJobStatus,
    meta?: Partial<WorkerJob>
  ) => {
    let notifMsg = `Job ${jobId} status updated to ${newStatus.replace('_', ' ')}.`;
    if (newStatus === 'accepted') {
      notifMsg = `Job assignment accepted by field specialist.`;
    } else if (newStatus === 'en_route') {
      notifMsg = `Field specialist is En Route to venue location.`;
    } else if (newStatus === 'in_progress') {
      notifMsg = `Check-in confirmed on site. Shift is now in progress.`;
    } else if (newStatus === 'completed') {
      notifMsg = `Job completed. Verified client sign-off received.`;
    }

    addNotification({
      message: notifMsg,
      type: newStatus === 'completed' ? 'success' : 'info',
      read: false,
    });
  };

  const addWorkerDocument = (workerId: string, doc: Omit<WorkerDocument, 'id' | 'createdAt'>) => {
    const newDoc: WorkerDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      ...doc,
    };
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === workerId) {
          return {
            ...u,
            documents: [newDoc, ...(u.documents || [])],
          };
        }
        return u;
      });
      const updatedCurrent =
        prev.currentUser?.id === workerId
          ? {
              ...prev.currentUser,
              documents: [newDoc, ...(prev.currentUser.documents || [])],
            }
          : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });

    addNotification({
      message: `New credential "${newDoc.name}" uploaded and submitted for review.`,
      type: 'info',
      read: false,
    });
  };

  const deleteWorkerDocument = (workerId: string, docId: string) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === workerId) {
          return {
            ...u,
            documents: (u.documents || []).filter((d) => d.id !== docId),
          };
        }
        return u;
      });
      const updatedCurrent =
        prev.currentUser?.id === workerId
          ? {
              ...prev.currentUser,
              documents: (prev.currentUser.documents || []).filter((d) => d.id !== docId),
            }
          : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });
  };

  const createSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>,
    initialMessage: string
  ): SupportTicket => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicketId = `tick-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const initialMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: newTicketId,
      senderId: ticketData.userId,
      senderName: ticketData.userName,
      senderRole: ticketData.userRole,
      content: initialMessage,
      timestamp: nowIso,
    };
    const newTicket: SupportTicket = {
      ...ticketData,
      id: newTicketId,
      ticketNumber: `TICK-${randomNum}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      messages: [initialMsg],
    };

    setState((prev) => ({
      ...prev,
      supportTickets: [newTicket, ...(prev.supportTickets || [])],
    }));

    addNotification({
      message: `Support Ticket #${newTicket.ticketNumber} ("${newTicket.title}") submitted.`,
      type: 'info',
      read: false,
    });

    return newTicket;
  };

  const replyToSupportTicket = (
    ticketId: string,
    content: string,
    senderOverride?: Partial<TicketMessage>
  ) => {
    const nowIso = new Date().toISOString();
    const sender = senderOverride || {
      senderId: state.currentUser?.id || 'user-specialist',
      senderName: state.currentUser?.fullName || 'Morgan Blake',
      senderRole: (state.currentUser?.role as any) || 'worker',
    };

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      senderId: sender.senderId!,
      senderName: sender.senderName!,
      senderRole: (sender.senderRole as any) || 'worker',
      content,
      timestamp: nowIso,
    };

    setState((prev) => {
      const tickets = (prev.supportTickets || []).map((t) => {
        if (t.id === ticketId) {
          const nextStatus = sender.senderRole === 'super_admin' ? 'in_progress' : t.status;
          return {
            ...t,
            status: nextStatus,
            updatedAt: nowIso,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      });
      return { ...prev, supportTickets: tickets };
    });

    addNotification({
      message: `New message on ticket from ${newMsg.senderName}.`,
      type: 'info',
      read: false,
    });
  };

  const updateSupportTicketStatus = (ticketId: string, status: TicketStatus) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const tickets = (prev.supportTickets || []).map((t) => {
        if (t.id === ticketId) {
          return { ...t, status, updatedAt: nowIso };
        }
        return t;
      });
      return { ...prev, supportTickets: tickets };
    });

    addNotification({
      message: `Ticket status updated to "${status}".`,
      type: status === 'resolved' ? 'success' : 'info',
      read: false,
    });
  };

  return (
    <DemoContext.Provider
      value={{
        state,
        currentUser: state.currentUser,
        users: state.users,
        activeBusiness,
        adminSelectedBusiness,
        unreadNotificationCount,
        allNotifications,
        isApiConnected,
        apiError,
        isLoadingDynamicData,
        refreshDynamicData: syncWithNeon,
        loginAsUser,
        logout,
        setCurrentUser,
        setAuthModalOpen,
        updateUserProfile,
        createUser,
        registerUser,
        updateUserById,
        deleteUserById,
        toggleUserStatus,
        updateBusinessPlan,
        setActiveRole,
        setVendorView,
        setAdminView,
        setWizardTab,
        selectBusinessForVendor,
        setActiveBusinessId,
        selectBusinessForAdmin,
        resetDemoData,
        createNewBusiness,
        updateCoreDetails,
        updateOperatingHours,
        applyMondayHoursToAll,
        addImage,
        removeImage,
        setCoverImage,
        toggleAmenity,
        addCustomAmenity,
        updateHolidaysRules,
        addHolidayClosure,
        removeHolidayClosure,
        updateFeesTax,
        addServiceFee,
        removeServiceFee,
        updateVerification,
        simulateTinVerification,
        simulateStateRegistryCheck,
        simulateBeneficialOwnerUpload,
        simulateSanctionsCheck,
        simulateBankVerification,
        submitForKycReview,
        resubmitKyc,
        processPayment,
        adminApproveBusiness,
        adminRejectBusiness,
        adminToggleBusinessStatus,
        publishAndGoLive,
        deleteBusinessById,
        saveVendorBusiness,
        saveW9Data,
        submitW9Data,
        resetW9Data,
        saveNmiPaymentAccount,
        getNmiPaymentAccount,
        linkVendorBankAccount,
        // Marketplace Ledger, Balances & Withdrawals
        platformLedger: state.platformLedger || DEFAULT_LEDGER_STATE,
        getBusinessBalance,
        bookServiceWithNmi,
        requestBusinessWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        requestSuperAdminWithdrawal,
        updateCommissionRate,
        prefillWizardWithDummyData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        // Unified Schema Service & Booking Management
        businessServices: state.businessServices,
        bookings: state.bookings,
        addBusinessService,
        updateBusinessService,
        deleteBusinessService,
        toggleBusinessServiceStatus,
        loadSalonPresets,
        loadSpaPresets,
        updateBusinessHours,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        submitBookingReview,
        rescheduleBooking,
        businessReviews: state.businessReviews || [],
        addVendorReviewReply,
        customerSavedCards: state.customerSavedCards || [],
        addCustomerSavedCard,
        removeCustomerSavedCard,
        setDefaultCustomerSavedCard,
        // Support Tickets & Chat
        supportTickets: state.supportTickets || [],
        createSupportTicket,
        replyToSupportTicket,
        updateSupportTicketStatus,
        // Worker Specific Management
        updateWorkerStatus,
        updateWorkerJobLifecycle,
        addWorkerDocument,
        deleteWorkerDocument,
        addNotification,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
