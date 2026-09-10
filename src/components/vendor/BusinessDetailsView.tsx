import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  X,
  Share2,
} from 'lucide-react';
import { Business, HolidayClosure } from '../../types';

interface BusinessDetailsViewProps {
  business: Business;
  onBack: () => void;
  onOpenW9: () => void;
  onEdit: () => void;
}

const DEFAULT_HOLIDAY_CLOSURES: HolidayClosure[] = [
  { id: 'hol-1', name: "New Year's Day", date: '2026-01-01', fullDayClosure: true, enabled: false },
  { id: 'hol-2', name: 'Christmas Day', date: '2026-12-25', fullDayClosure: true, enabled: true },
  { id: 'hol-3', name: 'Thanksgiving', date: '2026-11-26', fullDayClosure: true, enabled: false },
];

export const BusinessDetailsView: React.FC<BusinessDetailsViewProps> = ({
  business,
  onBack,
  onOpenW9,
  onEdit,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Gallery items or fallback images
  const galleryImages = (business.imageGallery && business.imageGallery.length > 0 && business.imageGallery.some((img) => Boolean(img.url)))
    ? business.imageGallery.map((img, idx) => ({
        ...img,
        url: img.url || [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
        ][idx % 3],
      }))
    : [
        {
          id: 'gallery-default-1',
          label: business.coreDetails.businessName || 'Business Showcase',
          color: '#f1f5f9',
          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'gallery-default-2',
          label: 'Service Area',
          color: '#e2e8f0',
          url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'gallery-default-3',
          label: 'Lounge & Reception',
          color: '#cbd5e1',
          url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
        },
      ];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Safe fallback values matching screenshot
  const name = business.coreDetails.businessName || 'Untitled Business';
  const legalEntity = business.coreDetails.legalEntityName || 'Consectetur cupiditate sed ea lorem cumque voluptatibus laborum recusandae Voluptatibus voluptatem edipiaci cum enim';
  const category = business.coreDetails.category || 'Day Spa';
  const description = business.coreDetails.description || 'Animi esse ad omnis aut ut ad architecto mollitia hic';
  const streetAddress = business.coreDetails.streetAddress || 'Aut nemo omnis aperiam beatae eligendi cupiditate tempore voluptatibus eos';
  const city = business.coreDetails.city || 'San Francisco';
  const state = business.coreDetails.state || 'CA';
  const zipCode = business.coreDetails.zipCode || '400051';
  const phone = business.phone || '+11563495212';
  const email = business.email || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business'}.com`;
  const taxId = business.feesTax?.businessTaxId || business.verification?.tinRaw || '13212544';

  const holidayClosures = (business.holidaysRules?.holidayClosures && business.holidaysRules.holidayClosures.length > 0)
    ? business.holidaysRules.holidayClosures
    : DEFAULT_HOLIDAY_CLOSURES;

  const currentImg = galleryImages[activeImageIndex] || galleryImages[0];

  return (
    <div id="business-details-view-page" className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-150">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <button
          onClick={onBack}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Businesses
        </button>
        <span>›</span>
        <span className="text-slate-700 font-semibold truncate max-w-md">{name}</span>
      </div>

      {/* 2. Top Header Row with Title & Action Buttons matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            View complete business profile and configuration.
          </p>
        </div>

        {/* Action Buttons: [ < Back ] [ W-9 Form ] [ Edit Business ] */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            id="btn-view-business-back"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back</span>
          </button>

          <button
            type="button"
            id="btn-view-business-w9"
            onClick={onOpenW9}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer hover:border-slate-300"
            title="Complete & Review Form W-9 for this business"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>W-9 Form</span>
            {business.w9?.status === 'verified' || business.w9?.status === 'submitted' ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            ) : business.w9?.status === 'draft' ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200">
                Draft
              </span>
            ) : null}
          </button>

          <button
            type="button"
            id="btn-view-business-edit"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <span>Edit Business</span>
          </button>
        </div>
      </div>

      {/* 3. Image Carousel Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-16/7 sm:aspect-21/9 max-h-[380px] w-full flex items-center justify-center select-none group">
          {/* Image */}
          <img
            src={currentImg.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'}
            alt={currentImg.label || name}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              // Fallback placeholder image
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Left Arrow Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Dot Indicators */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full backdrop-blur-xs">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Business Summary Header Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {name}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Recommended by UrSpot</span>
            </span>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-500">
          {category}
        </p>

        {/* Contact & Location Metadata Grid matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{streetAddress}, {zipCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{email}</span>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>License: #{taxId}</span>
          </div>
        </div>
      </div>

      {/* 5. About the Expert Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          About the Expert
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* 6. Core Details Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          Core Details
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Business Name</span>
            <span className="font-bold text-slate-900 sm:text-right">{name}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Legal Entity</span>
            <span className="font-bold text-slate-900 sm:text-right max-w-md">{legalEntity}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Category</span>
            <span className="font-bold text-slate-900 sm:text-right">{category}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Phone</span>
            <span className="font-bold text-slate-900 sm:text-right font-mono">{phone}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Address</span>
            <span className="font-bold text-slate-900 sm:text-right max-w-md">{streetAddress}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Postal Code</span>
            <span className="font-bold text-slate-900 sm:text-right font-mono">{zipCode}</span>
          </div>
        </div>
      </div>

      {/* 7. Holiday Closures Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          Holiday Closures
        </h3>

        <div className="space-y-2.5 text-xs">
          {holidayClosures.map((h, i) => (
            <div
              key={h.id || i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <span className="font-bold text-slate-800">{h.name}</span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {h.fullDayClosure ? 'Full Day' : 'Partial'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    h.enabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {h.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Business Rules Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Business Rules
          </h3>
        </div>

        {business.holidaysRules?.businessRules?.maxCapacity ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Capacity</span>
              <strong className="text-slate-900">{business.holidaysRules.businessRules.maxCapacity} Guests</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Friendly</span>
              <strong className="text-slate-900">{business.holidaysRules.businessRules.petFriendly ? 'Allowed' : 'No Pets'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Age Policy</span>
              <strong className="text-slate-900">{business.holidaysRules.businessRules.ageRequirement || 'All Ages'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">BYOB</span>
              <strong className="text-slate-900">{business.holidaysRules.businessRules.byobAllowed ? 'Permitted' : 'Not Allowed'}</strong>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No rules configured yet.
          </p>
        )}
      </div>

      {/* 9. Fees & Tax Card matching Image 2 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-800 font-black text-sm">$</span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Fees & Tax
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tax ID</span>
            <span className="font-bold text-slate-900 font-mono">{taxId}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Sales Tax Rate</span>
            <span className="font-bold text-slate-900">{business.feesTax?.salesTaxRate ?? 23}%</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tax Exempt</span>
            <span className="font-bold text-slate-900">{business.feesTax?.taxExempt ? 'Yes' : 'No'}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Currency</span>
            <span className="font-bold text-slate-900 font-mono">{business.feesTax?.currency || 'USD'}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Auto Invoicing</span>
            <span className="font-bold text-slate-900">
              {business.feesTax?.automaticInvoicing !== false ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {/* Service Fees Sub-heading */}
          <div className="pt-4 space-y-2.5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              SERVICE FEES
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Service Processing Fee</span>
                <span className="font-bold text-slate-900">$2.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Cleaning Fee</span>
                <span className="font-bold text-slate-900">$15.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Platform Commission</span>
                <span className="font-bold text-slate-900">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsView;
