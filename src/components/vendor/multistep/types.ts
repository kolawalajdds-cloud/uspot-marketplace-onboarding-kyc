export type MultiStepTab =
  | 'business-setup'
  | 'operating-hours'
  | 'image-gallery'
  | 'amenities'
  | 'holidays-rules'
  | 'fees-tax'
  | 'verification';

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface CustomAmenity {
  id: string;
  name: string;
  description: string;
  category: string;
  checked: boolean;
}

export interface CustomFee {
  id: string;
  name: string;
  type: 'Fixed' | 'Percentage';
  amount: number;
  description?: string;
}

export interface BusinessFormData {
  id?: string;
  // Step 1: Info & Location
  businessName: string;
  legalEntityName: string;
  category: string;
  phone: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;

  // Step 2: Operating Hours
  schedule: DaySchedule[];
  timezone: string;
  slotInterval: string;
  bufferTime: string;

  // Step 3: Gallery
  images: { id: string; url: string; label: string; isCover: boolean }[];

  // Step 4: Amenities
  selectedAmenityIds: string[];
  customAmenities: CustomAmenity[];

  // Step 5: Holidays & Rules
  holidays: { id: string; name: string; date: string; enabled: boolean }[];
  maxCapacity: number;
  ageRequirement: string;
  cancellationPolicy: string;
  depositRequired: boolean;
  depositPercentage: number;
  byobAllowed: boolean;
  petFriendly: boolean;

  // Step 6: Fees & Tax
  taxId: string;
  salesTaxRate: number;
  taxExempt: boolean;
  currency: string;
  automaticInvoicing: boolean;
  serviceFees: CustomFee[];

  // Step 7: Verification
  entityType: string;
  federalTaxClassification?: string;
  llcTaxClassification?: string;
  tinType?: 'EIN' | 'SSN';
  tinRaw?: string;
  tinMasked?: string;
  tinStatus?: 'not_verified' | 'verifying' | 'match' | 'mismatch' | 'pending' | 'unavailable' | 'error';
  ein: string;
  einMatched: boolean;
  sosDocUploaded: boolean;
  sosDocName?: string;
  stateRegistryActive: boolean;
  uboFullName: string;
  uboDob: string;
  uboSsn: string;
  govIdUploaded: boolean;
  govIdName?: string;
  selfieUploaded: boolean;
  sanctionsClear: boolean;
  kycSubmitted: boolean;
  kycStatus?: 'Draft' | 'Pending Review' | 'Verified' | 'Rejected';
  status?: string;
  subTab?: string;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  rejectionCount?: number;
  rejectionHistory?: Array<{ date: string; reason: string; rejectedBy?: string }>;
  resubmittedAt?: string | null;
}
