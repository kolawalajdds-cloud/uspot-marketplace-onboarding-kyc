import React, { useState, useMemo } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Wifi,
  Coffee,
  Wind,
  Car,
  ShieldCheck,
  AlertCircle,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Check,
  Award,
  X,
  Sparkles,
  Scissors,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Business, BusinessService } from '../../types';
import { getPresetServicesForBusiness } from '../../data/seedData';

interface CustomerSpotDetailViewProps {
  businessId: string;
  onBack: () => void;
  onBookService: (serviceId?: string) => void;
}

export const CustomerSpotDetailView: React.FC<CustomerSpotDetailViewProps> = ({
  businessId,
  onBack,
  onBookService,
}) => {
  const { state } = useDemo();

  // Find business from given state data (defaulting to biz-001 if not found)
  const business: Business = useMemo(() => {
    return state.businesses.find((b) => b.id === businessId) || state.businesses[0];
  }, [state.businesses, businessId]);

  // Image carousel state
  const images = useMemo(() => {
    if (business.imageGallery && business.imageGallery.length > 0) {
      return business.imageGallery.map((img) => img.url);
    }
    return [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    ];
  }, [business]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Customer Service Details Modal State
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<BusinessService | null>(null);
  const [serviceModalImageIndex, setServiceModalImageIndex] = useState<number>(0);

  // Group services by category with robust preset fallback
  const servicesByCategory = useMemo(() => {
    let services = state.businessServices.filter((s) => s.business_id === business.id && s.status === 'active');
    if (services.length === 0 && business.business_services && business.business_services.length > 0) {
      services = business.business_services.filter((s) => s.status === 'active');
    }
    if (services.length === 0) {
      services = getPresetServicesForBusiness(business.id, business.coreDetails?.category);
    }
    const groups: Record<string, BusinessService[]> = {};

    services.forEach((s) => {
      const cat = s.category_name || (s as any).category || 'General Services';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    return groups;
  }, [state.businessServices, business.id, business.business_services, business.coreDetails?.category]);

  // Dynamic working hours from given data
  const currentDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* Back button link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Spots</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        {/* Top Hero Image Carousel matching Image 2 */}
        <div className="relative w-full h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 group shadow-sm">
          <img
            src={images[activeImageIndex]}
            alt={business.coreDetails.businessName}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Left / Right Arrow Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Main 2-Column Layout matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header / Title / Badges / Actions */}
            <div className="border-b border-slate-100 pb-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {business.coreDetails.businessName}
                    </h1>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wide">
                      <Check className="w-3 h-3 text-slate-900" />
                      Recommended by UrSpot
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-black text-black" />
                      <span>{business.id === 'biz-001' ? '4.9' : '4.8'}</span>
                      <span className="text-slate-400 font-normal">(120 reviews)</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">
                      {business.coreDetails.category || 'Luxury Grooming'}
                    </span>
                  </div>
                </div>

                {/* Follow & Heart Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                      isFollowing
                        ? 'bg-slate-100 text-slate-900 border border-slate-300'
                        : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>

              {/* Address, Phone, Email, License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {business.coreDetails.streetAddress}, {business.coreDetails.city} {business.coreDetails.zipCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{business.phone || '+1 (212) 555-0198'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{business.email || 'contact@thegroomer.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>License: #{business.feesTax.businessTaxId || 'LIC-889271'}</span>
                </div>
              </div>
            </div>

            {/* About the Expert matching Image 2 */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">About the Expert</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {business.coreDetails.description ||
                  `At ${business.coreDetails.businessName}, we redefine modern service excellence by blending traditional mastery with contemporary aesthetics. Our team of world-class specialists is dedicated to precision, whether you're seeking a tailored signature cut, restorative bodywork, or a meticulously crafted wellness experience. We provide a sanctuary for the discerning client, where every booking is an artisanal journey in luxury.`}
              </p>
            </div>

            {/* Available Services matching Image 2 */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Services</h2>

              <div className="space-y-6">
                {(Object.entries(servicesByCategory) as [string, BusinessService[]][]).map(([categoryName, services]) => (
                  <div key={categoryName} className="space-y-3">
                    <div className="bg-slate-100/80 px-4 py-2 rounded-lg">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {categoryName}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {services.map((service: BusinessService) => {
                        const thumbnail = service.thumbnail_url || service.photo_url;
                        const galleryCount = service.gallery_photos?.length || 0;
                        const totalMediaCount = (thumbnail ? 1 : 0) + galleryCount;

                        return (
                          <div
                            key={service.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/60 p-2 sm:p-3 rounded-2xl transition-colors"
                          >
                            <div className="flex items-start gap-3.5 max-w-xl">
                              {/* Service Thumbnail (Clickable to open details) */}
                              <div
                                onClick={() => {
                                  setSelectedServiceForDetails(service);
                                  setServiceModalImageIndex(0);
                                }}
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group-hover:shadow-xs transition"
                                title="Click to view service gallery & details"
                              >
                                {thumbnail ? (
                                  <img
                                    src={thumbnail}
                                    alt={service.name}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Scissors className="w-6 h-6" />
                                  </div>
                                )}
                                {galleryCount > 0 && (
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold backdrop-blur-xs flex items-center gap-0.5">
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    <span>+{galleryCount}</span>
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3
                                    onClick={() => {
                                      setSelectedServiceForDetails(service);
                                      setServiceModalImageIndex(0);
                                    }}
                                    className="text-sm font-bold text-slate-900 leading-snug hover:text-indigo-600 transition cursor-pointer"
                                  >
                                    {service.name}
                                  </h3>
                                  {service.pricing_type === 'time_based' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      Hourly
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                  {service.description ||
                                    'Precision craftsmanship, premium organic styling elements, and complete service consultation.'}
                                </p>
                                <div className="flex items-center gap-3 pt-0.5">
                                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {service.duration_minutes} min
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedServiceForDetails(service);
                                      setServiceModalImageIndex(0);
                                    }}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    View Details & Photos {totalMediaCount > 0 ? `(${totalMediaCount})` : ''}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="text-right">
                                <span className="text-base font-bold text-slate-900 block">
                                  ${(service.base_price || 0).toFixed(2)}
                                </span>
                                {service.pricing_type === 'time_based' && (
                                  <span className="text-[10px] text-slate-400 block">per hour</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceForDetails(service);
                                  setServiceModalImageIndex(0);
                                }}
                                className="px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer whitespace-nowrap"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => onBookService(service.id)}
                                className="px-5 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map Container matching Image 2 */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Location</h2>
              <div className="h-48 w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 relative overflow-hidden select-none">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                <MapPin className="w-8 h-8 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">
                  Map of {business.coreDetails.city}
                </span>
                <span className="text-[11px] text-slate-400">
                  {business.coreDetails.streetAddress}
                </span>
              </div>
            </div>

            {/* Reviews Section matching Image 2 */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Reviews</h2>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-slate-200 hover:border-black text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'Marcus Sterling',
                    time: '3 days ago',
                    stars: 5,
                    quote:
                      'Best service I’ve had in years. The attention to detail is remarkable and the environment is extremely professional. Worth every penny.',
                    helpful: 12,
                  },
                  {
                    name: 'Julian Chen',
                    time: '1 week ago',
                    stars: 5,
                    quote:
                      'The signature treatment is a game changer. Truly a premium experience from start to finish. Highly recommended for anyone who values their grooming routine.',
                    helpful: 4,
                  },
                ].map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                          <span className="text-[10px] text-slate-400">{rev.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.stars)].map((_, s) => (
                          <Star key={s} className="w-3 h-3 fill-black text-black" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {rev.quote}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <button type="button" className="hover:text-black transition-colors cursor-pointer">
                        👍 Helpful ({rev.helpful})
                      </button>
                      <span>•</span>
                      <button type="button" className="hover:text-black transition-colors cursor-pointer">
                        Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 cols) matching Image 2 */}
          <div className="lg:col-span-4 space-y-6">
            {/* Working Hours Card matching Image 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                <Clock className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold">Working Hours</h3>
              </div>

              <div className="space-y-2 text-xs">
                {business.operatingHours.map((h) => {
                  const isToday = h.day.toLowerCase() === currentDayName.toLowerCase();
                  return (
                    <div
                      key={h.day}
                      className={`flex items-center justify-between py-1 px-2 rounded-md ${
                        isToday ? 'bg-slate-100 font-bold text-black' : 'text-slate-600'
                      }`}
                    >
                      <span>
                        {h.day} {isToday ? '(Today)' : ''}
                      </span>
                      <span className="font-mono text-[11px]">
                        {h.isOpen ? `${h.openTime} - ${h.closeTime}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Card matching Image 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Amenities
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-500" />
                  <span>Free Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-slate-500" />
                  <span>Espresso Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-500" />
                  <span>Free Parking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-slate-500" />
                  <span>Air Conditioned</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Card matching Image 2 */}
            <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200/80 p-6 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Cancellation Policy</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Appointments can be cancelled or rescheduled up to 24 hours in advance without any fee. Late
                cancellations or no-shows will be charged 50% of the service price.
              </p>
            </div>

            {/* Share This Business Card matching Image 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                SHARE THIS BUSINESS
              </span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Export"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              {shareCopied && (
                <span className="text-[10px] font-bold text-emerald-600 block animate-in fade-in">
                  Link copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUSTOMER SERVICE DETAILS MODAL (Thumbnail + 10 Gallery Photos Showcase)     */}
      {/* ========================================================================= */}
      {selectedServiceForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {selectedServiceForDetails.category_name || 'Service'}
                  </span>
                  {selectedServiceForDetails.pricing_type === 'time_based' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Hourly Rate
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Fixed Price
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    • {business.coreDetails.businessName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedServiceForDetails.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedServiceForDetails(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Media Gallery Section: 1 Thumbnail + Up to 10 Gallery Photos */}
              {(() => {
                const mediaPhotos = [
                  ...(selectedServiceForDetails.thumbnail_url || selectedServiceForDetails.photo_url
                    ? [selectedServiceForDetails.thumbnail_url || selectedServiceForDetails.photo_url!]
                    : []),
                  ...(selectedServiceForDetails.gallery_photos || []),
                ].filter(Boolean);

                if (mediaPhotos.length === 0) return null;

                const activePhotoUrl = mediaPhotos[serviceModalImageIndex] || mediaPhotos[0];
                const isThumbnail = serviceModalImageIndex === 0 && Boolean(selectedServiceForDetails.thumbnail_url || selectedServiceForDetails.photo_url);

                return (
                  <div className="space-y-3">
                    {/* Main Featured Photo View with Left/Right Navigation */}
                    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 group shadow-sm select-none">
                      <img
                        src={activePhotoUrl}
                        alt={selectedServiceForDetails.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                      {/* Photo Tag / Badge */}
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isThumbnail ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                        <span>{isThumbnail ? 'Primary Thumbnail (Cover)' : `Gallery Photo #${serviceModalImageIndex}`}</span>
                      </div>

                      <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-xl bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold shadow-sm">
                        Photo {serviceModalImageIndex + 1} of {mediaPhotos.length}
                      </div>

                      {/* Left/Right Carousel Controls */}
                      {mediaPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setServiceModalImageIndex((prev) =>
                                prev === 0 ? mediaPhotos.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setServiceModalImageIndex((prev) =>
                                (prev + 1) % mediaPhotos.length
                              )
                            }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                            aria-label="Next photo"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Horizontal Interactive Thumbnail Strip */}
                    {mediaPhotos.length > 1 && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-0.5">
                          <span className="font-semibold text-slate-600">Service Photos ({mediaPhotos.length})</span>
                          <span>Click to preview</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                          {mediaPhotos.map((url, idx) => {
                            const isCurrent = serviceModalImageIndex === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setServiceModalImageIndex(idx)}
                                className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'border-black ring-2 ring-slate-200 scale-105 shadow-xs'
                                    : 'border-slate-200 opacity-65 hover:opacity-100 hover:border-slate-400'
                                }`}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 rounded bg-black/75 text-white">
                                  {idx === 0 ? 'Cover' : `#${idx}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Service Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Service Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {selectedServiceForDetails.description ||
                    'Precision craftsmanship, premium organic styling elements, and complete service consultation.'}
                </p>
              </div>

              {/* Key Specs & Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    DURATION
                  </span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {selectedServiceForDetails.duration_minutes} Minutes
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    PRICING MODEL
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedServiceForDetails.pricing_type === 'time_based' ? 'Hourly Rate' : 'Fixed Fee'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    AVAILABILITY
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedServiceForDetails.assigned_workers_count || 4} Specialists
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    CONFIRMATION
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedServiceForDetails.requires_approval ? 'Approval Required' : 'Instant Confirmation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer with Pricing & Booking Action */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SERVICE CHARGE
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    ${(selectedServiceForDetails.base_price || 0).toFixed(2)}
                  </span>
                  {selectedServiceForDetails.pricing_type === 'time_based' && (
                    <span className="text-xs text-slate-500 font-medium">/ hr</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedServiceForDetails(null)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const svcId = selectedServiceForDetails.id;
                    setSelectedServiceForDetails(null);
                    onBookService(svcId);
                  }}
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Book This Service</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
