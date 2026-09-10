import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { MultiStepTab, BusinessFormData } from './types';
import { BusinessSetupTab } from './BusinessSetupTab';
import { OperatingHoursTab } from './OperatingHoursTab';
import { ImageGalleryTab } from './ImageGalleryTab';
import { AmenitiesTab } from './AmenitiesTab';
import { HolidaysRulesTab } from './HolidaysRulesTab';
import { FeesTaxTab } from './FeesTaxTab';
import { VerificationTab } from './VerificationTab';

interface BusinessMultiStepPageProps {
  initialData?: Partial<BusinessFormData>;
  initialTab?: MultiStepTab;
  isEditMode?: boolean;
  onSave: (data: BusinessFormData) => void;
  onDiscard: () => void;
  onNavigateToPayment?: (bizId: string) => void;
}

const TABS: { id: MultiStepTab; label: string; subtitle: string }[] = [
  {
    id: 'business-setup',
    label: 'Business Setup',
    subtitle: 'Configure your business identity and primary location details.',
  },
  {
    id: 'operating-hours',
    label: 'Operating Hours',
    subtitle: 'Configure your regular operating schedule and time slots.',
  },
  {
    id: 'image-gallery',
    label: 'Image Gallery',
    subtitle: 'Upload and manage your business photos.',
  },
  {
    id: 'amenities',
    label: 'Amenities',
    subtitle: 'List amenities available at your business.',
  },
  {
    id: 'holidays-rules',
    label: 'Holidays & Rules',
    subtitle: 'Select the features and facilities available at your location.',
  },
  {
    id: 'fees-tax',
    label: 'Fees & Tax',
    subtitle: 'Set up service fees and tax rates.',
  },
  {
    id: 'verification',
    label: 'Verification (KYC/KYB)',
    subtitle: 'Complete KYC/KYB compliance verification.',
  },
];

export const DEFAULT_FORM_DATA: BusinessFormData = {
  businessName: '',
  legalEntityName: '',
  category: 'Coworking & Office',
  phone: '',
  description: '',
  streetAddress: '',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  lat: 37.7749,
  lng: -122.4194,

  schedule: [
    {
      day: 'Monday',
      isOpen: true,
      slots: [
        { id: 's1', start: '09:00 AM', end: '06:00 PM' },
        { id: 's2', start: '07:00 PM', end: '10:00 PM' },
      ],
    },
    { day: 'Tuesday', isOpen: false, slots: [] },
    { day: 'Wednesday', isOpen: false, slots: [] },
    { day: 'Thursday', isOpen: false, slots: [] },
    { day: 'Friday', isOpen: false, slots: [] },
    { day: 'Saturday', isOpen: false, slots: [] },
    { day: 'Sunday', isOpen: false, slots: [] },
  ],
  timezone: '(GMT-08:00) Pacific Time (US & Canada)',
  slotInterval: '30 mins',
  bufferTime: '15 mins',

  images: [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      label: 'Main Office Space',
      isCover: true,
    },
  ],

  selectedAmenityIds: ['air-conditioning', 'high-speed-wifi', 'contactless-payments'],
  customAmenities: [],

  holidays: [
    { id: 'h1', name: "New Year's Day", date: '2026-01-01', enabled: true },
    { id: 'h2', name: 'Independence Day', date: '2026-07-04', enabled: true },
    { id: 'h3', name: 'Thanksgiving', date: '2026-11-28', enabled: false },
  ],
  maxCapacity: 150,
  ageRequirement: '21+ after 9:00 PM',
  cancellationPolicy: 'Flexible',
  depositRequired: true,
  depositPercentage: 20,
  byobAllowed: false,
  petFriendly: true,
  petFriendlyPolicy: 'Allowed (Patio Only)',

  taxId: '',
  salesTaxRate: 8.5,
  taxExempt: false,
  currency: 'USD',
  automaticInvoicing: true,
  serviceFees: [
    {
      id: 'f1',
      name: 'Service Processing Fee',
      type: 'Fixed',
      amount: 2.5,
      description: 'Applied per transaction',
    },
    {
      id: 'f2',
      name: 'Cleaning Fee',
      type: 'Fixed',
      amount: 15.0,
      description: 'Applied once per booking',
    },
    {
      id: 'f3',
      name: 'Platform Commission',
      type: 'Percentage',
      amount: 5,
      description: 'Calculated on subtotal',
    },
  ],

  entityType: 'Limited Liability Company (LLC)',
  federalTaxClassification: 'C Corporation',
  tinType: 'EIN',
  tinStatus: 'not_verified',
  ein: '',
  einMatched: false,
  sosDocUploaded: false,
  stateRegistryActive: false,
  uboFullName: 'Alex Vance',
  uboDob: '1988-04-12',
  uboSsn: '4829',
  govIdUploaded: false,
  selfieUploaded: false,
  sanctionsClear: true,
  kycSubmitted: false,
};

export const BusinessMultiStepPage: React.FC<BusinessMultiStepPageProps> = ({
  initialData,
  initialTab = 'business-setup',
  isEditMode = false,
  onSave,
  onDiscard,
  onNavigateToPayment,
}) => {
  const [activeTab, setActiveTab] = useState<MultiStepTab>(initialTab);
  const [formData, setFormData] = useState<BusinessFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });
  const [lastSavedText, setLastSavedText] = useState('Last saved just now');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        images: initialData.images !== undefined ? initialData.images : prev.images,
      }));
    }
  }, [initialData]);

  const updateFormData = (updates: Partial<BusinessFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      if (updates.kycSubmitted) {
        onSave(next);
      }
      return next;
    });
    setLastSavedText('Unsaved changes');
  };

  const currentTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleSave = () => {
    onSave(formData);
    setLastSavedText('Last saved just now');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Header Title matching screenshots
  const displayTitle = isEditMode
    ? `Edit: ${formData.businessName || 'Business'}`
    : currentTabMeta.label;

  return (
    <div id="business-multistep-page" className="space-y-6 pb-28 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isEditMode ? 'Business changes saved successfully!' : 'Business created successfully!'}</span>
        </div>
      )}

      {/* Top Breadcrumbs & Page Header matching Image 1 */}
      <div className="space-y-2">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={onDiscard}
            className="hover:text-slate-900 transition-colors font-medium cursor-pointer"
          >
            Businesses
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">
            {isEditMode ? 'Edit Business' : 'Create New Business'}
          </span>
        </div>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{currentTabMeta.subtitle}</p>
        </div>
      </div>

      {/* Global Alert in Multi-Step Page if KYC was rejected by Super Admin */}
      {formData.status !== 'KYC Approved' &&
        formData.status !== 'Live' &&
        formData.kycStatus !== 'Verified' &&
        (formData.kycStatus === 'Rejected' ||
          formData.status === 'KYC Rejected' ||
          Boolean(formData.rejectionReason)) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-rose-950">
                  KYC Verification Rejected by Super Admin
                </h4>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950 border border-rose-300">
                  Action Required
                </span>
                {(formData.rejectionCount || 0) > 0 && (
                  <span className="text-[10px] font-bold text-rose-800">
                    Attempt #{formData.rejectionCount || 1}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-900 mt-1 leading-snug">
                Super Admin Note: <strong className="italic">"{formData.rejectionReason || 'Please review compliance documents and correct flagged fields.'}"</strong>
              </p>
            </div>
          </div>
          {activeTab !== 'verification' && (
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Edit KYC Tab & Fix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Global Banner in Multi-Step Page if KYC is Approved and Awaiting Payment */}
      {(formData.status === 'KYC Approved' || formData.kycStatus === 'Verified') &&
        formData.status !== 'Live' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950">
                🎉 KYC Verification Approved by Super Admin!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your business is verified. Choose your subscription plan and complete payment to go live.
              </p>
            </div>
          </div>
          {onNavigateToPayment && (formData.id || initialData?.id) && (
            <button
              id="multistep-header-pay-now-btn"
              type="button"
              onClick={() => onNavigateToPayment((formData.id || initialData?.id)!)}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-2 active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pay Now to Activate</span>
            </button>
          )}
        </div>
      )}

      {/* Horizontal Multi-Step Tabs Bar matching Image 1 */}
      <div className="border-b border-slate-200/80 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-6 sm:gap-8 min-w-max" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isTabVerification = tab.id === 'verification';
            const isTabRejected =
              isTabVerification &&
              (formData.kycStatus === 'Rejected' ||
                formData.status === 'KYC Rejected' ||
                Boolean(formData.rejectionReason && formData.kycStatus !== 'Verified'));
            const isTabPending =
              isTabVerification &&
              !isTabRejected &&
              (formData.kycStatus === 'Pending Review' ||
                formData.status === 'Pending KYC Review' ||
                formData.kycSubmitted);
            const isTabVerified =
              isTabVerification &&
              (formData.kycStatus === 'Verified' || formData.status === 'KYC Approved');

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm transition-colors cursor-pointer relative whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'font-bold text-slate-950 border-b-2 border-black'
                    : 'font-medium text-slate-400 hover:text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {isTabRejected && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    Action Req.
                  </span>
                )}
                {isTabPending && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    In Review
                  </span>
                )}
                {isTabVerified && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Display */}
      <div className="pt-1">
        {activeTab === 'business-setup' && (
          <BusinessSetupTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'operating-hours' && (
          <OperatingHoursTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'image-gallery' && (
          <ImageGalleryTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'amenities' && (
          <AmenitiesTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'holidays-rules' && (
          <HolidaysRulesTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'fees-tax' && (
          <FeesTaxTab data={formData} onChange={updateFormData} />
        )}
        {activeTab === 'verification' && (
          <VerificationTab
            data={formData}
            onChange={updateFormData}
            onNavigateToPayment={
              onNavigateToPayment && (formData.id || initialData?.id)
                ? () => onNavigateToPayment((formData.id || initialData?.id)!)
                : undefined
            }
          />
        )}
      </div>

      {/* Sticky Bottom Action Bar matching Image 1 & 2 */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 sm:px-10 py-3.5 shadow-md flex items-center justify-between -mx-6 md:-mx-8 -mb-6 md:-mb-8 mt-8">
        <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
          {showSavedToast ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Changes saved successfully!
            </span>
          ) : (
            <span>{lastSavedText}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            id="multistep-discard-btn"
            type="button"
            onClick={onDiscard}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            id="multistep-save-changes-btn"
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black text-white hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
