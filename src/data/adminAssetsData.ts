export interface IndustryCategory {
  id: string;
  name: string;
  industryGroup: string;
  description: string;
  iconName: string;
  photoUrl?: string;
  isRecommended: boolean;
  servicesCount: number;
  activeListingCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface AssetService {
  id: string;
  name: string;
  description: string;
  businessCategory: string;
  industry: string;
  photoUrl?: string;
  status: 'Active' | 'Inactive';
  billingUnit?: 'Per Hour' | 'Per Day' | 'Flat Rate';
  standardRate?: number;
  iconName?: string;
}

export interface OnboardingRequirement {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isMandatory: boolean;
  verificationProvider: string;
  documentRequired: string;
  gracePeriodDays: number;
  status: 'active' | 'disabled';
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  active: boolean;
  isPrimary: boolean;
  currencyCode: string;
  phoneCode: string;
  taxIdLabel: string;
  taxIdFormat: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  formatLocale: string;
}

export interface LocationMetro {
  id: string;
  metroHub: string;
  state: string;
  countryCode: string;
  totalVenues: number;
  salesTaxRate: number;
  active: boolean;
}

export interface PlatformSystemSettings {
  platformCommissionRate: number;
  kycReviewSlaHours: number;
  autoPayoutHold: boolean;
  strictSanctionsCheck: boolean;
  enforceAdminMfa: boolean;
  maintenanceMode: boolean;
  notificationEmail: string;
  autoApproveLowRiskPlaid: boolean;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
}

export const INITIAL_INDUSTRIES_CATEGORIES: IndustryCategory[] = [
  {
    id: '637524CE-28EE-4FF9-B053-76198EEA3CE2',
    name: 'Barber Shop',
    industryGroup: 'Hair Care',
    description: 'Traditional and modern barbering, fades, beard grooming and hair styling.',
    iconName: 'Scissors',
    photoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 3,
    activeListingCount: 34,
    status: 'Active',
    createdAt: '2026-01-05',
  },
  {
    id: 'F4278512-1371-4CAA-B616-D37D614690A4',
    name: 'Day Spa',
    industryGroup: 'Wellness',
    description: 'Relaxing body treatments, facials, hydrotherapy and therapeutic massages.',
    iconName: 'Sparkles',
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 2,
    activeListingCount: 22,
    status: 'Active',
    createdAt: '2026-01-08',
  },
  {
    id: 'A3E481B0-1771-4F0A-BAA8-71614B5EA86E',
    name: 'Dentistry',
    industryGroup: 'Health',
    description: 'General, cosmetic, and orthodontic dentistry suites with clinical rooms.',
    iconName: 'ShieldCheck',
    photoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 0,
    activeListingCount: 16,
    status: 'Active',
    createdAt: '2026-01-12',
  },
  {
    id: '1C301FC8-78F5-4809-83F3-AAB9D9BA7A7C',
    name: 'Fitness',
    industryGroup: 'Fitness',
    description: 'Gym floor, strength equipment, cardio studio and lockers.',
    iconName: 'Dumbbell',
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 0,
    activeListingCount: 28,
    status: 'Active',
    createdAt: '2026-01-15',
  },
  {
    id: 'cat-wellness-spa',
    name: 'Wellness Spa',
    industryGroup: 'Health & Wellness',
    description: 'Hydrotherapy baths, sauna suites, relaxation lounges, and massage therapy rooms',
    iconName: 'Sparkles',
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 5,
    activeListingCount: 14,
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'cat-cowork',
    name: 'Coworking & Shared Desks',
    industryGroup: 'Flexible Office & Workspace',
    description: 'Hot desks, dedicated pods, and quiet focus booths with business WiFi',
    iconName: 'Building2',
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 6,
    activeListingCount: 42,
    status: 'Active',
    createdAt: '2026-01-15',
  },
  {
    id: 'cat-suites',
    name: 'Private Executive Suites',
    industryGroup: 'Flexible Office & Workspace',
    description: 'Turnkey private team offices accommodating 4 to 30 personnel',
    iconName: 'ShieldCheck',
    photoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 4,
    activeListingCount: 28,
    status: 'Active',
    createdAt: '2026-01-18',
  },
  {
    id: 'cat-events',
    name: 'Event & Banquet Halls',
    industryGroup: 'Events & Hospitality',
    description: 'Large open venues for brand activations, receptions, and galas',
    iconName: 'Sparkles',
    photoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80',
    isRecommended: true,
    servicesCount: 7,
    activeListingCount: 19,
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'cat-studios',
    name: 'Photo & Video Production Studios',
    industryGroup: 'Creative & Media',
    description: 'Soundstages, cyclorama walls, green screens, and lighting grids',
    iconName: 'Camera',
    photoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80',
    isRecommended: false,
    servicesCount: 5,
    activeListingCount: 15,
    status: 'Active',
    createdAt: '2026-02-10',
  },
  {
    id: 'cat-popups',
    name: 'Retail & Pop-Up Showrooms',
    industryGroup: 'Retail & Commercial',
    description: 'Streetfront boutique storefronts for seasonal launches and popups',
    iconName: 'Tag',
    photoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
    isRecommended: false,
    servicesCount: 3,
    activeListingCount: 11,
    status: 'Active',
    createdAt: '2026-03-04',
  },
  {
    id: 'cat-wellness',
    name: 'Movement & Pilates Lofts',
    industryGroup: 'Health & Wellness',
    description: 'Mirrored dance studios, reformer stations, and mindful movement halls',
    iconName: 'Activity',
    photoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
    isRecommended: false,
    servicesCount: 3,
    activeListingCount: 9,
    status: 'Active',
    createdAt: '2026-03-22',
  },
  {
    id: 'cat-kitchen',
    name: 'Commercial Kitchen Labs',
    industryGroup: 'Culinary & Production',
    description: 'Certified prep kitchens, walk-in refrigeration, and catering stations',
    iconName: 'Utensils',
    photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
    isRecommended: false,
    servicesCount: 4,
    activeListingCount: 6,
    status: 'Active',
    createdAt: '2026-04-11',
  },
  {
    id: 'cat-warehousing',
    name: 'Micro-Warehouses & Logistics',
    industryGroup: 'Industrial & Storage',
    description: 'Loading bay accessible staging bays and pallet storage units',
    iconName: 'Layers',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    isRecommended: false,
    servicesCount: 2,
    activeListingCount: 8,
    status: 'Inactive',
    createdAt: '2026-05-02',
  },
];

export const INITIAL_SERVICES_CATALOG: AssetService[] = [
  {
    id: 'srv-deep-massage',
    name: 'Deep Tissue Massage',
    description: 'Targeted firm pressure massage addressing chronic muscle tension, knots, and tightness.',
    businessCategory: 'Wellness Spa',
    industry: 'Health & Wellness',
    photoUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Hour',
    standardRate: 110,
    iconName: 'Sparkles',
  },
  {
    id: 'srv-hot-stone',
    name: 'Hot Stone Therapy',
    description: 'Smooth volcanic basalt stones placed on key energetic points to dissolve stress.',
    businessCategory: 'Wellness Spa',
    industry: 'Health & Wellness',
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Hour',
    standardRate: 135,
    iconName: 'Sparkles',
  },
  {
    id: 'srv-fiber',
    name: 'Dedicated 1Gbps Fiber Internet',
    description: 'Symmetric high-speed fiber connection with dedicated VLAN and static IP.',
    businessCategory: 'Coworking & Shared Desks',
    industry: 'Flexible Office & Workspace',
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Day',
    standardRate: 75,
    iconName: 'Wifi',
  },
  {
    id: 'srv-av-prod',
    name: '4K Broadcast AV & Mic Package',
    description: 'Logitech Rally Plus setup with 4 lapel wireless mics and motorized PTZ camera.',
    businessCategory: 'Grand Event Halls & Auditoriums',
    industry: 'Events & Hospitality',
    photoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Day',
    standardRate: 150,
    iconName: 'Video',
  },
  {
    id: 'srv-catering',
    name: 'Full Barista & Breakfast Service',
    description: 'Artisanal cold brew, espresso bar, pastries, and dedicated attendant.',
    businessCategory: 'Turnkey Executive Suites',
    industry: 'Flexible Office & Workspace',
    photoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Hour',
    standardRate: 85,
    iconName: 'Coffee',
  },
  {
    id: 'srv-janitorial',
    name: 'Post-Event Sanitization & Reset',
    description: 'Deep cleaning, trash hauling, and venue turnover by certified crew.',
    businessCategory: 'Grand Event Halls & Auditoriums',
    industry: 'Events & Hospitality',
    photoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Flat Rate',
    standardRate: 220,
    iconName: 'CheckCircle2',
  },
  {
    id: 'srv-pilates',
    name: 'Reformer Pilates Instruction',
    description: 'Private 1-on-1 coaching utilizing studio Allegro 2 reformers and springs.',
    businessCategory: 'Movement & Pilates Lofts',
    industry: 'Health & Wellness',
    photoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Hour',
    standardRate: 95,
    iconName: 'Activity',
  },
  {
    id: 'srv-lighting-rig',
    name: 'Studio Lighting & DMX Rigging',
    description: 'Overhead grid with motorized ARRI SkyPanels and wireless DMX master console.',
    businessCategory: 'Soundstage & Studio Spaces',
    industry: 'Creative & Media',
    photoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80',
    status: 'Active',
    billingUnit: 'Per Day',
    standardRate: 320,
    iconName: 'Camera',
  },
  {
    id: 'srv-kitchen-prep',
    name: 'Commercial Kitchen Deep Sanitization',
    description: 'NSF certified deep degreasing, walk-in sanitation, and grease trap purge.',
    businessCategory: 'Commercial Commissary Kitchens',
    industry: 'Culinary & Production',
    photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
    status: 'Inactive',
    billingUnit: 'Flat Rate',
    standardRate: 280,
    iconName: 'Utensils',
  },
];

export const INITIAL_ONBOARDING_REQUIREMENTS: OnboardingRequirement[] = [
  {
    id: 'req-ein',
    stepNumber: 1,
    title: 'IRS Tax ID / EIN Verification (CP575)',
    description: 'Legal company TIN match against IRS database to prevent fraud and tax mismatches',
    isMandatory: true,
    verificationProvider: 'IRS Real-Time TIN Matching API',
    documentRequired: 'IRS CP-575 or Form 147C Official Letter',
    gracePeriodDays: 0,
    status: 'active',
  },
  {
    id: 'req-registry',
    stepNumber: 2,
    title: 'Secretary of State Good Standing Filing',
    description: 'Verify the business entity is officially registered and active in state of formation',
    isMandatory: true,
    verificationProvider: 'State Registry Live Search (LexisNexis)',
    documentRequired: 'Articles of Organization / Certificate of Good Standing',
    gracePeriodDays: 3,
    status: 'active',
  },
  {
    id: 'req-beneficial',
    stepNumber: 3,
    title: 'Beneficial Owner Identity & Liveness Check',
    description: 'Government photo ID and facial liveness verification for individuals owning 25%+',
    isMandatory: true,
    verificationProvider: 'Jumio / Persona KYC Biometrics',
    documentRequired: "State Driver's License or Valid Passport + Real-time Selfie",
    gracePeriodDays: 0,
    status: 'active',
  },
  {
    id: 'req-bank',
    stepNumber: 4,
    title: 'Payout Bank Account Verification',
    description: 'Direct verification of corporate checking account for automated booking payouts',
    isMandatory: true,
    verificationProvider: 'Plaid Instant Auth / Micro-deposits',
    documentRequired: 'Voided Check or Official Bank Account Statement',
    gracePeriodDays: 0,
    status: 'active',
  },
  {
    id: 'req-insurance',
    stepNumber: 5,
    title: 'Commercial General Liability Insurance (CGL)',
    description: '$1M/$2M liability policy naming USPOT Platform as additional insured',
    isMandatory: false,
    verificationProvider: 'Manual Compliance Auditor Review',
    documentRequired: 'ACORD 25 Certificate of Liability Insurance',
    gracePeriodDays: 14,
    status: 'active',
  },
  {
    id: 'req-occupancy',
    stepNumber: 6,
    title: 'Certificate of Occupancy & Fire Safety',
    description: 'Local municipality occupancy permit and emergency egress compliance certificate',
    isMandatory: false,
    verificationProvider: 'Manual Compliance Review',
    documentRequired: 'Municipal Certificate of Occupancy',
    gracePeriodDays: 30,
    status: 'active',
  },
];

export const INITIAL_COUNTRIES: CountryConfig[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    active: true,
    isPrimary: true,
    currencyCode: 'USD',
    phoneCode: '+1',
    taxIdLabel: 'EIN / Tax ID',
    taxIdFormat: 'XX-XXXXXXX',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    active: true,
    isPrimary: false,
    currencyCode: 'CAD',
    phoneCode: '+1',
    taxIdLabel: 'CRA Business Number (BN)',
    taxIdFormat: 'XXXXXXXXX RC0001',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    active: true,
    isPrimary: false,
    currencyCode: 'GBP',
    phoneCode: '+44',
    taxIdLabel: 'Companies House CRN',
    taxIdFormat: '8 Digits',
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    active: true,
    isPrimary: false,
    currencyCode: 'AUD',
    phoneCode: '+61',
    taxIdLabel: 'Australian Business Number (ABN)',
    taxIdFormat: '11 Digits',
  },
  {
    code: 'DE',
    name: 'Germany (EU)',
    flag: '🇩🇪',
    active: false,
    isPrimary: false,
    currencyCode: 'EUR',
    phoneCode: '+49',
    taxIdLabel: 'Steuernummer / USt-IdNr',
    taxIdFormat: 'DE999999999',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    active: false,
    isPrimary: false,
    currencyCode: 'SGD',
    phoneCode: '+65',
    taxIdLabel: 'Unique Entity Number (UEN)',
    taxIdFormat: '9-10 Digits',
  },
];

export const INITIAL_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1.0,
    isDefault: true,
    isActive: true,
    formatLocale: 'en-US',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: 0.92,
    isDefault: false,
    isActive: true,
    formatLocale: 'de-DE',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    exchangeRate: 0.78,
    isDefault: false,
    isActive: true,
    formatLocale: 'en-GB',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    exchangeRate: 1.36,
    isDefault: false,
    isActive: true,
    formatLocale: 'en-CA',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    exchangeRate: 1.51,
    isDefault: false,
    isActive: true,
    formatLocale: 'en-AU',
  },
];

export const INITIAL_METROS: LocationMetro[] = [
  {
    id: 'loc-nyc',
    metroHub: 'New York City Metropolitan Area',
    state: 'New York (NY)',
    countryCode: 'US',
    totalVenues: 48,
    salesTaxRate: 8.875,
    active: true,
  },
  {
    id: 'loc-sf',
    metroHub: 'San Francisco & Silicon Valley Bay Area',
    state: 'California (CA)',
    countryCode: 'US',
    totalVenues: 34,
    salesTaxRate: 7.25,
    active: true,
  },
  {
    id: 'loc-atx',
    metroHub: 'Austin & Central Texas Corridor',
    state: 'Texas (TX)',
    countryCode: 'US',
    totalVenues: 22,
    salesTaxRate: 8.25,
    active: true,
  },
  {
    id: 'loc-chi',
    metroHub: 'Greater Chicago & Loop District',
    state: 'Illinois (IL)',
    countryCode: 'US',
    totalVenues: 18,
    salesTaxRate: 10.25,
    active: true,
  },
  {
    id: 'loc-mia',
    metroHub: 'Miami & South Florida Coastal',
    state: 'Florida (FL)',
    countryCode: 'US',
    totalVenues: 16,
    salesTaxRate: 7.0,
    active: true,
  },
  {
    id: 'loc-sea',
    metroHub: 'Seattle & Puget Sound Tech Hub',
    state: 'Washington (WA)',
    countryCode: 'US',
    totalVenues: 14,
    salesTaxRate: 10.25,
    active: true,
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSystemSettings = {
  platformCommissionRate: 10.0,
  kycReviewSlaHours: 24,
  autoPayoutHold: true,
  strictSanctionsCheck: true,
  enforceAdminMfa: true,
  maintenanceMode: false,
  notificationEmail: 'ops-alerts@uspot.com',
  autoApproveLowRiskPlaid: false,
  payoutSchedule: 'weekly',
};

export const POPULAR_LUCIDE_ICONS = [
  { name: 'Building2', tag: 'Venue / Building', category: 'Real Estate' },
  { name: 'ShieldCheck', tag: 'Security & Verification', category: 'Compliance' },
  { name: 'Sparkles', tag: 'Luxury & Highlights', category: 'General' },
  { name: 'Camera', tag: 'Studio & Photography', category: 'Creative' },
  { name: 'Tag', tag: 'Retail & Pricing', category: 'Commerce' },
  { name: 'Activity', tag: 'Fitness & Health', category: 'Wellness' },
  { name: 'Utensils', tag: 'Dining & Kitchen', category: 'Food' },
  { name: 'Wifi', tag: 'Networking & Fiber', category: 'Tech' },
  { name: 'Video', tag: 'Conferencing & AV', category: 'Tech' },
  { name: 'Coffee', tag: 'Beverage Bar & Cafe', category: 'Hospitality' },
  { name: 'Shield', tag: 'Guard & Access Control', category: 'Security' },
  { name: 'Layers', tag: 'Storage & Floorplans', category: 'Space' },
  { name: 'Car', tag: 'Parking & Valet', category: 'Transport' },
  { name: 'Users', tag: 'Team & Capacity', category: 'Social' },
  { name: 'Key', tag: 'Smart Lock Access', category: 'Access' },
  { name: 'MapPin', tag: 'Locations & Directions', category: 'Geo' },
  { name: 'Globe', tag: 'International / Region', category: 'Geo' },
  { name: 'DollarSign', tag: 'Currencies & Rates', category: 'Finance' },
];

export interface BusinessOnboardingSubmission {
  id: string;
  businessName: string;
  owner: string;
  submitted: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Pending Review';
  legalEntityName?: string;
  einTin?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  category?: string;
  notes?: string;
}

export const INITIAL_ONBOARDING_SUBMISSIONS: BusinessOnboardingSubmission[] = [
  {
    id: 'ee80806e-8f2c-4901-b841-3a87fbbd52e1',
    businessName: 'Gg',
    owner: '—',
    submitted: 'Sep 7, 2026',
    status: 'Draft',
    legalEntityName: 'GG Media & Production Spaces Ltd',
    einTin: 'XX-XXX8062',
    email: 'contact@ggspaces.co.uk',
    phone: '+44 7700 900388',
    country: 'United Kingdom',
    city: 'London',
    category: 'Creative & Media Studios',
    notes: 'Draft application in progress. Awaiting bank payout routing details.',
  },
  {
    id: '83135593-1c4b-4fd5-8a67-93e8e19c011a',
    businessName: 'Goods',
    owner: '—',
    submitted: 'Sep 4, 2026',
    status: 'Draft',
    legalEntityName: 'Goods Urban Warehousing Solutions Inc',
    einTin: 'XX-XXX5593',
    email: 'ops@goodsstorage.com',
    phone: '+1 555 019 7721',
    country: 'United States',
    city: 'Chicago',
    category: 'Industrial & Storage',
    notes: 'Warehouse floor plan uploaded. Need insurance certificate.',
  },
  {
    id: '4512958a-a82f-45b9-9154-1b1574d6f73b',
    businessName: 'The',
    owner: '—',
    submitted: 'Sep 3, 2026',
    status: 'Draft',
    legalEntityName: 'The Meeting Atelier Group LLP',
    einTin: 'XX-XXX2958',
    email: 'management@theatelier.com',
    phone: '+44 7700 900512',
    country: 'United Kingdom',
    city: 'Manchester',
    category: 'Executive Meeting Suites',
    notes: 'Awaiting primary authorized signatory proof of identity.',
  },
  {
    id: '4b8338f9-90b1-4ee3-be12-672583ec8912',
    businessName: "Nemish's Barber Shop",
    owner: '—',
    submitted: 'Sep 3, 2026',
    status: 'Draft',
    legalEntityName: "Nemish Grooming & Parlor Venues Ltd",
    einTin: 'XX-XXX3389',
    email: 'hello@nemishbarber.co.uk',
    phone: '+44 7700 900199',
    country: 'United Kingdom',
    city: 'Birmingham',
    category: 'Wellness & Grooming',
    notes: 'Initial profile registered. Merchant exploring space sharing.',
  },
  {
    id: '671306ed-3e9a-4c28-9844-33b2a09156ff',
    businessName: 'Dolorem tempor numqu (Updated Name)',
    owner: '—',
    submitted: 'Sep 2, 2026',
    status: 'Active',
    legalEntityName: 'Dolorem Executive Suites & Boardrooms',
    einTin: 'XX-XXX3064',
    email: 'compliance@dolorem-suites.com',
    phone: '+1 555 019 8834',
    country: 'United States',
    city: 'New York',
    category: 'Flexible Office & Workspace',
    notes: 'KYC verified and compliance check completed. Spaces live for booking.',
  },
  {
    id: 'bf10ef89-8d77-44bc-a019-91a5567b4e23',
    businessName: 'Ut exercitationem do',
    owner: '—',
    submitted: 'Sep 1, 2026',
    status: 'Active',
    legalEntityName: 'Exercitationem Creative Soundstage LLC',
    einTin: 'XX-XXX0ef8',
    email: 'booking@ut-studios.io',
    phone: '+1 555 019 4410',
    country: 'United States',
    city: 'Los Angeles',
    category: 'Creative & Media Studios',
    notes: 'Fully verified. Certificates in good standing.',
  },
  {
    id: 'b6e62de2-71c8-4177-84e9-6f17e34cd991',
    businessName: 'Grooming Lounge Barber',
    owner: '—',
    submitted: 'Sep 1, 2026',
    status: 'Inactive',
    legalEntityName: 'Grooming Lounge Commercial Suites Ltd',
    einTin: 'XX-XXX62de',
    email: 'admin@groominglounge.co.uk',
    phone: '+44 7700 900742',
    country: 'United Kingdom',
    city: 'Leeds',
    category: 'Health & Wellness',
    notes: 'Temporarily deactivated per partner request for venue renovation.',
  },
];

export interface OrganizationRecord {
  id: string;
  name: string;
  legalType: string;
  country: string;
  totalVenues: number;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const INITIAL_ORGANIZATIONS: OrganizationRecord[] = [
  {
    id: 'org-1',
    name: 'Nexus Workspace Global Holdings',
    legalType: 'C-Corporation',
    country: 'United States',
    totalVenues: 14,
    contactName: 'Victoria Vance',
    contactEmail: 'v.vance@nexusglobal.com',
    status: 'active',
    createdAt: '2025-08-12',
  },
  {
    id: 'org-2',
    name: 'Apex Studio & Soundstage Group',
    legalType: 'Private Limited Company (Ltd)',
    country: 'United Kingdom',
    totalVenues: 8,
    contactName: 'Harrison Brooks',
    contactEmail: 'h.brooks@apexstudios.co.uk',
    status: 'active',
    createdAt: '2025-11-04',
  },
  {
    id: 'org-3',
    name: 'Urban Vault Commercial Logistics',
    legalType: 'Limited Liability Company (LLC)',
    country: 'United States',
    totalVenues: 6,
    contactName: 'Rachel Green',
    contactEmail: 'rachel@urbanvault.io',
    status: 'active',
    createdAt: '2026-01-20',
  },
  {
    id: 'org-4',
    name: 'Atelier Hospitality Collective',
    legalType: 'Limited Partnership (LP)',
    country: 'United Kingdom',
    totalVenues: 5,
    contactName: 'Julian Thorne',
    contactEmail: 'j.thorne@atelierhospitality.com',
    status: 'active',
    createdAt: '2026-03-15',
  },
];

export interface IndustryRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryCount: number;
  activeListings: number;
  status: 'active' | 'archived';
}

export const INITIAL_INDUSTRIES: IndustryRecord[] = [
  {
    id: 'ind-1',
    code: 'IND-WORKSPACE',
    name: 'Flexible Office & Workspace',
    description: 'Coworking desks, private team suites, hot-desks, and shared office facilities',
    categoryCount: 5,
    activeListings: 78,
    status: 'active',
  },
  {
    id: 'ind-2',
    code: 'IND-EVENTS',
    name: 'Events & Hospitality',
    description: 'Conference halls, reception galleries, banquet spaces, and brand activation venues',
    categoryCount: 6,
    activeListings: 46,
    status: 'active',
  },
  {
    id: 'ind-3',
    code: 'IND-CREATIVE',
    name: 'Creative & Media',
    description: 'Soundstages, cyclorama photo studios, podcast booths, and broadcast suites',
    categoryCount: 4,
    activeListings: 32,
    status: 'active',
  },
  {
    id: 'ind-4',
    code: 'IND-RETAIL',
    name: 'Retail & Commercial',
    description: 'Streetfront pop-ups, showroom galleries, and seasonal commercial retail spots',
    categoryCount: 3,
    activeListings: 24,
    status: 'active',
  },
  {
    id: 'ind-5',
    code: 'IND-WELLNESS',
    name: 'Health & Wellness',
    description: 'Yoga studios, Pilates lofts, physical therapy suites, and wellness retreats',
    categoryCount: 4,
    activeListings: 19,
    status: 'active',
  },
  {
    id: 'ind-6',
    code: 'IND-CULINARY',
    name: 'Culinary & Production',
    description: 'Commercial prep kitchens, tasting rooms, dark kitchen ghost pods, and bakeries',
    categoryCount: 3,
    activeListings: 14,
    status: 'active',
  },
  {
    id: 'ind-7',
    code: 'IND-HAIRCARE',
    name: 'Hair Care',
    description: 'Barber shops, hair salons, color studios, and styling suites',
    categoryCount: 5,
    activeListings: 34,
    status: 'active',
  },
  {
    id: 'ind-8',
    code: 'IND-WELLNESS-VERT',
    name: 'Wellness',
    description: 'Day spas, recovery lounges, massage studios, and saunas',
    categoryCount: 4,
    activeListings: 22,
    status: 'active',
  },
  {
    id: 'ind-9',
    code: 'IND-HEALTH-CLINICAL',
    name: 'Health',
    description: 'Dentistry clinics, physiotherapy practices, and wellness suites',
    categoryCount: 3,
    activeListings: 16,
    status: 'active',
  },
  {
    id: 'ind-10',
    code: 'IND-FITNESS-GYM',
    name: 'Fitness',
    description: 'Gyms, CrossFit boxes, boutique studios, and strength training centers',
    categoryCount: 4,
    activeListings: 28,
    status: 'active',
  },
];

export interface ServiceCategoryRecord {
  id: string;
  name: string;
  industry: string;
  description: string;
  servicesCount: number;
  servicesLabel?: string;
  status: 'Active' | 'Inactive';
  photoUrl?: string;
  associations?: string[];
  linkedServices?: string;
  revenueGeneration?: string;
  createdAt: string;
}

export const INITIAL_SERVICE_CATEGORIES: ServiceCategoryRecord[] = [
  {
    id: 'scat-1',
    name: 'Hair Styling & Grooming',
    industry: 'Health & Wellness',
    description: 'Precision haircuts, beard trims, blowouts, coloring treatments, and scalp care.',
    servicesCount: 12,
    servicesLabel: '12 Active',
    status: 'Active',
    associations: ['Beauty', 'Wellness', 'Professional'],
    photoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    linkedServices: '12 Active',
    revenueGeneration: '$42,850 (MTD)',
    createdAt: '08/15/2026',
  },
  {
    id: 'scat-2',
    name: 'Skincare & Esthetics',
    industry: 'Health & Wellness',
    description: 'Clinical facials, microdermabrasion, LED therapy, lymphatic drainage, and peel treatments.',
    servicesCount: 9,
    servicesLabel: '9 Active',
    status: 'Active',
    associations: ['Beauty', 'Wellness', 'Medical'],
    photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    linkedServices: '9 Active',
    revenueGeneration: '$31,400 (MTD)',
    createdAt: '08/10/2026',
  },
  {
    id: 'scat-3',
    name: 'Massage & Bodywork',
    industry: 'Health & Wellness',
    description: 'Deep tissue, Swedish, hot stone therapy, sports recovery, and neuromuscular release.',
    servicesCount: 8,
    servicesLabel: '8 Active',
    status: 'Active',
    associations: ['Wellness', 'Medical', 'Fitness'],
    photoUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
    linkedServices: '8 Active',
    revenueGeneration: '$28,950 (MTD)',
    createdAt: '07/28/2026',
  },
  {
    id: 'scat-4',
    name: 'Audio & Visual Engineering',
    industry: 'Creative & Media',
    description: '4K broadcast streaming, multi-mic boom setups, wireless monitoring, and soundstage mixing.',
    servicesCount: 14,
    servicesLabel: '14 Active',
    status: 'Active',
    associations: ['Professional'],
    photoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    linkedServices: '14 Active',
    revenueGeneration: '$56,200 (MTD)',
    createdAt: '07/15/2026',
  },
  {
    id: 'scat-5',
    name: 'Personal Training & Movement',
    industry: 'Health & Wellness',
    description: 'Private fitness coaching, biomechanics assessments, mobility drills, and circuit programming.',
    servicesCount: 7,
    servicesLabel: '7 Active',
    status: 'Active',
    associations: ['Fitness', 'Wellness'],
    photoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    linkedServices: '7 Active',
    revenueGeneration: '$19,800 (MTD)',
    createdAt: '06/24/2026',
  },
  {
    id: 'scat-6',
    name: 'Culinary Prep & Sommelier',
    industry: 'Culinary & Production',
    description: 'Private chef prep stations, wine pairing consultations, and artisan pastry fabrication.',
    servicesCount: 5,
    servicesLabel: '5 Active',
    status: 'Inactive',
    associations: ['Professional'],
    photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    linkedServices: '5 Inactive',
    revenueGeneration: '$14,250 (MTD)',
    createdAt: '06/12/2026',
  },
  {
    id: 'scat-7',
    name: 'Events & Hospitality Staffing',
    industry: 'Events & Hospitality',
    description: 'Front-of-house concierge, certified bartenders, guest check-in hostesses, and security.',
    servicesCount: 11,
    servicesLabel: '11 Active',
    status: 'Active',
    associations: ['Professional'],
    photoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    linkedServices: '11 Active',
    revenueGeneration: '$38,600 (MTD)',
    createdAt: '05/30/2026',
  },
  {
    id: 'scat-8',
    name: 'Digital Infrastructure & IT',
    industry: 'Flexible Office & Workspace',
    description: 'Dedicated enterprise VLANs, VoIP phone bridges, cloud print queues, and IT helpdesk.',
    servicesCount: 6,
    servicesLabel: '6 Active',
    status: 'Active',
    associations: ['Professional'],
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    linkedServices: '6 Active',
    revenueGeneration: '$22,400 (MTD)',
    createdAt: '05/14/2026',
  },
];

