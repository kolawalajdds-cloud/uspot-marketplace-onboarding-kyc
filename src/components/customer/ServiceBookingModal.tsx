import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  Check,
  CreditCard,
  Building2,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  Banknote,
  FileText,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import {
  Business,
  BusinessService,
  Booking,
  BookingPaymentMethod,
} from '../../types';
import {
  calculateMultiServiceAvailability,
  getDayOfWeekFromDate,
  DAY_NAMES,
  minutesToTimeString,
} from '../../utils/serviceBookingUtils';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onBookingComplete?: (booking: Booking) => void;
  onNavigateToMyBookings?: () => void;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  onClose,
  business,
  onBookingComplete,
  onNavigateToMyBookings,
}) => {
  const {
    state,
    currentUser,
    createBooking,
    businessServices,
    bookings,
    customerSavedCards = [],
    addCustomerSavedCard,
  } = useDemo();

  // Wizard Steps: 1 = Services, 2 = Date & Slot, 3 = Details & Payment, 4 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Filter available services for this specific business
  const services = useMemo(() => {
    const list = businessServices.filter(
      (s) => s.business_id === business.id && s.status === 'active'
    );
    if (list.length > 0) return list;
    return (business.business_services || []).filter((s) => s.status === 'active');
  }, [businessServices, business.id, business.business_services]);

  // Step 1: Selected service IDs (Multiple services allowed!)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Step 2: Date & Slot
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrow);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);

  // Step 3: Customer Details & Payment
  const [customerName, setCustomerName] = useState(currentUser?.fullName || 'Alex Taylor');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'alex_shopper@uspot.com');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+1 (555) 019-2831');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('credit_card');

  // Saved Cards from Settings support
  const defaultSavedCard = useMemo(() => {
    return customerSavedCards.find((c) => c.is_default) || customerSavedCards[0];
  }, [customerSavedCards]);

  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    return defaultSavedCard ? defaultSavedCard.id : 'new';
  });

  useEffect(() => {
    if (selectedCardId !== 'new') {
      const exists = customerSavedCards.some((c) => c.id === selectedCardId);
      if (!exists) {
        setSelectedCardId(defaultSavedCard ? defaultSavedCard.id : 'new');
      }
    } else if (customerSavedCards.length > 0 && !selectedCardId) {
      setSelectedCardId(defaultSavedCard.id);
    }
  }, [customerSavedCards, defaultSavedCard]);

  const activeSavedCard = useMemo(() => {
    if (selectedCardId === 'new') return null;
    return customerSavedCards.find((c) => c.id === selectedCardId) || null;
  }, [customerSavedCards, selectedCardId]);

  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardholderName, setNewCardholderName] = useState(currentUser?.fullName || 'Alex Taylor');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('•••');
  const [saveCardToSettings, setSaveCardToSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Categories extraction
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category_name || 'General Services')));
    return ['All', ...cats];
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = activeCategoryFilter === 'All' || s.category_name === activeCategoryFilter;
      const matchQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [services, activeCategoryFilter, searchQuery]);

  // Selected Service objects
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  // Aggregated totals
  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.base_price, 0);
  }, [selectedServices]);

  // Availability calculation for Step 2
  const availability = useMemo(() => {
    if (!business || selectedServices.length === 0 || !selectedDate) {
      return null;
    }

    const bHours = business.business_hours || [];
    return calculateMultiServiceAvailability({
      businessHours: bHours,
      selectedServices,
      dateStr: selectedDate,
      existingBookings: bookings,
      businessId: business.id,
      slotIntervalMinutes: business.slotIntervalMinutes || 30,
      bufferMinutes: business.bufferMinutes || 0,
    });
  }, [business, selectedServices, selectedDate, bookings]);

  // Toggle service selection
  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
    // Reset selected slot when services change
    setSelectedSlotTime(null);
  };

  // Quick date pickers
  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
    setSelectedSlotTime(null);
  };

  // Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotTime || selectedServices.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let paymentDisplay = 'Mastercard •••• 4242';
      if (paymentMethod === 'cash') {
        paymentDisplay = 'Cash on Arrival';
      } else if (selectedCardId !== 'new' && activeSavedCard) {
        const brandUpper =
          activeSavedCard.brand.charAt(0).toUpperCase() + activeSavedCard.brand.slice(1);
        paymentDisplay = `${brandUpper} •••• ${activeSavedCard.last4}`;
      } else {
        const cleanNumber = newCardNumber.replace(/\D/g, '');
        const last4 = cleanNumber.slice(-4) || '4242';
        let detectedBrand: 'visa' | 'mastercard' | 'amex' | 'discover' = 'mastercard';
        if (cleanNumber.startsWith('4')) detectedBrand = 'visa';
        else if (cleanNumber.startsWith('3')) detectedBrand = 'amex';
        else if (cleanNumber.startsWith('6')) detectedBrand = 'discover';
        const brandUpper = detectedBrand.charAt(0).toUpperCase() + detectedBrand.slice(1);
        paymentDisplay = `${brandUpper} •••• ${last4}`;

        if (saveCardToSettings) {
          const cleanExpiry = newCardExpiry.trim();
          let expMonth = '12';
          let expYear = '28';
          if (cleanExpiry.includes('/')) {
            const parts = cleanExpiry.split('/').map((p) => p.trim());
            if (parts[0]) expMonth = parts[0].padStart(2, '0');
            if (parts[1]) expYear = parts[1].slice(-2);
          }
          addCustomerSavedCard({
            customer_id: currentUser?.id || 'user-customer',
            cardholder_name: newCardholderName.trim() || customerName,
            brand: detectedBrand,
            last4,
            exp_month: expMonth,
            exp_year: expYear,
            is_default: customerSavedCards.length === 0,
          });
        }
      }

      const res = await createBooking({
        customerId: currentUser?.id || 'user-customer',
        customerName: customerName.trim() || 'Valued Customer',
        customerEmail: customerEmail.trim() || 'customer@uspot.com',
        customerPhone: customerPhone.trim(),
        businessId: business.id,
        selectedServiceIds,
        dateStr: selectedDate,
        startTime: selectedSlotTime,
        paymentMethod,
        paymentMethodDisplay: paymentDisplay,
        notes: specialNotes.trim() || undefined,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        if (onBookingComplete) {
          onBookingComplete(res.booking);
        }
        setStep(4);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black shadow-xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  Book Services
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-800">{business.coreDetails.businessName}</span>
                <span>•</span>
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{business.coreDetails.city}, {business.coreDetails.state}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1 shrink-0">
          <div
            className="bg-black h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* ================================================================= */}
          {/* STEP 1: MULTI-SERVICE SELECTION                                   */}
          {/* ================================================================= */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-black text-slate-900">Choose Services</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select one or multiple services. Total duration and appointment slots will be calculated dynamically.
                </p>
              </div>

              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative shrink-0 sm:w-56">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search haircut, shave..."
                    className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Services List Grid */}
              {filteredServices.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">No services found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredServices.map((svc) => {
                    const isSelected = selectedServiceIds.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        onClick={() => handleToggleService(svc.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isSelected
                            ? 'border-black bg-slate-900 text-white shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                                  isSelected
                                    ? 'bg-slate-800 text-slate-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {svc.category_name || 'Service'}
                              </span>
                              <h4 className="font-bold text-sm mt-1.5 leading-snug">{svc.name}</h4>
                            </div>

                            {/* Checkbox indicator */}
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-white text-slate-950 font-black'
                                  : 'border-2 border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          {svc.description && (
                            <p
                              className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {svc.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100/20 flex items-center justify-between text-xs">
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{svc.duration_minutes} mins</span>
                          </div>

                          <div className="font-mono font-black text-sm">
                            ${svc.base_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: DATE & AVAILABLE TIME SLOT PICKER                         */}
          {/* ================================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-black text-slate-900">Select Date & Time Slot</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available appointment slots are calculated based on your total service duration (
                  <strong className="text-slate-800 font-bold">{totalDurationMinutes} mins</strong>) and
                  business open hours.
                </p>
              </div>

              {/* Date Selection Box */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Choose Appointment Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlotTime(null);
                      }}
                      className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-end">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(0)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(1)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(2)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      In 2 Days
                    </button>
                  </div>
                </div>

                {/* Operating Hours Info Badge */}
                {availability && (
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                      availability.isOpen
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-900 border border-amber-200/60'
                    }`}
                  >
                    <span className="font-semibold">
                      {availability.dayName} Hours:{' '}
                      <strong className="font-bold">{availability.operatingHoursText}</strong>
                    </span>
                    <span className="font-mono text-[11px] font-bold">
                      {availability.isOpen ? 'Open For Bookings' : 'Closed'}
                    </span>
                  </div>
                )}
              </div>

              {/* Closed Warning */}
              {availability && !availability.isOpen && (
                <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="font-bold text-sm text-slate-900">
                    {business.coreDetails.businessName} is closed on {availability.dayName}s
                  </p>
                  <p className="text-xs text-slate-600">
                    Please pick another date above to view available appointment slots.
                  </p>
                </div>
              )}

              {/* Slots Grid Grouped by Period */}
              {availability && availability.isOpen && (
                <div className="space-y-4">
                  {availability.slots.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        No continuous slots available for {totalDurationMinutes} minutes on this day.
                      </p>
                    </div>
                  ) : (
                    (['Morning', 'Afternoon', 'Evening'] as const).map((period) => {
                      const periodSlots = availability.slots.filter((s) => s.period === period);
                      if (periodSlots.length === 0) return null;

                      return (
                        <div key={period} className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {period}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {periodSlots.map((slot) => {
                              const isSelected = selectedSlotTime === slot.startTime;
                              return (
                                <button
                                  key={slot.slotId}
                                  type="button"
                                  disabled={!slot.isAvailable}
                                  onClick={() => setSelectedSlotTime(slot.startTime)}
                                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-black text-white border-black shadow-md'
                                      : slot.isAvailable
                                      ? 'bg-white border-slate-200 hover:border-slate-400 text-slate-900 hover:bg-slate-50 shadow-2xs'
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-xs">{slot.startTime}</span>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span
                                    className={`text-[10px] block mt-0.5 ${
                                      isSelected
                                        ? 'text-slate-300'
                                        : slot.isAvailable
                                        ? 'text-slate-500'
                                        : 'text-rose-500 font-medium'
                                    }`}
                                  >
                                    {slot.isAvailable
                                      ? `Ends ${slot.endTime}`
                                      : slot.conflictReason || 'Unavailable'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: DETAILS & PAYMENT CONFIRMATION                             */}
          {/* ================================================================= */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-black text-slate-900">Review & Payment Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your appointment schedule and select your preferred payment method.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Appointment Schedule Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      {selectedDate} at {selectedSlotTime}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {totalDurationMinutes} mins total
                  </span>
                </div>

                {/* Services list breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selected Services:
                  </span>
                  {selectedServices.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{svc.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({svc.duration_minutes}m)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ${svc.base_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Contact Fields */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Notes or Stylist Request
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Skin sensitivity, preferred stylist"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector (credit_card vs cash) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'credit_card'
                        ? 'border-black bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4" />
                      <div>
                        <span className="font-bold text-xs block">Pay with NMI Gateway</span>
                        <span
                          className={`text-[10px] ${
                            paymentMethod === 'credit_card' ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          Instant 256-bit TLS card checkout
                        </span>
                      </div>
                    </div>
                    {paymentMethod === 'credit_card' && <Check className="w-4 h-4" />}
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'cash'
                        ? 'border-black bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4" />
                      <div>
                        <span className="font-bold text-xs block">Pay at Salon / Venue</span>
                        <span
                          className={`text-[10px] ${
                            paymentMethod === 'cash' ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          Pay in cash or card upon arrival
                        </span>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && <Check className="w-4 h-4" />}
                  </div>
                </div>

                {/* Saved Cards & NMI TLS Details if Credit Card */}
                {paymentMethod === 'credit_card' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="font-extrabold text-slate-900">
                        Saved Cards from Settings ({customerSavedCards.length})
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                        <Lock className="w-2.5 h-2.5" /> 256-Bit TLS
                      </span>
                    </div>

                    {/* Saved Cards List */}
                    {customerSavedCards.length > 0 && (
                      <div className="space-y-2">
                        {customerSavedCards.map((card) => {
                          const isSelected = selectedCardId === card.id;
                          const isMastercard = card.brand === 'mastercard';
                          const isVisa = card.brand === 'visa';
                          const isAmex = card.brand === 'amex';

                          return (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCardId(card.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-black bg-slate-900 text-white shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'border-white bg-white' : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    isMastercard
                                      ? isSelected
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                      : isVisa
                                      ? isSelected
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : isAmex
                                      ? isSelected
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : isSelected
                                      ? 'bg-white/10 text-white'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {card.brand}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold">
                                      •••• {card.last4}
                                    </span>
                                    {card.is_default && (
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                          isSelected
                                            ? 'bg-emerald-400/20 text-emerald-300'
                                            : 'bg-emerald-50 text-emerald-700'
                                        }`}
                                      >
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] block ${
                                      isSelected ? 'text-slate-300' : 'text-slate-400'
                                    }`}
                                  >
                                    {card.cardholder_name} • Exp {card.exp_month}/{card.exp_year}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-medium font-mono ${
                                  isSelected ? 'text-slate-300' : 'text-slate-400'
                                }`}
                              >
                                Vault Tokenized
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New Card Option */}
                    <div
                      onClick={() => setSelectedCardId('new')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        selectedCardId === 'new'
                          ? 'border-black bg-white text-black font-semibold'
                          : 'border-slate-200 bg-white/50 hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedCardId === 'new' ? 'border-black bg-black' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedCardId === 'new' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>+ Use a new credit or debit card</span>
                      </div>
                    </div>

                    {(selectedCardId === 'new' || customerSavedCards.length === 0) && (
                      <div className="pt-2 space-y-2 border-t border-slate-200">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            required
                            value={newCardholderName}
                            onChange={(e) => setNewCardholderName(e.target.value)}
                            placeholder="Alex Taylor"
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Card Number
                          </label>
                          <input
                            type="text"
                            required
                            value={newCardNumber}
                            onChange={(e) => setNewCardNumber(e.target.value)}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              Expires (MM/YY)
                            </label>
                            <input
                              type="text"
                              required
                              value={newCardExpiry}
                              onChange={(e) => setNewCardExpiry(e.target.value)}
                              placeholder="12 / 28"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              CVC
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={newCardCvv}
                              onChange={(e) => setNewCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveCardToSettings}
                            onChange={(e) => setSaveCardToSettings(e.target.checked)}
                            className="rounded border-slate-300 text-black focus:ring-black h-3.5 w-3.5"
                          />
                          <span className="text-[11px] font-medium text-slate-600">
                            Save card to Settings for future bookings
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown Footer */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block font-medium">Total Amount Due</span>
                  <span className="text-[11px] text-slate-400">
                    {paymentMethod === 'credit_card'
                      ? 'Charged via NMI Card Gateway'
                      : 'Payable at salon upon service'}
                  </span>
                </div>
                <span className="font-mono font-black text-xl">${totalPrice.toFixed(2)} USD</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processing Appointment...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {paymentMethod === 'credit_card'
                          ? `Pay $${totalPrice.toFixed(2)} with ${
                              selectedCardId !== 'new' && activeSavedCard
                                ? `${activeSavedCard.brand.toUpperCase()} •••• ${activeSavedCard.last4}`
                                : 'Card'
                            }`
                          : `Confirm Appointment ($${totalPrice.toFixed(2)} at Salon)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 4: CONFIRMATION RECEIPT                                      */}
          {/* ================================================================= */}
          {step === 4 && confirmedBooking && (
            <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                  Appointment Confirmed
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">You're All Set!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your appointment with{' '}
                  <strong className="text-slate-800 font-bold">{business.coreDetails.businessName}</strong>{' '}
                  has been secured. A confirmation notice has been dispatched.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-extrabold text-slate-900">
                    {confirmedBooking.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-bold text-slate-900">
                    {confirmedBooking.booking_date} • {confirmedBooking.scheduled_start_time} -{' '}
                    {confirmedBooking.scheduled_end_time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedBooking.total_duration_minutes} mins
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-900">
                    {confirmedBooking.payment_method_display ||
                      (confirmedBooking.payment_status === 'paid' ? 'Credit Card' : 'Pay at Venue')}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Services Booked ({confirmedBooking.items.length}):
                  </span>
                  {confirmedBooking.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-700">
                      <span>• {item.service_name} ({item.duration_minutes}m)</span>
                      <span className="font-mono font-bold">${item.price_charged.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-slate-900">
                  <span>Total Paid / Due:</span>
                  <span className="font-mono font-black text-sm">
                    ${confirmedBooking.total_amount.toFixed(2)} (
                    {confirmedBooking.payment_status === 'paid' ? 'Paid via NMI' : 'Pay at Venue'})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                {onNavigateToMyBookings && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToMyBookings();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    View in My Bookings
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer for Step 1 & Step 2 */}
        {(step === 1 || step === 2) && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                  {selectedServices.length} Service{selectedServices.length === 1 ? '' : 's'} Selected
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-black text-slate-900 text-base">
                    ${totalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">•</span>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {totalDurationMinutes} mins
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Select Date & Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!selectedSlotTime}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
