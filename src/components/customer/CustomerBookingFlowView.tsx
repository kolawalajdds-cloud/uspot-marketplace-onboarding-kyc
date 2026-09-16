import React, { useState, useMemo } from 'react';
import {
  Check,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CreditCard,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Info,
  Lock,
  MapPin,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Business, BusinessService, Booking } from '../../types';

interface CustomerBookingFlowViewProps {
  businessId: string;
  initialServiceId?: string;
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateMyBookings: () => void;
}

export const CustomerBookingFlowView: React.FC<CustomerBookingFlowViewProps> = ({
  businessId,
  initialServiceId,
  onBack,
  onNavigateHome,
  onNavigateMyBookings,
}) => {
  const { state, currentUser, createBooking, bookServiceWithNmi } = useDemo();

  const business: Business = useMemo(() => {
    return state.businesses.find((b) => b.id === businessId) || state.businesses[0];
  }, [state.businesses, businessId]);

  // All active services for this business
  const businessServices = useMemo(() => {
    return state.businessServices.filter((s) => s.business_id === business.id && s.status === 'active');
  }, [state.businessServices, business.id]);

  // Selected services state (multi-service support)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    if (initialServiceId && businessServices.some((s) => s.id === initialServiceId)) {
      return [initialServiceId];
    }
    return businessServices.length > 0 ? [businessServices[0].id] : [];
  });

  // Current Step: 1 = DATE & TIME, 2 = DETAILS, 3 = PAYMENT, 4 = CONFIRMED
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Date & Time selection state (matching Image 3)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // September (0-indexed)
  const [selectedDay, setSelectedDay] = useState(16);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');

  // Customer Details (matching Step 2 / Step 3)
  const [customerName, setCustomerName] = useState(currentUser?.fullName || 'Johnathan Doe');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'johnathan.doe@example.com');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [specialRequests, setSpecialRequests] = useState('Please ensure a quiet environment if possible. We have a focus session during the scheduled time.');

  // Step 2 State matching media_1789550965142.png
  const [returningEmail, setReturningEmail] = useState('');
  const [returningPassword, setReturningPassword] = useState('');
  const [returningLoginMessage, setReturningLoginMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(
    currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Alex'
  );
  const [lastName, setLastName] = useState(
    currentUser?.fullName ? currentUser.fullName.split(' ').slice(1).join(' ') : 'Rivera'
  );
  const [newGuestPassword, setNewGuestPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [guestsCount, setGuestsCount] = useState(1);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [step2ValidationMessage, setStep2ValidationMessage] = useState<string | null>(null);

  // Payment Details (matching Image 4)
  const [cardholderName, setCardholderName] = useState('Johnathan Doe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12 / 28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed booking state (matching Image 5)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookingRefNumber, setBookingRefNumber] = useState('#UR-88291');
  const [refCopied, setRefCopied] = useState(false);

  // Selected services data
  const selectedServices = useMemo(() => {
    return businessServices.filter((s) => selectedServiceIds.includes(s.id));
  }, [businessServices, selectedServiceIds]);

  // Financial calculations
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.base_price || 0), 0);
  }, [selectedServices]);

  const serviceFee = 12.5;
  const processingFee = 4.35;
  const taxRate = 0.0825; // 8.25%
  const taxAmount = +(subtotal * taxRate).toFixed(2);
  const totalAmount = +(subtotal + serviceFee + processingFee + taxAmount).toFixed(2);

  // Selected date object & formatted strings
  const formattedDateStr = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }, [selectedYear, selectedMonth, selectedDay]);

  const selectedDateYMD = useMemo(() => {
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    return `${selectedYear}-${mm}-${dd}`;
  }, [selectedYear, selectedMonth, selectedDay]);

  // Dynamic available time slots based on business working hours
  const availableSlots = useMemo(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    const dayName = daysOfWeek[d.getDay()];

    const daySchedule = business.operatingHours?.find((h) => h.day.toLowerCase() === dayName.toLowerCase());

    if (!daySchedule || !daySchedule.isOpen) {
      return ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];
    }

    return ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'];
  }, [selectedYear, selectedMonth, selectedDay, business.operatingHours]);

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'URSPOT10' || code === 'WELCOME' || code === 'SAVE10') {
      const disc = +(subtotal * 0.1).toFixed(2);
      setAppliedPromoDiscount(disc);
      setPromoMessage(`✓ Promo code "${code}" applied: -$${disc.toFixed(2)} off!`);
    } else {
      setPromoMessage('Invalid promo code. Try "URSPOT10"');
    }
  };

  const handleReturningLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningEmail.trim()) return;
    setCustomerEmail(returningEmail);
    const inferredName = returningEmail.split('@')[0].replace(/[._]/g, ' ');
    const formatted = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
    setCustomerName(formatted);
    setFirstName(formatted.split(' ')[0] || 'Alex');
    setLastName(formatted.split(' ').slice(1).join(' ') || 'Rivera');
    setCardholderName(formatted);
    setReturningLoginMessage('✓ Logged in as returning guest!');
    setTimeout(() => setReturningLoginMessage(null), 4000);
  };

  const handleProceedFromStep2 = () => {
    if (!firstName.trim()) {
      setStep2ValidationMessage('Please enter your first name.');
      return;
    }
    if (!customerEmail.trim()) {
      setStep2ValidationMessage('Please enter your email address.');
      return;
    }
    if (!acceptedTerms) {
      setStep2ValidationMessage('Please accept the Terms and Conditions to proceed.');
      return;
    }
    setCustomerName(`${firstName} ${lastName}`.trim());
    setCardholderName(`${firstName} ${lastName}`.trim());
    setStep2ValidationMessage(null);
    setCurrentStep(3); // Go to Payment
  };

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun, 1 = Mon
    // Adjust so Mon is 0, Sun is 6
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days: Array<{ dayNum: number; inMonth: boolean }> = [];

    // Prev month padding
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ dayNum: prevMonthDays - i, inMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ dayNum: i, inMonth: true });
    }

    return days;
  }, [selectedYear, selectedMonth]);

  const handleConfirmAndPay = async () => {
    setIsProcessingPayment(true);
    try {
      // 1. Process NMI credit card transaction
      await bookServiceWithNmi({
        businessId: business.id,
        serviceName: selectedServices.map((s) => s.name).join(', ') || 'Premium Service Session',
        amount: totalAmount,
        customerName,
        customerEmail,
      });

      // 2. Persist appointment in DemoContext
      const res = await createBooking({
        businessId: business.id,
        selectedServiceIds,
        dateStr: selectedDateYMD,
        startTime: selectedTimeSlot,
        paymentMethod: 'credit_card',
        customerName,
        customerEmail,
        customerPhone,
        notes: specialRequests,
      });

      const randomRef = `#UR-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRefNumber(randomRef);

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
      }

      setCurrentStep(4); // Move to Booking Confirmed screen
    } catch (err) {
      console.error('Booking payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bookingRefNumber);
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white min-h-[85vh] py-8 animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ========================================================================= */}
        {/* TOP STEPPER BREADCRUMBS (Matching Images 3 & 4)                           */}
        {/* ========================================================================= */}
        {currentStep < 4 && (
          <div className="max-w-md mx-auto pt-2 pb-6">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute left-8 right-8 top-4 -translate-y-1/2 h-[1px] bg-slate-200 -z-0" />

              {/* Step 1: DATE & TIME */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex flex-col items-center gap-2 cursor-pointer z-10 bg-white px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 1
                      ? 'bg-black text-white'
                      : currentStep === 1
                      ? 'bg-black text-white ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    currentStep === 1 ? 'text-black' : 'text-slate-400'
                  }`}
                >
                  DATE & TIME
                </span>
              </button>

              {/* Step 2: DETAILS */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex flex-col items-center gap-2 cursor-pointer z-10 bg-white px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 2
                      ? 'bg-black text-white'
                      : currentStep === 2
                      ? 'bg-black text-white ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    currentStep === 2 ? 'text-black' : 'text-slate-400'
                  }`}
                >
                  DETAILS
                </span>
              </button>

              {/* Step 3: PAYMENT */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex flex-col items-center gap-2 cursor-pointer z-10 bg-white px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 3
                      ? 'bg-black text-white ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    currentStep === 3 ? 'text-black' : 'text-slate-400'
                  }`}
                >
                  PAYMENT
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: DATE & TIME (Matching Image 3)                                    */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Card (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-8 shadow-xs">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Select Date & Time
              </h2>

              {/* Calendar & Available Slots Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Month Calendar Picker */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      September 2026
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
                        className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDay((d) => Math.min(30, d + 1))}
                        className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                    <span>Su</span>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {calendarDays.slice(0, 35).map((d, i) => {
                      const isSelected = d.inMonth && d.dayNum === selectedDay;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!d.inMonth}
                          onClick={() => d.inMonth && setSelectedDay(d.dayNum)}
                          className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-black text-white font-bold shadow-xs'
                              : d.inMonth
                              ? 'text-slate-800 hover:bg-slate-100 font-medium'
                              : 'text-slate-300 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {d.dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Slots Grid matching Image 3 */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-900 block">Available Slots</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Services Section matching Image 3 */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">Selected Services</span>
                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-2xl bg-[#F9FAFB] border border-slate-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{service.name}</h4>
                          <span className="text-[11px] text-slate-400">
                            {service.duration_minutes} Minutes • Personal Suite
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        ${(service.base_price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Booking Summary (4 cols) matching Image 3 */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Booking Summary</h3>

              <div className="space-y-3 pb-4 border-b border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {selectedServices[0]?.name || 'Premium Session'}
                  </span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {formattedDateStr} • {selectedTimeSlot}
                </span>

                <div className="pt-2 space-y-2 text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Service Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing Fee</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax (8%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">${totalAmount.toFixed(2)}</span>
              </div>

              {/* Encrypted Security Notice */}
              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-slate-200/70 flex items-center gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Secure checkout powered by URSPOT. Your data is encrypted.</span>
              </div>

              {/* Luxury Image Banner matching Image 3 */}
              <div className="relative rounded-2xl h-28 overflow-hidden bg-slate-950 flex items-end p-4">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                  alt="Premium Experience"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <span className="relative z-10 text-xs font-bold text-white tracking-wide">
                  Premium Experience
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: COMPLETE YOUR BOOKING (Matching media_1789550965142.png)          */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header: Complete your booking */}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Complete your booking
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Log in to your account or create a new one to continue with your reservation.
              </p>
            </div>

            {/* Validation Alert */}
            {step2ValidationMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{step2ValidationMessage}</span>
              </div>
            )}

            {/* 3-Column Grid matching reference image */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Column 1: Returning Guest (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-5 shadow-xs">
                <h3 className="text-base font-bold text-slate-900">Returning Guest</h3>

                <form onSubmit={handleReturningLogin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      value={returningEmail}
                      onChange={(e) => setReturningEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      value={returningPassword}
                      onChange={(e) => setReturningPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-slate-500 hover:text-black cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Login
                  </button>

                  {returningLoginMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center animate-in fade-in">
                      {returningLoginMessage}
                    </div>
                  )}
                </form>
              </div>

              {/* Column 2: New Guest (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-slate-900">New Guest</h3>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Rivera"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      PHONE
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      value={newGuestPassword}
                      onChange={(e) => setNewGuestPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  {/* Terms & Conditions Checkbox matching reference image */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-[11px] text-slate-500 leading-snug">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <span>
                      I accept the <strong className="text-slate-900 font-bold">Terms and Conditions</strong> and the privacy policy of URSPOT.
                    </span>
                  </label>
                </div>
              </div>

              {/* Column 3: Reservation Summary (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-5 shadow-xs">
                <h3 className="text-base font-bold text-slate-900">Reservation Summary</h3>

                {/* Venue Thumbnail Card */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <img
                    src={business.imageGallery?.[0]?.url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80'}
                    alt={business.coreDetails.businessName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-900"
                  />
                  <div className="space-y-0.5 truncate">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {business.coreDetails.category || 'URBAN LOFT SUITE'}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {business.coreDetails.businessName}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{business.coreDetails.city}</span>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-900">{formattedDateStr}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-slate-900">
                      {selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)} Minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Guests</span>
                    <span className="font-bold text-slate-900">1 Person</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {selectedServices[0]?.name || 'Service Rate'}
                    </span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Service Fee</span>
                    <span className="font-semibold text-slate-900">${serviceFee.toFixed(2)}</span>
                  </div>
                  {appliedPromoDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-${appliedPromoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-black text-slate-900">
                      ${Math.max(0, +(subtotal + serviceFee - appliedPromoDiscount)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input matching reference image */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[11px] font-semibold ${appliedPromoDiscount > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Navigation Buttons matching reference image */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="py-3.5 px-8 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT METHOD & BREAKDOWN (Matching Image 4)                     */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Payment Form + Special Requests */}
            <div className="lg:col-span-8 space-y-6">
              {/* Payment Method Card matching Image 4 */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Payment Method</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Secure encryption powered by NMI. Your payment data is never stored on our servers.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Cardholder Name */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      CARDHOLDER NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-black font-medium"
                      placeholder="Johnathan Doe"
                    />
                  </div>

                  {/* Credit Card Number */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      CREDIT CARD NUMBER
                    </label>
                    <div className="relative rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 focus-within:border-black">
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-900 focus:outline-hidden font-mono"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        EXPIRY DATE
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-black font-medium"
                        placeholder="MM / YY"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        CVV
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-black font-medium"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests Card matching Image 4 */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Special Requests</h3>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    OPTIONAL NOTES
                  </label>
                  <textarea
                    rows={4}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific instructions for your booking..."
                    className="w-full rounded-xl border border-slate-200 p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons matching Image 4 */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-slate-600 hover:text-black cursor-pointer inline-flex items-center gap-1"
                >
                  <span>← PREVIOUS STEP</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmAndPay}
                  className="px-8 py-3.5 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {isProcessingPayment ? 'Processing with NMI...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>

            {/* Right Column: Order Breakdown (4 cols) matching Image 4 */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Order Breakdown</h3>

              <div className="space-y-3 pb-4 border-b border-slate-100 text-xs">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-slate-900 font-medium">
                    <span>{s.name} ({s.duration_minutes}m)</span>
                    <span className="font-bold">${(s.base_price || 0).toFixed(2)}</span>
                  </div>
                ))}

                <div className="pt-2 space-y-2 text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing Fees</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax (8.25%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Amount Due */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  TOTAL AMOUNT DUE
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">${totalAmount.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400">USD</span>
                </div>
              </div>

              {/* Security & Cancellation Policy Notice matching Image 4 */}
              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-slate-200/70 flex items-start gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Cancellation is free up to 24 hours before the booking start time. Secure payment via AES-256 SSL encryption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: BOOKING CONFIRMED SCREEN (Matching Image 5)                       */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-10 py-6">
            {/* Header: Large Checkmark Circle + Headline matching Image 5 */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Booking Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Your spot is secured. We've sent the details to your email.
              </p>

              {/* Reference Number Pill matching Image 5 */}
              <div className="inline-flex items-center gap-2 bg-[#F9FAFB] border border-slate-200 rounded-full px-5 py-2 text-xs font-mono">
                <span className="text-slate-500 font-sans font-bold">REF NUMBER:</span>
                <strong className="text-slate-900 font-bold">{bookingRefNumber}</strong>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-slate-400 hover:text-black transition-colors cursor-pointer"
                  title="Copy reference number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {refCopied && <span className="text-[10px] text-emerald-600 font-bold font-sans">Copied!</span>}
              </div>
            </div>

            {/* 3 Summary Cards matching Image 5 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: ORDER INFO */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  ORDER INFO
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-semibold text-slate-900">{formattedDateStr}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>VISA **** 4242</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Status</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="px-2 py-0.5 rounded-md border border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      PAID
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: PAYMENT SUMMARY */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  PAYMENT SUMMARY
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-semibold text-slate-900">${serviceFee.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-lg font-black text-slate-900">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: SPECIAL INSTRUCTIONS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  SPECIAL INSTRUCTIONS
                </span>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 italic font-normal leading-relaxed">
                  "{specialRequests || 'Standard booking session'}"
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Instructions shared with provider.</span>
                </div>
              </div>
            </div>

            {/* Order Summary Table matching Image 5 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-6">Service</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Date / Time</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-6 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {selectedServices.map((service) => (
                      <tr key={service.id}>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{service.name}</span>
                            <span className="text-[11px] text-slate-400">Level 4, North Wing</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">1</td>
                        <td className="py-4 px-4">
                          <span className="block font-semibold text-slate-900">{formattedDateStr}</span>
                          <span className="text-[11px] text-slate-400">{selectedTimeSlot}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{service.duration_minutes} min</td>
                        <td className="py-4 px-6 text-right font-black text-slate-900">
                          ${(service.base_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons matching Image 5 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Back to Home
              </button>

              <button
                type="button"
                onClick={onNavigateMyBookings}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                View My Bookings
              </button>

              <button
                type="button"
                onClick={onNavigateMyBookings}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Login to Track
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
