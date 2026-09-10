import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import { Business, UserProfile } from '../../types';
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
  Sparkles,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { BusinessWizard } from './BusinessWizard';
import { BusinessMultiStepPage, DEFAULT_FORM_DATA } from './multistep/BusinessMultiStepPage';
import { BusinessFormData, MultiStepTab } from './multistep/types';
import { W9TaxCertification } from './W9TaxCertification';

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
    selectBusinessForVendor,
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
  } = useDemo();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<BusinessPortalTab>('dashboard');
  const [isBusinessesMenuOpen, setIsBusinessesMenuOpen] = useState(true);
  const [isBookingsMenuOpen, setIsBookingsMenuOpen] = useState(true);
  const [isMyServicesMenuOpen, setIsMyServicesMenuOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    state.businesses[0]?.id || ''
  );
  const [businessSearchFilter, setBusinessSearchFilter] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<string>('All');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('2,450.00');

  // 2 View Options for "My Businesses": 'table' (Image 1) or 'grid' (Image 2)
  const [businessesViewMode, setBusinessesViewMode] = useState<'table' | 'grid'>('grid');
  const [myBusinessesSearch, setMyBusinessesSearch] = useState('');
  const [myBusinessesStatusFilter, setMyBusinessesStatusFilter] = useState<
    'All Statuses' | 'Active' | 'Pending' | 'Inactive'
  >('All Statuses');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Synchronized directly with DemoContext so changes in Business User reflect in Super Admin and vice versa!
  const myBusinessesList = useMemo(() => {
    return state.businesses.map((b) => {
      let status: 'Active' | 'Pending' | 'Inactive' = 'Active';
      if (b.status === 'Pending KYC Review') {
        status = 'Pending';
      } else if (b.status === 'KYC Rejected' || b.status === 'Draft' || b.status === 'Pending Payment') {
        status = 'Inactive';
      } else {
        status = 'Active';
      }

      const isKycRejected =
        b.status === 'KYC Rejected' ||
        b.verification?.status === 'Rejected' ||
        Boolean(b.rejectionReason || b.verification?.rejectionReason);

      const rejectionReason = b.rejectionReason || b.verification?.rejectionReason;
      const rejectionCount = b.rejectionCount ?? b.verification?.rejectionCount ?? 0;

      return {
        id: b.id,
        name: b.coreDetails.businessName || 'Untitled Business',
        category: b.coreDetails.category || 'Coworking & Office',
        city: b.coreDetails.city || 'San Francisco',
        status,
        rawStatus: b.status,
        isKycRejected,
        rejectionReason,
        rejectionCount,
        services: b.servicesCount ?? 8,
        workers: b.workersCount ?? 4,
        isActive: b.status === 'KYC Approved' || b.status === 'Live',
        avatarChar: b.avatarChar || (b.coreDetails.businessName || 'B').charAt(0).toUpperCase(),
      };
    });
  }, [state.businesses]);

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
  const [newBizStatus, setNewBizStatus] = useState<'Active' | 'Pending' | 'Inactive'>('Active');

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
    return {
      ...DEFAULT_FORM_DATA,
      id: b.id,
      businessName: b.coreDetails.businessName,
      legalEntityName: b.coreDetails.legalEntityName,
      category: b.coreDetails.category,
      phone: b.phone || '+1 (415) 555-0199',
      description: b.coreDetails.description,
      streetAddress: b.coreDetails.streetAddress,
      city: b.coreDetails.city,
      state: b.coreDetails.state,
      zipCode: b.coreDetails.zipCode,
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
        (b.status !== 'KYC Rejected' && Boolean(b.verification?.kycSubmitted)),
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
    };
  };

  const toggleBusinessActive = (bizId: string) => {
    const biz = state.businesses.find((b) => b.id === bizId);
    if (!biz) return;
    const isNowActive = biz.status === 'KYC Approved' || biz.status === 'Live';
    const nextStatus = isNowActive ? 'Draft' : 'KYC Approved';
    saveVendorBusiness({
      ...convertBusinessToFormData(biz),
      id: biz.id,
      status: nextStatus,
    });
    showToast(
      `${biz.coreDetails.businessName} is now ${
        !isNowActive ? 'Active and accepting orders' : 'Paused / Inactive'
      }.`
    );
  };

  const handleDeleteBusiness = (bizId: string) => {
    const target = state.businesses.find((b) => b.id === bizId);
    if (target) {
      deleteBusinessById(bizId);
      showToast(`Removed "${target.coreDetails.businessName}" from your businesses.`);
    }
  };

  const handleCreateBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    const newId = `biz-${Date.now()}`;
    const newBiz = saveVendorBusiness({
      id: newId,
      businessName: newBizName.trim(),
      category: newBizCategory,
      city: newBizCity.trim() || 'San Francisco',
      status:
        newBizStatus === 'Active'
          ? 'KYC Approved'
          : newBizStatus === 'Pending'
          ? 'Pending KYC Review'
          : 'Draft',
      kycSubmitted: newBizStatus === 'Pending',
      servicesCount: Number(newBizServices) || 1,
      workersCount: Number(newBizWorkers) || 1,
    });
    setIsCreateBusinessModalOpen(false);
    setNewBizName('');
    setNewBizCity('');
    showToast(`Successfully registered "${newBiz.coreDetails.businessName}"!`);
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
      status:
        editingBiz.status === 'Active'
          ? 'KYC Approved'
          : editingBiz.status === 'Pending'
          ? 'Pending KYC Review'
          : 'Draft',
      kycSubmitted: editingBiz.status === 'Pending',
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

    if (multistepMode === 'create') {
      showToast(`Business "${savedBiz.coreDetails.businessName}" created and synced to Super Admin!`);
      setMultistepMode(null);
    } else {
      setMultistepInitialData(dataWithId);
      showToast(`Saved changes for "${savedBiz.coreDetails.businessName}".`);
    }
  };

  const handleOpenEditMultiStep = (
    biz: {
      id: string;
      name: string;
      category: string;
      city: string;
    },
    initialTab: MultiStepTab = 'business-setup'
  ) => {
    setMultistepInitialTab(initialTab);
    const existingStore = businessDetailsStore[biz.id];
    const contextBiz = state.businesses.find((b) => b.id === biz.id);

    if (contextBiz) {
      const converted = convertBusinessToFormData(contextBiz);
      setMultistepInitialData({
        ...DEFAULT_FORM_DATA,
        ...(existingStore || {}),
        ...converted,
        id: biz.id,
        businessName: biz.name || contextBiz.coreDetails.businessName,
        category: biz.category || contextBiz.coreDetails.category,
        city: biz.city || contextBiz.coreDetails.city,
      });
    } else if (existingStore) {
      setMultistepInitialData({
        ...DEFAULT_FORM_DATA,
        ...existingStore,
        id: biz.id,
        businessName: biz.name,
        category: biz.category,
        city: biz.city,
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
  // MY SERVICES / SERVICE AVAILABILITY STATE (matching Image 1 & Image 2)
  // ==========================================
  const [selectedServiceBizId, setSelectedServiceBizId] = useState<string>('mbiz-1'); // Default 'mbiz-1' (Urban Roast Coffee)
  const [isServiceBizDropdownOpen, setIsServiceBizDropdownOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');

  // Business services repository - starts empty to exactly match Image 1
  const [businessServices, setBusinessServices] = useState<
    Array<{
      id: string;
      businessId: string;
      name: string;
      price: string;
      duration: string;
    }>
  >([]);

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const formattedPrice = newServicePrice.trim()
      ? newServicePrice.trim().startsWith('$')
        ? newServicePrice.trim()
        : `$${newServicePrice.trim()}`
      : '$25';

    const newService = {
      id: `srv-${Date.now()}`,
      businessId: selectedServiceBizId,
      name: newServiceName.trim(),
      price: formattedPrice,
      duration: newServiceDuration.trim() || '30',
    };
    setBusinessServices((prev) => [newService, ...prev]);
    setIsAddServiceModalOpen(false);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('30');
    showToast(`Added "${newService.name}" to service availability.`);
  };

  const handleDeleteService = (srvId: string) => {
    setBusinessServices((prev) => prev.filter((s) => s.id !== srvId));
    showToast('Service removed.');
  };

  const selectedServiceBiz =
    myBusinessesList.find((b) => b.id === selectedServiceBizId) ||
    myBusinessesList[0] || {
      id: 'mbiz-1',
      name: 'Urban Roast Coffee',
    };

  const servicesForSelectedBiz = businessServices.filter(
    (s) => s.businessId === selectedServiceBiz.id
  );

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

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPayoutModalOpen(false);
    showToast(`Payout request for $${payoutAmount} submitted to primary bank account.`);
  };

  const selectedBusiness =
    state.businesses.find((b) => b.id === selectedBusinessId) || state.businesses[0];

  const filteredBusinesses = state.businesses.filter((b) => {
    const matchesSearch =
      b.coreDetails.businessName.toLowerCase().includes(businessSearchFilter.toLowerCase()) ||
      b.coreDetails.city.toLowerCase().includes(businessSearchFilter.toLowerCase()) ||
      b.coreDetails.category.toLowerCase().includes(businessSearchFilter.toLowerCase());
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
      <div className="h-full w-full overflow-y-auto overscroll-contain scrollbar-none">
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
          {/* Brand Logo matching Image 2 */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-white font-black text-xl tracking-wider uppercase font-mono">
                URSPOT
              </span>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center transition-colors cursor-pointer"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* 2. W9 Form */}
            <button
              id="sidebar-tab-w9-form"
              onClick={() => setActiveTab('w9-form')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'w9-form'
                  ? 'bg-slate-800/90 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>W9 Form</span>
                  {selectedBusiness?.w9?.status === 'Submitted' || selectedBusiness?.w9?.status === 'Certified' ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Submitted
                    </span>
                  ) : selectedBusiness?.w9?.status === 'Draft' ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Draft
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
              )}
            </button>

            {/* 3. Businesses (Dropdown with 3 sub-options) */}
            <div>
              <button
                id="sidebar-tab-businesses-toggle"
                onClick={() => {
                  setIsBusinessesMenuOpen(!isBusinessesMenuOpen);
                  if (activeTab !== 'my-businesses' && activeTab !== 'business-details' && activeTab !== 'followed-businesses') {
                    setActiveTab('my-businesses');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-businesses' ||
                  activeTab === 'business-details' ||
                  activeTab === 'followed-businesses'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Businesses</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isBusinessesMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
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
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'my-businesses'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>My Businesses</span>
                  </button>

                  <button
                    id="sidebar-subtab-business-details"
                    onClick={() => setActiveTab('business-details')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'business-details'
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
                  setIsBookingsMenuOpen(!isBookingsMenuOpen);
                  if (
                    activeTab !== 'bookings' &&
                    activeTab !== 'booking-management' &&
                    activeTab !== 'advanced-booking-workflow'
                  ) {
                    setActiveTab('booking-management');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookings' ||
                  activeTab === 'booking-management' ||
                  activeTab === 'advanced-booking-workflow'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Bookings</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isBookingsMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-options: "Booking Management" and "Advanced Booking Workflow" */}
              {isBookingsMenuOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-booking-management"
                    onClick={() => setActiveTab('booking-management')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'booking-management' || activeTab === 'bookings'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Booking Management</span>
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
                  setIsMyServicesMenuOpen(!isMyServicesMenuOpen);
                  if (activeTab !== 'my-services' && activeTab !== 'service-availability') {
                    setActiveTab('service-availability');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-services' || activeTab === 'service-availability'
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
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

              {/* Sub-option: "Service Availability" */}
              {isMyServicesMenuOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-service-availability"
                    onClick={() => setActiveTab('service-availability')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                      activeTab === 'service-availability' || activeTab === 'my-services'
                        ? 'text-white font-bold bg-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Service Availability</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Workers */}
            <button
              onClick={() => setActiveTab('workers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Workers</span>}
            </button>

            {/* 7. Payouts */}
            <button
              onClick={() => setActiveTab('payouts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'payouts'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Payouts</span>}
            </button>

            {/* 8. Customers */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <UsersRound className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Customers</span>}
            </button>

            {/* 9. Reviews */}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Reviews</span>}
            </button>

            {/* 10. Subscriptions */}
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BadgeCheck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Subscriptions</span>}
            </button>

            {/* 11. Account */}
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Account</span>}
            </button>

            {/* 12. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
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
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold py-2.5 px-3 rounded-full transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Payout Request</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-white text-slate-900 flex items-center justify-center font-bold cursor-pointer"
              title="Create Payout Request"
            >
              +
            </button>
          )}

          {/* Help Center */}
          <button
            onClick={() => showToast('Connecting to 24/7 Merchant Support Help Center...')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Help Center</span>}
          </button>

          {/* Logout */}
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW CONTAINER (Navbar + Dynamic Active Tab Content)              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overscroll-contain scrollbar-none">
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
              {activeTab === 'workers' && 'Staff & On-site Specialists'}
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-sm">{currentUser?.fullName || 'Alex Vance'}</p>
                    <p className="text-slate-400 text-[11px]">{currentUser?.email || 'alex.vance@uspot.com'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                      Role: business (active)
                    </span>
                  </div>

                  {/* Switch Demo Role */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                      Switch Role (Demo)
                    </span>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            loginAsUser(u.id);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                            u.id === currentUser?.id ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">{u.fullName}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                          </div>
                          {u.id === currentUser?.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      ))}
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

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: W9 Tax Form CTA */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">W-9 Tax Certification</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Required for payouts and disbursements. Currently{' '}
                      <strong className="text-amber-600 font-semibold">
                        {selectedBusiness?.w9?.status || 'Pending Verification'}
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

                {/* Card 2: Manage My Businesses */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Registered Businesses</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      You have <strong className="text-slate-900 font-semibold">{state.businesses.length} commercial venue(s)</strong> active on the marketplace.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('my-businesses')}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View My Businesses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card 3: Payout Balance */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Available Payouts</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Available to withdraw: <strong className="text-emerald-700 font-bold">$2,450.00</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create Payout Request</span>
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
                onNavigateToEkyc={() => {
                  const biz = selectedBusiness;
                  if (biz) {
                    handleOpenEditMultiStep(
                      {
                        id: biz.id,
                        name: biz.coreDetails.businessName,
                        category: biz.coreDetails.category,
                        city: biz.coreDetails.city,
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
                <button
                  id="create-new-business-btn"
                  onClick={() => {
                    setMultistepInitialData(undefined);
                    setMultistepMode('create');
                  }}
                  className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Business</span>
                </button>
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

                            {/* Actions (Eye, Pencil, Trash2, Toggle Switch) */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setViewingBiz(biz)}
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

                                {/* Interactive Toggle Switch */}
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
                              </div>
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

                      {/* Bottom Row: Actions (Eye, Pencil, Trash) & Toggle Switch */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setViewingBiz(biz)}
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

                        {/* Toggle Switch */}
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
          )}

          {/* =================================================================== */}
          {/* VIEW 3B: BUSINESSES -> BUSINESS DETAILS                             */}
          {/* =================================================================== */}
          {activeTab === 'business-details' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
              {/* Header with Switcher Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                    <span>Businesses</span>
                    <span>›</span>
                    <span className="text-slate-600 font-semibold">Business Details</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedBusiness.coreDetails.businessName}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Legal Entity: <strong className="text-slate-700">{selectedBusiness.coreDetails.legalEntityName}</strong>
                  </p>
                </div>

                {/* Switch between owned businesses */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Select Business:</span>
                  <div className="relative">
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-2xs"
                    >
                      {state.businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.coreDetails.businessName} ({b.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Status & Quick Stats Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Marketplace Status</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedBusiness.status}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedBusiness.status === 'Live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedBusiness.status === 'Pending KYC Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedBusiness.status}
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Current Plan</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedBusiness.payment.planSelected}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                    Active Tier
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">KYC Risk Tier</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedBusiness.verification.riskTier} Risk</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Core Details & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Entity & General Info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                    Registration & Commercial Info
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Business Name</span>
                      <strong className="text-slate-900 font-bold">{selectedBusiness.coreDetails.businessName}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Legal Entity</span>
                      <span className="font-semibold text-slate-800">{selectedBusiness.coreDetails.legalEntityName}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Category</span>
                      <span className="font-semibold text-indigo-600">{selectedBusiness.coreDetails.category}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">EIN / TIN</span>
                      <span className="font-mono text-slate-800">{selectedBusiness.verification.einVerification.einEntered}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">TIN Match Status</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedBusiness.verification.einVerification.tinMatchStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Location & Address */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                    Location & Contact Details
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Street Address</span>
                      <strong className="text-slate-900 font-semibold">{selectedBusiness.coreDetails.streetAddress}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">City & State</span>
                      <span className="text-slate-800">{selectedBusiness.coreDetails.city}, {selectedBusiness.coreDetails.state} {selectedBusiness.coreDetails.zipCode}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Bank Verification</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedBusiness.verification.bankAccount.verified ? 'Verified & Linked' : 'Pending'}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Account Masked</span>
                      <span className="font-mono text-slate-700">{selectedBusiness.verification.bankAccount.accountNumberMasked}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => selectBusinessForVendor(selectedBusiness.id, 'Core Details')}
                      className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs text-center"
                    >
                      Open Full Setup Wizard
                    </button>
                  </div>
                </div>
              </div>

              {/* Operating Hours Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Operating Hours Schedule
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
                  {selectedBusiness.operatingHours.map((h) => (
                    <div
                      key={h.day}
                      className={`p-3 rounded-xl border ${
                        h.isOpen ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/60 text-slate-400'
                      }`}
                    >
                      <strong className="block text-slate-900 mb-1">{h.day.slice(0, 3)}</strong>
                      {h.isOpen ? (
                        <span className="text-[11px] font-mono text-slate-600">
                          {h.openTime} - {h.closeTime}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          {/* VIEW 4A: BOOKING MANAGEMENT (Empty tab with no data)                 */}
          {/* =================================================================== */}
          {(activeTab === 'bookings' || activeTab === 'booking-management') && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Management</h1>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-16 text-center min-h-[300px] flex items-center justify-center">
                <p className="text-xs text-slate-400 font-medium">No bookings yet.</p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 4B: ADVANCED BOOKING WORKFLOW (Empty tab with no data)          */}
          {/* =================================================================== */}
          {activeTab === 'advanced-booking-workflow' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Booking Workflow</h1>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-16 text-center min-h-[300px] flex items-center justify-center">
                <p className="text-xs text-slate-400 font-medium">No workflows configured.</p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 5: MY SERVICES / SERVICE AVAILABILITY (matching Image 1)       */}
          {/* =================================================================== */}
          {(activeTab === 'my-services' || activeTab === 'service-availability') && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Header matching Image 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Services</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Manage services offered by your businesses.
                  </p>
                </div>
                <button
                  id="add-service-header-btn"
                  onClick={() => {
                    setNewServiceName('');
                    setNewServicePrice('');
                    setNewServiceDuration('30');
                    setIsAddServiceModalOpen(true);
                  }}
                  className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              {/* Top Selector Card matching Image 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">Business</span>
                  <div className="relative">
                    <button
                      id="business-service-dropdown-btn"
                      onClick={() => setIsServiceBizDropdownOpen(!isServiceBizDropdownOpen)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs flex items-center gap-2.5"
                    >
                      <span>{selectedServiceBiz.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isServiceBizDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 text-xs">
                        {myBusinessesList.map((biz) => (
                          <button
                            key={biz.id}
                            onClick={() => {
                              setSelectedServiceBizId(biz.id);
                              setIsServiceBizDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              selectedServiceBiz.id === biz.id
                                ? 'font-bold text-slate-900 bg-slate-50'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{biz.name}</span>
                            {selectedServiceBiz.id === biz.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card matching Image 1 */}
              {servicesForSelectedBiz.length === 0 ? (
                <div
                  onClick={() => {
                    setNewServiceName('');
                    setNewServicePrice('');
                    setNewServiceDuration('30');
                    setIsAddServiceModalOpen(true);
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs py-16 px-6 text-center flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors min-h-[140px]"
                >
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">
                    No services yet. Click Add Service.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-3.5 px-6 font-bold">SERVICE NAME</th>
                          <th className="py-3.5 px-6 font-bold">PRICE</th>
                          <th className="py-3.5 px-6 font-bold">DURATION</th>
                          <th className="py-3.5 px-6 font-bold text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {servicesForSelectedBiz.map((srv) => (
                          <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 text-xs sm:text-sm">
                              {srv.name}
                            </td>
                            <td className="py-4 px-6 text-slate-700 font-semibold font-mono">
                              {srv.price}
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium">
                              {srv.duration} mins
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteService(srv.id);
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                                title="Delete Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

          {/* =================================================================== */}
          {/* VIEW 6: PAYOUTS                                                     */}
          {/* =================================================================== */}
          {activeTab === 'payouts' && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payouts & Disbursements</h1>
                  <p className="text-xs text-slate-500 mt-1">Track revenue withdrawals, automated deposits, and tax withholdings.</p>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  + Create Payout Request
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">Available Balance</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">$2,450.00</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">Pending Escrow</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">$1,180.00</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-400 font-bold uppercase">Lifetime Earnings</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">$48,920.00</p>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other sidebar items */}
          {['workers', 'customers', 'reviews', 'subscriptions', 'account', 'settings'].includes(activeTab) && (
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
      {/* MODAL: CREATE PAYOUT REQUEST                                              */}
      {/* ========================================================================= */}
      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Create Payout Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Disburse available earnings to verified bank account</p>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available to Withdraw</label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-semibold">Current Balance</span>
                  <span className="font-mono font-black text-emerald-700 text-base">$2,450.00</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payout Amount ($ USD) *</label>
                <input
                  type="text"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Bank Account</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                  Chase Business Checking (••••4829)
                </div>
              </div>
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
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Request Transfer
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
                    Launch Status
                  </label>
                  <select
                    value={newBizStatus}
                    onChange={(e) =>
                      setNewBizStatus(e.target.value as 'Active' | 'Pending' | 'Inactive')
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  <select
                    value={editingBiz.status}
                    onChange={(e) =>
                      setEditingBiz({
                        ...editingBiz,
                        status: e.target.value as 'Active' | 'Pending' | 'Inactive',
                        isActive: e.target.value === 'Active',
                      })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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

      {/* ADD SERVICE MODAL (matching Image 2) */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Add Service</h3>
            </div>
            <form onSubmit={handleAddServiceSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Service name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Price"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="30"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-colors cursor-pointer shadow-xs"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
