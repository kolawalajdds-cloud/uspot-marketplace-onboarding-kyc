export type BusinessStatus =
  | 'Draft'
  | 'Pending Payment'
  | 'Pending KYC Review'
  | 'KYC Approved'
  | 'KYC Rejected'
  | 'Live';

export type CanonicalLegalEntityType =
  | 'Limited Liability Company (LLC)'
  | 'C-Corporation'
  | 'S-Corporation'
  | 'General Partnership'
  | 'Sole Proprietorship'
  | 'Non-Profit Organization (501(c)(3))'
  | 'Other';

export type LegalEntityType =
  | CanonicalLegalEntityType
  | 'LLC'
  | 'Corporation'
  | 'Partnership';

export type FederalTaxClassification =
  | 'Individual / Sole Proprietor'
  | 'C Corporation'
  | 'S Corporation'
  | 'Partnership'
  | 'Limited Liability Company (LLC)'
  | 'Trust / Estate'
  | 'Other';

export type LlcTaxClassification = 'C' | 'S' | 'P' | 'Disregarded Entity';

export type TinType = 'EIN' | 'SSN';

export type TinVerificationStatus =
  | 'idle'
  | 'not_verified'
  | 'verifying'
  | 'match'
  | 'mismatch'
  | 'pending'
  | 'unavailable'
  | 'error';

export type TinMatchStatus = 'Not Started' | 'Matched' | 'Mismatch' | TinVerificationStatus;
export type StateRegistryStatus = 'Not Checked' | 'Active/Good Standing' | 'Not Found';
export type SanctionsStatus = 'Not Started' | 'Clear' | 'Flagged';
export type RiskTier = 'Low' | 'Medium' | 'High';
export type PlanTier = 'Essential' | 'Starter' | 'Pro' | 'Premium' | 'Enterprise' | 'Professional';
export type FeeType = 'Fixed' | 'Percentage';

export type W9Status = 'draft' | 'submitted' | 'verified' | 'rejected';

export interface W9Certifications {
  correctTin: boolean;
  noBackupWithholding: boolean;
  usPerson: boolean;
  fatcaCorrect: boolean;
}

export interface W9Data {
  id?: string;
  businessId: string;
  legalName: string;
  businessNameOrDisregarded?: string;
  federalTaxClassification: string;
  llcTaxClassification?: string;
  otherClassificationDetail?: string;
  exemptPayeeCode?: string;
  fatcaCode?: string;
  accountNumbers?: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  tinType: TinType;
  tinRaw?: string; // 9-digits normalized
  tinMasked: string; // **-*****6789 or ***-**-6789
  tinVerified: boolean;
  tinMatchStatus: TinVerificationStatus;
  reusedEkycTin: boolean;
  certifications: W9Certifications;
  signatureName: string;
  agreedPerjury: boolean;
  status: W9Status;
  signedAt?: string | null;
  signerIp?: string;
  signerUserAgent?: string;
  pdfGeneratedUrl?: string | null;
  updatedAt?: string;
  signatureImage?: string;
}

export interface OperatingDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface GalleryImage {
  id: string;
  label: string;
  color: string;
  isCover: boolean;
  url?: string;
}

export interface AmenityItem {
  id?: string;
  name: string;
  description: string;
  checked: boolean;
}

export interface AmenityCategory {
  category: 'General & Comfort' | 'Tech & Workspace' | 'Accessibility';
  items: AmenityItem[];
}

export interface HolidayClosure {
  id: string;
  name: string;
  date: string;
  fullDayClosure: boolean;
  enabled: boolean;
}

export interface ServiceFee {
  id: string;
  name: string;
  type: FeeType;
  amount: number;
}

export interface BusinessCoreDetails {
  businessName: string;
  legalEntityName: string;
  category: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface HolidaysRules {
  holidayClosures: HolidayClosure[];
  businessRules: {
    maxCapacity: number;
    petFriendly: boolean;
    ageRequirement: string;
    byobAllowed: boolean;
  };
}

export interface FeesTax {
  businessTaxId: string;
  salesTaxRate: number;
  taxExempt: boolean;
  currency: string;
  automaticInvoicing: boolean;
  serviceFees: ServiceFee[];
}

export interface VerificationRejectionLog {
  date: string;
  reason: string;
  rejectedBy?: string;
}

export interface VerificationData {
  status?: 'Draft' | 'Pending Review' | 'Verified' | 'Approved' | 'Rejected' | string;
  legalEntityType: LegalEntityType;
  federalTaxClassification?: FederalTaxClassification | string;
  llcTaxClassification?: LlcTaxClassification | string;
  tinType?: TinType;
  tinRaw?: string;
  tinMasked?: string;
  einVerification: {
    einEntered: string;
    tinType?: TinType;
    tinRaw?: string;
    tinMasked?: string;
    tinVerificationStatus?: TinVerificationStatus;
    tinMatchStatus: TinMatchStatus;
    verifiedAt: string | null;
    cp575DocUploaded?: boolean;
    cp575FileName?: string;
  };
  entityRegistration: {
    documentUploaded: boolean;
    fileName?: string;
    stateRegistryStatus: StateRegistryStatus;
  };
  beneficialOwner: {
    fullName: string;
    dateOfBirth: string;
    ssnLast4: string;
    govIdUploaded: boolean;
    selfieUploaded: boolean;
  };
  sanctionsScreening: {
    status: SanctionsStatus;
  };
  bankAccount: {
    accountHolderName: string;
    routingNumber: string;
    accountNumberMasked: string;
    verificationMethod: 'Instant' | 'Micro-deposit';
    verified: boolean;
    verificationFailed?: boolean;
    voidedCheckUploaded?: boolean;
    voidedCheckFileName?: string;
  };
  riskTier: RiskTier;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  rejectionCount?: number;
  rejectionHistory?: VerificationRejectionLog[];
  resubmittedAt?: string | null;
  kycSubmitted?: boolean;
  signature?: string;
  signatureDate?: string;
}

export interface PaymentData {
  planSelected: PlanTier;
  amount: number;
  paidAt: string | null;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: string;
  businessId?: string;
  actionRequired?: 'go_live' | 'edit_kyc' | 'continue_setup';
}

export interface Business {
  id: string;
  status: BusinessStatus;
  coreDetails: BusinessCoreDetails;
  operatingHours: OperatingDay[];
  imageGallery: GalleryImage[];
  amenities: AmenityCategory[];
  holidaysRules: HolidaysRules;
  feesTax: FeesTax;
  verification: VerificationData;
  payment: PaymentData;
  notifications: NotificationItem[];
  w9?: W9Data;
  // Enhanced sync fields across Super Admin & Business Portal
  subTab?: 'kyc-requests' | 'approved' | 'non-subscription';
  subscription?: string | null;
  phone?: string;
  email?: string;
  website?: string;
  monthlyVolume?: string;
  country?: string;
  date?: string;
  servicesCount?: number;
  workersCount?: number;
  rejectionReason?: string | null;
  rejectionCount?: number;
  rejectionHistory?: VerificationRejectionLog[];
  resubmittedAt?: string | null;
  avatarChar?: string;
  signature?: string;
  signatureDate?: string;
}

export interface DemoAppState {
  businesses: Business[];
  activeBusinessId: string | null;
  activeRole: 'vendor' | 'admin';
  vendorView: 'list' | 'wizard';
  adminView: 'queue' | 'all' | 'detail';
  wizardTab:
    | 'Core Details'
    | 'Operating Hours'
    | 'Image Gallery'
    | 'Amenities'
    | 'Holidays & Rules'
    | 'Fees & Tax'
    | 'Verification';
  globalNotifications: NotificationItem[];
}

export const DEFAULT_WEEK_HOURS: OperatingDay[] = [
  { day: 'Monday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '16:00' },
];

export const INITIAL_AMENITIES: AmenityCategory[] = [
  {
    category: 'General & Comfort',
    items: [
      { name: 'Climate Control (HVAC)', description: 'Independently zoned smart heating and AC', checked: true },
      { name: 'Lounge Seating', description: 'Ergonomic breakout lounge chairs and sofas', checked: true },
      { name: 'Filtered Water & Coffee Bar', description: 'Complimentary cold brew, espresso and filtered water tap', checked: true },
      { name: 'Private Phone Booths', description: 'Soundproof privacy pods for calls', checked: false },
      { name: 'Restroom Facilities', description: 'Clean private gender-neutral restrooms on-site', checked: true },
    ],
  },
  {
    category: 'Tech & Workspace',
    items: [
      { name: 'High-Speed Fiber WiFi (1 Gbps)', description: 'Dedicated redundant business fiber connection', checked: true },
      { name: '4K Display & Video Conf', description: '65" screen with Logitech Rally webcam and microphones', checked: true },
      { name: 'Whiteboards & Markers', description: 'Wall-mounted magnetic glass writing boards', checked: true },
      { name: 'Keycard & Smart Lock Access', description: 'Digital credential mobile unlocking', checked: false },
      { name: 'Dedicated Printing Station', description: 'Wireless color laser printer & paper shredder', checked: false },
    ],
  },
  {
    category: 'Accessibility',
    items: [
      { name: 'Wheelchair Accessible Entrance', description: 'Step-free ramp and automated door opener', checked: true },
      { name: 'Elevator Access', description: 'Modern ADA compliant elevator to all floors', checked: true },
      { name: 'Designated Accessible Parking', description: 'Wide spaces adjacent to main entry doorway', checked: true },
      { name: 'Service Animals Permitted', description: 'Full access for certified service animals', checked: true },
    ],
  },
];

export function computeRiskTier(
  legalType: LegalEntityType,
  sanctionsStatus: SanctionsStatus,
  tinStatus: TinMatchStatus
): RiskTier {
  if (sanctionsStatus === 'Flagged' || tinStatus === 'Mismatch' || tinStatus === 'mismatch') {
    return 'High';
  }
  if (
    legalType === 'Sole Proprietorship' ||
    legalType === 'Partnership' ||
    legalType === 'General Partnership'
  ) {
    return 'Medium';
  }
  return 'Low';
}

export type UserRole = 'super_admin' | 'business' | 'customer' | 'specialist';
export type UserRoleLabel = 'Superadmin' | 'Super Admin' | 'Business' | 'Customer' | 'Specalist' | 'Staff';

export interface UserProfile {
  id: string;
  role: UserRole;
  roleLabel: UserRoleLabel;
  status: 'active' | 'inactive';
  email: string;
  username: string;
  phone: string;
  nickname: string;
  fullName: string;
  referralCode: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  timezone: string;
  memberSince: string;
  avatarInitials: string;
  department?: string;
  primaryServiceCategory?: string;
  yearsOfExperience?: number | string;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type WithdrawalStatus = 'none' | 'pending' | 'processing' | 'completed' | 'rejected';

export type TransactionType =
  | 'BOOKING_PAYMENT'
  | 'BUSINESS_PAYOUT'
  | 'PAYOUT_FAILED'
  | 'PAYOUT_REVERSAL'
  | 'ADMIN_WITHDRAWAL'
  | 'REFUND'
  | 'WITHHOLDING'
  // Backward compatibility with legacy stored types
  | 'booking_payment'
  | 'business_withdrawal'
  | 'admin_withdrawal'
  | 'withdrawal_rejection_refund';

export interface MarketplaceTransaction {
  id: string;
  bookingId: string;
  type: TransactionType;
  customerName: string;
  customerEmail?: string;
  businessId: string;
  businessName: string;
  serviceName: string;
  grossAmount: number;
  commissionRate: number; // e.g. 10.0 (%)
  platformCommission: number; // e.g. 10.00
  w9Submitted: boolean;
  w9WithholdingRate: number; // 24 if not submitted, 0 if submitted
  w9WithholdingAmount: number; // e.g. 24.00 if uncertified, 0 if certified
  businessAmount: number; // e.g. 90.00 or 66.00
  currency: string;
  paymentStatus: PaymentStatus;
  withdrawalStatus: WithdrawalStatus;
  paymentGateway: string; // e.g. 'NMI Gateway'
  maskedBankAccount?: string;
  notes?: string;
  relatedTransactionId?: string; // Reference to original transaction (for reversals and refunds)
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  type: 'business' | 'super_admin';
  businessId?: string;
  businessName: string;
  requestedByUserId: string;
  requestedByUserName: string;
  amount: number;
  maskedBankAccount: string;
  bankAccountHolder: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  rejectionReason?: string;
  transactionId?: string;
}

export interface BusinessBalance {
  availableBalance: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalWithheldTax: number;
  grossEarned?: number;
}

export interface PlatformLedgerState {
  platformCommissionBalance: number;
  platformTaxWithholdingBalance: number;
  totalPlatformBalance: number;
  businessBalances: Record<string, BusinessBalance>;
  superAdminBank: {
    bankName: string;
    accountHolder: string;
    accountMasked: string;
    routingNumber: string;
  };
  transactions: MarketplaceTransaction[];
  withdrawals: WithdrawalRequest[];
  commissionRate: number;
}

