import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Headphones,
  Check,
  Sparkles,
  CreditCard,
  Lock,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { MarketplaceTransaction } from '../../types';

interface CustomerHomeViewProps {
  onNavigateCategories: () => void;
  onNavigateCities: () => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onNavigateCategories,
  onNavigateCities,
}) => {
  const { state, currentUser, bookServiceWithNmi, platformLedger } = useDemo();

  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [bookingVenue, setBookingVenue] = useState<{ id: string; name: string } | null>(null);
  const [selectedService, setSelectedService] = useState('Executive Studio & Workspace Booking');
  const [paymentAmount, setPaymentAmount] = useState<number>(100.0);
  const [bookingDate, setBookingDate] = useState('2026-09-15');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [isProcessingNmi, setIsProcessingNmi] = useState(false);
  const [confirmedTransaction, setConfirmedTransaction] = useState<MarketplaceTransaction | null>(null);
  const [quickTestNotice, setQuickTestNotice] = useState<string | null>(null);

  // Dynamic salon venues directly linked to state.businesses
  const recommendedSalons = useMemo(() => {
    const defaultImages: Record<string, string> = {
      'biz-001': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      'biz-002': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
      'biz-003': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      'biz-004': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    };

    return state.businesses.map((b) => {
      const isCertified = Boolean(b.w9 && (b.w9.status === 'submitted' || b.w9.status === 'verified'));
      const cover =
        b.imageGallery?.find((img) => img.isCover)?.url ||
        defaultImages[b.id] ||
        defaultImages['biz-001'];

      return {
        id: b.id,
        name: b.coreDetails.businessName,
        rating: b.id === 'biz-001' ? '5.0' : b.id === 'biz-002' ? '4.9' : b.id === 'biz-003' ? '4.9' : '4.8',
        location: `${b.coreDetails.city}, ${b.coreDetails.state}`,
        isCertified,
        badge: isCertified ? 'W-9 Certified (0% Tax)' : 'W-9 Missing (24% IRS Withholding)',
        image: cover,
      };
    });
  }, [state.businesses]);

  const clientReviews = [
    {
      stars: 5,
      quote:
        'URSPOT completely changed how I book beauty services. The quality of partners is outstanding and the process is seamless.',
      initial: 'E',
      name: 'Elena V.',
      title: 'Fashion Editor',
    },
    {
      stars: 5,
      quote:
        'As someone with a tight schedule, the quick booking and instant confirmations are a game changer. Highly recommended.',
      initial: 'M',
      name: 'Marcus L.',
      title: 'Architect',
    },
    {
      stars: 5,
      quote:
        'The premium experience starts from the app itself. Every detail feels considered and the concierge support is exceptional.',
      initial: 'S',
      name: 'Sophie T.',
      title: 'Creative Director',
    },
  ];

  const handleBook = (salon: { id: string; name: string } | string) => {
    if (typeof salon === 'string') {
      const match = recommendedSalons.find((v) => v.name.toLowerCase().includes(salon.toLowerCase())) || {
        id: 'biz-001',
        name: salon,
      };
      setBookingVenue({ id: match.id, name: match.name });
    } else {
      setBookingVenue({ id: salon.id, name: salon.name });
    }
    setSelectedService('Executive Studio & Workspace Booking');
    setPaymentAmount(100.0);
    setConfirmedTransaction(null);
    setIsProcessingNmi(false);
  };

  const handlePayWithNmi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingVenue) return;

    setIsProcessingNmi(true);

    try {
      const res = await bookServiceWithNmi({
        businessId: bookingVenue.id,
        serviceName: selectedService,
        amount: paymentAmount,
        customerName: currentUser?.fullName || 'Alex Taylor',
        customerEmail: currentUser?.email || 'alex_shopper@uspot.com',
      });

      if (res.success && res.transaction) {
        setConfirmedTransaction(res.transaction);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingNmi(false);
    }
  };

  // Prototype Quick-Test Helpers
  const handleRunPrototypeTest = async (businessId: string) => {
    const targetBiz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    setQuickTestNotice(`Processing test payment of $100 via NMI Gateway for "${targetBiz.coreDetails.businessName}"...`);

    const res = await bookServiceWithNmi({
      businessId: targetBiz.id,
      serviceName: 'Executive Studio & Workspace Booking ($100 Test)',
      amount: 100.0,
      customerName: currentUser?.fullName || 'Alex Taylor',
      customerEmail: currentUser?.email || 'alex_shopper@uspot.com',
    });

    if (res.success && res.transaction) {
      const t = res.transaction;
      const isWithheld = t.w9WithholdingAmount > 0;
      setQuickTestNotice(
        `✓ "${t.businessName}": Gross $100.00 | Super Admin Commission: $${t.platformCommission.toFixed(2)} (${t.commissionRate}%) | IRS Tax: $${t.w9WithholdingAmount.toFixed(2)} (${isWithheld ? '24% backup withholding charged' : '0% W-9 certified'}) | Business Net: $${t.businessAmount.toFixed(2)}`
      );
      setTimeout(() => setQuickTestNotice(null), 10000);
    }
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* Hero Section */}
      <section className="relative w-full bg-[#050607] py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Architectural Columns / Dark Marble Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-radial from-neutral-800/20 via-[#050607]/80 to-[#050607]" />
          {/* Subtle column pillars matching screenshot */}
          <div className="h-full w-full flex justify-around opacity-25">
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/30 to-transparent" />
            <div className="w-32 h-full bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent" />
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/30 to-transparent" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8">
            Find Your Next Appointment
          </h1>

          {/* Search Bar Pill */}
          <div className="bg-white rounded-full p-2 pl-5 sm:pl-6 shadow-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-2xl mx-auto border border-slate-100">
            <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto py-1 sm:py-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Service or Business..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto py-1 sm:py-0 border-t sm:border-t-0 border-slate-100">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Current Location"
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
            </div>

            <button
              type="button"
              onClick={onNavigateCategories}
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-7 py-3 rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* PROTOTYPE TEST BAR matching exact user requirements */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Marketplace Prototype Testing Bar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  NMI Payment Gateway Active
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Simulate Customer Booking & Internal Balance Flow ($100 Example)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer pays $100 via NMI Gateway → Checks live W-9 status of target business → If W-9 is not filled, Super Admin charges 24% IRS withholding.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                id="btn-quick-test-biz-001"
                onClick={() => handleRunPrototypeTest('biz-001')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 border border-slate-700"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Test Booking: The Nexus ($100)</span>
              </button>

              <button
                id="btn-quick-test-biz-002"
                onClick={() => handleRunPrototypeTest('biz-002')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 border border-slate-700"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Booking: Apex Studios ($100)</span>
              </button>
            </div>
          </div>

          {quickTestNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-semibold animate-in fade-in flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{quickTestNotice}</span>
            </div>
          )}
        </section>
        {/* Browse by Category */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Browse by Category
            </h2>
          </div>

          {/* 10 Category Placeholder / Skeleton Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {[
              'Hair Salon',
              'Barbershop',
              'Spa & Massage',
              'Nails Care',
              'Skin Care',
              'Yoga & Pilates',
              'Fitness Gym',
              'Dental Care',
              'Photography',
              'Wellness',
            ].map((catName, idx) => (
              <button
                key={idx}
                type="button"
                onClick={onNavigateCategories}
                className="group h-24 rounded-2xl bg-[#F4F5F7] hover:bg-[#EAECEF] border border-slate-200/50 flex flex-col items-center justify-center p-2 transition-all cursor-pointer text-center"
              >
                <div className="w-7 h-7 rounded-xl bg-white/80 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 line-clamp-1">
                  {catName}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Limited Offer Banner */}
        <section className="bg-gradient-to-r from-[#0C0D0E] via-[#15171A] to-[#0C0D0E] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-slate-400 block mb-2">
              LIMITED OFFER
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
              Elevate Your Self-Care Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Enjoy 20% off your first booking at selected premium partner salons this month.
            </p>
            <button
              type="button"
              onClick={() => handleBook('Onyx Spa')}
              className="bg-white hover:bg-slate-100 text-black text-xs font-extrabold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Book Now
            </button>
          </div>

          {/* Cosmetic Bottles Artwork / High-end Visual */}
          <div className="relative shrink-0 flex items-center justify-center md:pr-4">
            <div className="w-56 sm:w-64 h-48 sm:h-52 relative flex items-end justify-center">
              {/* Product render container */}
              <div className="absolute inset-0 bg-radial from-neutral-700/20 to-transparent rounded-full blur-xl" />
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Cosmetics"
                className="w-full h-full object-contain filter drop-shadow-2xl relative z-10"
              />
            </div>
          </div>
        </section>

        {/* Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Recommended for You
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Top rated businesses in your area</p>
            </div>
            <button
              type="button"
              onClick={onNavigateCategories}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between p-3.5 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Image Container with Live W-9 Status Badge */}
                  <div className="h-44 w-full rounded-xl bg-slate-100 overflow-hidden relative mb-3">
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      {salon.isCertified ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600/95 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>W-9 Certified (0% Tax)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-600/95 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>W-9 Missing (24% Tax)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{salon.name}</h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                      <Star className="w-3 h-3 fill-current text-slate-900" />
                      {salon.rating}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{salon.location}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBook(salon)}
                  className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Book with NMI ($100)</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Trust Value Props */}
        <section className="py-10 border-t border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* 1. Best Price Guarantee */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Best Price Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Found a lower price? We'll match it and give you an extra credit for your next visit.
              </p>
            </div>

            {/* 2. Easy & Quick Booking */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Zap className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Easy & Quick Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Book your preferred spot in under 60 seconds with instant confirmation and digital receipts.
              </p>
            </div>

            {/* 3. Customer Care 24/7 */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Headphones className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Care 24/7</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Our dedicated concierge team is always available to assist with your scheduling or questions.
              </p>
            </div>
          </div>
        </section>

        {/* What Our Clients Say */}
        <section>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight text-center mb-8">
            What Our Clients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientReviews.map((rev, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  {/* 5 Stars */}
                  <div className="flex items-center gap-1 mb-3 text-slate-950">
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current text-slate-950" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">"{rev.quote}"</p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none">{rev.name}</h4>
                    <span className="text-[11px] text-slate-400">{rev.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explore Top Destinations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Explore Top Destinations
            </h2>
            <button
              type="button"
              onClick={onNavigateCities}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* 3 Dark City Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                city: 'New York',
                locations: '42+ Locations',
                bg: 'from-[#19222E] to-[#121820]',
              },
              {
                city: 'London',
                locations: '215+ Locations',
                bg: 'from-[#18212C] to-[#11161D]',
              },
              {
                city: 'Tokyo',
                locations: '310+ Locations',
                bg: 'from-[#1A232F] to-[#10151C]',
              },
            ].map((dest, i) => (
              <div
                key={i}
                onClick={onNavigateCities}
                className={`bg-gradient-to-b ${dest.bg} text-white rounded-2xl h-56 p-6 flex flex-col justify-end shadow-xs hover:scale-[1.01] transition-transform cursor-pointer border border-slate-800 relative overflow-hidden group`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white group-hover:translate-x-1 transition-transform">
                    {dest.city}
                  </h3>
                  <span className="text-xs text-slate-400 mt-0.5 block">{dest.locations}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* NMI Payment Gateway Booking Modal */}
      {bookingVenue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            {confirmedTransaction ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Processed securely via <strong className="text-slate-900 font-bold">NMI Payment Gateway</strong>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-mono">
                    <span className="text-slate-500">Booking Reference:</span>
                    <strong className="text-slate-900">{confirmedTransaction.bookingId}</strong>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-semibold text-slate-800">{confirmedTransaction.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Venue Partner:</span>
                    <span className="font-semibold text-slate-800">{confirmedTransaction.businessName}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Gross Amount Paid:</span>
                    <strong className="text-slate-900 text-sm font-black">${confirmedTransaction.grossAmount.toFixed(2)}</strong>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between text-blue-700">
                      <span>Platform Commission ({confirmedTransaction.commissionRate}%):</span>
                      <strong className="font-mono">${confirmedTransaction.platformCommission.toFixed(2)}</strong>
                    </div>
                    {confirmedTransaction.w9WithholdingAmount > 0 && (
                      <div className="flex items-center justify-between text-amber-700">
                        <span>IRS Backup Withholding (24% - Missing W-9):</span>
                        <strong className="font-mono">-${confirmedTransaction.w9WithholdingAmount.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-emerald-800 font-semibold">
                      <span>Credited to Business Balance:</span>
                      <strong className="font-mono">${confirmedTransaction.businessAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The platform is holding your payment. Balances have been internally allocated between platform treasury and merchant balance.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBookingVenue(null);
                    setConfirmedTransaction(null);
                  }}
                  className="w-full py-3 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayWithNmi} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      N
                    </div>
                    <h3 className="text-base font-black text-slate-900">Book & Pay with NMI</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingVenue(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Venue */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Selected Venue / Business
                  </label>
                  <input
                    type="text"
                    disabled
                    value={bookingVenue.name}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Service & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Service</label>
                    <select
                      value={selectedService}
                      onChange={(e) => {
                        setSelectedService(e.target.value);
                        if (e.target.value.includes('$100')) setPaymentAmount(100.0);
                        else if (e.target.value.includes('$50')) setPaymentAmount(50.0);
                        else if (e.target.value.includes('$250')) setPaymentAmount(250.0);
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white text-slate-800"
                    >
                      <option value="Executive Studio & Workspace Booking">Executive Studio Booking ($100.00)</option>
                      <option value="Conference Room Half-Day">Conference Room Half-Day ($50.00)</option>
                      <option value="Full Campus Day Pass">Full Campus Day Pass ($250.00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Service Price ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* NMI Payment Gateway Card Details */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span className="font-extrabold text-slate-900">NMI Secure Card Checkout</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 font-mono">
                      <Lock className="w-2.5 h-2.5" /> 256-Bit TLS
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue="4007 •••• •••• 0021"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Expires
                      </label>
                      <input
                        type="text"
                        disabled
                        defaultValue="08 / 29"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        CVV
                      </label>
                      <input
                        type="text"
                        disabled
                        defaultValue="•••"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Live W-9 Status & Settlement Allocation Breakdown */}
                {(() => {
                  const targetBiz = state.businesses.find((b) => b.id === bookingVenue.id) || state.businesses[0];
                  const isW9Done = Boolean(targetBiz?.w9 && (targetBiz.w9.status === 'submitted' || targetBiz.w9.status === 'verified'));
                  const commRate = platformLedger?.commissionRate ?? 10.0;
                  const commAmt = Number(((paymentAmount * commRate) / 100).toFixed(2));
                  const taxAmt = isW9Done ? 0 : Number(((paymentAmount * 24.0) / 100).toFixed(2));
                  const bizNet = Number((paymentAmount - commAmt - taxAmt).toFixed(2));

                  return (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Business W-9 Status:</span>
                        {isW9Done ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>W-9 Certified (0% Tax)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>W-9 Missing (24% IRS Withheld)</span>
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Super Admin Commission ({commRate}%):</span>
                          <span className="font-mono font-semibold">${commAmt.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={taxAmt > 0 ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                            IRS Backup Withholding ({isW9Done ? '0%' : '24%'}):
                          </span>
                          <span className={`font-mono font-bold ${taxAmt > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {taxAmt > 0 ? `-$${taxAmt.toFixed(2)}` : '$0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-900 font-bold pt-1 border-t border-slate-200/60">
                          <span>Net Disbursable to Business:</span>
                          <span className="font-mono font-black text-emerald-700">${bizNet.toFixed(2)}</span>
                        </div>
                      </div>

                      {!isW9Done && (
                        <p className="text-[10px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 leading-tight">
                          ℹ Because this business has not completed Form W-9, Super Admin charges 24% IRS backup withholding to platform tax escrow.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Price Breakdown */}
                <div className="p-3 bg-slate-100/70 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Total Customer Payment</span>
                  <span className="font-mono font-black text-slate-950 text-base">
                    ${paymentAmount.toFixed(2)} USD
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingNmi}
                  className="w-full bg-black hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessingNmi ? (
                    <span>Processing NMI Payment...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pay ${paymentAmount.toFixed(2)} via NMI Gateway</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
