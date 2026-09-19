import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Lock,
  Heart,
  Calendar,
  Check,
  CreditCard,
  ChevronRight,
  Scissors,
  Sparkles,
  Flower2,
  Activity,
  Dumbbell,
  Palette,
  Eye,
  Shirt,
  Flame,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Business } from '../../types';
import { ServiceBookingModal } from './ServiceBookingModal';

interface CustomerHomeViewProps {
  onNavigateCategories: () => void;
  onNavigateCities: () => void;
  onNavigateMyBookings?: () => void;
  onNavigateSpots?: (category?: string, query?: string, location?: string) => void;
  onSelectSpotDetail?: (businessId: string) => void;
  onBookSpot?: (businessId: string, serviceId?: string) => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onNavigateCategories,
  onNavigateCities,
  onNavigateMyBookings,
  onNavigateSpots,
  onSelectSpotDetail,
  onBookSpot,
}) => {
  const { state, currentUser, bookServiceWithNmi, createBooking } = useDemo();

  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [quickTestNotice, setQuickTestNotice] = useState<string | null>(null);
  const [showDevBar, setShowDevBar] = useState(false);

  // Dynamic booking modal state fallback
  const [bookingBusiness, setBookingBusiness] = useState<Business | null>(null);
  const [isServiceBookingModalOpen, setIsServiceBookingModalOpen] = useState(false);

  const handleOpenBooking = (businessId: string) => {
    if (onBookSpot) {
      onBookSpot(businessId);
    } else {
      const biz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
      setBookingBusiness(biz);
      setIsServiceBookingModalOpen(true);
    }
  };

  const toggleFavorite = (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [spotId]: !prev[spotId] }));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onNavigateSpots) {
      onNavigateSpots(undefined, serviceQuery, locationQuery);
    } else {
      onNavigateCategories();
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onNavigateSpots) {
      onNavigateSpots(categoryName);
    } else {
      onNavigateCategories();
    }
  };

  // 9 category cards matching Screen 1
  const categoriesList = [
    { label: 'BARBER', icon: Scissors, query: 'Barber' },
    { label: 'BEAUTY', icon: Sparkles, query: 'Beauty' },
    { label: 'SPA', icon: Flower2, query: 'Spa' },
    { label: 'WELLNESS', icon: Activity, query: 'Wellness' },
    { label: 'FITNESS', icon: Dumbbell, query: 'Fitness' },
    { label: 'NAILS', icon: Palette, query: 'Nails' },
    { label: 'MASSAGE', icon: Flame, query: 'Massage' },
    { label: 'EYES', icon: Eye, query: 'Eyes' },
    { label: 'TAILOR', icon: Shirt, query: 'Tailor' },
  ];

  // Only display verified & live businesses approved by Super Admin
  // Only display verified & live businesses approved by Super Admin
  const displayBusinesses = useMemo(() => {
    return state.businesses.filter(
      (b) =>
        b.status === 'Live' ||
        b.status === 'KYC Approved' ||
        (b as any).status === 'Active'
    );
  }, [state.businesses]);

  // Recommended spots derived directly from actual vendor businesses
  const recommendedSpots = useMemo(() => {
    return displayBusinesses.map((biz) => {
      const coverImg =
        biz.imageGallery?.find((img) => img.isCover)?.url ||
        biz.imageGallery?.[0]?.url ||
        (biz.coreDetails?.category?.toLowerCase().includes('cowork')
          ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80'
          : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80');

      const categoryBadge = (biz.coreDetails?.category || 'General').toUpperCase();
      const addrParts = [
        biz.coreDetails?.streetAddress,
        biz.coreDetails?.city,
        biz.coreDetails?.state,
      ].filter(Boolean);
      const address = addrParts.length > 0 ? addrParts.join(', ') : 'United States';

      return {
        id: `rec-${biz.id}`,
        businessId: biz.id,
        name: biz.coreDetails?.businessName || 'Untitled Business',
        categoryBadge,
        rating: (biz as any).rating || 4.9,
        reviewCount: (biz as any).reviewCount || 12,
        address,
        image: coverImg,
      };
    });
  }, [displayBusinesses]);

  const clientReviews = [
    {
      stars: 5,
      quote:
        'URSPOT completely changed how I book beauty services. The quality of partners is outstanding and the booking confirmation was instant.',
      initial: 'E',
      name: 'Elena Rostova',
      title: 'Fashion Director, NYC',
    },
    {
      stars: 5,
      quote:
        'As someone with a very tight travel schedule, the quick booking, vetted spaces, and seamless checkout give me total peace of mind.',
      initial: 'M',
      name: 'Marcus Vance',
      title: 'Architectural Consultant',
    },
    {
      stars: 5,
      quote:
        'The luxury experience starts from the platform itself. Every single detail feels curated and every spot delivers world-class service.',
      initial: 'S',
      name: 'Sophie Tanaka',
      title: 'Creative Producer',
    },
  ];

  const destinations = useMemo(() => {
    const cityMap: Record<string, { count: number; image: string }> = {};
    displayBusinesses.forEach((b) => {
      const city = b.coreDetails?.city || 'Local Hub';
      const img =
        b.imageGallery?.find((i) => i.isCover)?.url ||
        b.imageGallery?.[0]?.url ||
        (city.toLowerCase().includes('francisco')
          ? 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80');
      if (!cityMap[city]) {
        cityMap[city] = { count: 1, image: img };
      } else {
        cityMap[city].count += 1;
      }
    });

    return Object.entries(cityMap).map(([city, data]) => ({
      city,
      spots: `${data.count} Verified Spot${data.count > 1 ? 's' : ''}`,
      image: data.image,
    }));
  }, [displayBusinesses]);

  // Quick-test helper preserved for platform validation
  const handleRunPrototypeTest = async (businessId: string) => {
    const targetBiz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    setQuickTestNotice(`Simulating payment for "${targetBiz.coreDetails.businessName}" via NMI Gateway...`);

    const res = await bookServiceWithNmi({
      businessId: targetBiz.id,
      serviceName: 'Executive Studio & Workspace Booking ($100 Test)',
      amount: 100.0,
      customerName: currentUser?.fullName || 'Alex Taylor',
      customerEmail: currentUser?.email || 'alex_shopper@uspot.com',
    });

    try {
      const defaultServices = state.businessServices.filter((s) => s.business_id === targetBiz.id);
      const serviceToBook = defaultServices[0]?.id || 'srv-biz-001-1';
      await createBooking({
        businessId: targetBiz.id,
        selectedServiceIds: [serviceToBook],
        dateStr: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '14:00',
        paymentMethod: 'credit_card',
        customerName: currentUser?.fullName || 'Alex Taylor',
        customerEmail: currentUser?.email || 'alex_shopper@uspot.com',
        notes: 'Quick-test booking via Prototype Testing Bar',
      });
    } catch (e) {
      console.warn('Prototype test appointment creation error:', e);
    }

    if (res.success && res.transaction) {
      const t = res.transaction;
      setQuickTestNotice(
        `✓ Simulated $100 payment for "${t.businessName}". Transaction ${t.id} successfully processed via NMI Gateway.`
      );
      setTimeout(() => setQuickTestNotice(null), 8000);
    }
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* 1. Hero Section matching Screen 1 */}
      <section className="relative w-full bg-[#08090B] py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Architectural Column Lighting in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-radial from-neutral-800/20 via-[#08090B]/80 to-[#08090B]" />
          <div className="h-full w-full flex justify-around opacity-20">
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/40 to-transparent" />
            <div className="w-36 h-full bg-gradient-to-r from-transparent via-neutral-500/30 to-transparent" />
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/40 to-transparent" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8">
            Find Your Next Appointment
          </h1>

          {/* Floating Dual Search Pill */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-full p-2 pl-5 sm:pl-6 shadow-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 max-w-2xl mx-auto border border-slate-100"
          >
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
              type="submit"
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-8 py-3 rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {/* 2. Browse by Category (9 square cards matching Screen 1) */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-5">
            Browse by Category
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
            {categoriesList.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCategoryClick(cat.query)}
                  className="group bg-[#F4F5F7] hover:bg-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer border border-transparent hover:border-slate-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-700 group-hover:text-black group-hover:scale-105 transition-all">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase group-hover:text-black">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Limited Offer Banner matching Screen 1 */}
        <section className="bg-[#0B0C0E] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-neutral-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 block mb-2">
              LIMITED OFFER
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
              Elevate Your Self-Care Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Book any premium service this week and enjoy complimentary treatments at top-tier partner locations.
            </p>
            <button
              type="button"
              onClick={() => handleOpenBooking('biz-002')}
              className="bg-white hover:bg-slate-100 text-black text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              Book Now
            </button>
          </div>

          {/* Luxury Cosmetic Bottles Graphic */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-64 h-48 sm:h-56 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-radial from-neutral-700/20 to-transparent rounded-full blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Self Care"
                className="w-full h-full object-contain filter drop-shadow-2xl relative z-10"
              />
            </div>
          </div>
        </section>

        {/* 4. Recommended for You (4 Cards matching Screen 1) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Recommended for You
            </h2>
            <button
              type="button"
              onClick={() => onNavigateSpots ? onNavigateSpots() : onNavigateCategories()}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recommendedSpots.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No active businesses available yet</p>
              <p className="text-xs text-slate-500 mt-1">When vendors register their businesses, they will be displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => onSelectSpotDetail ? onSelectSpotDetail(spot.businessId) : handleOpenBooking(spot.businessId)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
              >
                {/* Photo with category badge & heart icon */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {spot.categoryBadge}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(spot.id, e)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        favorites[spot.id] ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {spot.name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-900">{spot.rating}</span>
                        <span className="text-[10px] text-slate-400">({spot.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-4">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{spot.address}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBooking(spot.businessId);
                    }}
                    className="w-full py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

        {/* 5. Three Value Propositions matching Screen 1 */}
        <section className="py-12 border-t border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* 1. Curated Excellence */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Curated Excellence</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Handpicked professionals and luxury spaces verified for the highest standards of quality.
              </p>
            </div>

            {/* 2. Instant Booking */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Zap className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Instant Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Real-time availability and immediate confirmation with zero waiting or back-and-forth messaging.
              </p>
            </div>

            {/* 3. Secure Payment */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Lock className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Secure Payment</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Frictionless checkout powered by certified banking gateways with transparent pricing.
              </p>
            </div>
          </div>
        </section>

        {/* 6. What Our Clients Say (Testimonials) matching Screen 1 */}
        <section>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight text-center mb-8">
            What Our Clients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientReviews.map((rev, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-black text-black" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none">{rev.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{rev.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Explore Top Destinations matching Screen 1 */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Explore Top Destinations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover vetted spaces in the world's most vibrant cities
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateCities}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <div
                key={i}
                onClick={onNavigateCities}
                className="relative rounded-2xl h-60 overflow-hidden shadow-xs hover:scale-[1.01] transition-transform cursor-pointer group"
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform">
                    {dest.city}
                  </h3>
                  <span className="text-xs text-slate-300 mt-0.5 block">{dest.spots}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prototype Testing Bar Drawer (Collapsible for developer & testing use) */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setShowDevBar(!showDevBar)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{showDevBar ? '▲ Hide Prototype Testing Bar' : '▼ Show Prototype Testing Bar (NMI Payment Test)'}</span>
          </button>

          {showDevBar && (
            <div className="mt-4 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 text-left animate-in fade-in">
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
                  <h2 className="text-base font-bold text-white mt-1">
                    Simulate Customer Booking ($100 Service)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simulate a $100 checkout via the NMI Payment Gateway to test platform settlement and merchant balance allocation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <button
                    id="btn-quick-test-biz-001"
                    onClick={() => handleRunPrototypeTest('biz-001')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 border border-slate-700"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    <span>Simulate $100: The Nexus</span>
                  </button>

                  <button
                    id="btn-quick-test-biz-002"
                    onClick={() => handleRunPrototypeTest('biz-002')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 border border-slate-700"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate $100: Apex Studios</span>
                  </button>
                </div>
              </div>

              {quickTestNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-semibold animate-in fade-in flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{quickTestNotice}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Multi-Service Booking Modal with slot generation and NMI checkout */}
      {isServiceBookingModalOpen && bookingBusiness && (
        <ServiceBookingModal
          business={bookingBusiness}
          isOpen={isServiceBookingModalOpen}
          onClose={() => {
            setIsServiceBookingModalOpen(false);
            setBookingBusiness(null);
          }}
          onSuccess={() => {
            if (onNavigateMyBookings) {
              onNavigateMyBookings();
            }
          }}
        />
      )}
    </div>
  );
};
