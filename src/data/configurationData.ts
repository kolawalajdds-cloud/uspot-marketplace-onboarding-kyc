export interface IconAssetRecord {
  id: string;
  name: string;
  suburb: string; // keywords / synonyms shown in SUBURB column
  iconType: string;
  category?: string;
  addedDate?: string;
}

export interface MasterDataRecord {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  iconName?: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
}

export interface MasterDataCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  recordCount: number;
  apiEndpoint?: string;
  records: MasterDataRecord[];
}

export interface GeographyCity {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  lat: number;
  lng: number;
  timezone: string;
  serviceCount: number;
}

export interface GeographyState {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  cities: GeographyCity[];
}

export interface GeographyCountry {
  id: string;
  name: string;
  code: string;
  flag: string;
  status: 'Active' | 'Inactive';
  states: GeographyState[];
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
    id: 'cat-amenities',
    name: 'Amenities',
    code: 'AMENITIES',
    description: 'Property features and service amenities available to customers.',
    recordCount: 10,
    apiEndpoint: '/api/v1/master/amenities',
    records: [
      {
        id: '#AIR_CONDITIONING',
        code: 'AIR_CONDITIONING',
        name: 'Air Conditioning',
        iconName: 'AirVent',
        category: 'Climate',
        description: 'Central air conditioning and climate control systems.',
        status: 'Active',
        sortOrder: 1,
      },
      {
        id: '#EV_CHARGING',
        code: 'EV_CHARGING',
        name: 'EV Charging Station',
        iconName: 'BatteryCharging',
        category: 'Transport',
        description: 'Level 2 & DC Fast charging stations for electric vehicles.',
        status: 'Active',
        sortOrder: 2,
      },
      {
        id: '#CONTACTLESS_PAYMENTS',
        code: 'CONTACTLESS_PAYMENTS',
        name: 'Card & Contactless Payments',
        iconName: 'CreditCard',
        category: 'Payment',
        description: 'NFC, Apple Pay, Google Pay, and chip terminal support.',
        status: 'Active',
        sortOrder: 3,
      },
      {
        id: '#ESPRESSO_BAR',
        code: 'ESPRESSO_BAR',
        name: 'Espresso & Coffee Bar',
        iconName: 'Coffee',
        category: 'Food & Beverage',
        description: 'Complimentary barista espresso and specialty roasts.',
        status: 'Active',
        sortOrder: 4,
      },
      {
        id: '#WIFI',
        code: 'WIFI',
        name: 'High-Speed WiFi',
        iconName: 'Wifi',
        category: 'Tech',
        description: 'Gigabit fiber optic wireless internet across all areas.',
        status: 'Active',
        sortOrder: 5,
      },
      {
        id: '#VALET_PARKING',
        code: 'VALET_PARKING',
        name: 'Valet Parking & Garage',
        iconName: 'Car',
        category: 'Transport',
        description: 'Dedicated curbside valet and subterranean secured parking.',
        status: 'Active',
        sortOrder: 6,
      },
      {
        id: '#SWIMMING_POOL',
        code: 'SWIMMING_POOL',
        name: 'Heated Pool & Hydrotherapy',
        iconName: 'Waves',
        category: 'Wellness',
        description: 'Year-round temperature-controlled saltwater lap pool.',
        status: 'Active',
        sortOrder: 7,
      },
      {
        id: '#CONFERENCE_ROOM',
        code: 'CONFERENCE_ROOM',
        name: 'Executive Conference Room',
        iconName: 'Briefcase',
        category: 'Work',
        description: '4K video conferencing and acoustic-insulated meeting suite.',
        status: 'Active',
        sortOrder: 8,
      },
      {
        id: '#FITNESS_CENTER',
        code: 'FITNESS_CENTER',
        name: 'Fitness & Gym Center',
        iconName: 'Sparkles',
        category: 'Wellness',
        description: 'Peloton bikes, free weights, and dedicated stretching zone.',
        status: 'Active',
        sortOrder: 9,
      },
      {
        id: '#PET_FRIENDLY',
        code: 'PET_FRIENDLY',
        name: 'Pet Friendly Venue',
        iconName: 'Drama',
        category: 'General',
        description: 'Accommodating designated areas for domestic pets and service animals.',
        status: 'Active',
        sortOrder: 10,
      },
    ],
  },
  {
    id: 'cat-countries',
    name: 'Countries',
    code: 'GEO_COUNTRIES',
    description: 'ISO-3166 operational country codes and jurisdictions.',
    recordCount: 5,
    apiEndpoint: '/api/v1/master/countries',
    records: [
      { id: '#US', code: 'US', name: 'United States', status: 'Active', sortOrder: 1 },
      { id: '#CA', code: 'CA', name: 'Canada', status: 'Active', sortOrder: 2 },
      { id: '#GB', code: 'GB', name: 'United Kingdom', status: 'Active', sortOrder: 3 },
      { id: '#IN', code: 'IN', name: 'India', status: 'Active', sortOrder: 4 },
      { id: '#AU', code: 'AU', name: 'Australia', status: 'Active', sortOrder: 5 },
    ],
  },
  {
    id: 'cat-currencies',
    name: 'Currencies',
    code: 'CURRENCIES',
    description: 'Global multi-currency billing and payout ISO-4217 specifications.',
    recordCount: 6,
    apiEndpoint: '/api/v1/master/currencies',
    records: [
      { id: '#USD', code: 'USD', name: 'United States Dollar ($)', status: 'Active', sortOrder: 1 },
      { id: '#EUR', code: 'EUR', name: 'Euro (€)', status: 'Active', sortOrder: 2 },
      { id: '#GBP', code: 'GBP', name: 'British Pound Sterling (£)', status: 'Active', sortOrder: 3 },
      { id: '#CAD', code: 'CAD', name: 'Canadian Dollar (C$)', status: 'Active', sortOrder: 4 },
      { id: '#AUD', code: 'AUD', name: 'Australian Dollar (A$)', status: 'Active', sortOrder: 5 },
      { id: '#INR', code: 'INR', name: 'Indian Rupee (₹)', status: 'Active', sortOrder: 6 },
    ],
  },
  {
    id: 'cat-holidays',
    name: 'Holidays',
    code: 'HOLIDAYS',
    description: 'Official corporate, federal, and regional operational holidays.',
    recordCount: 3,
    apiEndpoint: '/api/v1/master/holidays',
    records: [
      { id: '#NEW_YEAR', code: 'NEW_YEAR', name: "New Year's Day (Jan 1)", status: 'Active', sortOrder: 1 },
      { id: '#INDEPENDENCE', code: 'INDEPENDENCE', name: 'Independence Day (Jul 4)', status: 'Active', sortOrder: 2 },
      { id: '#THANKSGIVING', code: 'THANKSGIVING', name: 'Thanksgiving Day (Nov 26)', status: 'Active', sortOrder: 3 },
    ],
  },
  {
    id: 'cat-industry-types',
    name: 'Industry Types',
    code: 'INDUSTRY_TYPES',
    description: 'Standard business vertical categories and MCC mappings.',
    recordCount: 8,
    apiEndpoint: '/api/v1/master/industries',
    records: [
      { id: '#BEAUTY_SALONS', code: 'BEAUTY_SALONS', name: 'Beauty & Hair Salons', status: 'Active', sortOrder: 1 },
      { id: '#COWORKING_OFFICE', code: 'COWORKING_OFFICE', name: 'Coworking & Office Spaces', status: 'Active', sortOrder: 2 },
      { id: '#WELLNESS_SPA', code: 'WELLNESS_SPA', name: 'Wellness, Massage & Spas', status: 'Active', sortOrder: 3 },
      { id: '#CREATIVE_STUDIOS', code: 'CREATIVE_STUDIOS', name: 'Creative & Photography Studios', status: 'Active', sortOrder: 4 },
      { id: '#EVENT_VENUES', code: 'EVENT_VENUES', name: 'Event Halls & Venues', status: 'Active', sortOrder: 5 },
      { id: '#FITNESS_CENTERS', code: 'FITNESS_CENTERS', name: 'Fitness & Athletic Clubs', status: 'Active', sortOrder: 6 },
      { id: '#HOSPITALITY', code: 'HOSPITALITY', name: 'Boutique Hospitality & Lounges', status: 'Active', sortOrder: 7 },
      { id: '#HEALTHCARE', code: 'HEALTHCARE', name: 'Holistic Healthcare & Clinics', status: 'Active', sortOrder: 8 },
    ],
  },
  {
    id: 'cat-social-platforms',
    name: 'Social Platforms',
    code: 'SOCIAL_PLATFORMS',
    description: 'Authorized partner link integrations for social profiles.',
    recordCount: 7,
    apiEndpoint: '/api/v1/master/socials',
    records: [
      { id: '#INSTAGRAM', code: 'INSTAGRAM', name: 'Instagram', status: 'Active', sortOrder: 1 },
      { id: '#FACEBOOK', code: 'FACEBOOK', name: 'Facebook', status: 'Active', sortOrder: 2 },
      { id: '#LINKEDIN', code: 'LINKEDIN', name: 'LinkedIn', status: 'Active', sortOrder: 3 },
      { id: '#TWITTER_X', code: 'TWITTER_X', name: 'X (formerly Twitter)', status: 'Active', sortOrder: 4 },
      { id: '#YOUTUBE', code: 'YOUTUBE', name: 'YouTube', status: 'Active', sortOrder: 5 },
      { id: '#TIKTOK', code: 'TIKTOK', name: 'TikTok', status: 'Active', sortOrder: 6 },
      { id: '#PINTEREST', code: 'PINTEREST', name: 'Pinterest', status: 'Active', sortOrder: 7 },
    ],
  },
];

// Exact hierarchy matching Image 3: 5 Countries · 14 States · 30 Cities
export const INITIAL_GEOGRAPHY_COUNTRIES: GeographyCountry[] = [
  {
    id: 'country-us',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    status: 'Active',
    states: [
      {
        id: 'state-ca',
        name: 'California',
        code: 'CA',
        status: 'Active',
        cities: [
          { id: 'city-sf', name: 'San Francisco', status: 'Active', lat: 37.7749, lng: -122.4194, timezone: 'PST', serviceCount: 48 },
          { id: 'city-la', name: 'Los Angeles', status: 'Active', lat: 34.0522, lng: -118.2437, timezone: 'PST', serviceCount: 62 },
          { id: 'city-sd', name: 'San Diego', status: 'Active', lat: 32.7157, lng: -117.1611, timezone: 'PST', serviceCount: 24 },
          { id: 'city-sj', name: 'San Jose', status: 'Active', lat: 37.3382, lng: -121.8863, timezone: 'PST', serviceCount: 31 },
        ],
      },
      {
        id: 'state-tx',
        name: 'Texas',
        code: 'TX',
        status: 'Active',
        cities: [
          { id: 'city-dallas', name: 'Dallas', status: 'Active', lat: 32.7767, lng: -96.797, timezone: 'CST', serviceCount: 29 },
          { id: 'city-austin', name: 'Austin', status: 'Active', lat: 30.2672, lng: -97.7431, timezone: 'CST', serviceCount: 38 },
          { id: 'city-houston', name: 'Houston', status: 'Active', lat: 29.7604, lng: -95.3698, timezone: 'CST', serviceCount: 45 },
        ],
      },
      {
        id: 'state-ny',
        name: 'New York',
        code: 'NY',
        status: 'Active',
        cities: [
          { id: 'city-nyc', name: 'New York City', status: 'Active', lat: 40.7128, lng: -74.006, timezone: 'EST', serviceCount: 74 },
          { id: 'city-brooklyn', name: 'Brooklyn', status: 'Active', lat: 40.6782, lng: -73.9442, timezone: 'EST', serviceCount: 52 },
          { id: 'city-buffalo', name: 'Buffalo', status: 'Active', lat: 42.8864, lng: -78.8784, timezone: 'EST', serviceCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'country-ca',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    status: 'Active',
    states: [
      {
        id: 'state-on',
        name: 'Ontario',
        code: 'ON',
        status: 'Active',
        cities: [
          { id: 'city-toronto', name: 'Toronto', status: 'Active', lat: 43.6532, lng: -79.3832, timezone: 'EST', serviceCount: 42 },
          { id: 'city-ottawa', name: 'Ottawa', status: 'Active', lat: 45.4215, lng: -75.6972, timezone: 'EST', serviceCount: 21 },
        ],
      },
      {
        id: 'state-qc',
        name: 'Quebec',
        code: 'QC',
        status: 'Active',
        cities: [
          { id: 'city-montreal', name: 'Montreal', status: 'Active', lat: 45.5017, lng: -73.5673, timezone: 'EST', serviceCount: 35 },
          { id: 'city-quebec-city', name: 'Quebec City', status: 'Active', lat: 46.8139, lng: -71.208, timezone: 'EST', serviceCount: 15 },
        ],
      },
      {
        id: 'state-bc',
        name: 'British Columbia',
        code: 'BC',
        status: 'Active',
        cities: [
          { id: 'city-vancouver', name: 'Vancouver', status: 'Active', lat: 49.2827, lng: -123.1207, timezone: 'PST', serviceCount: 39 },
          { id: 'city-victoria', name: 'Victoria', status: 'Active', lat: 48.4284, lng: -123.3656, timezone: 'PST', serviceCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'country-gb',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    status: 'Active',
    states: [
      {
        id: 'state-england',
        name: 'England',
        code: 'ENG',
        status: 'Active',
        cities: [
          { id: 'city-london', name: 'London', status: 'Active', lat: 51.5074, lng: -0.1278, timezone: 'GMT', serviceCount: 88 },
          { id: 'city-manchester', name: 'Manchester', status: 'Active', lat: 53.4808, lng: -2.2426, timezone: 'GMT', serviceCount: 26 },
          { id: 'city-birmingham', name: 'Birmingham', status: 'Active', lat: 52.4862, lng: -1.8904, timezone: 'GMT', serviceCount: 20 },
        ],
      },
      {
        id: 'state-scotland',
        name: 'Scotland',
        code: 'SCT',
        status: 'Active',
        cities: [
          { id: 'city-edinburgh', name: 'Edinburgh', status: 'Active', lat: 55.9533, lng: -3.1883, timezone: 'GMT', serviceCount: 19 },
          { id: 'city-glasgow', name: 'Glasgow', status: 'Active', lat: 55.8642, lng: -4.2518, timezone: 'GMT', serviceCount: 16 },
        ],
      },
    ],
  },
  {
    id: 'country-in',
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    status: 'Active',
    states: [
      {
        id: 'state-mh',
        name: 'Maharashtra',
        code: 'MH',
        status: 'Active',
        cities: [
          { id: 'city-mumbai', name: 'Mumbai', status: 'Active', lat: 19.076, lng: 72.8777, timezone: 'IST', serviceCount: 56 },
          { id: 'city-pune', name: 'Pune', status: 'Active', lat: 18.5204, lng: 73.8567, timezone: 'IST', serviceCount: 28 },
        ],
      },
      {
        id: 'state-ka',
        name: 'Karnataka',
        code: 'KA',
        status: 'Active',
        cities: [
          { id: 'city-bengaluru', name: 'Bengaluru', status: 'Active', lat: 12.9716, lng: 77.5946, timezone: 'IST', serviceCount: 65 },
        ],
      },
      {
        id: 'state-dl',
        name: 'Delhi NCR',
        code: 'DL',
        status: 'Active',
        cities: [
          { id: 'city-delhi', name: 'New Delhi', status: 'Active', lat: 28.6139, lng: 77.209, timezone: 'IST', serviceCount: 48 },
          { id: 'city-gurugram', name: 'Gurugram', status: 'Active', lat: 28.4595, lng: 77.0266, timezone: 'IST', serviceCount: 32 },
        ],
      },
    ],
  },
  {
    id: 'country-au',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    status: 'Active',
    states: [
      {
        id: 'state-nsw',
        name: 'New South Wales',
        code: 'NSW',
        status: 'Active',
        cities: [
          { id: 'city-sydney', name: 'Sydney', status: 'Active', lat: -33.8688, lng: 151.2093, timezone: 'AEST', serviceCount: 51 },
        ],
      },
      {
        id: 'state-vic',
        name: 'Victoria',
        code: 'VIC',
        status: 'Active',
        cities: [
          { id: 'city-melbourne', name: 'Melbourne', status: 'Active', lat: -37.8136, lng: 144.9631, timezone: 'AEST', serviceCount: 44 },
          { id: 'city-geelong', name: 'Geelong', status: 'Active', lat: -38.1499, lng: 144.3617, timezone: 'AEST', serviceCount: 11 },
        ],
      },
      {
        id: 'state-qld',
        name: 'Queensland',
        code: 'QLD',
        status: 'Active',
        cities: [
          { id: 'city-brisbane', name: 'Brisbane', status: 'Active', lat: -27.4698, lng: 153.0251, timezone: 'AEST', serviceCount: 27 },
        ],
      },
    ],
  },
];

// Flat operational regions for map pins and search
export const INITIAL_GEOGRAPHY_REGIONS: OperationalRegion[] = INITIAL_GEOGRAPHY_COUNTRIES.flatMap((country) =>
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

// =========================================================================
// 5. ADMIN CONFIGS & AUDIT (NMI Gateway & System Configurations)
// =========================================================================
export interface AdminConfigRecord {
  id: string;
  group: 'nmi' | 'twilio' | 'stripe' | string;
  key: string;
  valueEncrypted?: string;
  valuePlain?: string;
  valueLast4?: string;
  isSecret: boolean;
  description: string;
  environment: 'production';
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConfigAuditRecord {
  id: string;
  configId: string;
  group: string;
  key: string;
  environment: 'production';
  action: 'CREATE' | 'UPDATE' | 'ROTATE' | 'DELETE' | 'TEST';
  updatedBy: string;
  oldValueLast4?: string;
  newValueLast4?: string;
  oldValueHash?: string;
  newValueHash?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export const INITIAL_NMI_ADMIN_CONFIGS: AdminConfigRecord[] = [
  {
    id: 'cfg-nmi-001',
    group: 'nmi',
    key: 'security_key',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_9f4b:tag_3a21:enc_2F822rw294ED1945nc9b52kvnmx70873',
    valueLast4: '0873',
    description: 'NMI Private API / Transaction Security Key',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-10T16:25:00Z',
  },
  {
    id: 'cfg-nmi-002',
    group: 'nmi',
    key: 'public_key',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_1c7d:tag_8b90:enc_pub_live_9410385bf7291a4c892',
    valueLast4: 'c892',
    description: 'NMI Public Client Key for Collect.js / Tokenization',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-08T11:40:00Z',
  },
  {
    id: 'cfg-nmi-003',
    group: 'nmi',
    key: 'webhook_signing_key',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_6e3a:tag_2f44:enc_whsec_58b2910cf94812a4',
    valueLast4: '12a4',
    description: 'HMAC-SHA256 Webhook signing secret',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-05T09:15:00Z',
  },
  {
    id: 'cfg-nmi-004',
    group: 'nmi',
    key: 'api_url',
    isSecret: false,
    valuePlain: 'https://secure.nmi.com/api/transact.php',
    description: 'NMI Direct Post / Transaction Gateway URL',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T14:30:00Z',
  },
  {
    id: 'cfg-nmi-005',
    group: 'nmi',
    key: 'query_url',
    isSecret: false,
    valuePlain: 'https://secure.nmi.com/api/query.php',
    description: 'NMI Query / Reporting Gateway URL',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T14:30:00Z',
  },
  {
    id: 'cfg-nmi-006',
    group: 'nmi',
    key: 'environment',
    isSecret: false,
    valuePlain: 'production',
    description: 'Gateway mode (production)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-10T16:25:00Z',
  },
];

export const INITIAL_NMI_ADMIN_AUDIT: AdminConfigAuditRecord[] = [
  {
    id: 'aud-001',
    configId: 'cfg-nmi-001',
    group: 'nmi',
    key: 'security_key',
    environment: 'production',
    action: 'ROTATE',
    updatedBy: 'Super Admin',
    oldValueLast4: '9120',
    newValueLast4: '0873',
    oldValueHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    newValueHash: '4f8a7e2b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-10T16:25:00Z',
  },
  {
    id: 'aud-002',
    configId: 'cfg-nmi-001',
    group: 'nmi',
    key: 'security_key',
    environment: 'production',
    action: 'TEST',
    updatedBy: 'Super Admin',
    oldValueLast4: '0873',
    newValueLast4: '0873',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-11T08:14:00Z',
  },
  {
    id: 'aud-003',
    configId: 'cfg-nmi-002',
    group: 'nmi',
    key: 'public_key',
    environment: 'production',
    action: 'UPDATE',
    updatedBy: 'Super Admin',
    oldValueLast4: 'b114',
    newValueLast4: 'c892',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-08T11:40:00Z',
  },
  {
    id: 'aud-004',
    configId: 'cfg-nmi-004',
    group: 'nmi',
    key: 'api_url',
    environment: 'production',
    action: 'UPDATE',
    updatedBy: 'Super Admin',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-01T14:30:00Z',
  },
  {
    id: 'aud-005',
    configId: 'cfg-nmi-003',
    group: 'nmi',
    key: 'webhook_signing_key',
    environment: 'production',
    action: 'CREATE',
    updatedBy: 'Super Admin',
    newValueLast4: '12a4',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'aud-006',
    configId: 'cfg-twilio-002',
    group: 'twilio',
    key: 'auth_token',
    environment: 'production',
    action: 'ROTATE',
    updatedBy: 'Super Admin',
    oldValueLast4: '4190',
    newValueLast4: '0831',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-09T14:10:00Z',
  },
  {
    id: 'aud-007',
    configId: 'cfg-firebase-003',
    group: 'firebase',
    key: 'private_key',
    environment: 'production',
    action: 'TEST',
    updatedBy: 'Super Admin',
    oldValueLast4: '8192',
    newValueLast4: '8192',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    createdAt: '2026-09-10T12:00:00Z',
  },
];

export const INITIAL_TWILIO_ADMIN_CONFIGS: AdminConfigRecord[] = [
  {
    id: 'cfg-twilio-001',
    group: 'twilio',
    key: 'account_sid',
    isSecret: false,
    valuePlain: 'AC_LIVE_TWILIO_ACCOUNT_SID_PROD',
    description: 'Twilio Account SID from Twilio Console',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-08T15:20:00Z',
  },
  {
    id: 'cfg-twilio-002',
    group: 'twilio',
    key: 'auth_token',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_7d2e:tag_1a9f:enc_89104fa28cd71b29a4e829cb81920831',
    valueLast4: '0831',
    description: 'Twilio Primary Auth Token (AES-256-GCM Encrypted)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-09T14:10:00Z',
  },
  {
    id: 'cfg-twilio-003',
    group: 'twilio',
    key: 'sender_phone',
    isSecret: false,
    valuePlain: '+18559281042',
    description: 'Outbound Caller/SMS Phone Number (E.164 format)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-08T15:20:00Z',
  },
  {
    id: 'cfg-twilio-004',
    group: 'twilio',
    key: 'sms_log_only',
    isSecret: false,
    valuePlain: 'false',
    description: 'Carrier Dispatch Mode (live carrier SMS delivery)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
];

export const INITIAL_FIREBASE_ADMIN_CONFIGS: AdminConfigRecord[] = [
  {
    id: 'cfg-firebase-001',
    group: 'firebase',
    key: 'project_id',
    isSecret: false,
    valuePlain: 'urspot-marketplace-prod',
    description: 'Google Cloud / Firebase Project ID',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'cfg-firebase-002',
    group: 'firebase',
    key: 'client_email',
    isSecret: false,
    valuePlain: 'firebase-adminsdk-m8192@urspot-marketplace-prod.iam.gserviceaccount.com',
    description: 'Firebase Service Account Client Email',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'cfg-firebase-003',
    group: 'firebase',
    key: 'private_key',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_3f1b:tag_8c22:enc_MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC78192',
    valueLast4: '8192',
    description: 'Firebase Service Account RSA Private Key (AES-256-GCM Encrypted)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
  },
];

export const INITIAL_MIDDESK_ADMIN_CONFIGS: AdminConfigRecord[] = [
  {
    id: 'cfg-middesk-001',
    group: 'middesk',
    key: 'api_key',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_8e1c:tag_3b91:enc_mddsk_sec_78a9c2014fb029419142',
    valueLast4: '9142',
    description: 'Middesk Business Verification Secret API Key (AES-256-GCM Encrypted)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'cfg-middesk-002',
    group: 'middesk',
    key: 'base_url',
    isSecret: false,
    valuePlain: 'https://api.middesk.com/v1',
    description: 'Middesk API Base URL',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-08T15:20:00Z',
  },
  {
    id: 'cfg-middesk-003',
    group: 'middesk',
    key: 'webhook_secret',
    isSecret: true,
    valueEncrypted: 'aes256gcm:iv_5a2d:tag_9f44:enc_whsec_mdsk_9281a04b12c85821',
    valueLast4: '5821',
    description: 'Middesk Webhook HMAC-SHA256 Signature Verification Secret (AES-256-GCM Encrypted)',
    environment: 'production',
    updatedBy: 'usr-admin-super',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-09T14:10:00Z',
  },
];
