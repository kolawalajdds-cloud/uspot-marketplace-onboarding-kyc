export interface ManagedBusinessRecord {
  id: string;
  name: string;
  legalEntity: string;
  category: string;
  status:
    | 'Active'
    | 'Inactive'
    | 'Setup Pending'
    | 'Pending Review'
    | 'Pending KYC Review'
    | 'KYC Approved'
    | 'KYC Rejected';
  subscription: string | null;
  location: string;
  city: string;
  state: string;
  country: string;
  date: string;
  subTab: 'kyc-requests' | 'approved' | 'non-subscription';
  // Additional review data
  description?: string;
  ein?: string;
  tinType?: 'EIN' | 'SSN';
  tinMasked?: string;
  federalTaxClassification?: string;
  llcTaxClassification?: string;
  tinMatchStatus?: string;
  tinVerificationStatus?: 'not_verified' | 'verifying' | 'match' | 'mismatch' | 'pending' | 'unavailable' | 'error';
  sanctionsStatus?: 'Clear' | 'Flagged' | 'Not Started';
  riskLevel?: 'Low' | 'Medium' | 'High';
  stateRegistryStatus?: string;
  stateRegistryFile?: string;
  beneficialOwner?: {
    fullName: string;
    dob: string;
    ssnLast4: string;
    verified: boolean;
  };
  bankAccount?: {
    accountHolder: string;
    routingNumber: string;
    accountMasked: string;
    verified: boolean;
  };
  phone?: string;
  email?: string;
  website?: string;
  monthlyVolume?: string;
  // Rejection & Resubmission Tracking
  rejectionReason?: string | null;
  rejectionCount?: number;
  rejectionHistory?: Array<{
    date: string;
    reason: string;
    rejectedBy?: string;
  }>;
  resubmittedAt?: string | null;
  servicesCount?: number;
  workersCount?: number;
  address?: string;
  entityType?: string;
  hasW9?: boolean;
}

export const INITIAL_MANAGED_BUSINESSES: ManagedBusinessRecord[] = [
  // 1. APPROVED BUSINESSES (from Image 2)
  {
    id: 'biz-app-1',
    name: 'Dolorem tempor numqu (Updated Name)',
    legalEntity: 'Fuga Cupidatat non',
    category: 'DENTISTRY',
    status: 'Active',
    subscription: 'Professional',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    date: 'Sep 2, 2026',
    subTab: 'approved',
    description: 'Comprehensive restorative dentistry, orthodontic aligners, and periodontal therapies.',
    ein: '27-8910243',
    tinMatchStatus: 'Matched',
    stateRegistryFile: 'Articles_of_Incorporation_Fuga.pdf',
    beneficialOwner: {
      fullName: 'Aarav Mehta',
      dob: '1984-04-12',
      ssnLast4: '3819',
      verified: true,
    },
    bankAccount: {
      accountHolder: 'Fuga Cupidatat Non LLC',
      routingNumber: '021000021',
      accountMasked: '•••• •••• 9104',
      verified: true,
    },
    phone: '+91 22 4920 1823',
    email: 'contact@fuga-dentistry.in',
    monthlyVolume: '$38,400',
  },
  {
    id: 'biz-app-2',
    name: 'Ut exercitationem do',
    legalEntity: 'Minima facere simili',
    category: 'DENTISTRY',
    status: 'Active',
    subscription: 'Professional',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    date: 'Sep 1, 2026',
    subTab: 'approved',
    description: 'State-of-the-art dental diagnostics, cosmetic porcelain veneers, and laser dentistry.',
    ein: '45-6712903',
    tinMatchStatus: 'Matched',
    stateRegistryFile: 'Maharashtra_ROC_Certificate.pdf',
    beneficialOwner: {
      fullName: 'Priya Sharma',
      dob: '1989-11-25',
      ssnLast4: '5420',
      verified: true,
    },
    bankAccount: {
      accountHolder: 'Minima Facere Simili Co',
      routingNumber: '026009593',
      accountMasked: '•••• •••• 4412',
      verified: true,
    },
    phone: '+91 22 5819 0392',
    email: 'ops@minima-dental.com',
    monthlyVolume: '$29,750',
  },
  {
    id: 'biz-app-3',
    name: 'Grooming Lounge Barber',
    legalEntity: 'Grooming Lounge Barber LLC',
    category: 'BARBER SHOP',
    status: 'Inactive',
    subscription: 'Professional',
    location: 'Dallas, Texas',
    city: 'Dallas',
    state: 'Texas',
    country: 'United States',
    date: 'Sep 1, 2026',
    subTab: 'approved',
    description: 'Executive men grooming, hot towel straight-razor shaves, and custom fades.',
    ein: '75-3918204',
    tinMatchStatus: 'Matched',
    stateRegistryFile: 'Texas_Certificate_Formation.pdf',
    beneficialOwner: {
      fullName: 'Jackson Miller',
      dob: '1986-07-19',
      ssnLast4: '8821',
      verified: true,
    },
    bankAccount: {
      accountHolder: 'Grooming Lounge Barber LLC',
      routingNumber: '111000025',
      accountMasked: '•••• •••• 6192',
      verified: true,
    },
    phone: '+1 (214) 555-0194',
    email: 'hello@groominglounge-tx.com',
    monthlyVolume: '$18,200',
  },

  // 2. NON-SUBSCRIPTION BUSINESSES (from Image 3)
  {
    id: 'biz-nonsub-1',
    name: 'Gg',
    legalEntity: 'Guii',
    category: 'BARBER SHOP',
    status: 'Setup Pending',
    subscription: null,
    location: 'San Francisco, California',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    date: 'Sep 7, 2026',
    subTab: 'non-subscription',
    description: 'Boutique hair styling and barber collective awaiting payment authorization.',
    ein: '94-1829301',
    tinMatchStatus: 'Pending',
    stateRegistryFile: 'CA_SecState_Guii.pdf',
    beneficialOwner: {
      fullName: 'George Vance',
      dob: '1992-02-14',
      ssnLast4: '1092',
      verified: false,
    },
    bankAccount: {
      accountHolder: 'Guii Enterprise',
      routingNumber: '121000358',
      accountMasked: '•••• •••• 8201',
      verified: false,
    },
    phone: '+1 (415) 555-0182',
    email: 'info@ggbarbers.io',
    monthlyVolume: '$0 (Unpaid)',
  },
  {
    id: 'biz-nonsub-2',
    name: 'Goods',
    legalEntity: 'Test',
    category: 'VETERINARY CLINIC',
    status: 'Setup Pending',
    subscription: null,
    location: 'San Francisco, California',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    date: 'Sep 4, 2026',
    subTab: 'non-subscription',
    description: 'Pet wellness examinations, surgical suites, and preventative veterinary diagnostics.',
    ein: '68-9102938',
    tinMatchStatus: 'Pending',
    stateRegistryFile: 'Test_Vet_Articles.pdf',
    beneficialOwner: {
      fullName: 'Elena Fisher',
      dob: '1987-09-08',
      ssnLast4: '7731',
      verified: false,
    },
    bankAccount: {
      accountHolder: 'Test Goods Animal Care',
      routingNumber: '121000358',
      accountMasked: '•••• •••• 3910',
      verified: false,
    },
    phone: '+1 (415) 555-0199',
    email: 'admin@goodsvetcare.org',
    monthlyVolume: '$0 (Unpaid)',
  },
  {
    id: 'biz-nonsub-3',
    name: 'The',
    legalEntity: 'The',
    category: 'FITNESS',
    status: 'Setup Pending',
    subscription: null,
    location: 'San Francisco, California',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    date: 'Sep 3, 2026',
    subTab: 'non-subscription',
    description: 'High-intensity interval studio and strength training biomechanics facility.',
    ein: '94-5519283',
    tinMatchStatus: 'Pending',
    stateRegistryFile: 'The_LLC_Registration.pdf',
    beneficialOwner: {
      fullName: 'Theodore Wright',
      dob: '1990-05-18',
      ssnLast4: '4190',
      verified: false,
    },
    bankAccount: {
      accountHolder: 'The Fitness Labs',
      routingNumber: '121000358',
      accountMasked: '•••• •••• 5518',
      verified: false,
    },
    phone: '+1 (415) 555-0144',
    email: 'join@thefitnesshub.com',
    monthlyVolume: '$0 (Unpaid)',
  },
  {
    id: 'biz-nonsub-4',
    name: "Nemish's Barber Shop",
    legalEntity: 'Nemish Co LLP',
    category: 'BARBER SHOP',
    status: 'Setup Pending',
    subscription: null,
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    date: 'Sep 3, 2026',
    subTab: 'non-subscription',
    description: 'Traditional artisanal barber cuts, beard sculpts, and bespoke grooming rituals.',
    ein: '27-7719280',
    tinMatchStatus: 'Pending',
    stateRegistryFile: 'Nemish_LLP_Agreement.pdf',
    beneficialOwner: {
      fullName: 'Nemish Patel',
      dob: '1985-08-30',
      ssnLast4: '9920',
      verified: false,
    },
    bankAccount: {
      accountHolder: 'Nemish Co LLP',
      routingNumber: '026009593',
      accountMasked: '•••• •••• 1029',
      verified: false,
    },
    phone: '+91 22 6620 4819',
    email: 'support@nemishbarbers.in',
    monthlyVolume: '$0 (Unpaid)',
  },

  // 3. KYC REQUESTS (Pending Review items for Super Admin to review immediately)
  {
    id: 'biz-kyc-1',
    name: 'Apex Creative Studios & Soundstage',
    legalEntity: 'Apex Media Group Inc.',
    category: 'STUDIO & PRODUCTION',
    status: 'Pending KYC Review',
    subscription: 'Professional',
    location: 'Austin, Texas',
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
    date: 'Sep 9, 2026',
    subTab: 'kyc-requests',
    description: 'Over 4,500 sq ft acoustically treated production stage, cyclorama wall, and sound booths.',
    ein: '74-9182310',
    tinMatchStatus: 'Matched',
    stateRegistryFile: 'Texas_SecState_Certificate_ApexMediaGroup.pdf',
    beneficialOwner: {
      fullName: 'Marcus Aurelius Sterling',
      dob: '1982-11-03',
      ssnLast4: '7194',
      verified: true,
    },
    bankAccount: {
      accountHolder: 'Apex Media Group Inc.',
      routingNumber: '111000025',
      accountMasked: '•••• •••• 5519',
      verified: true,
    },
    phone: '+1 (512) 555-0192',
    email: 'marcus@apexstudios.io',
    website: 'https://apexstudios.io',
    monthlyVolume: '$42,500',
    rejectionCount: 0,
    rejectionHistory: [],
    entityType: 'Corporation',
  },
  {
    id: 'biz-kyc-2',
    name: 'Solaria Innovation Foundry',
    legalEntity: 'Solaria Ventures Group LLC',
    category: 'MAKERSPACE & PROTOTYPING',
    status: 'Pending KYC Review',
    subscription: 'Enterprise',
    location: 'Denver, Colorado',
    city: 'Denver',
    state: 'Colorado',
    country: 'United States',
    date: 'Sep 9, 2026',
    subTab: 'kyc-requests',
    description: 'Industrial makerspace equipped with 5-axis CNC mills, cleanroom assembly, and rapid laser bays.',
    ein: '84-1928374',
    tinMatchStatus: 'Matched',
    stateRegistryFile: 'Colorado_SOS_GoodStanding_Updated_2026.pdf',
    beneficialOwner: {
      fullName: 'Elena Rostova-Davis',
      dob: '1987-05-14',
      ssnLast4: '3819',
      verified: true,
    },
    bankAccount: {
      accountHolder: 'Solaria Ventures Group LLC',
      routingNumber: '102000076',
      accountMasked: '•••• •••• 7712',
      verified: true,
    },
    phone: '+1 (303) 555-0149',
    email: 'compliance@solariafoundry.com',
    website: 'https://solariafoundry.com',
    monthlyVolume: '$58,000',
    rejectionCount: 1,
    rejectionHistory: [
      {
        date: 'Sep 8, 2026 at 03:15 PM',
        reason: 'State business registration filing was expired and Articles of Organization document was unreadable. Please upload updated Good Standing Certificate with CO Secretary of State.',
        rejectedBy: 'Super Admin',
      },
    ],
    resubmittedAt: 'Sep 9, 2026 at 09:30 AM',
    entityType: 'Limited Liability Company (LLC)',
  },
];
