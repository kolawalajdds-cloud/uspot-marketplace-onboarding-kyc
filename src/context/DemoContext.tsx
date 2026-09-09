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
} from '../types';
import { getSeedBusinesses } from '../data/seedData';
import { getSeedUsers } from '../data/seedUsers';

const LOCAL_STORAGE_KEY = 'uspot_demo_state';

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
}

interface DemoContextType {
  state: StoredState;
  currentUser: UserProfile | null;
  users: UserProfile[];
  activeBusiness: Business | null;
  adminSelectedBusiness: Business | null;
  unreadNotificationCount: number;
  allNotifications: NotificationItem[];
  // User & Auth
  loginAsUser: (identifier: string) => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createUser: (newUser: UserProfile) => void;
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
  publishAndGoLive: (id: string) => void;
  deleteBusinessById: (id: string) => void;
  saveVendorBusiness: (formData: any) => Business;
  saveW9Data: (businessId: string, w9Data: Partial<W9Data>) => void;
  submitW9Data: (businessId: string, w9Data: W9Data) => Promise<void>;
  // Helpers
  prefillWizardWithDummyData: (id: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
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

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoredState>(() => {
    const seedUsers = getSeedUsers();
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.businesses) && parsed.businesses.length > 0) {
          const storedUsers: UserProfile[] = Array.isArray(parsed.users) ? parsed.users : [];
          // Deprecated extra seed IDs from previous revisions (should not linger)
          const DEPRECATED_IDS = new Set([
            'user-admin-sarah',
            'user-partner-devon',
            'user-partner-clara',
            'user-customer-marcus',
            'user-customer-sofia',
            'user-staff-jordan',
          ]);
          const filteredStoredUsers = storedUsers.filter((u) => !DEPRECATED_IDS.has(u.id));
          const storedIds = new Set(filteredStoredUsers.map((u) => u.id));
          const missingSeedUsers = seedUsers.filter((s) => !storedIds.has(s.id));
          const baseUsers = filteredStoredUsers.length > 0 ? [...filteredStoredUsers, ...missingSeedUsers] : seedUsers;
          const loadedUsers = baseUsers.map((u) => {
            const seedMatch = seedUsers.find((s) => s.id === u.id);
            if (seedMatch) {
              return {
                ...u,
                role: seedMatch.role,
                roleLabel: seedMatch.roleLabel,
                fullName: seedMatch.fullName,
                email: seedMatch.email,
                username: seedMatch.username,
                phone: seedMatch.phone,
                avatarInitials: seedMatch.avatarInitials,
                primaryServiceCategory: seedMatch.primaryServiceCategory,
                yearsOfExperience: seedMatch.yearsOfExperience,
              };
            }
            return u;
          });
          let loadedCurrent: UserProfile | null =
            parsed.hasExplicitLogin && parsed.currentUser ? parsed.currentUser : null;
          if (loadedCurrent && DEPRECATED_IDS.has(loadedCurrent.id)) {
            loadedCurrent = null;
          } else if (loadedCurrent) {
            const seedMatch = seedUsers.find((s) => s.id === loadedCurrent?.id);
            if (seedMatch) {
              loadedCurrent = {
                ...loadedCurrent,
                role: seedMatch.role,
                roleLabel: seedMatch.roleLabel,
                fullName: seedMatch.fullName,
                email: seedMatch.email,
                username: seedMatch.username,
                phone: seedMatch.phone,
                avatarInitials: seedMatch.avatarInitials,
                primaryServiceCategory: seedMatch.primaryServiceCategory,
                yearsOfExperience: seedMatch.yearsOfExperience,
              };
            }
          }
          const LEGACY_DUMMY_IDS = new Set([
            'biz-003',
            'biz-004',
            'biz-005',
            'biz-006',
            'biz-007',
            'biz-008',
            'mbiz-1',
            'mbiz-2',
            'mbiz-3',
            'mbiz-4',
            'biz-app-1',
            'biz-app-2',
            'biz-app-3',
            'biz-app-4',
            'biz-app-5',
            'biz-app-6',
            'biz-app-7',
            'biz-app-8',
            'biz-app-9',
            'biz-app-10',
          ]);
          const seeds = getSeedBusinesses();
          const validStoredBusinesses = (parsed.businesses || []).filter(
            (b: Business) => !LEGACY_DUMMY_IDS.has(b.id)
          );
          const storedBizIds = new Set(validStoredBusinesses.map((b: Business) => b.id));
          const missingBizSeeds = seeds.filter((s) => !storedBizIds.has(s.id));
          const loadedBusinesses = [...validStoredBusinesses, ...missingBizSeeds].map((b: Business) => {
            const rCount = b.rejectionCount ?? b.verification?.rejectionCount ?? 0;
            const rHist = b.rejectionHistory ?? b.verification?.rejectionHistory ?? [];
            return {
              ...b,
              rejectionCount: rCount,
              rejectionHistory: rHist,
              verification: {
                ...b.verification,
                rejectionCount: rCount,
                rejectionHistory: rHist,
              },
            };
          });

          return {
            businesses: loadedBusinesses,
            users: loadedUsers,
            currentUser: loadedCurrent,
            activeRole: parsed.activeRole || (loadedCurrent?.role === 'super_admin' ? 'admin' : 'vendor'),
            activeBusinessId: parsed.activeBusinessId || loadedBusinesses[0]?.id || seeds[0].id,
            vendorView: parsed.vendorView || 'list',
            adminView: parsed.adminView || 'queue',
            adminSelectedBusinessId: parsed.adminSelectedBusinessId || null,
            wizardTab: parsed.wizardTab || 'Core Details',
            isAuthModalOpen: false,
            hasExplicitLogin: Boolean(loadedCurrent && parsed.hasExplicitLogin),
          };
        }
      }
    } catch (e) {
      console.error('Failed to load local demo state:', e);
    }

    const seeds = getSeedBusinesses();
    return {
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

  const loginAsUser = (identifier: string) => {
    setState((prev) => {
      const lower = identifier.toLowerCase().trim();
      const matched =
        prev.users.find(
          (u) =>
            u.id === identifier ||
            u.role.toLowerCase() === lower ||
            u.roleLabel.toLowerCase() === lower ||
            u.email.toLowerCase() === lower ||
            u.username.toLowerCase() === lower ||
            (lower.includes('staff') && (u.role === 'specialist' || u.roleLabel.toLowerCase().includes('staff'))) ||
            (lower.includes('admin') && u.role === 'super_admin') ||
            (lower.includes('business') && u.role === 'business') ||
            (lower.includes('customer') && u.role === 'customer')
        ) || prev.users[0];

      const newRole: 'vendor' | 'admin' =
        matched.role === 'super_admin' || matched.role === 'specialist' ? 'admin' : 'vendor';

      return {
        ...prev,
        currentUser: matched,
        activeRole: newRole,
        isAuthModalOpen: false,
        hasExplicitLogin: true,
      };
    });
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isAuthModalOpen: false,
      hasExplicitLogin: false,
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
    });
  };

  const createNewBusiness = (): string => {
    const newId = `biz-${Date.now().toString().slice(-4)}`;
    const newBiz: Business = {
      id: newId,
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
        resubmittedAt: formattedDate,
        coreDetails: updatedCore,
        verification: {
          ...updatedVerif,
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
            : 'Pending Payment';

          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            message: isApproved
              ? `🎉 Payment of $${amount} for ${plan} plan confirmed! Your business "${b.coreDetails.businessName}" is now active and Live on the platform.`
              : `Payment of $${amount} for ${plan} plan successful! ${
                  kycComplete
                    ? 'Your application has been forwarded for KYC review.'
                    : 'Please finish all KYC verification checks to submit for review.'
                }`,
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
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message: `🎉 Your business "${b.coreDetails.businessName}" KYC has been approved and verified by the Super Admin! You can now go live on the platform.`,
        type: 'success',
        read: false,
        timestamp: 'Just now',
        businessId: id,
        actionRequired: 'go_live',
      };

      return {
        ...b,
        status: 'KYC Approved',
        subTab: 'approved',
        verification: {
          ...b.verification,
          reviewedAt: now,
          reviewedBy: state.currentUser?.fullName || 'Super Admin',
          rejectionReason: null,
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

    const computedStatus: BusinessStatus = formData.status
      ? (formData.status as BusinessStatus)
      : (formData.kycStatus === 'Pending Review' || kycSub)
      ? 'Pending KYC Review'
      : (existing?.status || initialStatus);

    const computedSubTab = formData.subTab
      ? formData.subTab
      : (computedStatus === 'Pending KYC Review' || kycSub)
      ? 'kyc-requests'
      : computedStatus === 'KYC Approved' || computedStatus === 'Live'
      ? 'approved'
      : (existing?.subTab || 'non-subscription');

    if (existing) {
      resultBiz = {
        ...existing,
        coreDetails: core,
        verification,
        status: computedStatus,
        subTab: computedSubTab,
        rejectionReason: verification.rejectionReason,
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
      };
      setState((prev) => ({
        ...prev,
        businesses: prev.businesses.map((b) => (b.id === businessId ? resultBiz : b)),
        activeBusinessId: businessId,
      }));
    } else {
      resultBiz = {
        id: businessId,
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
        email: formData.email || 'contact@mybusiness.com',
        website: formData.website || '',
        date: formattedDate,
        rejectionCount: 0,
        rejectionHistory: [],
      };
      setState((prev) => ({
        ...prev,
        businesses: [resultBiz, ...prev.businesses],
        activeBusinessId: businessId,
      }));
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
          legalName: b.coreDetails.legalEntityName || b.verification.beneficialOwner.fullName,
          federalTaxClassification: 'Limited Liability Company (LLC)',
          streetAddress: b.coreDetails.streetAddress,
          city: b.coreDetails.city,
          state: b.coreDetails.state,
          zipCode: b.coreDetails.zipCode,
          tinType: 'EIN',
          tinMasked: '**-*****6789',
          tinVerified: true,
          tinMatchStatus: 'match',
          reusedEkycTin: true,
          certifications: {
            correctTin: true,
            noBackupWithholding: true,
            usPerson: true,
            fatcaCorrect: true,
          },
          signatureName: b.verification.beneficialOwner.fullName || 'Alex Vance',
          agreedPerjury: true,
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
        loginAsUser,
        logout,
        setAuthModalOpen,
        updateUserProfile,
        createUser,
        updateUserById,
        deleteUserById,
        toggleUserStatus,
        updateBusinessPlan,
        setActiveRole,
        setVendorView,
        setAdminView,
        setWizardTab,
        selectBusinessForVendor,
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
        publishAndGoLive,
        deleteBusinessById,
        saveVendorBusiness,
        saveW9Data,
        submitW9Data,
        prefillWizardWithDummyData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
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
