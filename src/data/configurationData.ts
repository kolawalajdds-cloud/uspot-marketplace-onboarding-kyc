export interface IconAssetRecord {
  id: string;
  name: string;
  suburb: string; // keywords / synonyms shown in SUBURB column
  iconType: string;
  category?: string;
  addedDate?: string;
}

export interface MasterDataCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  recordCount: number;
  apiEndpoint?: string;
  records?: Array<{ id: string; code: string; label: string; status: 'Active' | 'Inactive'; sortOrder: number }>;
}

export interface OperationalRegion {
  id: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  status: 'Active' | 'Inactive';
  lat: number;
  lng: number;
  timezone: string;
  serviceCount: number;
}

export const INITIAL_ICON_ASSETS: IconAssetRecord[] = [
  {
    id: 'icon-1',
    name: 'Air conditioning',
    suburb: 'AIR CONDITIONING, AC, A/C, COOLING, AIR CONDITIONER, CLIMATE CONTROL',
    iconType: 'AirVent',
    category: 'Amenities',
  },
  {
    id: 'icon-2',
    name: 'Appointment Required',
    suburb: 'APPOINTMENT REQUIRED, APPOINTMENT ONLY, BOOKING REQUIRED, PRIOR APPOINTMENT, SCHEDULED APPOINTMENT',
    iconType: 'CalendarClock',
    category: 'Booking',
  },
  {
    id: 'icon-3',
    name: 'Auditorium',
    suburb: 'AUDITORIUM, ASSEMBLY HALL, THEATER, THEATRE, LECTURE HALL, EVENT HALL',
    iconType: 'Drama',
    category: 'Venues',
  },
  {
    id: 'icon-4',
    name: 'Banquet hall',
    suburb: 'BANQUET HALL, BANQUET VENUE, FUNCTION HALL, RECEPTION HALL, EVENT HALL, PARTY HALL',
    iconType: 'UtensilsCrossed',
    category: 'Venues',
  },
  {
    id: 'icon-5',
    name: 'Bar',
    suburb: 'BAR, PUB, DRINKS, COCKTAIL BAR, LOUNGE BAR, BEVERAGE BAR',
    iconType: 'Wine',
    category: 'Food & Beverage',
  },
  {
    id: 'icon-6',
    name: 'Battery charging full',
    suburb: 'BATTERY CHARGING, BATTERY CHARGER, CHARGING, FULL CHARGE, DEVICE CHARGING, POWER CHARGING',
    iconType: 'BatteryCharging',
    category: 'Tech',
  },
  {
    id: 'icon-7',
    name: 'Beach Access',
    suburb: 'BEACH ACCESS, BEACH, NEAR BEACH, BEACHFRONT, OCEAN ACCESS, SHORE ACCESS',
    iconType: 'Waves',
    category: 'Outdoors',
  },
  {
    id: 'icon-8',
    name: 'Bluetooth',
    suburb: 'BLUETOOTH, WIRELESS CONNECTION, BLUETOOTH CONNECTIVITY, WIRELESS AUDIO, DEVICE PAIRING',
    iconType: 'Bluetooth',
    category: 'Tech',
  },
  {
    id: 'icon-9',
    name: 'Breakfast',
    suburb: 'BREAKFAST, MORNING MEAL, BREAKFAST SERVICE, BREAKFAST MENU, MORNING FOOD',
    iconType: 'Coffee',
    category: 'Food & Beverage',
  },
  {
    id: 'icon-10',
    name: 'Business',
    suburb: 'BUSINESS, COMPANY, ENTERPRISE, COMMERCIAL, OFFICE',
    iconType: 'Briefcase',
    category: 'General',
  },
  {
    id: 'icon-11',
    name: 'High-Speed Wi-Fi',
    suburb: 'WIFI, INTERNET, HIGH SPEED BROADBAND, WIRELESS, FIBER OPTIC',
    iconType: 'Wifi',
    category: 'Tech',
  },
  {
    id: 'icon-12',
    name: 'Valet Parking',
    suburb: 'PARKING, VALET, GARAGE, VEHICLE STORAGE, ON SITE PARKING',
    iconType: 'Car',
    category: 'Transport',
  },
  {
    id: 'icon-13',
    name: 'Spa & Wellness',
    suburb: 'SPA, MASSAGE, SAUNA, WELLNESS, HYDROTHERAPY, STEAM ROOM',
    iconType: 'Sparkles',
    category: 'Wellness',
  },
  {
    id: 'icon-14',
    name: '24/7 Security',
    suburb: 'SECURITY, GUARD, CCTV, SURVEILLANCE, SAFE, SECURED ACCESS',
    iconType: 'ShieldCheck',
    category: 'Safety',
  },
];

export const INITIAL_MASTER_CATEGORIES: MasterDataCategory[] = [
  {
    id: 'cat-countries',
    name: 'Countries & Jurisdictions',
    code: 'GEO_COUNTRIES',
    description: 'ISO-3166 operational country codes, currency pairs, and compliance zones.',
    recordCount: 4,
    apiEndpoint: '/api/v1/master/countries',
    records: [
      { id: 'rec-1', code: 'US', label: 'United States', status: 'Active', sortOrder: 1 },
      { id: 'rec-2', code: 'IN', label: 'India', status: 'Active', sortOrder: 2 },
      { id: 'rec-3', code: 'GB', label: 'United Kingdom', status: 'Active', sortOrder: 3 },
      { id: 'rec-4', code: 'CA', label: 'Canada', status: 'Active', sortOrder: 4 },
    ],
  },
  {
    id: 'cat-tax-codes',
    name: 'Tax & Regulatory Categories',
    code: 'FIN_TAX_CODES',
    description: 'Standard merchant category codes (MCC), GST, VAT, and sales tax classifications.',
    recordCount: 5,
    apiEndpoint: '/api/v1/master/tax-codes',
    records: [
      { id: 'rec-10', code: 'MCC-7230', label: 'Beauty and Barber Shops', status: 'Active', sortOrder: 1 },
      { id: 'rec-11', code: 'MCC-8021', label: 'Dentists and Orthodontists', status: 'Active', sortOrder: 2 },
      { id: 'rec-12', code: 'MCC-7298', label: 'Health and Beauty Spas', status: 'Active', sortOrder: 3 },
      { id: 'rec-13', code: 'MCC-7991', label: 'Physical Fitness Facilities', status: 'Active', sortOrder: 4 },
      { id: 'rec-14', code: 'MCC-0742', label: 'Veterinary Services', status: 'Active', sortOrder: 5 },
    ],
  },
  {
    id: 'cat-id-types',
    name: 'Identity Document Types',
    code: 'KYC_DOC_TYPES',
    description: 'Permitted government identity documents for KYC / AML onboarding checks.',
    recordCount: 3,
    apiEndpoint: '/api/v1/master/doc-types',
    records: [
      { id: 'rec-20', code: 'PASSPORT', label: 'International Passport', status: 'Active', sortOrder: 1 },
      { id: 'rec-21', code: 'DRIVERS_LIC', label: "Driver's License / State ID", status: 'Active', sortOrder: 2 },
      { id: 'rec-22', code: 'NAT_ID', label: 'National Identity Card (Aadhaar / SSN)', status: 'Active', sortOrder: 3 },
    ],
  },
];

export const INITIAL_GEOGRAPHY_REGIONS: OperationalRegion[] = [
  {
    id: 'geo-1',
    country: 'United States',
    countryCode: 'US',
    state: 'California',
    city: 'San Francisco',
    status: 'Active',
    lat: 37.7749,
    lng: -122.4194,
    timezone: 'America/Los_Angeles (PST)',
    serviceCount: 48,
  },
  {
    id: 'geo-2',
    country: 'United States',
    countryCode: 'US',
    state: 'Texas',
    city: 'Dallas',
    status: 'Active',
    lat: 32.7767,
    lng: -96.797,
    timezone: 'America/Chicago (CST)',
    serviceCount: 29,
  },
  {
    id: 'geo-3',
    country: 'United States',
    countryCode: 'US',
    state: 'New York',
    city: 'New York',
    status: 'Active',
    lat: 40.7128,
    lng: -74.006,
    timezone: 'America/New_York (EST)',
    serviceCount: 74,
  },
  {
    id: 'geo-4',
    country: 'India',
    countryCode: 'IN',
    state: 'Maharashtra',
    city: 'Mumbai',
    status: 'Active',
    lat: 19.076,
    lng: 72.8777,
    timezone: 'Asia/Kolkata (IST)',
    serviceCount: 56,
  },
];
